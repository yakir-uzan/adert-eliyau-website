import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

const QUESTIONS = [
  {
    q: 'צריך ידע טכני כדי לנהל את האתר?',
    a: 'לא. מנהלי האתר נכנסים לממשק ניהול פשוט, מעדכנים תוכן, פעילות, הודעות, תמונות ותשלומים, והאתר מתעדכן מיד.',
  },
  {
    q: 'אפשר לפתוח אתר גם לפני שכל הפרטים מוכנים?',
    a: 'כן. אפשר להתחיל עם שם הארגון ופרטי קשר בסיסיים, ולאחר מכן להשלים גלריה, לוחות פעילות, קישורי תשלום ותוכן נוסף.',
  },
  {
    q: 'האתר מתאים לטלפונים?',
    a: 'כן. כל דפי האתר בנויים קודם כל לשימוש נוח בנייד, כי רוב המשתמשים נכנסים מהטלפון.',
  },
  {
    q: 'אפשר לחבר תרומות ותשלומים?',
    a: 'כן. קיימת תמיכה בפרטי בנק, ביט, פייבוקס, נדרים פלוס וחיבורי תשלום נוספים לפי הצורך.',
  },
  {
    q: 'מה קורה אחרי תקופת הניסיון?',
    a: 'האתר נשאר מוכן להפעלה. לאחר הסדרת התשלום אפשר להמשיך לפרסם, לעדכן ולנהל אותו באופן שוטף.',
  },
  {
    q: 'אפשר לקבל עזרה בהקמה?',
    a: 'בוודאי. אפשר ליצור קשר ונעזור להעלות את התוכן הראשון, לסדר את הדפים ולוודא שהאתר נראה מכובד ומוכן לקהילה.',
  },
];

export default function FAQ() {
  return (
    <PlatformLayout>
      <Container maxWidth="md" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="שאלות נפוצות"
          subtitle="כל מה שכדאי לדעת לפני שמקימים אתר לעמותה, ישיבה, בית כנסת או ארגון."
        />

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {QUESTIONS.map((item) => (
            <Accordion
              key={item.q}
              disableGutters
              sx={{
                bgcolor: 'rgba(16,26,37,0.82)',
                color: COLORS.ivory,
                border: `1px solid ${COLORS.borderSoft}`,
                borderRadius: '12px !important',
                overflow: 'hidden',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  borderColor: COLORS.border,
                  bgcolor: 'rgba(16,26,37,0.94)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: COLORS.goldLight }} />}
                sx={{
                  minHeight: 66,
                  px: { xs: 2.2, md: 3 },
                  '& .MuiAccordionSummary-content': { my: 1.4 },
                }}
              >
                <Typography sx={{ fontFamily: '"Assistant", sans-serif', fontWeight: 700, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2.2, md: 3 }, pt: 0, pb: 2.6 }}>
                <Typography sx={{ color: COLORS.muted, lineHeight: 1.9 }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box
          sx={{
            mt: 6,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'rgba(201,168,76,0.07)',
            border: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <Typography sx={{ color: COLORS.ivory, fontWeight: 800, fontSize: '1.35rem', mb: 1 }}>
            יש לכם שאלה אחרת?
          </Typography>
          <Typography sx={{ color: COLORS.muted, mb: 3, lineHeight: 1.8 }}>
            שלחו לנו הודעה קצרה ונעזור להבין מה מתאים לארגון שלכם.
          </Typography>
          <Button
            component={Link}
            to="/contact-us"
            endIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: COLORS.gold,
              color: COLORS.bg,
              fontWeight: 800,
              px: 4,
              py: 1.3,
              borderRadius: 3,
              '&:hover': { bgcolor: COLORS.goldLight },
            }}
          >
            דברו איתנו
          </Button>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
