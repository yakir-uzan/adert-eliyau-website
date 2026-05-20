import { useState } from 'react';
import { useTenant } from '../config/TenantContext';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StarIcon from '@mui/icons-material/Star';
import KeyIcon from '@mui/icons-material/Key';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import CreditCardDialog from '../components/CreditCardDialog';
import { fmtMoney } from '../utils/formatters';
import css from './Brachot.module.css';

const ICON_MAP = {
  key: KeyIcon,
  menubook: MenuBookIcon,
  emojievents: EmojiEventsIcon,
  stars: StarsIcon,
  school: SchoolIcon,
};

export const DEFAULT_BRACHOT = [
  { id: 'hikal', title: 'ברכה בפתיחת ההיכל', description: 'זכות לברך בפתיחת ארון הקודש', price: 200, tag: 'פופולרי', icon: 'key' },
  { id: 'tehilim', title: 'ברכה אחרי התהילים', description: 'זכות הברכה לאחר אמירת תהילים בציבור', price: 150, tag: null, icon: 'menubook' },
  { id: 'shnatit', title: 'ברכה שנתית', description: 'ברכה מיוחדת הנאמרת בציבור פעם בשנה', price: 600, tag: 'מיוחד', icon: 'emojievents' },
  { id: 'hatzi', title: 'ברכה חצי שנתית', description: 'ברכה בציבור פעמיים בשנה', price: 350, tag: null, icon: 'stars' },
  { id: 'shiur', title: 'ברכה אחרי השיעור', description: 'זכות לברך בסיום שיעור תורה שבועי', price: 100, tag: null, icon: 'school' },
];

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

function PurchaseDialog({ bracha, onClose, config }) {
  const [creditOpen, setCreditOpen] = useState(false);
  if (!bracha) return null;

  const pay = config.payments || {};
  const wa  = config.whatsapp || {};
  const waGabbai   = wa.gabaiLink || '';
  const bitPhone   = pay.bitPhone || '';
  const payboxLink = pay.payboxLink || '';
  const nedarimLink = pay.nedarimLink || '';
  const bankRows   = pay.bankRows || [];
  const bitLink    = bitPhone ? `https://www.bitpay.co.il/app/transfer?phone=${bitPhone}` : '';

  const { title, description, price, Icon } = bracha;
  const waText = encodeURIComponent(`שלום, שילמתי עבור ${title} (${fmtMoney(price)}). אנא אשרו קבלת התשלום.`);

  return (
    <>
      <Dialog open={!!bracha} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon sx={{ color: 'primary.main', fontSize: 32 }} />
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

            {bitLink && (
              <PaymentRow label="ביט" color="#0091FF" href={bitLink}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ color: 'secondary.main', fontWeight: 700, direction: 'ltr', fontSize: '0.95rem' }}>{bitPhone}</Typography>
                  <CopyButton value={bitPhone} />
                </Box>
              </PaymentRow>
            )}

            {payboxLink && (
              <PaymentRow label="פייבוקס" color="#6c3cbf" href={payboxLink}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>תשלום מהיר ובטוח</Typography>
              </PaymentRow>
            )}

            {nedarimLink && (
              <PaymentRow label="נדרים פלוס" color="#1a56b0" href={nedarimLink}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>nedarimplus.co.il</Typography>
              </PaymentRow>
            )}

            {bankRows.length > 0 && (
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 2, px: 2, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600 }}>העברה בנקאית</Typography>
                </Box>
                <Table size="small" sx={{ '& td': { border: 'none', py: 0.25, px: 0 } }}>
                  <TableBody>
                    {bankRows.map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', width: 70 }}>{k}:</TableCell>
                        <TableCell sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.85rem' }}>{v}</TableCell>
                        <TableCell sx={{ width: 32 }}><CopyButton value={v} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(201,168,76,0.1)', my: 2.5 }} />

          {waGabbai && (
            <>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mb: 1.5 }}>
                לאחר תשלום בביט / פייבוקס / בנק — אשרו לגבאות
              </Typography>
              <Button fullWidth href={`${waGabbai}?text=${waText}`} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}
                sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 700, py: 1.2, fontSize: '0.95rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' } }}>
                אישור תשלום לגבאות
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreditCardDialog open={creditOpen} onClose={() => setCreditOpen(false)} amount={price} description={title} />
    </>
  );
}

export default function Brachot() {
  const { config } = useTenant();
  const brachot = config.brachot || DEFAULT_BRACHOT;
  const wa = config.whatsapp || {};
  const waGabbai = wa.gabaiLink || '';

  const [selected, setSelected] = useState(null);

  return (
    <Box>
      <PageHero title="קניית ברכות" subtitle="זכו בברכה בציבור לעצמכם ולאהוביכם" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Typography textAlign="center" color="text.secondary" sx={{ mb: 5, maxWidth: 600, mx: 'auto', lineHeight: 1.9 }}>
            לרכישת ברכה — בחרו ברכה מהרשימה, שלמו בכל אמצעי התשלום הנוח לכם ואשרו לגבאות
          </Typography>

          <Grid container spacing={3}>
            {brachot.map(b => {
              const Icon = ICON_MAP[b.icon] || StarIcon;
              return (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.25s, box-shadow 0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(201,168,76,0.2)' } }}>
                    {b.tag && (
                      <Chip label={b.tag} size="small" icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                        sx={{ position: 'absolute', top: 14, right: 14, bgcolor: 'rgba(201,168,76,0.15)', color: 'primary.main', fontWeight: 700, border: '1px solid rgba(201,168,76,0.3)' }} />
                    )}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, p: 3 }}>
                      <Box sx={{ mt: b.tag ? 3 : 0 }}><Icon sx={{ fontSize: 48, color: 'primary.main' }} /></Box>
                      <Typography variant="h5" sx={{ color: 'secondary.main', fontFamily: '"Secular One", serif' }}>{b.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, flexGrow: 1 }}>{b.description}</Typography>
                      <Divider sx={{ borderColor: 'rgba(201,168,76,0.15)', my: 0.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">מחיר</Typography>
                          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.6rem', fontFamily: '"Secular One", serif', lineHeight: 1 }}>{fmtMoney(b.price)}</Typography>
                        </Box>
                        <Button variant="contained" size="small" startIcon={<ShoppingCartIcon />}
                          onClick={() => setSelected({ ...b, Icon })}
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

          {waGabbai && (
            <Card sx={{ mt: 6, p: { xs: 3, md: 4 }, textAlign: 'center', background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)', borderColor: 'primary.main' }}>
              <Typography variant="h5" sx={{ color: 'primary.main', mb: 1 }}>רוצים ברכה מיוחדת שלא ברשימה?</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>פנו ישירות לגבאות ונשמח להתאים ברכה לכל אירוע ומועד</Typography>
              <Button href={`${waGabbai}?text=שלום, ברצוני לברר אודות רכישת ברכה`} target="_blank" rel="noopener" size="large" startIcon={<WhatsAppIcon />}
                sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 1.4, fontSize: '1rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 24px rgba(37,211,102,0.4)' } }}>
                וואטסאפ לגבאות
              </Button>
            </Card>
          )}
        </Container>
      </Box>

      <PurchaseDialog bracha={selected} onClose={() => setSelected(null)} config={config} />
    </Box>
  );
}
