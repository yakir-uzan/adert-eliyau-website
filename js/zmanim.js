// ===== PRAYER TIMES — reads from Firestore =====
import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const LABELS = {
  shacharit_weekday: 'שחרית חול',
  shacharit_shabbat: 'שחרית שבת',
  mincha_summer:     'מנחה קיץ',
  mincha_winter:     'מנחה חורף',
  arvit:             'ערבית',
  kabbalat_shabbat:  'קבלת שבת',
};

export async function loadZmanim() {
  try {
    const snap = await getDoc(doc(db, 'zmanim', 'current'));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id };
  } catch (e) {
    console.error('loadZmanim error', e);
    return null;
  }
}

export function renderZmanimStrip(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const keys = ['shacharit_weekday', 'mincha_summer', 'arvit'];
  el.innerHTML = keys.map(k => `
    <div class="zmanim-item">
      <span class="zmanim-label">${LABELS[k]}</span>
      <span class="zmanim-time">${data[k] || '--:--'}</span>
    </div>
  `).join('');
}

export function renderZmanimFull(data, container) {
  if (!container) return;
  const weekday = ['shacharit_weekday','mincha_summer','mincha_winter','arvit'];
  const shabbat = ['kabbalat_shabbat','shacharit_shabbat','mincha_summer','arvit'];

  const buildRows = keys => keys.map(k => `
    <div class="zman-row">
      <span class="zman-name">${LABELS[k]}</span>
      <span class="zman-time">${data[k] || '--:--'}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="zmanim-grid">
      <div class="zmanim-block">
        <h3>ימי חול</h3>
        ${buildRows(weekday)}
      </div>
      <div class="zmanim-block">
        <h3>שבת קודש</h3>
        ${buildRows(shabbat)}
      </div>
    </div>
    ${data.note ? `<p class="zmanim-note">${data.note}</p>` : ''}
    ${data.last_updated ? `<p class="zmanim-updated">עודכן: ${formatDate(data.last_updated.toDate?.() || new Date(data.last_updated))}</p>` : ''}
  `;
}

function formatDate(d) {
  return d.toLocaleDateString('he-IL', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
