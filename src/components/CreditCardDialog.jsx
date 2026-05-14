import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { sendReceiptEmail } from '../utils/receipt';

// ─── Stripe configuration ────────────────────────────────────────────────────
// Set VITE_STRIPE_PUBLIC_KEY in your .env file (starts with pk_live_ or pk_test_)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder'
);
// ─────────────────────────────────────────────────────────────────────────────

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#F5F0E8',
      fontFamily: '"Assistant", Arial, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#5a6a7a' },
    },
    invalid: { color: '#f87171', iconColor: '#f87171' },
  },
};

const fieldBox = {
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: 1.5,
  px: 1.75,
  py: 1.4,
  bgcolor: 'rgba(0,0,0,0.25)',
  transition: 'border-color 0.2s',
  '&:focus-within': { borderColor: 'primary.main' },
};

function fmtMoney(n) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);
}

function CheckoutForm({ amount, description, onClose }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!name.trim() || !email.trim()) { setError('יש למלא שם ואימייל'); return; }

    setLoading(true);
    setError('');

    try {
      // Step 1: tokenize card data securely via Stripe.js (card data never reaches our server)
      const { paymentMethod, error: pmErr } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: { name, email },
      });
      if (pmErr) throw new Error(pmErr.message);

      // Step 2: send paymentMethod.id to backend to create & confirm PaymentIntent
      // ── BACKEND REQUIRED ────────────────────────────────────────────────────
      // Create a Firebase Cloud Function (or any HTTPS endpoint) that:
      //   1. Receives { paymentMethodId, amountAgorot, description }
      //   2. Calls stripe.paymentIntents.create({ amount, currency:'ils', payment_method, confirm:true })
      //   3. Returns { success: true } or { error: '...' }
      //
      // const res = await fetch(import.meta.env.VITE_PAYMENT_API_URL + '/charge', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ paymentMethodId: paymentMethod.id, amountAgorot: amount * 100, description }),
      // });
      // const json = await res.json();
      // if (!res.ok || json.error) throw new Error(json.error || 'שגיאה בעיבוד התשלום');
      // ────────────────────────────────────────────────────────────────────────

      // Step 3: send styled receipt email via EmailJS
      const rid = await sendReceiptEmail({
        name,
        email,
        description,
        amount: fmtMoney(amount),
      }).catch(() => null); // don't fail if email fails

      setReceiptId(rid || '');
      setSuccess(true);
    } catch (err) {
      const hebrewErrors = {
        'Your card number is incorrect.': 'מספר הכרטיס שגוי',
        'Your card has expired.': 'הכרטיס פג תוקף',
        "Your card's security code is incorrect.": 'קוד האבטחה שגוי',
        'Your card was declined.': 'הכרטיס נדחה',
        'An error occurred while processing your card.': 'אירעה שגיאה בעיבוד הכרטיס',
      };
      setError(hebrewErrors[err.message] || err.message || 'אירעה שגיאה — נסו שוב');
    }
    setLoading(false);
  };

  // ── Success screen ──
  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#4ade80', mb: 2 }} />
        <Typography variant="h5" sx={{ color: 'secondary.main', mb: 1 }}>התשלום בוצע!</Typography>
        <Typography color="text.secondary" sx={{ mb: receiptId ? 2 : 0 }}>
          {description} — {fmtMoney(amount)}
        </Typography>
        {receiptId && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <MarkEmailReadIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
            <Typography variant="body2" color="text.secondary">
              קבלה נשלחה לכתובת <strong style={{ color: '#F5F0E8' }}>{email}</strong>
            </Typography>
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          מספר קבלה: {receiptId}
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ mt: 3, px: 5 }}>סגור</Button>
      </Box>
    );
  }

  // ── Payment form ──
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Amount badge */}
      <Box sx={{ textAlign: 'center', bgcolor: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block">סכום לתשלום</Typography>
        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.9rem', fontFamily: '"Secular One", serif', lineHeight: 1.1 }}>
          {fmtMoney(amount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      </Box>

      {/* Personal details */}
      <TextField
        label="שם מלא *"
        value={name}
        onChange={e => setName(e.target.value)}
        fullWidth
        size="small"
        required
      />
      <TextField
        label="אימייל לקבלה *"
        value={email}
        onChange={e => setEmail(e.target.value)}
        type="email"
        fullWidth
        size="small"
        required
        inputProps={{ dir: 'ltr' }}
        helperText="הקבלה תישלח לכתובת זו"
      />

      <Divider sx={{ borderColor: 'rgba(201,168,76,0.12)' }} />

      {/* Card fields */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>מספר כרטיס</Typography>
        <Box sx={fieldBox}>
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>תוקף</Typography>
          <Box sx={fieldBox}>
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>CVV</Typography>
          <Box sx={fieldBox}>
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ fontSize: '0.88rem' }}>{error}</Alert>}

      {/* Security note */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center' }}>
        <LockIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          התשלום מאובטח בהצפנת SSL — מופעל על ידי Stripe
        </Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !stripe}
        startIcon={loading ? null : <CreditCardIcon />}
        sx={{
          background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
          color: '#0D1B2A',
          fontWeight: 700,
          fontSize: '1rem',
          py: 1.4,
          '&:hover': { boxShadow: '0 6px 24px rgba(201,168,76,0.4)' },
        }}
      >
        {loading ? <CircularProgress size={24} sx={{ color: '#0D1B2A' }} /> : `שלם ${fmtMoney(amount)}`}
      </Button>
    </Box>
  );
}

export default function CreditCardDialog({ open, onClose, amount, description }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1A2940',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 3,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ color: 'secondary.main', fontFamily: '"Secular One", serif' }}>
            תשלום בכרטיס אשראי
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Elements stripe={stripePromise}>
          <CheckoutForm amount={amount} description={description} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
