import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const CONTACT_DEFAULTS = {
  address:      '[רחוב ומספר], [עיר]',
  phone:        '05X-XXXXXXX',
  phoneHref:    'tel:05XXXXXXXX',
  email:        'info@aderet-eliyahu.co.il',
  hours:        'א׳–ה׳: 09:00–13:00 | שישי: 09:00–11:30',
  mapUrl:       'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d34.78!3d32.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzEyLjAiTiAzNMKwNDYnNDguMCJF!5e0!3m2!1siw!2sil!4v1000000000000',
  waPhone:      '05XXXXXXXX',
  waGroupLink:  'https://chat.whatsapp.com/WHATSAPP_INVITE_CODE',
};

const ContactCtx = createContext({
  config:     CONTACT_DEFAULTS,
  saveConfig: async () => {},
});

export function ContactProvider({ children }) {
  const [config, setConfig] = useState(CONTACT_DEFAULTS);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config', 'contact'),
      snap => { if (snap.exists()) setConfig({ ...CONTACT_DEFAULTS, ...snap.data() }); },
      () => {}
    );
    return unsub;
  }, []);

  const saveConfig = (updates) =>
    setDoc(doc(db, 'config', 'contact'), updates, { merge: true });

  return (
    <ContactCtx.Provider value={{ config, saveConfig }}>
      {children}
    </ContactCtx.Provider>
  );
}

export const useContact = () => useContext(ContactCtx);
