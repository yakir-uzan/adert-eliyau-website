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
  'אתר מלא לבית הכנסת עם כתובת ייחודית',
  'ממשק ניהול לגבאים ללא ידע טכני',
  'זמני תפילה, הודעות, גלריה וברכות',
  'אפשרויות תרומה ותשלום אונליין',
  'התאמה מלאה לנייד ולמחשב',
  'עדכוני תוכן בזמן אמת',
];

export default function Pricing() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="מחירים"
          subtitle="מתחילים בתקופת ניסיון, בודקים שהכל מתאים לקהילה, ורק אז מפעילים את האתר להמשך שימוש."
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
              p: { xs: 3.2, md: 5 },
              borderRadius: 4,
              bgcolor: 'rgba(16,26,37,0.86)',
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 28px 70px rgba(0,0,0,0.28)',
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
                background: 'radial-gradient(circle, rgba(201,168,76,0.18), transparent 68%)',
              }}
            />

            <Typography sx={{ color: COLORS.goldLight, fontWeight: 700, fontSize: '1.15rem', mb: 1 }}>
              תוכנית מלאה לבית כנסת
            </Typography>
            <Typography sx={{ color: COLORS.ivory, fontFamily: '"Secular One", sans-serif', fontSize: { xs: '2.4rem', md: '3.4rem' }, lineHeight: 1.08, mb: 1.5 }}>
              30 ימי ניסיון
            </Typography>
            <Typography sx={{ color: COLORS.muted, lineHeight: 1.9, mb: 3.5 }}>
              תקופת ניסיון מלאה לפני הפעלה בתשלום. לאחר מכן ממשיכים לפי המחירים הקבועים של האתר.
            </Typography>

            <Box sx={{ display: 'grid', gap: 1.5, mb: 4 }}>
              {INCLUDED.map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.3 }}>
                  <CheckCircleIcon sx={{ color: COLORS.gold, fontSize: 21, flexShrink: 0 }} />
                  <Typography sx={{ color: COLORS.ivory, lineHeight: 1.6 }}>{item}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              component={Link}
              to="/register"
              size="large"
              endIcon={<ArrowBackIcon />}
              sx={{
                bgcolor: COLORS.gold,
                color: COLORS.bg,
                fontWeight: 800,
                fontSize: '1.05rem',
                px: 4.5,
                py: 1.55,
                borderRadius: 3,
                boxShadow: '0 16px 42px rgba(201,168,76,0.26)',
                '&:hover': { bgcolor: COLORS.goldLight, transform: 'translateY(-2px)' },
                transition: 'all 0.24s ease',
              }}
            >
              התחילו ניסיון
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {[
              { label: 'הקמה חד-פעמית', price: '₪490–₪990', note: 'תשלום הקמה עבור פתיחת האתר, התאמת ההגדרות והעמדת האתר לשימוש.' },
              { label: 'חידוש שנתי', price: '₪180–₪360', note: 'תשלום שנתי לשמירת האתר פעיל, זמין ומוכן לעדכונים שוטפים.' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: { xs: 3.2, md: 4 },
                  borderRadius: 3,
                  bgcolor: 'rgba(245,240,232,0.035)',
                  border: `1px solid ${COLORS.borderSoft}`,
                  minHeight: 190,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: COLORS.muted, fontWeight: 700, mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: COLORS.goldLight, fontFamily: '"Secular One", sans-serif', fontSize: { xs: '2.4rem', md: '3.2rem' }, lineHeight: 1, mb: 1.5 }}>
                  {item.price}
                </Typography>
                <Typography sx={{ color: COLORS.muted, lineHeight: 1.85 }}>
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
