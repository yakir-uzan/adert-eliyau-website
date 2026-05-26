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
    desc: 'בחרו את סוג האתר, מלאו את שם הארגון והפרטים הבסיסיים. תוך פחות מדקה תקבלו אתר מוכן עם כתובת ייחודית.',
  },
  {
    num: '02',
    icon: <EditIcon sx={{ fontSize: 36 }} />,
    title: 'התאמה אישית',
    desc: 'הוסיפו פעילות, הודעות, תמונות לגלריה, פרטי תשלום, תוכן ייעודי ועוד. הכל דרך ממשק ניהול פשוט ונוח.',
  },
  {
    num: '03',
    icon: <RocketLaunchIcon sx={{ fontSize: 36 }} />,
    title: 'האתר באוויר!',
    desc: 'שתפו את הקישור עם הקהילה, התורמים, התלמידים או הלקוחות. האתר מותאם לנייד, מהיר ומעודכן בזמן אמת.',
  },
];

export default function HowItWorks() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="איך זה עובד?"
          subtitle="שלושה צעדים פשוטים ויש לכם אתר מקצועי לעמותה, ישיבה, בית כנסת או ארגון"
        />

        {/* Steps */}
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
                borderRadius: 4,
                bgcolor: COLORS.panel,
                border: `1px solid ${COLORS.borderSoft}`,
                textAlign: 'center',
                transition: 'border-color 0.3s, transform 0.3s',
                '&:hover': {
                  borderColor: COLORS.border,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Secular One", sans-serif',
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  color: 'rgba(201,168,76,0.08)',
                  position: 'absolute',
                  top: 12,
                  left: 20,
                  lineHeight: 1,
                }}
              >
                {step.num}
              </Typography>
              <Box sx={{ color: COLORS.gold, mb: 2.5 }}>{step.icon}</Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: COLORS.ivory, mb: 1.5 }}>
                {step.title}
              </Typography>
              <Typography sx={{ color: COLORS.muted, lineHeight: 1.9, fontSize: '0.95rem' }}>
                {step.desc}
              </Typography>
              {i < STEPS.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    top: '50%',
                    left: -28,
                    transform: 'translateY(-50%)',
                    color: 'rgba(201,168,76,0.3)',
                    fontSize: '1.5rem',
                  }}
                >
                  &#8592;
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            component={Link}
            to="/register"
            size="large"
            endIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: COLORS.gold,
              color: COLORS.bg,
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 320, sm: 'none' },
              px: 5,
              py: { xs: 1.45, sm: 1.6 },
              borderRadius: 3,
              boxShadow: '0 12px 36px rgba(201,168,76,0.28)',
              '&:hover': {
                bgcolor: COLORS.goldLight,
                boxShadow: '0 16px 44px rgba(201,168,76,0.38)',
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
