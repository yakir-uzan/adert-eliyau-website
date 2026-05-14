// ===== MEMBER ACCOUNT — Google Sign-In + personal balance =====
import { auth, db } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { collection, query, where, orderBy, getDocs, setDoc, doc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const loginSection   = document.getElementById('loginSection');
const accountSection = document.getElementById('accountSection');
const loadingSection = document.getElementById('loadingSection');

function formatDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(n) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);
}

async function loadBalance(uid) {
  const q = query(
    collection(db, 'cheshbonot'),
    where('uid', '==', uid),
    where('paid', '==', false),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function renderAccount(user, charges) {
  // User info
  document.getElementById('userPhoto').src = user.photoURL || '';
  document.getElementById('userName').textContent = user.displayName || 'מתפלל יקר';
  document.getElementById('userEmail').textContent = user.email || '';

  // Total
  const total = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalEl = document.getElementById('totalDebt');
  totalEl.textContent = formatCurrency(total);
  totalEl.className = total > 0 ? 'debt-amount debt-positive' : 'debt-amount debt-clear';
  document.getElementById('debtStatus').textContent = total > 0
    ? 'יש סכום לתשלום'
    : '✅ החשבון מאוזן — תודה!';
  document.getElementById('debtStatus').className = total > 0 ? 'debt-status red' : 'debt-status green';

  // Payment buttons - show only if debt > 0
  document.getElementById('paymentActions').style.display = total > 0 ? 'flex' : 'none';

  // Charges table
  const tbody = document.getElementById('chargesBody');
  if (charges.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:2rem">אין חיובים פתוחים</td></tr>`;
  } else {
    tbody.innerHTML = charges.map(c => `
      <tr>
        <td>${formatDate(c.date)}</td>
        <td><span class="type-badge type-${c.type}">${c.type === 'aliya' ? 'עלייה לתורה' : 'נדר / תרומה'}</span></td>
        <td>${c.description || ''}</td>
        <td class="charge-amount">${formatCurrency(c.amount || 0)}</td>
      </tr>
    `).join('');
  }
}

async function saveUserToFirestore(user) {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error('saveUser error', e);
  }
}

export function initAccount() {
  onAuthStateChanged(auth, async user => {
    if (loadingSection) loadingSection.style.display = 'none';

    if (user) {
      if (loginSection)   loginSection.style.display = 'none';
      if (accountSection) accountSection.style.display = 'block';

      await saveUserToFirestore(user);
      try {
        const charges = await loadBalance(user.uid);
        renderAccount(user, charges);
      } catch (e) {
        console.error('loadBalance error', e);
        document.getElementById('chargesBody').innerHTML =
          `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:2rem">שגיאה בטעינת הנתונים</td></tr>`;
      }
    } else {
      if (loginSection)   loginSection.style.display = 'flex';
      if (accountSection) accountSection.style.display = 'none';
    }
  });

  const loginBtn = document.getElementById('googleLoginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      signInWithPopup(auth, new GoogleAuthProvider()).catch(err => {
        console.error('Login error', err);
        alert('שגיאה בכניסה. אנא נסו שנית.');
      });
    });
  }

  const logoutBtn = document.getElementById('accountLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => signOut(auth));
  }
}
