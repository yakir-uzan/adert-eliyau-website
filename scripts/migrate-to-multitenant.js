/**
 * Migration script: converts existing single-tenant data to multi-tenant.
 *
 * Run once with:  node scripts/migrate-to-multitenant.js
 *
 * Prerequisites:
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service-account JSON path.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const TENANT_SLUG = 'genisite';

initializeApp({ credential: cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')) });
const db = getFirestore();

async function createTenantDoc() {
  console.log('Creating tenant document...');
  await db.doc(`tenants/${TENANT_SLUG}`).set({
    name: 'בית כנסת לדוגמה',
    subtitle: 'ע"ש אליהו אוזן ז"ל',
    aboutText: '',
    contact: {
      address: '',
      phone: '',
      email: '',
      officeHours: '',
      mapEmbedUrl: '',
      formspreeId: '',
    },
    whatsapp: {
      groupLink: '',
      gabaiLink: '',
    },
    payments: {
      bitPhone: '',
      payboxPhone: '',
      payboxLink: '',
      nedarimLink: 'https://www.nedarimplus.co.il/',
      bankRows: [],
      stripeKey: '',
    },
    theme: {
      primaryColor: '#C9A84C',
      primaryLight: '#E8D5A3',
      bgDefault: '#0D1B2A',
      bgPaper: '#1A2940',
    },
    images: {
      logo: '/images/logo.png',
      heroSlides: [],
      pageHeroBg: '/images/hero-bg.jpg',
    },
    ticker: [],
    brachot: [],
    email: {
      serviceId: '',
      templateId: '',
      publicKey: '',
    },
    meta: {
      copyrightYear: new Date().getFullYear(),
    },
    admins: [],
  });
  console.log(`  -> tenants/${TENANT_SLUG} created`);
}

async function addTenantIdToCollection(collectionName) {
  console.log(`Adding tenantId to ${collectionName}...`);
  const snap = await db.collection(collectionName).get();
  const batch = db.batch();
  let count = 0;
  snap.docs.forEach(doc => {
    if (!doc.data().tenantId) {
      batch.update(doc.ref, { tenantId: TENANT_SLUG });
      count++;
    }
  });
  if (count > 0) {
    await batch.commit();
    console.log(`  -> Updated ${count} documents`);
  } else {
    console.log('  -> No documents to update');
  }
}

async function migrateZmanim() {
  console.log('Migrating zmanim/current -> zmanim/' + TENANT_SLUG + '...');
  const currentDoc = await db.doc('zmanim/current').get();
  if (currentDoc.exists) {
    await db.doc(`zmanim/${TENANT_SLUG}`).set(currentDoc.data());
    console.log('  -> Done');
  } else {
    console.log('  -> zmanim/current not found, skipping');
  }
}

async function main() {
  console.log('=== Multi-tenant migration ===\n');

  await createTenantDoc();
  await addTenantIdToCollection('hodaot');
  await addTenantIdToCollection('gallery');
  await addTenantIdToCollection('cheshbonot');
  await addTenantIdToCollection('users');
  await migrateZmanim();

  console.log('\n=== Migration complete ===');
  console.log('Fill in the tenant document fields in Firebase Console:');
  console.log(`  Firestore -> tenants -> ${TENANT_SLUG}`);
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
