import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useContact } from '../contexts/ContactContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import GoldDivider from '../components/GoldDivider';
import Footer from '../components/Footer';

/* ─── Fallback ticker items ─────────────────────────────── */
const TICKER_FALLBACK = [
  { cat: 'לעילוי נשמת',  text: 'ראובן בן יוסף ז"ל' },
  { cat: 'לרפואה שלמה',  text: 'שרה בת אברהם שתחיה' },
  { cat: 'לפרנסה טובה',  text: 'משה יצחק בן דוד' },
  { cat: 'לזיווג הגון',   text: 'דינה בת יעקב' },
  { cat: 'לעילוי נשמת',  text: 'רחל בת שלמה ע"ה' },
  { cat: 'לברכה והצלחה', text: 'יוסף בן יעקב' },
  { cat: 'לרפואה שלמה',  text: 'מרים בת אהרן שתחיה' },
  { cat: 'לזיווג הגון',   text: 'שמעון בן לוי' },
  { cat: 'לפרנסה',        text: 'דבורה בת נחמן' },
  { cat: 'לעילוי נשמת',  text: 'אברהם יצחק בן ישראל ז"ל' },
  { cat: 'לברכה',         text: 'חנה בת יהושע' },
  { cat: 'לרפואה שלמה',  text: 'אליהו בן שמואל שיחיה' },
];

const TICKER_CATS = [
  'לעילוי נשמת', 'לרפואה שלמה', 'לפרנסה טובה',
  'לזיווג הגון', 'לברכה והצלחה', 'לברכה', 'לפרנסה', 'לשמחה', 'להצלחה',
];

const HERO_SLIDES = [
  '/images/hero/building-render.jpg',
  '/images/hero/interior-01.png',
  '/images/hero/interior-02.png',
];

const GALLERY_PREVIEW = [
  '/images/gallery/interior-01.png',
  '/images/gallery/interior-02.png',
  '/images/gallery/building-render.jpg',
  '/images/gallery/interior-03.png',
  '/images/gallery/interior-04.png',
  '/images/gallery/interior-05.png',
  '/images/gallery/interior-06.png',
  '/images/gallery/building-construction.jpg',
];

const TOTAL_SECTIONS = 4;
const TRANSITION_MS  = 950;

/* ─── Ticker content ─────────────────────────────────────── */
function TickerContent({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i}>
          <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.87rem' }}>{item.cat}:</span>
          {' '}
          <span style={{ color: '#E8D5A3', fontSize: '0.87rem' }}>{item.text}</span>
          <span style={{ color: 'rgba(201,168,76,0.35)', padding: '0 22px' }}>✦</span>
        </span>
      ))}
    </>
  );
}

/* ─── Ticker management dialog ──────────────────────────── */
function TickerManageDialog({ open, onClose, items, fromFirestore, onAdd, onDelete }) {
  const [cat, setCat]   = useState(TICKER_CATS[0]);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setAdding(true);
    await onAdd({ cat, text: text.trim() });
    setText('');
    setAdding(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}>
      <DialogTitle sx={{ color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        ניהול בר הגלילה
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        {/* Add form */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            select
            value={cat}
            onChange={e => setCat(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {TICKER_CATS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField
            value={text}
            onChange={e => setText(e.target.value)}
            size="small"
            placeholder='שם, כגון "ראובן בן יוסף ז"ל"'
            sx={{ flex: 1, minWidth: 180 }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={adding || !text.trim()}
            startIcon={<AddIcon />}
            sx={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3, #C9A84C)', color: '#0D1B2A', fontWeight: 700, flexShrink: 0 }}
          >
            הוסף
          </Button>
        </Box>

        {/* Items list */}
        {!fromFirestore && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            כרגע מוצגות דוגמאות — שורות שתוסיפו יחליפו אותן
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 320, overflowY: 'auto' }}>
          {items.map((item, i) => (
            <Box key={item.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.04)', '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' } }}>
              <Typography sx={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.82rem', minWidth: 110 }}>{item.cat}:</Typography>
              <Typography sx={{ color: '#E8D5A3', fontSize: '0.85rem', flex: 1 }}>{item.text}</Typography>
              {item.id && (
                <Tooltip title="מחק">
                  <IconButton size="small" onClick={() => onDelete(item.id)} sx={{ color: 'error.light', p: 0.3 }}>
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">סגור</Button>
      </DialogActions>
    </Dialog>
  );
}

/* Navigation dot */
function NavDot({ active, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: active ? 10 : 7,
        height: active ? 10 : 7,
        borderRadius: '50%',
        bgcolor: active ? 'primary.main' : 'rgba(201,168,76,0.28)',
        border: active ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.2)',
        cursor: 'pointer',
        transition: 'all 0.35s ease',
        boxShadow: active ? '0 0 10px rgba(201,168,76,0.5)' : 'none',
        '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.25)' },
      }}
    />
  );
}

/* ─── Main component ─────────────────────────────────── */
export default function Home() {
  const { isAdmin } = useAuth();
  const { config }  = useContact();

  const [slide,   setSlide]   = useState(0);
  const [current, setCurrent] = useState(0);

  // Ticker state
  const [tickerItems, setTickerItems]   = useState(TICKER_FALLBACK);
  const [fromFirestore, setFromFirestore] = useState(false);
  const [tickerDialogOpen, setTickerDialogOpen] = useState(false);

  const currentRef   = useRef(0);
  const animatingRef = useRef(false);
  const deltaAccRef  = useRef(0);

  /* Load ticker from Firestore */
  const loadTicker = async () => {
    try {
      const q = query(
        collection(db, 'ticker'),
        where('active', '==', true),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setTickerItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFromFirestore(true);
      }
    } catch {}
  };

  useEffect(() => { loadTicker(); }, []);

  const handleTickerAdd = async ({ cat, text }) => {
    try {
      const ref = await addDoc(collection(db, 'ticker'), { cat, text, active: true, createdAt: serverTimestamp() });
      const newItem = { id: ref.id, cat, text, active: true };
      setTickerItems(prev => {
        const base = fromFirestore ? prev : [];
        return [...base, newItem];
      });
      setFromFirestore(true);
    } catch {}
  };

  const handleTickerDelete = async (id) => {
    try {
      await updateDoc(doc(db, 'ticker', id), { active: false });
      setTickerItems(prev => {
        const next = prev.filter(i => i.id !== id);
        if (next.length === 0) { setFromFirestore(false); return TICKER_FALLBACK; }
        return next;
      });
    } catch {}
  };

  /* Hero auto-rotate */
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  /* Section navigation */
  const go = (next) => {
    if (animatingRef.current || next < 0 || next >= TOTAL_SECTIONS) return;
    animatingRef.current = true;
    currentRef.current   = next;
    setCurrent(next);
    setTimeout(() => { animatingRef.current = false; deltaAccRef.current = 0; }, TRANSITION_MS);
  };

  /* Wheel */
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      if (animatingRef.current) return;
      deltaAccRef.current += e.deltaY;
      if (deltaAccRef.current > 60)  { go(currentRef.current + 1); deltaAccRef.current = 0; }
      if (deltaAccRef.current < -60) { go(currentRef.current - 1); deltaAccRef.current = 0; }
    };
    document.addEventListener('wheel', onWheel, { passive: false });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);

  /* Touch */
  useEffect(() => {
    let ty = 0;
    const onStart = (e) => { ty = e.touches[0].clientY; };
    const onEnd   = (e) => {
      const d = ty - e.changedTouches[0].clientY;
      if (Math.abs(d) > 45) d > 0 ? go(currentRef.current + 1) : go(currentRef.current - 1);
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend',   onEnd);
    };
  }, []);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') go(currentRef.current + 1);
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   go(currentRef.current - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── Render ── */
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative', bgcolor: 'background.default' }}>

      {/* Navigation dots */}
      <Box sx={{ position: 'fixed', left: { xs: 10, md: 24 }, top: '50%', transform: 'translateY(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 1.8, alignItems: 'center' }}>
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <NavDot key={i} active={i === current} onClick={() => go(i)} />
        ))}
      </Box>

      {/* Progress bar */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, height: 2, zIndex: 200, bgcolor: 'primary.main', width: `${((current) / (TOTAL_SECTIONS - 1)) * 100}%`, transition: `width ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`, boxShadow: '0 0 8px rgba(201,168,76,0.6)' }} />

      {/* Sliding sections container */}
      <Box sx={{ height: `${TOTAL_SECTIONS * 100}vh`, transform: `translateY(-${current * 100}vh)`, transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`, willChange: 'transform' }}>

        {/* ══ SECTION 1: HERO + TICKER ══ */}
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Hero */}
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {HERO_SLIDES.map((src, i) => (
              <Box key={src} sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === slide ? 1 : 0, transition: 'opacity 1.4s ease', transform: i === slide ? 'scale(1)' : 'scale(1.03)' }} />
            ))}
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.95) 0%, rgba(13,27,42,0.45) 55%, rgba(13,27,42,0.15) 100%)' }} />
            <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 2 }}>
              <Typography sx={{ color: 'primary.main', letterSpacing: '0.18em', fontSize: '1rem', mb: 1, textTransform: 'uppercase' }}>ברוכים הבאים</Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '5rem' }, lineHeight: 1.15, color: '#F5F0E8', mb: 1.5, '& span': { background: 'linear-gradient(90deg, #C9A84C 0%, #E8D5A3 45%, #C9A84C 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'goldFlow 4s linear infinite' }, '@keyframes goldFlow': { '0%': { backgroundPosition: '0% center' }, '100%': { backgroundPosition: '200% center' } } }}>
                בית כנסת<br /><span>אדרת אליהו</span>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', md: '1.2rem' }, mb: 4 }}>ע"ש אליהו אוזן ז"ל</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button component={Link} to="/zmanim" variant="contained" size="large" sx={{ px: 4 }}>זמני תפילות</Button>
                <Button component={Link} to="/hodaot" variant="outlined" size="large" sx={{ px: 4 }}>הודעות</Button>
              </Box>
            </Box>
            <Box onClick={() => go(1)} sx={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', color: 'primary.main', opacity: 0.55, cursor: 'pointer', animation: 'bounce 2.2s ease-in-out infinite', '@keyframes bounce': { '0%,100%': { transform: 'translateX(-50%) translateY(0)' }, '50%': { transform: 'translateX(-50%) translateY(9px)' } } }}>
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 16l-6-6h12z" fill="currentColor" /></svg>
            </Box>
          </Box>

          {/* Ticker */}
          <Box sx={{ flexShrink: 0, bgcolor: '#060d16', borderTop: '1px solid rgba(201,168,76,0.3)', py: 1, overflow: 'hidden', whiteSpace: 'nowrap', direction: 'ltr', position: 'relative' }}>
            <Box sx={{ display: 'inline-block', animation: 'tickerScroll 110s linear infinite', '@keyframes tickerScroll': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } }}>
              <TickerContent items={tickerItems} /><TickerContent items={tickerItems} />
            </Box>
            {isAdmin && (
              <Tooltip title="ניהול בר הגלילה">
                <IconButton
                  size="small"
                  onClick={() => setTickerDialogOpen(true)}
                  sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,168,76,0.6)', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* ══ SECTION 2: ABOUT ══ */}
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/gallery/interior-03.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,27,42,0.93) 0%, rgba(13,27,42,0.82) 100%)' }} />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(30px)', transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.3}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.3}ms` }}>
              על בית הכנסת
            </Typography>
            <Box sx={{ opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)', transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.4}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.4}ms` }}>
              <GoldDivider />
            </Box>
            <Typography sx={{ mt: 3, lineHeight: 2, color: 'text.primary', fontSize: { xs: '1rem', md: '1.12rem' }, opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)', transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.5}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.5}ms` }}>
              בית כנסת "אדרת אליהו" — מקום תפילה ולימוד תורה המשמש את הקהילה בקדושה ובטהרה.
              בית הכנסת מקיים תפילות בכל ימות השנה, שיעורי תורה ואירועי קהילה.
              ארון הקודש המפואר ועיצוב האולם המרשים מהווים בית רוחני לכל המתפללים.
              מוזמנים להצטרף אלינו לתפילה, ללימוד ולכל שמחה.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap', opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)', transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.6}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.6}ms` }}>
              <Button component={Link} to="/contact" variant="outlined" size="large">צרו קשר</Button>
              <Button component={Link} to="/galeria" variant="contained" size="large">לגלריה</Button>
            </Box>
          </Container>
        </Box>

        {/* ══ SECTION 3: GALLERY ══ */}
        <Box sx={{ height: '100vh', bgcolor: '#111d2d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', py: 3 }}>
          <Container maxWidth="lg" sx={{ width: '100%' }}>
            <Typography variant="h2" textAlign="center" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, opacity: current === 2 ? 1 : 0, transform: current === 2 ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s' }}>
              גלריה
            </Typography>
            <Box sx={{ opacity: current === 2 ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>
              <GoldDivider />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, mt: 2, opacity: current === 2 ? 1 : 0, transform: current === 2 ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s' }}>
              {GALLERY_PREVIEW.map((src, i) => (
                <Box key={i} component={Link} to="/galeria" sx={{ display: 'block', overflow: 'hidden', borderRadius: 2, aspectRatio: '1', border: '1px solid rgba(201,168,76,0.18)', transition: 'border-color 0.3s, transform 0.3s', '&:hover': { borderColor: 'primary.main', transform: 'scale(1.02)' }, '&:hover img': { transform: 'scale(1.1)' } }}>
                  <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} />
                </Box>
              ))}
            </Box>
            <Box textAlign="center" mt={2} sx={{ opacity: current === 2 ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
              <Button component={Link} to="/galeria" variant="outlined" size="small">לגלריה המלאה</Button>
            </Box>
          </Container>
        </Box>

        {/* ══ SECTION 4: WHATSAPP + FOOTER ══ */}
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #071a0e 0%, #0D1B2A 60%, #0a1520 100%)', textAlign: 'center' }}>
            <Container maxWidth="sm">
              <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, opacity: current === 3 ? 1 : 0, transform: current === 3 ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s' }}>
                הצטרפו לקבוצת הוואטסאפ
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, opacity: current === 3 ? 1 : 0, transition: 'opacity 0.6s ease 0.45s' }}>
                קבלו עדכונים, הודעות ושיעורי תורה ישירות לנייד
              </Typography>
              <Box sx={{ opacity: current === 3 ? 1 : 0, transform: current === 3 ? 'scale(1)' : 'scale(0.9)', transition: 'opacity 0.6s ease 0.55s, transform 0.6s ease 0.55s' }}>
                <Button
                  href={config.waGroupLink}
                  target="_blank" rel="noopener" size="large"
                  startIcon={<WhatsAppIcon />}
                  sx={{ bgcolor: '#25D366', color: '#fff', fontSize: '1.05rem', px: 5, py: 1.4, '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 28px rgba(37,211,102,0.45)' } }}
                >
                  הצטרפו לקבוצה
                </Button>
              </Box>
            </Container>
          </Box>
          <Footer />
        </Box>

      </Box>{/* end sliding container */}

      {/* Ticker management dialog */}
      <TickerManageDialog
        open={tickerDialogOpen}
        onClose={() => setTickerDialogOpen(false)}
        items={tickerItems}
        fromFirestore={fromFirestore}
        onAdd={handleTickerAdd}
        onDelete={handleTickerDelete}
      />
    </Box>
  );
}
