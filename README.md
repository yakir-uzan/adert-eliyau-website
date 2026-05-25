<div dir="rtl" align="right">

# Kehila Sites

פלטפורמה ליצירת אתרים לעמותות, ישיבות, בתי כנסת וארגונים.

המערכת בנויה כ־Multi-Tenant: אפליקציה אחת, מסד נתונים אחד, והרבה אתרים נפרדים לפי סוג ארגון וכתובת:

- `/beit-knesset/:slug`
- `/amuta/:slug`
- `/yeshiva/:slug`
- `/organization/:slug`

בית כנסת נשאר template ברירת המחדל כדי לא לשבור אתרים קיימים.

---

## מה הפלטפורמה כוללת

- דף בית מעוצב לכל אתר.
- בחירת סוג ארגון בתהליך יצירת אתר.
- ניהול תוכן מלא דרך מסך מנהל.
- הודעות ועדכונים.
- גלריית תמונות.
- יצירת קשר, מפה, וואטסאפ וטופס פנייה.
- תשלומים ותרומות.
- קמפיינים להתרמות עם קישורים לפי מתרים.
- סליקת אשראי דרך Stripe PaymentIntent.
- Firebase Auth, Firestore, Storage ו־Functions.
- RTL מלא בעברית.
- בדיקות E2E עם Playwright.

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Frontend | React 18, Vite, MUI 5 |
| Backend | Firebase Functions |
| Database | Firestore |
| Files | Firebase Storage |
| Auth | Firebase Auth + Google |
| Payments | Stripe |
| Emails | EmailJS / Stripe receipts |
| Tests | Playwright |

---

## מבנה נתיבים

### פלטפורמה

| נתיב | תיאור |
|---|---|
| `/` | דף נחיתה של הפלטפורמה |
| `/register` | יצירת אתר חדש |
| `/features` | יכולות המערכת |
| `/pricing` | מחירים |
| `/faq` | שאלות נפוצות |
| `/contact-us` | יצירת קשר עם הפלטפורמה |

### אתר פנימי של לקוח

| נתיב | תיאור |
|---|---|
| `/:siteType/:slug` | דף הבית של האתר |
| `/:siteType/:slug/hodaot` | הודעות |
| `/:siteType/:slug/tashlumim` | תשלומים |
| `/:siteType/:slug/campaigns` | קמפיינים |
| `/:siteType/:slug/galeria` | גלריה |
| `/:siteType/:slug/contact` | יצירת קשר |
| `/:siteType/:slug/admin` | ניהול האתר |
| `/:siteType/:slug/activate` | הפעלת האתר |

בבית כנסת קיימים גם מודולים ייעודיים כמו זמנים וברכות.

---

## התקנה מקומית

</div>

```bash
npm install
cp .env.example .env
npm run dev
```

<div dir="rtl" align="right">

האתר ירוץ בדרך כלל בכתובת:

</div>

```text
http://localhost:5173
```

<div dir="rtl" align="right">

---

## בדיקות

</div>

```bash
npm audit --audit-level=moderate
npm audit --prefix functions --audit-level=moderate
node --check functions/index.js
npm run build
npm run test:e2e
```

<div dir="rtl" align="right">

---

## Firebase

הפרויקט כולל:

- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `functions/index.js`

להוראות פריסה מלאות ראו:

[DEPLOYMENT.md](DEPLOYMENT.md)

---

## משתני סביבה

קובץ דוגמה:

`.env.example`

משתנים מרכזיים:

- `VITE_FIREBASE_*`
- `VITE_PUBLIC_SITE_URL`
- `VITE_PLATFORM_ADMIN_EMAILS`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_ENABLE_AUTOMATIC_CHECKOUT`
- `VITE_EMAILJS_*`

סודות Stripe לא נכנסים ל־`.env`. הם מוגדרים דרך Firebase Secret Manager:

</div>

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

<div dir="rtl" align="right">

---

## Branch עבודה

העבודה הרב־ארגונית מתבצעת על:

`feature/multi-organization-platform`

אין למזג ל־`main` בלי אישור מפורש.

---

## סטטוס

הפרויקט פרטי ובפיתוח פעיל.

</div>
