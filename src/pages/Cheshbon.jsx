import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useTenant } from '../config/TenantContext';
import { DEFAULT_SITE_TYPE } from '../config/siteTypes';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import css from './Cheshbon.module.css';

const fmtDate  = ts => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('he-IL', { day:'numeric', month:'long', year:'numeric' }); };
const fmtMoney = n  => new Intl.NumberFormat('he-IL', { style:'currency', currency:'ILS', maximumFractionDigits:0 }).format(n||0);
const ACCOUNT_COPY = {
  [DEFAULT_SITE_TYPE]: {
    title: 'החשבון שלי',
    subtitle: 'צפייה בחיובים ותשלום מקוון',
    loginText: 'התחברו עם חשבון Google שלכם כדי לראות את החיובים שלכם בבית הכנסת',
    guestNote: 'אם אינכם רשומים, פנו לגבאות לרישום חשבונכם',
    paidText: 'החשבון מאוזן — תודה!',
    whatsappLabel: 'וואטסאפ לגבאי',
    confirmationNote: 'לאחר ביצוע תשלום, עדכנו את הגבאות לאישור ✓',
    typeLabels: { aliya: 'עלייה', neder: 'נדר' },
  },
  amuta: {
    title: 'האזור האישי שלי',
    subtitle: 'צפייה בתרומות, חיובים ותשלומים',
    loginText: 'התחברו עם חשבון Google שלכם כדי לראות תרומות וחיובים המשויכים אליכם',
    guestNote: 'אם אינכם רשומים, פנו לצוות העמותה',
    paidText: 'אין חיובים פתוחים — תודה!',
    whatsappLabel: 'וואטסאפ לעמותה',
    confirmationNote: 'לאחר ביצוע תשלום, עדכנו את צוות העמותה לאישור ✓',
    typeLabels: { donation: 'תרומה', membership: 'דמי חבר', project: 'פרויקט' },
  },
  yeshiva: {
    title: 'האזור האישי שלי',
    subtitle: 'צפייה בתשלומים ותרומות',
    loginText: 'התחברו עם חשבון Google שלכם כדי לראות חיובים ותשלומים המשויכים אליכם',
    guestNote: 'אם אינכם רשומים, פנו להנהלת הישיבה',
    paidText: 'אין חיובים פתוחים — תודה!',
    whatsappLabel: 'וואטסאפ להנהלה',
    confirmationNote: 'לאחר ביצוע תשלום, עדכנו את הנהלת הישיבה לאישור ✓',
    typeLabels: { donation: 'תרומה', tuition: 'שכר לימוד', sponsorship: 'הקדשה' },
  },
  organization: {
    title: 'האזור האישי שלי',
    subtitle: 'צפייה בחיובים ותשלומים',
    loginText: 'התחברו עם חשבון Google שלכם כדי לראות חיובים ותשלומים המשויכים אליכם',
    guestNote: 'אם אינכם רשומים, פנו לצוות הארגון',
    paidText: 'אין חיובים פתוחים — תודה!',
    whatsappLabel: 'וואטסאפ לצוות',
    confirmationNote: 'לאחר ביצוע תשלום, עדכנו את הצוות לאישור ✓',
    typeLabels: { payment: 'תשלום', membership: 'דמי חבר', service: 'שירות' },
  },
};

export default function Cheshbon() {
  const { config, slug } = useTenant();
  const copy = ACCOUNT_COPY[config.siteType] || ACCOUNT_COPY[DEFAULT_SITE_TYPE];
  const pay = config.payments || {};
  const wa  = config.whatsapp || {};
  const bitLink    = pay.bitPhone ? `https://www.bitpay.co.il/app/transfer?phone=${pay.bitPhone}` : '';
  const payboxLink = pay.payboxLink || '';
  const waGabbai   = wa.gabaiLink || '';

  const [authState, setAuthState] = useState('loading');
  const [user, setUser]           = useState(null);
  const [charges, setCharges]     = useState(null);

  useEffect(() => onAuthStateChanged(auth, async u => {
    if (u) {
      setUser(u);
      setAuthState('user');
      try {
        await setDoc(doc(db, 'users', u.uid), { displayName: u.displayName, email: u.email, photoURL: u.photoURL, lastLogin: serverTimestamp(), tenantId: slug }, { merge: true });
        const q = query(collection(db, 'cheshbonot'), where('uid','==',u.uid), where('tenantId','==',slug), where('paid','==',false), orderBy('date','desc'));
        const snap = await getDocs(q);
        setCharges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setCharges([]); }
    } else { setUser(null); setAuthState('guest'); }
  }), [slug]);

  const login  = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);
  const logout = () => signOut(auth);
  const total  = (charges || []).reduce((s,c) => s + (c.amount||0), 0);
  const openCharges = (charges || []).filter(c => (c.amount || 0) > 0);
  const hasOpenChargeAmount = openCharges.length > 0;

  return (
    <Box>
      <PageHero title={copy.title} subtitle={copy.subtitle} />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="sm">
          <GoldDivider />

          {authState === 'loading' && (
            <Box display="flex" justifyContent="center" mt={6}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
          )}

          {authState === 'guest' && (
            <Card sx={{ mt: 4, p: { xs: 3, sm: 5 }, textAlign: 'center', mx: 'auto', maxWidth: 420 }}>
              <LockIcon sx={{ fontSize: '3rem', mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" gutterBottom>כניסה לחשבון האישי</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {copy.loginText}
              </Typography>
              <Button onClick={login} fullWidth size="large"
                sx={{ bgcolor: '#fff', color: '#1a1a1a', fontWeight: 700, gap: 1.5, '&:hover': { bgcolor: '#f0f0f0' } }}
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              >
                כניסה עם Google
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                {copy.guestNote}
              </Typography>
            </Card>
          )}

          {authState === 'user' && user && (
            <>
              <Card sx={{ mt: 4, p: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                  <Avatar src={user.photoURL} sx={{ width: 56, height: 56, border: '2px solid', borderColor: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ color: 'secondary.main' }}>{user.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={logout}>התנתק</Button>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2, p: 3, textAlign: 'center', bgcolor: total > 0 ? 'rgba(248,113,113,0.05)' : 'rgba(74,222,128,0.05)', borderColor: total > 0 ? '#f87171' : '#4ade80' }}>
                <Typography variant="caption" color="text.secondary">סה״כ לתשלום</Typography>
                <Typography sx={{ fontSize: '3rem', fontWeight: 700, color: total > 0 ? '#f87171' : '#4ade80', fontFamily: '"Secular One", serif' }}>
                  {charges === null ? <CircularProgress size={36} /> : fmtMoney(total)}
                </Typography>
                <Typography sx={{ color: total > 0 ? '#fca5a5' : '#86efac' }}>
                  {charges === null ? 'בודקים חיובים פתוחים...' : total > 0 ? 'יש סכום לתשלום' : <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}><CheckCircleIcon fontSize="small" />{copy.paidText}</Box>}
                </Typography>
                {total > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                    {bitLink && <Button href={bitLink} target="_blank" sx={{ bgcolor: '#0091FF', color: '#fff', '&:hover': { bgcolor: '#007fd9' } }}>שלם בביט</Button>}
                    {payboxLink && <Button href={payboxLink} target="_blank" sx={{ bgcolor: '#6c3cbf', color: '#fff', '&:hover': { bgcolor: '#5a30a8' } }}>שלם בפייבוקס</Button>}
                    {waGabbai && <Button href={`${waGabbai}?text=${encodeURIComponent(`שלום, ברצוני לשלם באתר ${config.name}`)}`} target="_blank" startIcon={<WhatsAppIcon />} sx={{ bgcolor: '#25D366', color: '#fff', '&:hover': { bgcolor: '#1ebe5d' } }}>{copy.whatsappLabel}</Button>}
                  </Box>
                )}
              </Card>

              {hasOpenChargeAmount && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>פירוט חיובים פתוחים</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>תאריך</TableCell>
                          <TableCell>סוג</TableCell>
                          <TableCell>תיאור</TableCell>
                          <TableCell align="left">סכום</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {openCharges.map(c => (
                          <TableRow key={c.id}>
                            <TableCell>{fmtDate(c.date)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={copy.typeLabels[c.type] || 'חיוב'} sx={{ bgcolor: c.type==='aliya'?'rgba(201,168,76,0.15)':'rgba(139,26,26,0.2)', color: c.type==='aliya'?'primary.main':'#f87171' }} />
                            </TableCell>
                            <TableCell>{c.description||''}</TableCell>
                            <TableCell align="left" sx={{ color: 'primary.main', fontWeight: 700 }}>{fmtMoney(c.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              {hasOpenChargeAmount && (
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                  {copy.confirmationNote}
                </Typography>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}
