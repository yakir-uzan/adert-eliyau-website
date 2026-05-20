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

async function updateTenant(slug, data) {
  await db.collection('tenants').doc(slug).set(data, { merge: true });
}

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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'he',
      customer_email: tenant.contact?.email || undefined,
      success_url: `${baseUrl}/${tenantSlug}/activate?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${tenantSlug}/activate?checkout=cancelled`,
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
              description: 'הקמה והפעלה של אתר בית הכנסת',
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

    response.status(200).json({ received: true });
  }
);

