import { expect, test } from '@playwright/test';

const tenantBase = '/beit-knesset/aderet-eliyahu';
const tenantSlug = 'aderet-eliyahu';

const seededTenant = {
  siteType: 'beit-knesset',
  templateId: 'beit-knesset',
  name: 'בית כנסת אדרת אליהו',
  subtitle: 'ע"ש אליהו אוזן ז"ל',
  aboutText: 'בית כנסת קהילתי עם תפילות, שיעורים ופעילות קבועה.',
  contact: {
    address: 'רחוב הדוגמה 1',
    city: 'ירושלים',
    phone: '050-1234567',
    email: 'info@example.com',
    officeHours: 'א-ה 09:00-13:00',
    mapEmbedUrl: '',
    formspreeId: '',
  },
  whatsapp: {
    groupLink: 'https://chat.whatsapp.com/example',
    gabaiLink: 'https://wa.me/972501234567',
    gabaiPhone: '050-1234567',
  },
  payments: {
    bitPhone: '050-1234567',
    payboxPhone: '050-1234567',
    payboxLink: 'https://payboxapp.page.link/example',
    nedarimLink: 'https://www.nedarimplus.co.il/',
    bankRows: [['בנק', '12'], ['סניף', '345'], ['חשבון', '67890']],
    stripeKey: '',
    stripePaymentEndpoint: '',
  },
  theme: {
    primaryColor: '#C9A84C',
    primaryLight: '#E8D5A3',
    bgDefault: '#07111B',
    bgPaper: '#101A25',
  },
  images: {
    logo: '',
    heroSlides: ['/images/hero/building-render.jpg'],
    pageHeroBg: '',
    galleryPreview: ['/images/hero/building-render.jpg'],
  },
  ticker: [{ cat: 'לעילוי נשמת', text: 'אליהו בן שרה' }],
  brachot: [{ id: 'test-bracha', title: 'ברכה לדוגמה', description: 'תיאור קצר', price: 180, icon: 'key' }],
  campaigns: [{
    id: 'main',
    title: 'קמפיין לדוגמה',
    description: 'קמפיין בדיקה',
    goal: 10000,
    raised: 1200,
    matchMultiplier: 1,
    active: true,
    levels: [{ label: 'שותף', amount: 180 }],
    raisers: [{ id: 'r1', name: 'ישראל ישראלי', slug: 'israel', goal: 1000, raised: 100 }],
  }],
  planStatus: 'trial',
  paymentStatus: 'pending',
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  admins: [],
  adminEmails: [],
};

async function seedTenant(page) {
  await page.addInitScript(({ slug, tenant }) => {
    window.localStorage.setItem(`local-tenant:${slug}`, JSON.stringify(tenant));
    window.localStorage.setItem(`local-tenant-owner:${slug}`, '1');
  }, { slug: tenantSlug, tenant: seededTenant });
}

async function collectRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    const text = msg.text();
    const isFirestoreOfflineNoise = text.includes('@firebase/firestore') && text.includes('Could not reach Cloud Firestore backend');
    if (msg.type() === 'error' && !isFirestoreOfflineNoise) errors.push(text);
  });
  return errors;
}

test.describe('platform shell', () => {
  test('landing page navigates to registration without runtime errors', async ({ page }) => {
    const errors = await collectRuntimeErrors(page);
    await page.goto('/');
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
    await page.locator('a[href="/register"]').first().click();
    await expect(page).toHaveURL(/\/register$/);
    expect(errors).toEqual([]);
  });

  test('mobile platform menu opens from the right side and contains nav links', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile only');
    const errors = await collectRuntimeErrors(page);
    await page.goto('/');
    await page.getByLabel('פתח תפריט').click();

    const drawer = page.locator('.MuiDrawer-paper').first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS('direction', 'rtl');

    await expect.poll(async () => {
      const box = await drawer.boundingBox();
      return box?.x ?? 0;
    }).toBeGreaterThan(80);
    await expect(drawer.locator('a[href="/features"], [role="button"]').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('registration flow', () => {
  test('site type step is RTL and updates URL preview slug fields', async ({ page }) => {
    const errors = await collectRuntimeErrors(page);
    await page.goto('/register');

    const grid = page.locator('[dir="rtl"]').first();
    await expect(grid).toBeVisible();

    await page.getByText('עמותה', { exact: true }).click();
    await page.getByRole('button', { name: /הבא/ }).click();
    await page.getByLabel(/שם/).first().fill('חסדי דוד');

    const slugInput = page.locator('input[dir="ltr"]').first();
    await expect(slugInput).toHaveValue(/hasde|hesed|david|dwd|david/i);
    expect(errors).toEqual([]);
  });
});

test.describe('tenant pages', () => {
  for (const path of [
    tenantBase,
    `${tenantBase}/zmanim`,
    `${tenantBase}/hodaot`,
    `${tenantBase}/tashlumim`,
    `${tenantBase}/campaigns`,
    `${tenantBase}/brachot`,
    `${tenantBase}/galeria`,
    `${tenantBase}/contact`,
  ]) {
    test(`renders ${path} without crashing`, async ({ page }) => {
      await seedTenant(page);
      const errors = await collectRuntimeErrors(page);
      await page.goto(path);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.locator('main')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('credit card dialog blocks unsafe payment when Stripe endpoint is missing', async ({ page }) => {
    await seedTenant(page);
    await page.goto(`${tenantBase}/tashlumim`);
    await page.getByRole('button', { name: /אשראי/ }).first().click();
    await expect(page.getByText(/לא מוגדר כרגע/)).toBeVisible();
  });

  test('tenant mobile drawer opens with RTL direction', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile only');
    await seedTenant(page);
    await page.goto(tenantBase);
    await page.getByLabel('פתח תפריט').click();
    const drawer = page.locator('.MuiDrawer-paper').first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS('direction', 'rtl');
  });
});
