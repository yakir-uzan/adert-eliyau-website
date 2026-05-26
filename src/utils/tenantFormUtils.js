import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { createTrialEndDate } from './tenantPlan';
import { buildWhatsappLink, withSynagoguePrefix } from './slugUtils';
import { DEFAULT_SITE_TYPE, getSiteTypeConfig } from '../config/siteTypes';

const PREVIEW_TICKER_ITEMS = [
  { cat: 'לרפואה שלמה', text: 'לרפואת משה בן שרה' },
  { cat: 'לעילוי נשמת', text: 'לעילוי נשמת יעקב בן רחל' },
  { cat: 'להצלחה', text: 'להצלחת כל התורמים והמתפללים' },
];

export function buildTenantDocFromForm(data, userId = '', options = {}) {
  const siteType = data.siteType || DEFAULT_SITE_TYPE;
  const siteTypeConfig = getSiteTypeConfig(siteType);
  const cleanName = data.name.trim();
  const fullName = siteType === DEFAULT_SITE_TYPE ? withSynagoguePrefix(cleanName) : cleanName;
  const nameValue = options.forPreview ? fullName : (fullName || siteTypeConfig.defaultName);
  const adminEmail = data.email.trim().toLowerCase();
  const heroSlides = data.pageHeroBg.trim()
    ? [data.pageHeroBg.trim(), '/images/hero/building-render.jpg', '/images/hero/interior-01.png']
    : ['/images/hero/building-render.jpg', '/images/hero/interior-01.png', '/images/hero/interior-02.png'];
  const tickerItems = siteTypeConfig.ticker || PREVIEW_TICKER_ITEMS;
  const bankRows = [
    ['בנק', data.bankName.trim()],
    ['סניף', data.bankBranch.trim()],
    ['חשבון', data.accountNumber.trim()],
    ['לפקודת', data.accountOwner.trim()],
  ].filter(([, value]) => value);

  return {
    siteType,
    templateId: siteType,
    name: nameValue,
    subtitle: data.subtitle.trim() || siteTypeConfig.defaultSubtitle,
    aboutText: data.aboutText.trim(),
    contact: {
      address: data.address.trim(),
      city: data.city.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      officeHours: '',
      mapEmbedUrl: '',
      formspreeId: '',
    },
    whatsapp: {
      groupLink: data.waGroupLink.trim(),
      gabaiLink: buildWhatsappLink(data.gabaiPhone),
      gabaiPhone: data.gabaiPhone.trim(),
    },
    payments: {
      bitPhone: data.bitPhone.trim(),
      payboxPhone: data.payboxPhone.trim(),
      payboxLink: data.payboxLink.trim(),
      nedarimLink: data.nedarimLink.trim(),
      bankRows,
      stripeKey: '',
    },
    theme: {
      primaryColor: '#C9A84C',
      primaryLight: '#E8D5A3',
      bgDefault: '#07111B',
      bgPaper: '#101A25',
    },
    images: {
      logo: data.logo.trim(),
      heroSlides,
      pageHeroBg: data.pageHeroBg.trim(),
      galleryPreview: [],
    },
    content: {
      siteType,
      primaryModule: siteTypeConfig.nav?.[1]?.path || 'hodaot',
      secondaryModule: siteTypeConfig.nav?.[2]?.path || 'tashlumim',
    },
    ticker: tickerItems,
    brachot: [],
    campaigns: [],
    email: {
      serviceId: '',
      templateId: '',
      publicKey: '',
    },
    planStatus: 'trial',
    paymentStatus: 'pending',
    trialEndsAt: Timestamp.fromDate(createTrialEndDate()),
    meta: {
      copyrightYear: new Date().getFullYear(),
      templateId: siteType,
      templateName: siteTypeConfig.templateName,
    },
    admins: userId ? [userId] : [],
    adminEmails: adminEmail ? [adminEmail] : [],
    createdAt: serverTimestamp(),
    createdBy: userId,
  };
}
