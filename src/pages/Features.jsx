import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WebIcon from '@mui/icons-material/Web';
import SpeedIcon from '@mui/icons-material/Speed';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import CollectionsIcon from '@mui/icons-material/Collections';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

const FEATURES = [
  {
    icon: <WebIcon sx={{ fontSize: 28 }} />,
    title: 'אתר מקצועי',
    desc: 'עיצוב מודרני ומותאם אישית שמייצג את העסק שלכם בצורה הטובה ביותר.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 28 }} />,
    title: 'הקמה מהירה',
    desc: 'בחרו תבנית, מלאו פרטים, ותוך דקות יש לכם אתר עם כתובת ייחודית.',
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 28 }} />,
    title: 'תשלומים אונליין',
    desc: 'קבלת תשלומים בצורה מאובטחת. תמיכה בכרטיסי אשראי, ביט והעברות.',
  },
  {
    icon: <CollectionsIcon sx={{ fontSize: 28 }} />,
    title: 'גלריית תמונות',
    desc: 'הציגו תמונות מהעסק, מוצרים ואירועים בגלריה מעוצבת ומרשימה.',
  },
  {
    icon: <PhoneIphoneIcon sx={{ fontSize: 28 }} />,
    title: 'מותאם לנייד',
    desc: 'האתר נראה מושלם בכל מכשיר - סמארטפון, טאבלט ומחשב.',
  },
  {
    icon: <DashboardCustomizeIcon sx={{ fontSize: 28 }} />,
    title: 'ממשק ניהול',
    desc: 'ממשק ניהול אינטואיטיבי שמאפשר לעדכן את כל התוכן בקלות.',
  },
  {
    icon: <PaletteIcon sx={{ fontSize: 28 }} />,
    title: 'התאמה אישית',
    desc: 'צבעים, תמונות, עמודים וסקשנים - הכל בשליטה מלאה שלכם.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    title: 'אבטחה ופרטיות',
    desc: 'המידע מאוחסן בצורה מאובטחת עם גיבויים אוטומטיים בענן.',
  },
];

export default function Features() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="כל מה שהעסק שלכם צריך"
          subtitle="פיצ׳רים שנבנו כדי לעזור לכם ליצור נוכחות דיגיטלית מקצועית"
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
            gap: 3,
            mb: { xs: 8, md: 10 },
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
                  transform: 'translateY(-4px)',
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
                  mb: 2.5,
                }}
              >
                {f.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.text, mb: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, lineHeight: 1.85 }}>
                {f.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '1.1rem', mb: 3 }}>
            רוצים לראות את כל זה באתר שלכם?
          </Typography>
          <Button
            component={Link}
            to="/register"
            size="large"
            endIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: COLORS.primary,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 5,
              py: 1.6,
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
    </PlatformLayout>
  );
}
