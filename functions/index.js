import admin from 'firebase-admin';
import Stripe from 'stripe';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

admin.initializeApp();

const db = admin.firestore();
const DEFAULT_SETUP_AMOUNT_ILS = 490;
const STRIPE_API_VERSION = '2026-02-25.clover';

function getStripeClient() {
  return new Stripe(stripeSecretKey.value(), {
    apiVersion: STRIPE_API_VERSION,
  });
}

function normalizeBaseUrl(origin) {
  const candidate = typeof origin === 'string' && /^https?:\/\//.test(origin)
    ? origin
    : process.env.APP_BASE_URL;

  if (!candidate || !/^https?:\/\//.test(candidate)) {
    throw new HttpsError('failed-precondition', 'Missing APP_BASE_URL or valid origin.');
  }

  return candidate.replace(/\/$/, '');
}

function resolveStripeAmount(config = {}) {
  const rawAmount = config.billing?.setupAmount ?? process.env.DEFAULT_SETUP_AMOUNT_ILS ?? DEFAULT_SETUP_AMOUNT_ILS;
  const amount = Number(rawAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpsError('failed-precondition', 'Invalid setup amount for automatic checkout.');
  }

  return Math.round(amount * 100);
}

function validatePaymentAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new HttpsError('invalid-argument', 'A positive amount is required.');
  }
  return Math.round(value * 100);
}

async function updateTenant(slug, data) {
  await db.collection('tenants').doc(slug).set(data, { merge: true });
}

async function updateCampaignDonation({ tenantSlug, campaignId, raiserSlug, amount }) {
  if (!tenantSlug || !campaignId || !amount) return;

  await db.runTransaction(async transaction => {
    const tenantRef = db.collection('tenants').doc(tenantSlug);
    const tenantSnap = await transaction.get(tenantRef);
    if (!tenantSnap.exists) return;

    const tenant = tenantSnap.data() || {};
    const campaigns = Array.isArray(tenant.campaigns) ? tenant.campaigns : [];
    const nextCampaigns = campaigns.map(campaign => {
      if (campaign.id !== campaignId) return campaign;
      return {
        ...campaign,
        raised: (Number(campaign.raised) || 0) + amount,
        raisers: (campaign.raisers || []).map(raiser => (
          raiser.slug === raiserSlug
            ? { ...raiser, raised: (Number(raiser.raised) || 0) + amount }
            : raiser
        )),
      };
    });

    transaction.set(tenantRef, { campaigns: nextCampaigns }, { merge: true });
  });
}

export const createTenantPaymentIntent = onCall(
  { secrets: [stripeSecretKey] },
  async request => {
    const tenantSlug = String(request.data?.tenantSlug || '').trim().toLowerCase();
    const amount = validatePaymentAmount(request.data?.amount);
    const currency = String(request.data?.currency || 'ils').toLowerCase();
    const description = String(request.data?.description || 'Tenant payment').trim().slice(0, 500);
    const receiptEmail = String(request.data?.receiptEmail || '').trim();
    const customerName = String(request.data?.customerName || '').trim().slice(0, 120);
    const metadata = request.data?.metadata || {};

    if (!tenantSlug) {
      throw new HttpsError('invalid-argument', 'tenantSlug is required.');
    }

    const tenantSnap = await db.collection('tenants').doc(tenantSlug).get();
    if (!tenantSnap.exists) {
      throw new HttpsError('not-found', 'Tenant not found.');
    }

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      receipt_email: receiptEmail || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        tenantSlug,
        purpose: String(metadata.purpose || 'tenant_payment'),
        campaignId: String(metadata.campaignId || ''),
        raiserSlug: String(metadata.raiserSlug || ''),
        itemId: String(metadata.itemId || ''),
        customerName,
      },
    });

    await db.collection('tenants').doc(tenantSlug).collection('paymentIntents').doc(intent.id).set({
      amount: amount / 100,
      currency,
      description,
      receiptEmail,
      customerName,
      status: intent.status,
      metadata: intent.metadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }
);

export const createTenantCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async request => {
    const tenantSlug = String(request.data?.tenantSlug || '').trim().toLowerCase();
    const origin = request.data?.origin;

    if (!tenantSlug) {
      throw new HttpsError('invalid-argument', 'tenantSlug is required.');
    }

    const tenantRef = db.collection('tenants').doc(tenantSlug);
    const tenantSnap = await tenantRef.get();

    if (!tenantSnap.exists) {
      throw new HttpsError('not-found', 'Tenant not found.');
    }

    const tenant = tenantSnap.data() || {};
    const stripe = getStripeClient();
    const baseUrl = normalizeBaseUrl(origin);
    const amount = resolveStripeAmount(tenant);
    const siteName = tenant.name || tenantSlug;
    const siteType = tenant.siteType || 'beit-knesset';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'he',
      customer_email: tenant.contact?.email || undefined,
      success_url: `${baseUrl}/${siteType}/${tenantSlug}/activate?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${siteType}/${tenantSlug}/activate?checkout=cancelled`,
      metadata: {
        tenantSlug,
        purpose: 'site_activation',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'ils',
            unit_amount: amount,
            product_data: {
              name: `הפעלת אתר - ${siteName}`,
              description: 'הקמה והפעלה של אתר ב־genisite',
            },
          },
        },
      ],
    });

    await updateTenant(tenantSlug, {
      paymentStatus: 'checkout_started',
      checkoutSessionId: session.id,
      checkoutCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }
);

export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    const signature = request.headers['stripe-signature'];

    if (!signature) {
      response.status(400).send('Missing stripe-signature header');
      return;
    }

    let event;

    try {
      event = getStripeClient().webhooks.constructEvent(
        request.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (error) {
      response.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const tenantSlug = session.metadata?.tenantSlug;

      if (tenantSlug && session.payment_status === 'paid') {
        await updateTenant(tenantSlug, {
          planStatus: 'active',
          paymentStatus: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          stripeCheckoutSessionId: session.id,
          stripeCustomerId: session.customer || '',
          stripePaymentIntentId: session.payment_intent || '',
          billing: {
            lastPaidAmount: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
            currency: session.currency || 'ils',
          },
        });
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const tenantSlug = session.metadata?.tenantSlug;

      if (tenantSlug) {
        await updateTenant(tenantSlug, {
          paymentStatus: 'expired',
          expiredCheckoutSessionId: session.id,
        });
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const tenantSlug = intent.metadata?.tenantSlug;
      const amount = typeof intent.amount_received === 'number' ? intent.amount_received / 100 : 0;

      if (tenantSlug) {
        await db.collection('tenants').doc(tenantSlug).collection('payments').doc(intent.id).set({
          amount,
          currency: intent.currency || 'ils',
          description: intent.description || '',
          receiptEmail: intent.receipt_email || '',
          status: intent.status,
          stripePaymentIntentId: intent.id,
          metadata: intent.metadata || {},
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        if (intent.metadata?.purpose === 'campaign_donation') {
          await updateCampaignDonation({
            tenantSlug,
            campaignId: intent.metadata.campaignId,
            raiserSlug: intent.metadata.raiserSlug,
            amount,
          });
        }
      }
    }

    response.status(200).json({ received: true });
  }
);

