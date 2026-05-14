import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

const SUBJECTS = ['שאלה כללית','תשלום / חשבון','עלייה לתורה','שיעורי תורה','אירוע / שמחה','אחר'];
const WA_LINK  = 'https://chat.whatsapp.com/WHATSAPP_INVITE_CODE';

export default function Contact() {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', subject: 'שאלה כללית', message: '' });
  const [status, setStatus] = useState(null); // 'ok' | 'err' | null
  const [loading, setLoading] = useState(false);

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Replace YOUR_FORM_ID with your Formspree form ID
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'ok' : 'err');
      if (res.ok) setForm({ name: '', phone: '', email: '', subject: 'שאלה כללית', message: '' });
    } catch { setStatus('err'); }
    setLoading(false);
  };

  return (
    <Box>
      <PageHero title="יצירת קשר" subtitle="אנחנו כאן לכל שאלה ובקשה" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Grid container spacing={4} mt={1}>

            {/* Form */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: 'secondary.main' }}>שלחו הודעה</Typography>
                  <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="שם מלא *" value={form.name} onChange={update('name')} required fullWidth />
                    <TextField label="טלפון" value={form.phone} onChange={update('phone')} fullWidth inputProps={{ dir: 'ltr' }} />
                    <TextField label="אימייל" value={form.email} onChange={update('email')} type="email" fullWidth inputProps={{ dir: 'ltr' }} />
                    <TextField label="נושא" value={form.subject} onChange={update('subject')} select fullWidth>
                      {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <TextField label="הודעה *" value={form.message} onChange={update('message')} required multiline rows={4} fullWidth />
                    {status === 'ok' && <Alert severity="success">ההודעה נשלחה בהצלחה! נחזור אליכם בקרוב.</Alert>}
                    {status === 'err' && <Alert severity="error">שגיאה בשליחה. אנא נסו שנית.</Alert>}
                    <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                      {loading ? 'שולח...' : 'שלח הודעה'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <LocationOnIcon />, label: 'כתובת', value: '[רחוב ומספר], [עיר]' },
                  { icon: <PhoneIcon />,      label: 'טלפון',  value: '05X-XXXXXXX', href: 'tel:05XXXXXXXX' },
                  { icon: <EmailIcon />,      label: 'אימייל', value: 'info@aderet-eliyahu.co.il', href: 'mailto:info@aderet-eliyahu.co.il' },
                  { icon: <AccessTimeIcon />, label: 'שעות משרד', value: 'א׳–ה׳: 09:00–13:00 | שישי: 09:00–11:30' },
                ].map(item => (
                  <Card key={item.label}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                      <Box sx={{ color: 'primary.main', display: 'flex' }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography fontWeight={600} sx={{ color: 'secondary.main' }}>
                          {item.href ? <a href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>{item.value}</a> : item.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {/* Google Maps embed */}
                <Card>
                  <CardContent sx={{ p: '0 !important' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d34.78!3d32.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzEyLjAiTiAzNMKwNDYnNDguMCJF!5e0!3m2!1siw!2sil!4v1000000000000"
                      style={{ width: '100%', height: 200, border: 'none', display: 'block', borderRadius: 10 }}
                      loading="lazy"
                      title="מפת בית הכנסת"
                    />
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>

          {/* WhatsApp CTA */}
          <Box sx={{ mt: 6, p: 4, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #0a1f0e, #0D1B2A)', border: '1px solid rgba(37,211,102,0.3)' }}>
            <Typography variant="h4" sx={{ color: '#25D366', mb: 1 }}>הצטרפו לקבוצת הוואטסאפ</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>קבלו עדכונים, הודעות ושיעורי תורה ישירות לנייד</Typography>
            <Button href={WA_LINK} target="_blank" rel="noopener" size="large" startIcon={<WhatsAppIcon />}
              sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 1.4, fontSize: '1rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 24px rgba(37,211,102,0.4)' } }}>
              הצטרפו לקבוצה
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
