# Deployment Guide

This guide covers the production setup for the multi-organization platform.

## 1. Local Validation

Run these before every deploy:

```bash
npm audit --audit-level=moderate
npm audit --prefix functions --audit-level=moderate
node --check functions/index.js
npm run build
npm run test:e2e
```

## 2. Frontend Environment

Copy the example file and fill real values:

```bash
cp .env.example .env
```

Required:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION`
- `VITE_PUBLIC_SITE_URL`
- `VITE_PLATFORM_ADMIN_EMAILS`

Payments and contact:

- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_ENABLE_AUTOMATIC_CHECKOUT`
- `VITE_SITE_ACTIVATION_PAYMENT_LINK`
- `VITE_PUBLIC_CONTACT_WHATSAPP`
- `VITE_PUBLIC_CONTACT_EMAIL`
- `VITE_PUBLIC_CONTACT_FORMSPREE_ID`

Optional receipt emails:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

## 3. Firebase Project Files

For a new environment:

```bash
cp firebase.example.json firebase.json
cp .firebaserc.example .firebaserc
```

Then update the Firebase project id in `.firebaserc`.

## 4. Functions Environment

Install dependencies:

```bash
npm run functions:install
```

Copy the example file:

```bash
cp functions/.env.example functions/.env.production
```

Set:

- `APP_BASE_URL=https://your-domain.com`
- `DEFAULT_SETUP_AMOUNT_ILS=490`

## 5. Stripe Secrets

Set Stripe secrets with Firebase Secret Manager:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Never put Stripe secret keys in `.env`, frontend code, Firestore, or Git.

## 6. Stripe Webhook

Create a Stripe webhook endpoint:

```text
https://YOUR_DOMAIN/stripeWebhook
```

Listen to:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`

`payment_intent.succeeded` is required for campaign donation totals and tenant payment records.

## 7. Firebase Rules and Indexes

This branch includes:

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`

Deploy them with:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Local emulator validation requires Java installed and available on `PATH`.

## 8. Deploy Order

Recommended deploy order:

```bash
npm run build
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
firebase deploy --only hosting
```

## 9. Production Checks

After deployment:

- Create a test tenant from `/register`.
- Confirm the creator receives admin access.
- Open the tenant admin screen.
- Add a campaign and donation level.
- Test card payment with Stripe test mode first.
- Confirm Stripe webhook creates a payment document.
- Confirm campaign totals update only after webhook success.
- Upload and delete one gallery image.
- Confirm mobile navigation opens from the right side in RTL.
