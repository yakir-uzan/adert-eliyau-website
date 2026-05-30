import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

const INCLUDED = [
  'אתר מלא לעסק עם כתובת ייחודית',
  'ממשק ניהול ללא ידע טכני',
  'עמודים מותאמים לסוג העסק שלכם',
  'אפשרויות תשלום אונליין',
  'התאמה מלאה לנייד ולמחשב',
  'עדכוני תוכן בזמן אמת',
];

export default function Pricing() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="מחירים"
          subtitle="מתחילים בתקופת ניסיון, בודקים שהכל מתאים, ורק אז ממשיכים."
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              p: { xs: 3.5, md: 5 },
              borderRadius: 4,
              bgcolor: COLORS.panel,
              border: `2px solid ${COLORS.primary}`,
              boxShadow: '0 8px 32px rgba(37,99,235,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                insetInlineStart: -70,
                top: -95,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.06), transparent 68%)',
              }}
            />

            <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
              תוכנית מלאה לעסק
            </Typography>
            <Typography sx={{ color: COLORS.text, fontFamily: '"Inter", "Assistant", sans-serif', fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, lineHeight: 1.08, mb: 1.5, letterSpacing: '-0.02em' }}>
              30 ימי ניסיון
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.9, mb: 3.5 }}>
              תקופת ניסיון מלאה לפני הפעלה בתשלום. לאחר מכן ממשיכים לפי המחירים הקבועים.
            </Typography>

            <Box sx={{ display: 'grid', gap: 1.5, mb: 4 }}>
              {INCLUDED.map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.3 }}>
                  <CheckCircleIcon sx={{ color: COLORS.secondary, fontSize: 20, flexShrink: 0 }} />
                  <Typography sx={{ color: COLORS.text, lineHeight: 1.6 }}>{item}</Typography>
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
                px: 4.5,
                py: 1.55,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                '&:hover': { bgcolor: COLORS.primaryDark, transform: 'translateY(-2px)' },
                transition: 'all 0.24s ease',
              }}
            >
              התחילו ניסיון
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {[
              { label: 'הקמה חד-פעמית', price: '₪490-₪990', note: 'תשלום הקמה עבור פתיחת האתר, התאמת ההגדרות והעמדת האתר לשימוש.' },
              { label: 'חידוש שנתי', price: '₪180-₪360', note: 'תשלום שנתי לשמירת האתר פעיל, זמין ומוכן לעדכונים שוטפים.' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: { xs: 3.5, md: 4 },
                  borderRadius: 3,
                  bgcolor: COLORS.bgAlt,
                  border: `1px solid ${COLORS.border}`,
                  minHeight: 190,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: COLORS.textSecondary, fontWeight: 700, mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: COLORS.primary, fontFamily: '"Inter", "Assistant", sans-serif', fontWeight: 800, fontSize: { xs: '2.2rem', md: '2.8rem' }, lineHeight: 1, mb: 1.5, letterSpacing: '-0.02em' }}>
                  {item.price}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.85 }}>
                  {item.note}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
