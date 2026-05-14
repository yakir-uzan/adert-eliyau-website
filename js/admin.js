// ===== ADMIN PANEL =====
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc, getDoc, setDoc, collection, query, orderBy, where,
  getDocs, addDoc, updateDoc, serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── DOM refs ──
const loginSection  = document.getElementById('loginSection');
const adminPanel    = document.getElementById('adminPanel');
const loginForm     = document.getElementById('loginForm');
const loginError    = document.getElementById('loginError');
const adminEmail    = document.getElementById('adminEmail');

function showToast(msg, ok = true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = ok ? 'var(--gold)' : '#c0392b';
  t.style.color = ok ? 'var(--navy)' : '#fff';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── AUTH ──
onAuthStateChanged(auth, user => {
  if (user) {
    loginSection.style.display = 'none';
    adminPanel.style.display   = 'block';
    adminEmail.textContent = user.email;
    loadAll();
  } else {
    loginSection.style.display = 'flex';
    adminPanel.style.display   = 'none';
  }
});

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    loginError.textContent = 'אימייל או סיסמה שגויים. נסה שנית.';
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => signOut(auth));

// ── LOAD ALL ──
async function loadAll() {
  await Promise.all([loadZmanim(), loadHodaot(), loadUsers(), loadCharges()]);
}

// ══════════════════════════════════════
//  ZMANIM EDITOR
// ══════════════════════════════════════
async function loadZmanim() {
  const snap = await getDoc(doc(db, 'zmanim', 'current'));
  const data = snap.exists() ? snap.data() : {};
  const fields = ['shacharit_weekday','shacharit_shabbat','mincha_summer','mincha_winter','arvit','kabbalat_shabbat'];
  fields.forEach(f => {
    const el = document.getElementById('z_' + f);
    if (el) el.value = data[f] || '';
  });
  const noteEl = document.getElementById('z_note');
  if (noteEl) noteEl.value = data.note || '';
}

document.getElementById('zmanimForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fields = ['shacharit_weekday','shacharit_shabbat','mincha_summer','mincha_winter','arvit','kabbalat_shabbat'];
  const data = { last_updated: serverTimestamp() };
  fields.forEach(f => { data[f] = document.getElementById('z_' + f)?.value || ''; });
  const noteEl = document.getElementById('z_note');
  if (noteEl) data.note = noteEl.value;
  await setDoc(doc(db, 'zmanim', 'current'), data, { merge: true });
  showToast('זמני התפילות עודכנו בהצלחה ✓');
});

// ══════════════════════════════════════
//  HODAOT EDITOR
// ══════════════════════════════════════
async function loadHodaot() {
  const q = query(collection(db, 'hodaot'), where('active','==',true), orderBy('date','desc'));
  const snap = await getDocs(q);
  const list = document.getElementById('hodaotAdminList');
  if (!list) return;
  if (snap.empty) { list.innerHTML = '<p style="color:var(--muted)">אין הודעות</p>'; return; }
  list.innerHTML = snap.docs.map(d => {
    const h = d.data();
    const dateStr = h.date?.toDate ? h.date.toDate().toLocaleDateString('he-IL') : '';
    return `
      <div class="admin-hodaa-item" data-id="${d.id}">
        <div class="admin-hodaa-header">
          <strong>${h.title}</strong>
          <span style="color:var(--muted);font-size:0.82rem">${dateStr}</span>
          ${h.pinned ? '<span class="badge-pinned">📌</span>' : ''}
        </div>
        <p style="color:var(--muted);font-size:0.88rem;margin-top:0.3rem">${(h.body||'').substring(0,80)}${(h.body||'').length>80?'…':''}</p>
        <div class="admin-item-actions">
          <button class="btn-sm btn-danger" onclick="deleteHodaa('${d.id}')">מחק</button>
          ${!h.pinned ? `<button class="btn-sm btn-outline" onclick="pinHodaa('${d.id}')">📌 הצמד</button>` : `<button class="btn-sm btn-outline" onclick="unpinHodaa('${d.id}')">הסר הצמדה</button>`}
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('hodaaForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const title  = document.getElementById('h_title').value.trim();
  const body   = document.getElementById('h_body').value.trim();
  const pinned = document.getElementById('h_pinned').checked;
  if (!title || !body) return;
  await addDoc(collection(db, 'hodaot'), {
    title, body, pinned, active: true, date: serverTimestamp()
  });
  document.getElementById('h_title').value = '';
  document.getElementById('h_body').value  = '';
  document.getElementById('h_pinned').checked = false;
  showToast('ההודעה נוספה בהצלחה ✓');
  loadHodaot();
});

window.deleteHodaa = async id => {
  if (!confirm('האם למחוק את ההודעה?')) return;
  await updateDoc(doc(db, 'hodaot', id), { active: false });
  showToast('ההודעה נמחקה');
  loadHodaot();
};
window.pinHodaa = async id => {
  await updateDoc(doc(db, 'hodaot', id), { pinned: true });
  showToast('ההודעה הוצמדה ✓');
  loadHodaot();
};
window.unpinHodaa = async id => {
  await updateDoc(doc(db, 'hodaot', id), { pinned: false });
  loadHodaot();
};

// ══════════════════════════════════════
//  USERS LIST
// ══════════════════════════════════════
let allUsers = [];
async function loadUsers() {
  const snap = await getDocs(collection(db, 'users'));
  allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  const sel = document.getElementById('chargeUid');
  if (sel) {
    sel.innerHTML = '<option value="">-- בחר מתפלל --</option>' +
      allUsers.map(u => `<option value="${u.uid}">${u.displayName || u.email} (${u.email})</option>`).join('');
  }
}

// ══════════════════════════════════════
//  CHARGES (MEMBER DEBTS)
// ══════════════════════════════════════
async function loadCharges() {
  const q = query(collection(db, 'cheshbonot'), where('paid','==',false), orderBy('date','desc'));
  const snap = await getDocs(q);
  const list = document.getElementById('chargesList');
  if (!list) return;
  if (snap.empty) { list.innerHTML = '<p style="color:var(--muted)">אין חיובים פתוחים</p>'; return; }

  // Group by uid
  const byUid = {};
  snap.docs.forEach(d => {
    const data = d.data();
    if (!byUid[data.uid]) byUid[data.uid] = { charges: [], total: 0 };
    byUid[data.uid].charges.push({ id: d.id, ...data });
    byUid[data.uid].total += (data.amount || 0);
  });

  list.innerHTML = Object.entries(byUid).map(([uid, info]) => {
    const user = allUsers.find(u => u.uid === uid);
    const name = user ? (user.displayName || user.email) : uid;
    const rows = info.charges.map(c => `
      <div class="charge-row">
        <span class="charge-type-badge type-${c.type}">${c.type==='aliya'?'עלייה':'נדר'}</span>
        <span>${c.description || ''}</span>
        <span style="color:var(--gold);font-weight:700">${formatILS(c.amount)}</span>
        <button class="btn-sm btn-success" onclick="markPaid('${c.id}')">✓ שולם</button>
      </div>
    `).join('');
    return `
      <div class="user-charges-block">
        <div class="user-charges-header">
          <strong>${name}</strong>
          <span class="total-debt-badge">סה״כ: ${formatILS(info.total)}</span>
        </div>
        ${rows}
      </div>
    `;
  }).join('');
}

function formatILS(n) {
  return new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:0}).format(n||0);
}

document.getElementById('chargeForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const uid  = document.getElementById('chargeUid').value;
  const type = document.getElementById('chargeType').value;
  const desc = document.getElementById('chargeDesc').value.trim();
  const amt  = parseFloat(document.getElementById('chargeAmount').value);
  const dateVal = document.getElementById('chargeDate').value;
  if (!uid || !type || !amt || isNaN(amt)) { showToast('נא למלא את כל השדות', false); return; }
  const date = dateVal ? Timestamp.fromDate(new Date(dateVal)) : serverTimestamp();
  await addDoc(collection(db, 'cheshbonot'), { uid, type, description: desc, amount: amt, date, paid: false });
  document.getElementById('chargeForm').reset();
  showToast('החיוב נוסף בהצלחה ✓');
  loadCharges();
});

window.markPaid = async id => {
  if (!confirm('לסמן חיוב זה כשולם?')) return;
  await updateDoc(doc(db, 'cheshbonot', id), { paid: true, paidAt: serverTimestamp() });
  showToast('סומן כשולם ✓');
  loadCharges();
};
