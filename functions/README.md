# Stripe functions

This folder contains the Firebase Functions used for:

- automatic site activation with Stripe Checkout
- tenant payments with Stripe PaymentIntent
- campaign donation totals via Stripe webhook

## Required setup

1. Install the functions dependencies:
   `cd functions && npm install`
2. Set the Stripe secrets:
   `firebase functions:secrets:set STRIPE_SECRET_KEY`
   `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`
3. Create `functions/.env` or `functions/.env.production` and add:
   `APP_BASE_URL=https://your-domain.com`
   `DEFAULT_SETUP_AMOUNT_ILS=490`

4. Copy `firebase.example.json` to `firebase.json` before deployment.
5. Copy `.firebaserc.example` to `.firebaserc` and set your Firebase project id.

## Deploy

1. Build the frontend:
   `npm run build`
2. Deploy hosting and functions:
   `firebase deploy`

## Stripe webhook

In the Stripe dashboard, point the webhook endpoint to:

`https://<your-domain>/stripeWebhook`

Listen to:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`

## Frontend payment setup

Set a Stripe publishable key in the frontend environment or per tenant:

`VITE_STRIPE_PUBLIC_KEY=pk_live_...`

The secret key stays only in Firebase Functions:

`firebase functions:secrets:set STRIPE_SECRET_KEY`

Do not put `STRIPE_SECRET_KEY` in any Vite/client environment file.

## Recommended deploy order

1. `npm run build`
2. `npm run functions:install`
3. `firebase deploy --only functions`
4. `firebase deploy --only hosting`
