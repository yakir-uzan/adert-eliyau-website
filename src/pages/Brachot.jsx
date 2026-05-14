import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StarIcon from '@mui/icons-material/Star';
import KeyIcon from '@mui/icons-material/Key';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import CreditCardDialog from '../components/CreditCardDialog';

/* ── Icon registry ── */
const ICON_OPTIONS = [
  { name: 'KeyIcon',              label: 'מפתח',    Comp: KeyIcon },
  { name: 'MenuBookIcon',         label: 'ספר',      Comp: MenuBookIcon },
  { name: 'EmojiEventsIcon',      label: 'גביע',     Comp: EmojiEventsIcon },
  { name: 'StarsIcon',            label: 'כוכבים',   Comp: StarsIcon },
  { name: 'SchoolIcon',           label: 'לימוד',    Comp: SchoolIcon },
  { name: 'StarIcon',             label: 'כוכב',     Comp: StarIcon },
  { name: 'FavoriteIcon',         label: 'לב',       Comp: FavoriteIcon },
  { name: 'AutoAwesomeIcon',      label: 'ניצוץ',    Comp: AutoAwesomeIcon },
  { name: 'WorkspacePremiumIcon', label: 'פרס',      Comp: WorkspacePremiumIcon },
  { name: 'ShoppingCartIcon',     label: 'עגלה',     Comp: ShoppingCartIcon },
];
const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(o => [o.name, o.Comp]));
const DEFAULT_ICON = StarIcon;

/* ── Hardcoded defaults (shown when Firestore has no data) ── */
const BRACHOT_DEFAULT = [
  { id: 'hikal',   title: 'ברכה בפתיחת ההיכל',    description: 'זכות לברך בפתיחת ארון הקודש וקריאת פסוק "ויהי בנסוע הארון" בתפילת שחרית של שבת', price: 200, tag: 'פופולרי', iconName: 'KeyIcon' },
  { id: 'tehilim', title: 'ברכה אחרי התהילים',     description: 'זכות הברכה לאחר אמירת תהילים בציבור — לעילוי נשמה, לרפואה שלמה או לשמחה',          price: 150, tag: null,      iconName: 'MenuBookIcon' },
  { id: 'shnatit', title: 'ברכה שנתית',            description: 'ברכה מיוחדת הנאמרת בציבור פעם בשנה — ביום הולדת, יום נישואין, יארצייט או אירוע משפחתי', price: 600, tag: 'מיוחד',   iconName: 'EmojiEventsIcon' },
  { id: 'hatzi',   title: 'ברכה חצי שנתית',        description: 'ברכה בציבור פעמיים בשנה — לאבות המשפחה, לבריאות, להצלחה ולברכה',                     price: 350, tag: null,      iconName: 'StarsIcon' },
  { id: 'shiur',   title: 'ברכה אחרי השיעור',      description: 'זכות לברך בסיום שיעור תורה שבועי — זכות גדולה לעצמכם ולזולת',                         price: 100, tag: null,      iconName: 'SchoolIcon' },
];

const WA_GABBAI    = 'https://wa.me/9725XXXXXXXX';
const BIT_PHONE    = '05XXXXXXXX';
const PAYBOX_LINK  = 'https://paybox.me/XXXXX';
const NEDARIM_LINK = 'https://www.nedarimplus.co.il/';
const BIT_LINK     = `https://www.bitpay.co.il/app/transfer?phone=${BIT_PHONE}`;
const BANK_ROWS    = [
  ['בנק',   '[שם הבנק]'],
  ['סניף',  '[מספר סניף]'],
  ['חשבון', '[מספר חשבון]'],
];

function fmtMoney(n) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);
}

/* ── Helpers ── */
function resolveIcon(iconName) {
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <Tooltip title={copied ? 'הועתק!' : 'העתק'} placement="top">
      <IconButton size="small" onClick={copy} sx={{ color: copied ? '#4ade80' : 'primary.main', p: 0.5, transition: 'color 0.2s' }}>
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

function PaymentRow({ label, color, href, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 2, px: 2, py: 1.5, gap: 1 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', minWidth: 80 }}>{label}</Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Button href={href} target="_blank" rel="noopener" size="small" endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
        sx={{ borderColor: color, color, fontWeight: 700, fontSize: '0.8rem', px: 1.5, border: '1px solid', '&:hover': { bgcolor: `${color}14` } }}>
        פתח
      </Button>
    </Box>
  );
}

/* ── Purchase dialog ── */
function PurchaseDialog({ bracha, onClose }) {
  const [creditOpen, setCreditOpen] = useState(false);
  if (!bracha) return null;
  const { title, description, price, iconName } = bracha;
  const IconComp = resolveIcon(iconName);
  const waText = encodeURIComponent(`שלום, שילמתי עבור ${title} (${fmtMoney(price)}). אנא אשרו קבלת התשלום.`);

  return (
    <>
      <Dialog open={!!bracha} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconComp sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ color: 'secondary.main', fontFamily: '"Secular One", serif', lineHeight: 1.2 }}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{description}</Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', mt: -0.5, mr: -1 }}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Box sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">סכום לתשלום</Typography>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '2rem', fontFamily: '"Secular One", serif', lineHeight: 1.1 }}>{fmtMoney(price)}</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(201,168,76,0.15)', mt: 1 }} />
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3, pt: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', opacity: 0.8, display: 'block', mb: 1.5, letterSpacing: 1 }}>בחרו אמצעי תשלום</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2, p: 2, bgcolor: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CreditCardIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Box>
                  <Typography sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.95rem' }}>כרטיס אשראי</Typography>
                  <Typography variant="caption" color="text.secondary">קבלה תישלח למייל מידית</Typography>
                </Box>
              </Box>
              <Button variant="contained" size="small" onClick={() => setCreditOpen(true)}
                sx={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)', color: '#0D1B2A', fontWeight: 700, px: 2, flexShrink: 0 }}>
                שלם
              </Button>
            </Box>
            <PaymentRow label="ביט" color="#0091FF" href={BIT_LINK}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ color: 'secondary.main', fontWeight: 700, direction: 'ltr', fontSize: '0.95rem' }}>{BIT_PHONE}</Typography>
                <CopyButton value={BIT_PHONE} />
              </Box>
            </PaymentRow>
            <PaymentRow label="פייבוקס" color="#6c3cbf" href={PAYBOX_LINK}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>תשלום מהיר ובטוח</Typography>
            </PaymentRow>
            <PaymentRow label="נדרים פלוס" color="#1a56b0" href={NEDARIM_LINK}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>nedarimplus.co.il</Typography>
            </PaymentRow>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 2, px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600 }}>העברה בנקאית</Typography>
              </Box>
              <Table size="small" sx={{ '& td': { border: 'none', py: 0.25, px: 0 } }}>
                <TableBody>
                  {BANK_ROWS.map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', width: 70 }}>{k}:</TableCell>
                      <TableCell sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.85rem' }}>{v}</TableCell>
                      <TableCell sx={{ width: 32 }}><CopyButton value={v} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(201,168,76,0.1)', my: 2.5 }} />
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mb: 1.5 }}>
            לאחר תשלום בביט / פייבוקס / בנק — אשרו לגבאות
          </Typography>
          <Button fullWidth href={`${WA_GABBAI}?text=${waText}`} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}
            sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 700, py: 1.2, fontSize: '0.95rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' } }}>
            אישור תשלום לגבאות
          </Button>
        </DialogContent>
      </Dialog>
      <CreditCardDialog open={creditOpen} onClose={() => setCreditOpen(false)} amount={price} description={title} />
    </>
  );
}

/* ── Edit bracha dialog ── */
function EditBrachaDialog({ bracha, onClose, onSave }) {
  const [title, setTitle]      = useState('');
  const [description, setDesc] = useState('');
  const [price, setPrice]      = useState('');
  const [tag, setTag]          = useState('');
  const [iconName, setIcon]    = useState('StarIcon');
  const [saving, setSaving]    = useState(false);

  useEffect(() => {
    if (bracha) {
      setTitle(bracha.title || '');
      setDesc(bracha.description || '');
      setPrice(bracha.price || '');
      setTag(bracha.tag || '');
      setIcon(bracha.iconName || 'StarIcon');
    }
  }, [bracha]);

  const handleSave = async () => {
    if (!title.trim() || !price) return;
    setSaving(true);
    await onSave(bracha.id, { title, description, price: parseFloat(price), tag: tag.trim() || null, iconName });
    setSaving(false);
    onClose();
  };

  if (!bracha) return null;
  return (
    <Dialog open={!!bracha} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}>
      <DialogTitle sx={{ color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        עריכת ברכה
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="שם הברכה *" value={title} onChange={e => setTitle(e.target.value)} fullWidth autoFocus />
        <TextField label="תיאור" value={description} onChange={e => setDesc(e.target.value)} multiline rows={3} fullWidth />
        <TextField label="מחיר (₪) *" value={price} onChange={e => setPrice(e.target.value)} type="number" fullWidth inputProps={{ dir: 'ltr', min: 1 }} />
        <TextField label='תג (אופציונלי, כגון "פופולרי")' value={tag} onChange={e => setTag(e.target.value)} fullWidth />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>אייקון</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ICON_OPTIONS.map(({ name, label, Comp }) => (
              <Tooltip key={name} title={label}>
                <IconButton
                  size="small"
                  onClick={() => setIcon(name)}
                  sx={{
                    color: iconName === name ? 'primary.main' : 'text.secondary',
                    bgcolor: iconName === name ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: '1px solid',
                    borderColor: iconName === name ? 'primary.main' : 'rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    p: 0.8,
                    '&:hover': { bgcolor: 'rgba(201,168,76,0.1)' },
                  }}
                >
                  <Comp fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">ביטול</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !title.trim() || !price}
          startIcon={saving ? null : <SaveIcon />}>
          {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Add bracha dialog ── */
function AddBrachaDialog({ open, onClose, onAdd }) {
  const [title, setTitle]      = useState('');
  const [description, setDesc] = useState('');
  const [price, setPrice]      = useState('');
  const [tag, setTag]          = useState('');
  const [iconName, setIcon]    = useState('StarIcon');
  const [saving, setSaving]    = useState(false);

  const reset = () => { setTitle(''); setDesc(''); setPrice(''); setTag(''); setIcon('StarIcon'); };

  const handleAdd = async () => {
    if (!title.trim() || !price) return;
    setSaving(true);
    await onAdd({ title, description, price: parseFloat(price), tag: tag.trim() || null, iconName, active: true, createdAt: serverTimestamp() });
    setSaving(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} maxWidth="xs" fullWidth
      PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}>
      <DialogTitle sx={{ color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        הוסף ברכה חדשה
        <IconButton onClick={() => { reset(); onClose(); }} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="שם הברכה *" value={title} onChange={e => setTitle(e.target.value)} fullWidth autoFocus />
        <TextField label="תיאור" value={description} onChange={e => setDesc(e.target.value)} multiline rows={3} fullWidth />
        <TextField label="מחיר (₪) *" value={price} onChange={e => setPrice(e.target.value)} type="number" fullWidth inputProps={{ dir: 'ltr', min: 1 }} />
        <TextField label='תג (אופציונלי, כגון "פופולרי")' value={tag} onChange={e => setTag(e.target.value)} fullWidth />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>אייקון</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ICON_OPTIONS.map(({ name, label, Comp }) => (
              <Tooltip key={name} title={label}>
                <IconButton
                  size="small"
                  onClick={() => setIcon(name)}
                  sx={{
                    color: iconName === name ? 'primary.main' : 'text.secondary',
                    bgcolor: iconName === name ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: '1px solid',
                    borderColor: iconName === name ? 'primary.main' : 'rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    p: 0.8,
                    '&:hover': { bgcolor: 'rgba(201,168,76,0.1)' },
                  }}
                >
                  <Comp fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={() => { reset(); onClose(); }} color="inherit">ביטול</Button>
        <Button variant="contained" onClick={handleAdd} disabled={saving || !title.trim() || !price}
          startIcon={saving ? null : <AddIcon />}>
          {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'הוסף ברכה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Main page ── */
export default function Brachot() {
  const { isAdmin } = useAuth();
  const [selected, setSelected]     = useState(null);
  const [editBracha, setEditBracha] = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [brachot, setBrachot]       = useState(BRACHOT_DEFAULT);
  const [fromFirestore, setFromFirestore] = useState(false);
  const [toast, setToast]           = useState({ open: false, msg: '', sev: 'success' });

  const loadBrachot = async () => {
    try {
      const snap = await getDocs(collection(db, 'brachot'));
      if (snap.empty) return;

      const fsMap = {};
      snap.docs.forEach(d => { fsMap[d.id] = { id: d.id, ...d.data() }; });

      const defaultIds = new Set(BRACHOT_DEFAULT.map(b => b.id));

      // Defaults merged with Firestore overrides (skip if active: false)
      const fromDefaults = BRACHOT_DEFAULT
        .filter(b => !fsMap[b.id] || fsMap[b.id].active !== false)
        .map(b => fsMap[b.id] ? { ...b, ...fsMap[b.id] } : b);

      // New Firestore brachot (not in defaults), active only
      const fromNew = snap.docs
        .filter(d => !defaultIds.has(d.id) && d.data().active !== false)
        .map(d => ({ id: d.id, ...d.data() }));

      const all = [...fromDefaults, ...fromNew];
      setBrachot(all);
      setFromFirestore(true);
    } catch {}
  };

  useEffect(() => { loadBrachot(); }, []);

  const handleSaveBracha = async (id, data) => {
    try {
      await setDoc(doc(db, 'brachot', id), data, { merge: true });
      setBrachot(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      setToast({ open: true, msg: 'הברכה עודכנה', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'שגיאה בשמירה', sev: 'error' });
    }
  };

  const handleAddBracha = async (data) => {
    try {
      const ref = await addDoc(collection(db, 'brachot'), data);
      setBrachot(prev => [...prev, { id: ref.id, ...data }]);
      setToast({ open: true, msg: 'הברכה נוספה בהצלחה', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'שגיאה בהוספה', sev: 'error' });
    }
  };

  const handleDeleteBracha = async (b) => {
    if (!window.confirm(`למחוק את "${b.title}"?`)) return;
    try {
      // For default brachot, setDoc with active:false; for new ones, updateDoc
      const defaultIds = new Set(BRACHOT_DEFAULT.map(d => d.id));
      if (defaultIds.has(b.id)) {
        await setDoc(doc(db, 'brachot', b.id), { active: false }, { merge: true });
      } else {
        await updateDoc(doc(db, 'brachot', b.id), { active: false });
      }
      setBrachot(prev => prev.filter(item => item.id !== b.id));
      setToast({ open: true, msg: 'הברכה הוסרה', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'שגיאה במחיקה', sev: 'error' });
    }
  };

  return (
    <Box>
      <PageHero title="קניית ברכות" subtitle="זכו בברכה בציבור לעצמכם ולאהוביכם" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Typography textAlign="center" color="text.secondary" sx={{ mb: isAdmin ? 3 : 5, maxWidth: 600, mx: 'auto', lineHeight: 1.9 }}>
            לרכישת ברכה — בחרו ברכה מהרשימה, שלמו בכל אמצעי התשלום הנוח לכם ואשרו לגבאות
          </Typography>

          {/* Admin add button */}
          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
                  color: '#0D1B2A',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': { boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
                }}
              >
                הוסף ברכה חדשה
              </Button>
            </Box>
          )}

          <Grid container spacing={3}>
            {brachot.map(b => {
              const IconComp = resolveIcon(b.iconName);
              return (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(201,168,76,0.2)' },
                  }}>
                    {b.tag && (
                      <Chip label={b.tag} size="small" icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                        sx={{ position: 'absolute', top: 14, right: 14, bgcolor: 'rgba(201,168,76,0.15)', color: 'primary.main', fontWeight: 700, border: '1px solid rgba(201,168,76,0.3)' }} />
                    )}
                    {isAdmin && (
                      <Box sx={{ position: 'absolute', top: b.tag ? 44 : 10, right: 10, display: 'flex', gap: 0.5 }}>
                        <Tooltip title="ערוך ברכה">
                          <IconButton size="small" onClick={() => setEditBracha(b)}
                            sx={{ color: 'primary.main', bgcolor: 'rgba(201,168,76,0.08)', opacity: 0.8, '&:hover': { opacity: 1, bgcolor: 'rgba(201,168,76,0.18)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="מחק ברכה">
                          <IconButton size="small" onClick={() => handleDeleteBracha(b)}
                            sx={{ color: 'error.main', bgcolor: 'rgba(200,30,30,0.08)', opacity: 0.8, '&:hover': { opacity: 1, bgcolor: 'rgba(200,30,30,0.2)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, p: 3 }}>
                      <Box sx={{ mt: b.tag ? 3 : isAdmin ? 4.5 : 0 }}>
                        <IconComp sx={{ fontSize: 48, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h5" sx={{ color: 'secondary.main', fontFamily: '"Secular One", serif' }}>{b.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, flexGrow: 1 }}>{b.description}</Typography>
                      <Divider sx={{ borderColor: 'rgba(201,168,76,0.15)', my: 0.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">מחיר</Typography>
                          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.6rem', fontFamily: '"Secular One", serif', lineHeight: 1 }}>
                            {fmtMoney(b.price)}
                          </Typography>
                        </Box>
                        <Button variant="contained" size="small" startIcon={<ShoppingCartIcon />}
                          onClick={() => setSelected(b)}
                          sx={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)', color: '#0D1B2A', fontWeight: 700, px: 2, '&:hover': { boxShadow: '0 4px 16px rgba(201,168,76,0.4)' } }}>
                          קנייה
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card sx={{ mt: 6, p: { xs: 3, md: 4 }, textAlign: 'center', background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)', borderColor: 'primary.main' }}>
            <Typography variant="h5" sx={{ color: 'primary.main', mb: 1 }}>רוצים ברכה מיוחדת שלא ברשימה?</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>פנו ישירות לגבאות ונשמח להתאים ברכה לכל אירוע ומועד</Typography>
            <Button href={`${WA_GABBAI}?text=שלום, ברצוני לברר אודות רכישת ברכה`} target="_blank" rel="noopener" size="large" startIcon={<WhatsAppIcon />}
              sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 1.4, fontSize: '1rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 24px rgba(37,211,102,0.4)' } }}>
              וואטסאפ לגבאות
            </Button>
          </Card>
        </Container>
      </Box>

      {/* Admin FAB — add bracha */}
      {isAdmin && (
        <Fab
          onClick={() => setAddOpen(true)}
          sx={{
            position: 'fixed', bottom: 28, left: 28,
            background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
            color: '#0D1B2A',
            '&:hover': { boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <PurchaseDialog bracha={selected} onClose={() => setSelected(null)} />
      <EditBrachaDialog bracha={editBracha} onClose={() => setEditBracha(null)} onSave={handleSaveBracha} />
      <AddBrachaDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddBracha} />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
