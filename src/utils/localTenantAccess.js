export const LOCAL_TENANT_PREFIX = 'local-tenant:';
export const LOCAL_TENANT_OWNER_PREFIX = 'local-tenant-owner:';
export const LOCAL_TENANT_ZMANIM_PREFIX = 'local-tenant-zmanim:';
export const LOCAL_TENANT_HODAOT_PREFIX = 'local-tenant-hodaot:';
export const LOCAL_TENANT_GALLERY_PREFIX = 'local-tenant-gallery:';
export const LOCAL_TENANT_UPDATED_EVENT = 'local-tenant-updated';

function normalizeLocalValue(value) {
  return JSON.parse(JSON.stringify(value, (_, currentValue) => (
    currentValue && typeof currentValue === 'object' && typeof currentValue.toDate === 'function'
      ? currentValue.toDate().toISOString()
      : currentValue
  )));
}

function readJson(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value, detail) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeLocalValue(value);
  window.localStorage.setItem(key, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(LOCAL_TENANT_UPDATED_EVENT, { detail }));
}

export function isLocalDevHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

export function markLocalTenantOwnerAccess(slug) {
  if (!slug || typeof window === 'undefined') return;
  window.localStorage.setItem(`${LOCAL_TENANT_OWNER_PREFIX}${slug}`, '1');
}

export function hasLocalTenantOwnerAccess(slug) {
  if (!slug || typeof window === 'undefined') return false;
  return window.localStorage.getItem(`${LOCAL_TENANT_OWNER_PREFIX}${slug}`) === '1';
}

export function readLocalTenantDraft(slug) {
  return readJson(`${LOCAL_TENANT_PREFIX}${slug}`);
}

export function saveLocalTenantDraft(slug, tenantDoc) {
  writeJson(`${LOCAL_TENANT_PREFIX}${slug}`, tenantDoc, { slug, type: 'tenant' });
}

export function readLocalZmanim(slug) {
  return readJson(`${LOCAL_TENANT_ZMANIM_PREFIX}${slug}`) || {};
}

export function saveLocalZmanim(slug, zmanim) {
  writeJson(`${LOCAL_TENANT_ZMANIM_PREFIX}${slug}`, zmanim, { slug, type: 'zmanim' });
}

export function readLocalHodaot(slug) {
  return readJson(`${LOCAL_TENANT_HODAOT_PREFIX}${slug}`) || [];
}

export function saveLocalHodaot(slug, hodaot) {
  writeJson(`${LOCAL_TENANT_HODAOT_PREFIX}${slug}`, hodaot, { slug, type: 'hodaot' });
}

export function readLocalGallery(slug) {
  return readJson(`${LOCAL_TENANT_GALLERY_PREFIX}${slug}`) || [];
}

export function saveLocalGallery(slug, gallery) {
  writeJson(`${LOCAL_TENANT_GALLERY_PREFIX}${slug}`, gallery, { slug, type: 'gallery' });
}
