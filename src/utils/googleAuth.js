import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

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

function shouldUseRedirect() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(max-width: 768px)').matches
    || /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export async function signInWithGoogle({ preferRedirect = false } = {}) {
  if (preferRedirect || shouldUseRedirect()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (
      error?.code === 'auth/popup-blocked'
      || error?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
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
