import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import PushPinIcon from '@mui/icons-material/PushPin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

function fmt(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FAKE_HODAOT = [
  {
    id: 'f1',
    title: 'שיעור תורה שבועי — פרשת השבוע',
    body: 'מוסר הגמרא בכל יום שישי בשעה 18:30 ברב המקום.\nהשיעור מוקדש לעילוי נשמת ראובן בן יוסף ז"ל.\nכולם מוזמנים — כניסה חופשית.',
    date: { toDate: () => new Date('2025-05-09') },
    pinned: true,
  },
  {
    id: 'f2',
    title: 'קבלת שבת מיוחדת — שבת נחמו',
    body: 'השבת הקרובה תתקיים קבלת שבת מיוחדת בשעה 19:00 עם שירה וניגונים.\nמוזמנים כל בני הקהילה ומשפחותיהם.',
    date: { toDate: () => new Date('2025-05-06') },
    pinned: true,
  },
  {
    id: 'f3',
    title: 'הזדמנות לרכוש ברכה לעילוי נשמה',
    body: 'לרגל יארצייט — ניתן לרכוש ברכה מיוחדת שתיאמר בציבור בתפילת שחרית של שבת.\nלפרטים ולהרשמה — פנו לגבאות.',
    date: { toDate: () => new Date('2025-05-02') },
    pinned: false,
  },
  {
    id: 'f4',
    title: 'שינוי זמן מנחה — קיץ תשפ"ה',
    body: 'החל מראש חודש סיון, תפילת מנחה תתקיים בשעה 19:45.\nערבית כ-20 דקות לאחר מנחה.',
    date: { toDate: () => new Date('2025-04-28') },
    pinned: false,
  },
  {
    id: 'f5',
    title: 'לימוד משניות לעילוי נשמות',
    body: 'בכל בוקר לאחר שחרית — לימוד משניות לעילוי נשמת נפטרי הקהילה.\nמי שמעוניין לציין יום פטירה — פנו לגבאות.',
    date: { toDate: () => new Date('2025-04-20') },
    pinned: false,
  },
  {
    id: 'f6',
    title: 'גביית דמי חבר — תשפ"ה',
    body: 'מתפללים יקרים, מתבקשים לשלם דמי חבר לשנת תשפ"ה.\nניתן לשלם בביט, פייבוקס, או בהעברה בנקאית.\nלפרטים — דף התשלומים באתר.',
    date: { toDate: () => new Date('2025-04-15') },
    pinned: false,
  },
];

function HodaaCard({ h }) {
  return (
    <Card
      sx={{
        borderInlineStart: h.pinned ? '3px solid' : '3px solid transparent',
        borderInlineStartColor: h.pinned ? 'primary.main' : 'transparent',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 24px rgba(201,168,76,0.12)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Top row: pin chip + date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {h.pinned ? (
            <Chip
              label="מוצמד"
              size="small"
              icon={<PushPinIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{ bgcolor: 'rgba(201,168,76,0.12)', color: 'primary.main', fontWeight: 600, border: '1px solid rgba(201,168,76,0.25)' }}
            />
          ) : <Box />}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.8rem', color: 'primary.main', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ color: 'primary.main', opacity: 0.8, fontWeight: 600 }}>
              {fmt(h.date)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(201,168,76,0.1)', mb: 1.5 }} />

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Secular One", serif',
            color: 'secondary.main',
            fontSize: '1.15rem',
            mb: 1.2,
            lineHeight: 1.4,
          }}
        >
          {h.title}
        </Typography>

        {/* Body */}
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.9,
            whiteSpace: 'pre-line',
            color: 'text.primary',
            fontFamily: '"Assistant", sans-serif',
            fontSize: '0.97rem',
          }}
        >
          {h.body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Hodaot() {
  const [items, setItems]     = useState(FAKE_HODAOT); // show immediately
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchItems(after = null) {
    setLoading(true);
    const PAGE = 10;
    let q = query(
      collection(db, 'hodaot'),
      where('active', '==', true),
      orderBy('pinned', 'desc'),
      orderBy('date', 'desc'),
      limit(PAGE)
    );
    if (after) q = query(collection(db, 'hodaot'), where('active','==',true), orderBy('pinned','desc'), orderBy('date','desc'), startAfter(after), limit(PAGE));
    try {
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(prev => after ? [...prev, ...docs] : docs);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE);
      }
    } catch {/* keep fake data */}
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  return (
    <Box>
      <PageHero title="הודעות" subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="sm">
          <GoldDivider />
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map(h => <HodaaCard key={h.id} h={h} />)}
          </Box>
          {hasMore && (
            <Box textAlign="center" mt={3}>
              <Button variant="outlined" onClick={() => fetchItems(lastDoc)} disabled={loading}>
                {loading ? 'טוען...' : 'טען עוד הודעות'}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
