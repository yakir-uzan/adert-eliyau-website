// ===== NAV: scroll effect, hamburger, active link, auth state =====
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Scroll → solid navbar
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// Hamburger toggle
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const overlay   = document.getElementById('navOverlay');
if (hamburger) {
  const closeMenu = () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
  };
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', closeMenu);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

// Active nav link
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-links a, .mobile-nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === current || (current === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// Auth state — show/hide user avatar + login button
const userSection  = document.getElementById('navUserSection');
const loginBtn     = document.getElementById('navLoginBtn');
const userAvatar   = document.getElementById('navUserAvatar');
const userName     = document.getElementById('navUserName');
const logoutBtn    = document.getElementById('navLogoutBtn');

onAuthStateChanged(auth, user => {
  if (!userSection) return;
  if (user) {
    if (userAvatar) { userAvatar.src = user.photoURL || ''; userAvatar.style.display = 'block'; }
    if (userName)   userName.textContent = user.displayName?.split(' ')[0] || '';
    if (loginBtn)   loginBtn.style.display = 'none';
    if (logoutBtn)  logoutBtn.style.display = 'inline-flex';
    userSection.style.display = 'flex';
  } else {
    if (userAvatar) userAvatar.style.display = 'none';
    if (userName)   userName.textContent = '';
    if (loginBtn)   loginBtn.style.display = 'inline-flex';
    if (logoutBtn)  logoutBtn.style.display = 'none';
  }
});

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then(() => { location.href = 'cheshbon.html'; })
      .catch(err => console.error('Login error', err));
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => location.reload());
  });
}
