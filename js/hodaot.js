// ===== ANNOUNCEMENTS — reads from Firestore =====
import { db } from './firebase-config.js';
import { collection, query, where, orderBy, limit, getDocs, startAfter }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('he-IL', { day:'numeric', month:'long', year:'numeric' });
}

function buildCard(doc) {
  const d = doc.data();
  return `
    <article class="hodaa-card card ${d.pinned ? 'pinned' : ''}">
      ${d.pinned ? '<span class="pin-badge">📌 מוצמד</span>' : ''}
      <div class="hodaa-date">${formatDate(d.date)}</div>
      <h3 class="hodaa-title">${d.title}</h3>
      <p class="hodaa-body">${(d.body || '').replace(/\n/g, '<br>')}</p>
    </article>
  `;
}

export async function loadHodaot({ containerId, previewCount = 0, loadMoreBtnId = null }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="skeleton" style="height:120px;margin-bottom:1rem"></div>`.repeat(previewCount || 3);

  const lim = previewCount || 20;
  const q = query(
    collection(db, 'hodaot'),
    where('active', '==', true),
    orderBy('pinned', 'desc'),
    orderBy('date', 'desc'),
    limit(lim)
  );

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = `<p class="empty-state">אין הודעות כרגע</p>`;
      return;
    }
    container.innerHTML = snap.docs.map(buildCard).join('');

    if (loadMoreBtnId && snap.docs.length === lim) {
      const btn = document.getElementById(loadMoreBtnId);
      if (btn) {
        btn.style.display = 'block';
        let lastDoc = snap.docs[snap.docs.length - 1];
        btn.addEventListener('click', async () => {
          const moreQ = query(
            collection(db, 'hodaot'),
            where('active', '==', true),
            orderBy('pinned', 'desc'),
            orderBy('date', 'desc'),
            startAfter(lastDoc),
            limit(10)
          );
          const moreSnap = await getDocs(moreQ);
          moreSnap.docs.forEach(d => {
            container.insertAdjacentHTML('beforeend', buildCard(d));
          });
          lastDoc = moreSnap.docs[moreSnap.docs.length - 1];
          if (moreSnap.docs.length < 10) btn.style.display = 'none';
        });
      }
    }
  } catch (e) {
    console.error('loadHodaot error', e);
    container.innerHTML = `<p class="empty-state">שגיאה בטעינת הודעות</p>`;
  }
}
