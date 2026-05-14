import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ADMIN_EMAIL = 'yakiruzangreen@gmail.com';
const Ctx = createContext({ user: null, isAdmin: false, loading: true });

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, u => {
    setUser(u ?? null);
    setIsAdmin(u?.email === ADMIN_EMAIL);
    setLoading(false);
  }), []);

  return <Ctx.Provider value={{ user, isAdmin, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
