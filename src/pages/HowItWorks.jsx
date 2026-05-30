import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import EditIcon from '@mui/icons-material/Edit';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

const STEPS = [
  {
    num: '01',
    icon: <TouchAppIcon sx={{ fontSize: 36 }} />,
    title: 'הרשמה מהירה',
    desc: 'בחרו תבנית מתאימה לסוג העסק, מלאו את הפרטים הבסיסיים, ותוך פחות מדקה תקבלו אתר מוכן.',
  },
  {
    num: '02',
    icon: <EditIcon sx={{ fontSize: 36 }} />,
    title: 'התאמה אישית',
    desc: 'הוסיפו תוכן, תמונות, עמודים ופרטי קשר. הכל דרך ממשק ניהול פשוט וללא ידע טכני.',
  },
  {
    num: '03',
    icon: <RocketLaunchIcon sx={{ fontSize: 36 }} />,
    title: 'האתר באוויר!',
    desc: 'שתפו את הקישור עם הלקוחות. האתר מותאם לנייד, מהיר ומעודכן בזמן אמת.',
  },
];

export default function HowItWorks() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="איך זה עובד?"
          subtitle="שלושה צעדים פשוטים ויש לכם אתר מקצועי לעסק"
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 4,
            mb: { xs: 8, md: 12 },
          }}
        >
          {STEPS.map((step, i) => (
            <Box
              key={step.num}
              sx={{
                position: 'relative',
                p: 4,
                borderRadius: 3,
                bgcolor: COLORS.panel,
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

        <Box sx={{ textAlign: 'center' }}>
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
            בואו נתחיל
          </Button>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
