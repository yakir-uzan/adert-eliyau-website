import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import WebIcon from '@mui/icons-material/Web';
import SpeedIcon from '@mui/icons-material/Speed';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import EditIcon from '@mui/icons-material/Edit';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformNavbar from '../components/PlatformNavbar';
import css from './landing/Landing.module.css';

const FEATURES = [
  { icon: <WebIcon />, title: 'אתר מקצועי', desc: 'עיצוב מודרני ומרשים שמייצג את העסק שלכם בצורה הטובה ביותר.' },
  { icon: <SpeedIcon />, title: 'הקמה מהירה', desc: 'בחרו תבנית, התאימו אישית, והאתר באוויר תוך דקות.' },
  { icon: <PhoneIphoneIcon />, title: 'מותאם לנייד', desc: 'האתר נראה מושלם בכל מכשיר - סמארטפון, טאבלט ומחשב.' },
  { icon: <DashboardCustomizeIcon />, title: 'ניהול קל', desc: 'ממשק ניהול אינטואיטיבי - עדכנו תוכן ללא ידע טכני.' },
  { icon: <PaletteIcon />, title: 'התאמה אישית', desc: 'צבעים, תמונות, עמודים ותוכן - הכל בשליטה שלכם.' },
  { icon: <SecurityIcon />, title: 'אבטחה מלאה', desc: 'המידע מאובטח עם גיבויים אוטומטיים ואחסון בענן.' },
];

const TEMPLATES = [
  { icon: <StorefrontIcon />, label: 'חנות', color: '#8B5CF6' },
  { icon: <RestaurantIcon />, label: 'מסעדה', color: '#EF4444' },
  { icon: <ContentCutIcon />, label: 'מספרה', color: '#EC4899' },
  { icon: <ChildCareIcon />, label: 'גן ילדים', color: '#F59E0B' },
  { icon: <FitnessCenterIcon />, label: 'חדר כושר', color: '#10B981' },
  { icon: <LocalHospitalIcon />, label: 'קליניקה', color: '#06B6D4' },
];

const STEPS = [
  { num: '01', icon: <TouchAppIcon sx={{ fontSize: 32 }} />, title: 'בחרו תבנית', desc: 'בחרו את סוג העסק שלכם מתוך מגוון תבניות מוכנות ומעוצבות.' },
  { num: '02', icon: <EditIcon sx={{ fontSize: 32 }} />, title: 'התאימו אישית', desc: 'הוסיפו תוכן, תמונות, צבעים ועמודים בדיוק כפי שאתם רוצים.' },
  { num: '03', icon: <RocketLaunchIcon sx={{ fontSize: 32 }} />, title: 'האתר באוויר', desc: 'שתפו את הקישור ותנו ללקוחות למצוא אתכם.' },
];

const FAQ_ITEMS = [
  { q: 'צריך ידע טכני כדי לנהל את האתר?', a: 'לא. נכנסים לממשק ניהול פשוט, מעדכנים תוכן, תמונות ופרטים, והאתר מתעדכן מיד.' },
  { q: 'אפשר לפתוח אתר גם לפני שכל הפרטים מוכנים?', a: 'כן. אפשר להתחיל עם שם העסק ופרטי קשר בסיסיים, ולאחר מכן להשלים גלריה, תוכן ועמודים נוספים.' },
  { q: 'האתר מותאם לטלפונים?', a: 'כן. כל דפי האתר בנויים קודם כל לשימוש נוח בנייד, כי רוב הלקוחות גולשים מהטלפון.' },
  { q: 'אפשר לקבל תשלומים דרך האתר?', a: 'כן. קיימת תמיכה בכרטיסי אשראי, ביט, פייבוקס, העברות בנקאיות וחיבורים נוספים.' },
  { q: 'מה קורה אחרי תקופת הניסיון?', a: 'האתר נשאר מוכן להפעלה. לאחר הסדרת התשלום אפשר להמשיך לפרסם, לעדכן ולנהל אותו באופן שוטף.' },
  { q: 'אפשר לקבל עזרה בהקמה?', a: 'בוודאי. צרו קשר ונעזור להעלות את התוכן הראשון, לסדר את העמודים ולוודא שהאתר נראה מעולה.' },
];

const CONTACT_PHONE = import.meta.env.VITE_PUBLIC_CONTACT_PHONE || '0538227642';
const CONTACT_WA = import.meta.env.VITE_PUBLIC_CONTACT_WHATSAPP || 'https://wa.me/972538227642';
const CONTACT_EMAIL = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL || 'yakiruzangreen@gmail.com';

const CONTACT_CARDS = [
  { icon: <WhatsAppIcon />, title: 'וואטסאפ', text: 'להודעה מהירה, תיאום קצר או שאלה ראשונה.', color: '#25D366', href: CONTACT_WA },
  { icon: <EmailOutlinedIcon />, title: 'מייל', text: 'אפשר לכתוב לנו ישירות למייל.', color: '#2563EB', href: `mailto:${CONTACT_EMAIL}` },
  { icon: <EditIcon />, title: 'השארת פרטים', text: 'ממלאים את הטופס ונחזור אליכם.', color: '#F59E0B', action: 'form' },
];

const TYPING_LINES = [
  'בנו אתר לעסק שלכם',
  'בקלות ובמהירות',
];

function useTypingEffect(lines, charDelay = 90, lineDelay = 600) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const currentLine = lines[lineIndex];
    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => setCharIndex(c => c + 1), charDelay);
      return () => clearTimeout(timeout);
    }

    if (lineIndex < lines.length - 1) {
      const timeout = setTimeout(() => {
        setLineIndex(i => i + 1);
        setCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => setDone(true), 800);
    return () => clearTimeout(timeout);
  }, [lineIndex, charIndex, done, lines, charDelay, lineDelay]);

  const displayLines = lines.map((line, i) => {
    if (i < lineIndex) return line;
    if (i === lineIndex) return line.slice(0, charIndex);
    return '';
  });

  const cursorLine = lineIndex;

  return { displayLines, cursorLine, done };
}

export default function Landing() {
  const { displayLines, cursorLine, done } = useTypingEffect(TYPING_LINES);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formSending, setFormSending] = useState(false);
  const [formToast, setFormToast] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setFormSending(true);

    const text = `פנייה חדשה מ-genisite:\nשם: ${formData.name}\nטלפון: ${formData.phone}${formData.message ? `\nהודעה: ${formData.message}` : ''}`;
    const waPhone = CONTACT_PHONE.replace(/^0/, '972');
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;

    const subject = `פנייה חדשה מ-genisite - ${formData.name}`;
    const body = `שם: ${formData.name}\nטלפון: ${formData.phone}\n${formData.message ? `הודעה: ${formData.message}` : ''}`;
    const mailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(waUrl, '_blank');
    window.open(mailUrl, '_blank');

    setFormSending(false);
    setFormOpen(false);
    setFormData({ name: '', phone: '', message: '' });
    setFormToast('הפרטים נשלחו בהצלחה!');
  };

  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', bgcolor: '#F0F7FF', color: COLORS.text }}>
      <PlatformNavbar />

      {/* Hero */}
      <Box
        id="hero"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 14 },
          background: 'linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -200, right: -200,
            width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100, left: -100,
            width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h1"
            className={css.heroHeading}
            sx={{
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4.2rem', lg: '4.8rem' },
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: COLORS.text,
              mb: 3,
            }}
          >
            <Box component="span" sx={{ display: 'block' }}>
              {displayLines[0]}
              {cursorLine === 0 && !done && <span className={css.cursor}>|</span>}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                visibility: displayLines[1] ? 'visible' : 'hidden',
              }}
            >
              {displayLines[1] || ' '}
              {cursorLine >= 1 && (
                <span className={css.cursor} style={{ WebkitTextFillColor: COLORS.primary }}>|</span>
              )}
            </Box>
          </Typography>

          <div className={`${css.heroSubContent} ${done ? css.heroSubContentVisible : ''}`}>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                lineHeight: 1.8,
                maxWidth: 600,
                mx: 'auto',
                mb: 5,
              }}
            >
              בחרו תבנית, התאימו אישית, והאתר שלכם מוכן. בלי מתכנתים, בלי עלויות גבוהות.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/register"
                size="large"
                className={css.heroCta}
                sx={{
                  bgcolor: COLORS.primary,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  px: 4.5,
                  py: 1.6,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                  '&:hover': {
                    bgcolor: COLORS.primaryDark,
                    boxShadow: '0 12px 32px rgba(37,99,235,0.35)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  התחילו בחינם
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </Box>
              </Button>
              <Button
                onClick={() => { const el = document.getElementById('features'); if (el) { const nav = document.querySelector('nav'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 0), behavior: 'smooth' }); } }}
                size="large"
                sx={{
                  color: COLORS.textSecondary,
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  '&:hover': { bgcolor: COLORS.bgAlt, borderColor: COLORS.muted },
                }}
              >
                למידע נוסף
              </Button>
            </Box>
          </div>

          <Box
            className={css.scrollIndicator}
            onClick={() => { const el = document.getElementById('templates'); if (el) { const nav = document.querySelector('nav'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 0), behavior: 'smooth' }); } }}
            sx={{
              mt: 6,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              color: COLORS.muted,
            }}
          >
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.05em' }}>
              גלו עוד
            </Typography>
            <Box className={css.scrollArrow} sx={{ fontSize: '1.4rem', lineHeight: 1 }}>
              &#8595;
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Template Showcase */}
      <Box id="templates" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bg }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              mb: 1.5,
            }}
          >
            תבנית לכל סוג עסק
          </Typography>
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '1.05rem', mb: 6, maxWidth: 520, mx: 'auto' }}>
            בחרו את הסגנון שמתאים לכם מתוך מגוון תבניות מקצועיות מוכנות
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
              gap: 3,
            }}
          >
            {TEMPLATES.map((t) => (
              <Box
                key={t.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: t.color,
                    boxShadow: `0 8px 24px ${t.color}18`,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56, height: 56,
                    borderRadius: 3,
                    bgcolor: `${t.color}0D`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.color,
                    '& svg': { fontSize: 28 },
                  }}
                >
                  {t.icon}
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: COLORS.text }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bgAlt }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              mb: 1.5,
            }}
          >
            הכל כלול באתר שלכם
          </Typography>
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '1.05rem', mb: 6, maxWidth: 520, mx: 'auto' }}>
            כל הכלים שאתם צריכים כדי לנהל נוכחות דיגיטלית מרשימה לעסק
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {FEATURES.map((f) => (
              <Box
                key={f.title}
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  bgcolor: COLORS.panel,
                  border: `1px solid ${COLORS.border}`,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(37,99,235,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.primary,
                    mb: 2,
                    '& svg': { fontSize: 24 },
                  }}
                >
                  {f.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.text, mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.8, fontSize: '0.93rem' }}>
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bg }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              mb: 1.5,
            }}
          >
            איך זה עובד?
          </Typography>
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '1.05rem', mb: 6 }}>
            שלושה צעדים פשוטים לאתר מקצועי
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {STEPS.map((step, i) => (
              <Box
                key={step.num}
                sx={{
                  position: 'relative',
                  p: 4,
                  borderRadius: 3,
                  bgcolor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'rgba(37,99,235,0.07)',
                    position: 'absolute',
                    top: 12,
                    left: 20,
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </Typography>
                <Box
                  sx={{
                    width: 56, height: 56,
                    borderRadius: 3,
                    bgcolor: 'rgba(37,99,235,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.primary,
                    mx: 'auto',
                    mb: 2.5,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: COLORS.text, mb: 1.5 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {step.desc}
                </Typography>
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      position: 'absolute',
                      top: '50%',
                      left: -20,
                      transform: 'translateY(-50%)',
                      color: COLORS.muted,
                      fontSize: '1.3rem',
                    }}
                  >
                    &#8592;
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Pricing Preview */}
      <Box id="pricing" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bgAlt }}>
        <Container maxWidth="sm">
          <Box
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 4,
              bgcolor: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 8px 32px rgba(15,23,42,0.06)',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Inter", "Assistant", sans-serif',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                color: COLORS.text,
                mb: 1,
              }}
            >
              התחילו בניסיון חינם
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, mb: 3, lineHeight: 1.8 }}>
              בדקו את הפלטפורמה לפני שמתחייבים. ללא כרטיס אשראי.
            </Typography>

            <Box sx={{ display: 'grid', gap: 1.2, mb: 4, textAlign: 'right' }}>
              {[
                'אתר מלא עם כתובת ייחודית',
                'ממשק ניהול ללא ידע טכני',
                'עמודים מותאמים לסוג העסק',
                'התאמה מלאה לנייד',
              ].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: COLORS.secondary, fontSize: 20, flexShrink: 0 }} />
                  <Typography sx={{ color: COLORS.text, fontSize: '0.95rem' }}>{item}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              component={Link}
              to="/register"
              size="large"
              endIcon={<ArrowBackIcon />}
              sx={{
                bgcolor: COLORS.primary,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.05rem',
                px: 5,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                '&:hover': {
                  bgcolor: COLORS.primaryDark,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.25s ease',
              }}
            >
              צרו אתר עכשיו
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Box id="faq" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bg }}>
        <Container maxWidth="md">
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              mb: 1.5,
            }}
          >
            שאלות נפוצות
          </Typography>
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '1.05rem', mb: 6, maxWidth: 520, mx: 'auto' }}>
            כל מה שכדאי לדעת לפני שמקימים אתר לעסק
          </Typography>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {FAQ_ITEMS.map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                sx={{
                  bgcolor: COLORS.panel,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    borderColor: COLORS.primary,
                    boxShadow: '0 4px 16px rgba(37,99,235,0.06)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: COLORS.primary }} />}
                  sx={{
                    minHeight: 66,
                    px: { xs: 2.2, md: 3 },
                    '& .MuiAccordionSummary-content': { my: 1.4 },
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2.2, md: 3 }, pt: 0, pb: 2.6 }}>
                  <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.9 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Contact */}
      <Box id="contact" sx={{ py: { xs: 8, md: 12 }, bgcolor: COLORS.bgAlt }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              mb: 1.5,
            }}
          >
            צור קשר
          </Typography>
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '1.05rem', mb: 6, maxWidth: 520, mx: 'auto' }}>
            רוצים אתר לעסק? פנו אלינו בכל דרך שנוחה לכם
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: { xs: 4, md: 8 },
              flexWrap: 'wrap',
            }}
          >
            {CONTACT_CARDS.map((card) => (
              <Box
                key={card.title}
                component={card.href ? 'a' : 'div'}
                href={card.href || undefined}
                target={card.href && (card.href.startsWith('http') || card.href.startsWith('mailto')) ? '_blank' : undefined}
                rel={card.href && card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={card.action === 'form' ? () => setFormOpen(true) : undefined}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                  '&:hover .contactCircle': { boxShadow: `0 8px 24px ${card.color}30` },
                }}
              >
                <Box
                  className="contactCircle"
                  sx={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    bgcolor: `${card.color}12`,
                    border: `2px solid ${card.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                    transition: 'box-shadow 0.25s ease',
                    '& svg': { fontSize: 36 },
                  }}
                >
                  {card.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.text }}>
                  {card.title}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.88rem', textAlign: 'center', maxWidth: 160 }}>
                  {card.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          py: 3,
          bgcolor: COLORS.bg,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: COLORS.muted, textAlign: 'center' }}>
            2026 &copy; genisite. כל הזכויות שמורות.
          </Typography>
        </Container>
      </Box>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, direction: 'rtl', p: 0 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, flexDirection: 'row-reverse' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: COLORS.text }}>
            השארת פרטים
          </Typography>
          <IconButton onClick={() => setFormOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 1.5, textAlign: 'left' }}>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.9rem', mb: 3 }}>
            מלאו את הפרטים ונחזור אליכם בהקדם
          </Typography>
          <Box component="form" onSubmit={handleFormSubmit} sx={{
            display: 'grid', gap: 2.5,
            '& .MuiInputLabel-root': { right: 'auto !important', left: '0 !important', transformOrigin: 'top left !important' },
            '& legend': { textAlign: 'left' },
          }}>
            <TextField
              label="שם מלא"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              label="טלפון"
              required
              fullWidth
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              label="הודעה (לא חובה)"
              fullWidth
              multiline
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={formSending || !formData.name.trim() || !formData.phone.trim()}
              sx={{
                bgcolor: COLORS.primary,
                color: '#fff',
                fontWeight: 700,
                py: 1.4,
                borderRadius: 2.5,
                fontSize: '1rem',
                '&:hover': { bgcolor: COLORS.primaryDark },
              }}
            >
              {formSending ? 'שולח...' : 'שליחה'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!formToast} autoHideDuration={4000} onClose={() => setFormToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>{formToast}</Alert>
      </Snackbar>
    </Box>
  );
}
