# Deployment Guide

## Frontend

1. Install dependencies:
   `npm install`
2. Build:
   `npm run build`

## Firebase project files

1. Copy `firebase.example.json` to `firebase.json`
2. Copy `.firebaserc.example` to `.firebaserc`
3. Replace the Firebase project id in `.firebaserc`

## Functions

1. Install functions dependencies:
   `npm run functions:install`
2. Copy `functions/.env.example` to `functions/.env.production`
3. Update:
   - `APP_BASE_URL`
   - `DEFAULT_SETUP_AMOUNT_ILS`

## Stripe secrets

Run:

`firebase functions:secrets:set STRIPE_SECRET_KEY`

`firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`

## Deploy order

1. `firebase deploy --only functions`
2. `firebase deploy --only hosting`

## Stripe webhook

Create a webhook in Stripe to:

`https://YOUR_DOMAIN/stripeWebhook`

Listen to:

- `checkout.session.completed`
- `checkout.session.expired`

