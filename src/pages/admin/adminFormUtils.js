export function tenantToForm(config = {}) {
  const contact = config.contact || {};
  const whatsapp = config.whatsapp || {};
  const payments = config.payments || {};
  const billing = config.billing || {};
  const theme = config.theme || {};
  const images = config.images || {};
  const email = config.email || {};

  return {
    name: config.name || '',
    subtitle: config.subtitle || '',
    aboutText: config.aboutText || '',
    address: contact.address || '',
    city: contact.city || '',
    phone: contact.phone || '',
    email: contact.email || '',
    officeHours: contact.officeHours || '',
    mapEmbedUrl: contact.mapEmbedUrl || '',
    formspreeId: contact.formspreeId || '',
    waGroupLink: whatsapp.groupLink || '',
    waGabaiLink: whatsapp.gabaiLink || '',
    bitPhone: payments.bitPhone || '',
    payboxPhone: payments.payboxPhone || '',
    payboxLink: payments.payboxLink || '',
    nedarimLink: payments.nedarimLink || '',
    stripeKey: payments.stripeKey || '',
    bankName: payments.bankName || (Array.isArray(payments.bankRows) ? (payments.bankRows.find(([k]) => k === 'בנק')?.[1] || '') : ''),
    bankBranch: payments.bankBranch || (Array.isArray(payments.bankRows) ? (payments.bankRows.find(([k]) => k === 'סניף')?.[1] || '') : ''),
    accountNumber: payments.accountNumber || (Array.isArray(payments.bankRows) ? (payments.bankRows.find(([k]) => k === 'חשבון')?.[1] || '') : ''),
    accountOwner: payments.accountOwner || (Array.isArray(payments.bankRows) ? (payments.bankRows.find(([k]) => k === 'לפקודת')?.[1] || '') : ''),
    setupPrice: billing.setupPrice || '',
    renewalPrice: billing.renewalPrice || '',
    setupAmount: billing.setupAmount || '',
    renewalAmount: billing.renewalAmount || '',
    paymentLink: billing.paymentLink || '',
    billingWhatsappLink: billing.whatsappLink || '',
    primaryColor: theme.primaryColor || '#C9A84C',
    primaryLight: theme.primaryLight || '#E8D5A3',
    bgDefault: theme.bgDefault || '#0D1B2A',
    bgPaper: theme.bgPaper || '#1A2940',
    logo: images.logo || '',
    pageHeroBg: images.pageHeroBg || '',
    emailServiceId: email.serviceId || '',
    emailTemplateId: email.templateId || '',
    emailPublicKey: email.publicKey || '',
  };
}

export function mergeTenantConfig(config, form) {
  return {
    ...config,
    name: form.name.trim(),
    subtitle: form.subtitle.trim(),
    aboutText: form.aboutText.trim(),
    contact: {
      ...(config.contact || {}),
      address: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      officeHours: form.officeHours.trim(),
      mapEmbedUrl: form.mapEmbedUrl.trim(),
      formspreeId: form.formspreeId.trim(),
    },
    whatsapp: {
      ...(config.whatsapp || {}),
      groupLink: form.waGroupLink.trim(),
      gabaiLink: form.waGabaiLink.trim(),
    },
    payments: {
      ...(config.payments || {}),
      bitPhone: form.bitPhone.trim(),
      payboxPhone: form.payboxPhone.trim(),
      payboxLink: form.payboxLink.trim(),
      nedarimLink: form.nedarimLink.trim(),
      stripeKey: form.stripeKey.trim(),
      bankName: form.bankName?.trim() || '',
      bankBranch: form.bankBranch?.trim() || '',
      accountNumber: form.accountNumber?.trim() || '',
      accountOwner: form.accountOwner?.trim() || '',
    },
    billing: {
      ...(config.billing || {}),
      setupPrice: form.setupPrice.trim(),
      renewalPrice: form.renewalPrice.trim(),
      setupAmount: form.setupAmount.trim(),
      renewalAmount: form.renewalAmount.trim(),
      paymentLink: form.paymentLink.trim(),
      whatsappLink: form.billingWhatsappLink.trim(),
    },
    theme: {
      ...(config.theme || {}),
      primaryColor: form.primaryColor,
      primaryLight: form.primaryLight,
      bgDefault: form.bgDefault,
      bgPaper: form.bgPaper,
    },
    images: {
      ...(config.images || {}),
      logo: form.logo.trim(),
      pageHeroBg: form.pageHeroBg.trim(),
    },
    email: {
      ...(config.email || {}),
      serviceId: form.emailServiceId.trim(),
      templateId: form.emailTemplateId.trim(),
      publicKey: form.emailPublicKey.trim(),
    },
  };
}
