import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useTenant } from '../config/TenantContext';
import { db, functions } from '../firebase';
import { formatPlanDate } from '../utils/tenantPlan';
import { httpsCallable } from 'firebase/functions';
import css from './TenantActivate.module.css';

const BENEFITS = [
  'האתר נשאר פעיל ופתוח לציבור',
  'הודעות, לוחות פעילות, תשלומים ויצירת קשר ממשיכים לעבוד',
  'ניהול ועדכונים שוטפים מתוך הממשק',
  'תחזוקה ותמיכה שוטפת',
];

function getPriceLabel(value, fallback) {
  if (!value && value !== 0) return fallback;
  if (typeof value === 'number') return `₪${value}`;
  const trimmed = String(value).trim();
  return trimmed || fallback;
}

export default function TenantActivate() {
  const { config, slug, basePath, plan } = useTenant();
  const [searchParams] = useSearchParams();
  const [requesting, setRequesting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [requested, setRequested] = useState(config.paymentStatus === 'submitted');
  const paymentHref = config.billing?.paymentLink || import.meta.env.VITE_SITE_ACTIVATION_PAYMENT_LINK || '/contact-us';
  const whatsappHref = config.billing?.whatsappLink || import.meta.env.VITE_PUBLIC_CONTACT_WHATSAPP || 'https://wa.me/972000000000';
  const endDate = formatPlanDate(plan?.trialEndsAt);
  const setupPrice = getPriceLabel(config.billing?.setupPrice, '₪490–₪990');
  const renewalPrice = getPriceLabel(config.billing?.renewalPrice, '₪180–₪360');
  const checkoutState = searchParams.get('checkout');
  const automaticCheckoutEnabled = import.meta.env.VITE_ENABLE_AUTOMATIC_CHECKOUT !== 'false';

  const startAutomaticCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const createCheckoutSession = httpsCallable(functions, 'createTenantCheckoutSession');
      const result = await createCheckoutSession({
        tenantSlug: slug,
        origin: window.location.origin,
      });
      const url = result.data?.url;
      if (!url) throw new Error('missing-url');
      window.location.assign(url);
      return;
    } catch {
      setCheckoutError('לא הצלחנו לפתוח תשלום אוטומטי כרגע. אפשר לנסות שוב או לעבור לתשלום ידני.');
    }
    setCheckoutLoading(false);
  };

  const submitPaymentRequest = async () => {
    setRequesting(true);
    try {
      await setDoc(doc(db, 'tenants', slug), {
        paymentStatus: 'submitted',
        activationRequestedAt: serverTimestamp(),
      }, { merge: true });
      setRequested(true);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography
              variant="h3"
              sx={{ textAlign: 'center', fontFamily: '"Secular One", serif', mb: 1 }}
            >
              {plan?.isActive ? 'האתר הופעל בהצלחה' : plan?.isExpired ? 'האתר מוכן ומחכה להפעלה' : 'האתר שלך פעיל בניסיון'}
            </Typography>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
              {plan?.isActive
                ? 'התשלום אושר והאתר פעיל עכשיו באופן מלא.'
                : plan?.isExpired
                ? 'כדי להמשיך לפרסם ולנהל את האתר, צריך להשלים תשלום.'
                : `הניסיון שלך פעיל עד ${endDate}. כדי שהאתר יישאר פעיל גם אחר כך, אפשר להשלים תשלום כבר עכשיו.`}
            </Typography>

            {checkoutState === 'success' && !plan?.isActive && (
              <Alert severity="info" sx={{ mb: 3 }}>
                התשלום הושלם. אנחנו מאמתים עכשיו את ההפעלה, והעמוד יתעדכן אוטומטית ברגע שהאתר יעבור למצב פעיל.
              </Alert>
            )}

            {checkoutState === 'cancelled' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                התשלום בוטל לפני סיום. אפשר לנסות שוב בכל רגע.
              </Alert>
            )}

            {requested && (
              <Alert severity="success" sx={{ mb: 3 }}>
                קיבלנו בקשת הפעלה. אחרי אימות התשלום האתר יעבור להפעלה מלאה.
              </Alert>
            )}

            {checkoutError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {checkoutError}
              </Alert>
            )}

            <Box
              sx={{
                borderRadius: 3,
                p: 3,
                bgcolor: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.18)',
                mb: 4,
              }}
            >
              <Typography sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>מה כלול בהפעלה</Typography>
              <Stack spacing={1.2}>
                {BENEFITS.map(item => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
                    <Typography>{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mb: 4,
              }}
            >
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(201,168,76,0.16)' }}>
                <Typography sx={{ color: 'text.secondary', mb: 0.5 }}>הקמה חד-פעמית</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontFamily: '"Secular One", serif' }}>{setupPrice}</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(201,168,76,0.16)' }}>
                <Typography sx={{ color: 'text.secondary', mb: 0.5 }}>חידוש שנתי</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontFamily: '"Secular One", serif' }}>{renewalPrice}</Typography>
              </Box>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              {automaticCheckoutEnabled ? (
                <Button onClick={startAutomaticCheckout} variant="contained" size="large" disabled={checkoutLoading || plan?.isActive}>
                  {checkoutLoading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : plan?.isActive ? 'האתר פעיל' : 'הפעל את האתר'}
                </Button>
              ) : (
                <Button component="a" href={paymentHref} variant="contained" size="large">
                  הפעל את האתר
                </Button>
              )}
              <Button component="a" href={whatsappHref} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" startIcon={<WhatsAppIcon />}>
                דברו איתנו
              </Button>
              <Button
                onClick={submitPaymentRequest}
                variant="outlined"
                size="large"
                startIcon={requesting ? null : <SendOutlinedIcon />}
                disabled={requesting || requested}
              >
                {requesting ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : requested ? 'הבקשה נשלחה' : 'שלחתי תשלום'}
              </Button>
              <Button component={Link} to={basePath} variant="text" size="large">
                חזרה לאתר
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
