import { useState } from 'react';
import { useTenant } from '../config/TenantContext';
import { getSiteTypeConfig } from '../config/siteTypes';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LoopIcon from '@mui/icons-material/Loop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import CreditCardDialog from '../components/CreditCardDialog';
import css from './Tashlumim.module.css';

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt('העתיקו את הערך:', value); }
  };
  return (
    <Tooltip title={copied ? 'הועתק!' : 'העתק'} placement="top">
      <IconButton
        aria-label="העתקה"
        size="small"
        onClick={copy}
        sx={{
          color: copied ? '#4ade80' : 'primary.main',
          width: 40,
          height: 40,
          p: 0,
          flexShrink: 0,
          transition: 'color 0.2s, background-color 0.2s',
          '&:hover': { bgcolor: 'rgba(201,168,76,0.08)' },
        }}
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

function PhoneBox({ label, value }) {
  return (
    <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ color: 'secondary.main', fontWeight: 700, direction: 'ltr' }}>{value}</Typography>
        <CopyButton value={value} />
      </Box>
    </Box>
  );
}

const LOGO_SX = { height: 52, maxWidth: 120, objectFit: 'contain', borderRadius: 2, alignSelf: 'flex-start' };

export default function Tashlumim() {
  const { config, basePath } = useTenant();
  const pageCopy = getSiteTypeConfig(config.siteType).pages.payments;
  const base = basePath;
  const pay = config.payments || {};
  const bitPhone    = pay.bitPhone || '';
  const payboxPhone = pay.payboxPhone || '';
  const payboxLink  = pay.payboxLink || '';
  const nedarimLink = pay.nedarimLink || 'https://www.nedarimplus.co.il/';
  const bitLink     = bitPhone ? `https://www.bitpay.co.il/app/transfer?phone=${bitPhone}` : '';
  const bankRows    = pay.bankRows || [];
  const standingOrderPdfUrl = pay.standingOrderPdfUrl || '';

  const [creditOpen, setCreditOpen] = useState(false);

  return (
    <Box>
      <PageHero title={pageCopy.title} subtitle="" />
      <Box sx={{ py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Typography textAlign="center" color="text.secondary" sx={{ mb: 4, mt: 2 }}>{pageCopy.subtitle}</Typography>

          <Grid container spacing={3}>
            {bitPhone && (
              <Grid item xs={12} sm={6} md={4} lg>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Box sx={{ height: 32 }} />
                    <Box component="img" src="/images/logo-bit.png" alt="ביט" sx={LOGO_SX} />
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>ביט</Typography>
                    <Typography variant="body2" color="text.secondary">שלחו תשלום ישיר דרך אפליקציית ביט</Typography>
                    <PhoneBox label="מספר לביט:" value={bitPhone} />
                    <Button href={bitLink} target="_blank" rel="noopener" variant="outlined"
                      sx={{ mt: 'auto', width: { xs: '100%', sm: 'auto' }, minHeight: 44, borderColor: '#0091FF', color: '#0091FF', fontWeight: 700, '&:hover': { borderColor: '#0091FF', bgcolor: 'rgba(0,145,255,0.08)' } }}>
                      פתח ביט
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {payboxLink && (
              <Grid item xs={12} sm={6} md={4} lg>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Box sx={{ height: 32 }} />
                    <Box component="img" src="/images/logo-paybox.jpg" alt="פייבוקס" sx={LOGO_SX} />
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>פייבוקס</Typography>
                    <Typography variant="body2" color="text.secondary">תשלום מהיר ובטוח דרך פייבוקס</Typography>
                    {payboxPhone && <PhoneBox label="מספר לפייבוקס:" value={payboxPhone} />}
                    <Button href={payboxLink} target="_blank" rel="noopener" variant="outlined"
                      sx={{ mt: 'auto', width: { xs: '100%', sm: 'auto' }, minHeight: 44, borderColor: '#6c3cbf', color: '#6c3cbf', fontWeight: 700, '&:hover': { borderColor: '#6c3cbf', bgcolor: 'rgba(108,60,191,0.08)' } }}>
                      פתח פייבוקס
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {nedarimLink && (
              <Grid item xs={12} sm={6} md={4} lg>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Box sx={{ height: 32 }} />
                    <Box component="img" src="/images/logo-nedarim.png" alt="נדרים פלוס" sx={LOGO_SX} />
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>נדרים פלוס</Typography>
                    <Typography variant="body2" color="text.secondary">פלטפורמת תשלום ייעודית לארגונים יהודיים</Typography>
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">תשלום מאובטח:</Typography>
                      <Typography sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.9rem' }}>nedarimplus.co.il</Typography>
                    </Box>
                    <Button href={nedarimLink} target="_blank" rel="noopener" variant="outlined"
                      sx={{ mt: 'auto', width: { xs: '100%', sm: 'auto' }, minHeight: 44, borderColor: '#1a56b0', color: '#4a90d9', fontWeight: 700, '&:hover': { borderColor: '#1a56b0', bgcolor: 'rgba(26,86,176,0.08)' } }}>
                      תשלום בנדרים פלוס
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={4} lg>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                  <Box sx={{ height: 32 }} />
                  <CreditCardIcon sx={{ fontSize: 52, color: 'primary.main', alignSelf: 'flex-start' }} />
                  <Typography variant="h5" sx={{ color: 'primary.main' }}>כרטיס אשראי</Typography>
                  <Typography variant="body2" color="text.secondary">תשלום מאובטח בכרטיס אשראי — קבלה תישלח למייל באופן מידי</Typography>
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">מאובטח על ידי:</Typography>
                    <Typography sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.9rem', direction: 'ltr' }}>Stripe · SSL</Typography>
                  </Box>
                  <Button variant="outlined" onClick={() => setCreditOpen(true)} startIcon={<CreditCardIcon />}
                    sx={{ mt: 'auto', width: { xs: '100%', sm: 'auto' }, minHeight: 44, borderColor: 'primary.main', color: 'primary.main', fontWeight: 700, '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(201,168,76,0.08)' } }}>
                    שלם באשראי
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {bankRows.length > 0 && (
              <Grid item xs={12} sm={6} md={4} lg>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Box sx={{ height: 32 }} />
                    <AccountBalanceIcon sx={{ fontSize: 52, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>העברה בנקאית</Typography>
                    <Typography variant="body2" color="text.secondary">{pageCopy.bankDescription}</Typography>
                    <Table size="small">
                      <TableBody>
                        {bankRows.map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell sx={{ color: 'text.secondary', border: 'none', py: 0.5, px: 0 }}>{k}</TableCell>
                            <TableCell sx={{ color: 'secondary.main', fontWeight: 700, border: 'none', py: 0.5 }}>{v}</TableCell>
                            <TableCell sx={{ border: 'none', py: 0.5, px: 0.5, width: 44 }}><CopyButton value={v} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={4} lg>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                  <Box sx={{ height: 32 }} />
                  <LoopIcon sx={{ fontSize: 52, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ color: 'primary.main' }}>הוראת קבע</Typography>
                  <Typography variant="body2" color="text.secondary">{pageCopy.standingOrderDescription}</Typography>
                  <Button
                    variant="outlined"
                    href={standingOrderPdfUrl || undefined}
                    target={standingOrderPdfUrl ? '_blank' : undefined}
                    rel={standingOrderPdfUrl ? 'noopener' : undefined}
                    disabled={!standingOrderPdfUrl}
                    sx={{ mt: 'auto', width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
                  >
                    {standingOrderPdfUrl ? 'הורדת טופס PDF' : 'טופס PDF לא הוגדר'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" textAlign="center">{pageCopy.standingOrderNote}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 6, p: 3, textAlign: 'center', bgcolor: 'rgba(201,168,76,0.07)', borderColor: 'primary.main' }}>
            <Typography variant="h5" sx={{ color: 'primary.main', mb: 1 }}>{pageCopy.accountCtaTitle}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{pageCopy.accountCtaText}</Typography>
            <Button component={Link} to={`${base}/cheshbon`} variant="contained" size="large" sx={{ width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: 320, sm: 'none' }, minHeight: 48 }}>{pageCopy.accountButton}</Button>
          </Card>
        </Container>
      </Box>

      <CreditCardDialog open={creditOpen} onClose={() => setCreditOpen(false)} amount={0} description={`תשלום ל${config.name}`} />
    </Box>
  );
}
