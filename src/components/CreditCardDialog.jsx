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
import { useTenant } from '../config/TenantContext';
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
import { fmtMoney } from '../utils/formatters';
import css from './CreditCardDialog.module.css';

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

function CheckoutForm({ amount, description, onClose, tenantConfig, onSuccess }) {
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
      const { paymentMethod, error: pmErr } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: { name, email },
      });
      if (pmErr) throw new Error(pmErr.message);

      const rid = await sendReceiptEmail({
        name,
        email,
        description,
        amount: fmtMoney(amount),
        tenantConfig,
      }).catch(() => null);

      setReceiptId(rid || '');
      setSuccess(true);
      onSuccess?.({ name, email, amount, description, receiptId: rid || '' });
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

  if (success) {
    return (
      <div className={css.successContainer}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#4ade80', mb: 2 }} />
        <Typography variant="h5" sx={{ color: 'secondary.main', mb: 1 }}>התשלום בוצע!</Typography>
        <Typography color="text.secondary" sx={{ mb: receiptId ? 2 : 0 }}>{description} — {fmtMoney(amount)}</Typography>
        {receiptId && (
          <div className={css.receiptRow}>
            <MarkEmailReadIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
            <Typography variant="body2" color="text.secondary">
              קבלה נשלחה לכתובת <strong style={{ color: '#F5F0E8' }}>{email}</strong>
            </Typography>
          </div>
        )}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>מספר קבלה: {receiptId}</Typography>
        <Button variant="contained" onClick={onClose} sx={{ mt: 3, px: 5 }}>סגור</Button>
      </div>
    );
  }

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.amountBox}>
        <Typography variant="caption" color="text.secondary" display="block">סכום לתשלום</Typography>
        <Typography className={css.amountValue} sx={{ color: 'primary.main' }}>{fmtMoney(amount)}</Typography>
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      </div>

      <TextField label="שם מלא *" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" required />
      <TextField label="אימייל לקבלה *" value={email} onChange={e => setEmail(e.target.value)} type="email" fullWidth size="small" required inputProps={{ dir: 'ltr' }} helperText="הקבלה תישלח לכתובת זו" />

      <Divider sx={{ borderColor: 'rgba(201,168,76,0.12)' }} />

      <div>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>מספר כרטיס</Typography>
        <div className={css.fieldBox}><CardNumberElement options={ELEMENT_OPTIONS} /></div>
      </div>

      <div className={css.cardFieldsRow}>
        <div>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>תוקף</Typography>
          <div className={css.fieldBox}><CardExpiryElement options={ELEMENT_OPTIONS} /></div>
        </div>
        <div>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>CVV</Typography>
          <div className={css.fieldBox}><CardCvcElement options={ELEMENT_OPTIONS} /></div>
        </div>
      </div>

      {error && <Alert severity="error" sx={{ fontSize: '0.88rem' }}>{error}</Alert>}

      <div className={css.securityNote}>
        <LockIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">התשלום מאובטח בהצפנת SSL — מופעל על ידי Stripe</Typography>
      </div>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || !stripe} startIcon={loading ? null : <CreditCardIcon />}
        className={css.submitButton}
      >
        {loading ? <CircularProgress size={24} sx={{ color: '#0D1B2A' }} /> : `שלם ${fmtMoney(amount)}`}
      </Button>
    </form>
  );
}

export default function CreditCardDialog({ open, onClose, amount, description, onSuccess }) {
  const { config } = useTenant();
  const stripeKey = config.payments?.stripeKey || import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

  if (!stripeKey) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{ className: css.dialogPaper }}>
        <DialogTitle className={css.dialogTitleRow}>
          <Typography variant="h6" className={css.titleText} sx={{ color: 'secondary.main' }}>תשלום בכרטיס אשראי</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            תשלום בכרטיס אשראי לא מוגדר כרגע. פנו למנהל האתר.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const stripePromise = loadStripe(stripeKey);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ className: css.dialogPaper }}>
      <DialogTitle className={css.dialogTitleRow}>
        <div className={css.dialogTitleInner}>
          <CreditCardIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" className={css.titleText} sx={{ color: 'secondary.main' }}>תשלום בכרטיס אשראי</Typography>
        </div>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Elements stripe={stripePromise}>
          <CheckoutForm amount={amount} description={description} onClose={onClose} tenantConfig={config} onSuccess={onSuccess} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
