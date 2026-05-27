import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

/**
 * iOS Safari (and iPadOS) has a well-known issue where signInWithPopup breaks
 * when called from inside an async function — the popup is treated as a
 * non-user-gesture context and gets blocked/fails silently.
 * For those devices we always use the redirect flow instead.
 */
function shouldUseRedirect() {
  const ua = navigator.userAgent;
  // iPhone, iPod, or iPad (both classic UA and the modern iPadOS UA that
  // reports "Macintosh" with maxTouchPoints > 1)
  return /iPhone|iPod/.test(ua)
    || /iPad/.test(ua)
    || (ua.includes('Mac') && navigator.maxTouchPoints > 1);
}

export function getGoogleAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return 'הדומיין של האתר עדיין לא מורשה ב-Firebase Authentication. צריך להוסיף את genisite.com ואת www.genisite.com לרשימת Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'כניסה עם Google לא מופעלת בפרויקט Firebase. צריך להפעיל את Google ב-Authentication > Sign-in method.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication עדיין לא הוגדר בפרויקט. צריך להיכנס ל-Firebase Console > Authentication, ללחוץ Get started, ולהפעיל את Google כספק התחברות.';
    case 'auth/popup-blocked':
      return 'הדפדפן חסם את חלון ההתחברות. נסו שוב או פתחו את האתר בדפדפן רגיל.';
    case 'auth/network-request-failed':
      return 'יש בעיית רשת מול Google/Firebase. בדקו חיבור ונסו שוב.';
    case 'auth/cancelled-popup-request':
    case 'auth/popup-closed-by-user':
      return 'הכניסה בוטלה לפני שהסתיימה.';
    default:
      return 'הכניסה עם Google לא הצליחה. נסו שוב בעוד רגע.';
  }
}

export async function signInWithGoogle() {
  // iOS / iPadOS: popup is unreliable from inside async handlers → use redirect.
  // All other platforms: popup first for better UX; redirect as last-resort fallback.
  if (shouldUseRedirect()) {
    return signInWithRedirect(auth, provider);
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (
      error?.code === 'auth/popup-blocked'
      || error?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      // Last-resort fallback: if the browser blocks the popup, use redirect.
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export function signInWithGoogleRedirect() {
  return signInWithRedirect(auth, provider);
}

export function readGoogleRedirectResult() {
  return getRedirectResult(auth);
}
