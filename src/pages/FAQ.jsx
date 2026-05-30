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
    a: 'לא. נכנסים לממשק ניהול פשוט, מעדכנים תוכן, תמונות ופרטים, והאתר מתעדכן מיד.',
  },
  {
    q: 'אפשר לפתוח אתר גם לפני שכל הפרטים מוכנים?',
    a: 'כן. אפשר להתחיל עם שם העסק ופרטי קשר בסיסיים, ולאחר מכן להשלים גלריה, תוכן ועמודים נוספים.',
  },
  {
    q: 'האתר מותאם לטלפונים?',
    a: 'כן. כל דפי האתר בנויים קודם כל לשימוש נוח בנייד, כי רוב הלקוחות גולשים מהטלפון.',
  },
  {
    q: 'אפשר לקבל תשלומים דרך האתר?',
    a: 'כן. קיימת תמיכה בכרטיסי אשראי, ביט, פייבוקס, העברות בנקאיות וחיבורים נוספים.',
  },
  {
    q: 'מה קורה אחרי תקופת הניסיון?',
    a: 'האתר נשאר מוכן להפעלה. לאחר הסדרת התשלום אפשר להמשיך לפרסם, לעדכן ולנהל אותו באופן שוטף.',
  },
  {
    q: 'אפשר לקבל עזרה בהקמה?',
    a: 'בוודאי. צרו קשר ונעזור להעלות את התוכן הראשון, לסדר את העמודים ולוודא שהאתר נראה מעולה.',
  },
];

export default function FAQ() {
  return (
    <PlatformLayout>
      <Container maxWidth="md" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="שאלות נפוצות"
          subtitle="כל מה שכדאי לדעת לפני שמקימים אתר לעסק."
        />

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {QUESTIONS.map((item) => (
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

        <Box
          sx={{
            mt: 6,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: COLORS.bgAlt,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography sx={{ color: COLORS.text, fontWeight: 800, fontSize: '1.3rem', mb: 1 }}>
            יש לכם שאלה אחרת?
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, mb: 3, lineHeight: 1.8 }}>
            שלחו לנו הודעה קצרה ונעזור לכם להבין מה מתאים לעסק.
          </Typography>
          <Button
            component={Link}
            to="/contact-us"
            endIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: COLORS.primary,
              color: '#FFFFFF',
              fontWeight: 700,
              px: 4,
              py: 1.3,
              borderRadius: 3,
              '&:hover': { bgcolor: COLORS.primaryDark },
            }}
          >
            דברו איתנו
          </Button>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
