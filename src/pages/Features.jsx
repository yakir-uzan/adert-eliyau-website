import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import PaymentIcon from '@mui/icons-material/Payment';
import CollectionsIcon from '@mui/icons-material/Collections';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

const FEATURES = [
  {
    icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
    title: 'לוחות זמנים ופעילות',
    desc: 'הצגת זמני פעילות, שיעורים, אירועים או סדרי יום בצורה ברורה ומעודכנת לפי סוג הארגון.',
  },
  {
    icon: <CampaignIcon sx={{ fontSize: 32 }} />,
    title: 'הודעות ועדכונים',
    desc: 'פרסום הודעות לקהילה, לתורמים, לתלמידים או לחברים — אירועים, עדכונים וחדשות במקום אחד.',
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 32 }} />,
    title: 'תשלומים ותרומות',
    desc: 'קבלת תרומות ותשלומים אונליין בצורה מאובטחת. תמיכה בכרטיסי אשראי והעברות.',
  },
  {
    icon: <CollectionsIcon sx={{ fontSize: 32 }} />,
    title: 'גלריית תמונות',
    desc: 'הצגת תמונות מהפעילות, מהאירועים ומהקהילה בגלריה מרשימה ומותאמת לנייד.',
  },
  {
    icon: <PhoneIphoneIcon sx={{ fontSize: 32 }} />,
    title: 'מותאם לנייד',
    desc: 'האתר נראה מושלם בכל מכשיר — סמארטפון, טאבלט ומחשב. ללא צורך באפליקציה.',
  },
  {
    icon: <DashboardCustomizeIcon sx={{ fontSize: 32 }} />,
    title: 'ממשק ניהול',
    desc: 'ממשק ניהול אינטואיטיבי שמאפשר למנהלי האתר לעדכן את כל התוכן בקלות וללא ידע טכני.',
  },
  {
    icon: <WidgetsIcon sx={{ fontSize: 32 }} />,
    title: 'מודולים לפי סוג אתר',
    desc: 'ברכות לבית כנסת, פרויקטים לעמותה, שיעורים לישיבה או שירותים לארגון — הכל מותאם לסוג האתר.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: 'אבטחה ופרטיות',
    desc: 'המידע מאוחסן בצורה מאובטחת עם גיבויים אוטומטיים, הרשאות מנהל ופרטיות משתמשים.',
  },
];

export default function Features() {
  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="כל מה שאתר קהילתי צריך"
          subtitle="יכולות שנבנו לעמותות, ישיבות, בתי כנסת וארגונים שרוצים אתר מכובד ומנוהל בקלות"
        />

        {/* Features Grid */}
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
                borderRadius: 4,
                bgcolor: COLORS.panel,
                border: `1px solid ${COLORS.borderSoft}`,
                transition: 'border-color 0.3s, transform 0.3s',
                '&:hover': {
                  borderColor: COLORS.border,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: 'rgba(201,168,76,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.gold,
                  mb: 2.5,
                }}
              >
                {f.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.ivory, mb: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.muted, lineHeight: 1.85 }}>
                {f.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: COLORS.muted, fontSize: '1.1rem', mb: 3 }}>
            רוצים לראות את כל זה באתר שלכם?
          </Typography>
          <Button
            component={Link}
            to="/register"
            size="large"
            endIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: COLORS.gold,
              color: COLORS.bg,
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 5,
              py: 1.6,
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
            צרו אתר עכשיו
          </Button>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
