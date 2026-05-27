import { useState } from 'react';
import { useTenant } from '../config/TenantContext';
import { getSiteTypeConfig } from '../config/siteTypes';
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
import css from './Contact.module.css';

export default function Contact() {
  const { config } = useTenant();
  const pageCopy = getSiteTypeConfig(config.siteType).pages.contact;
  const contact = config.contact || {};
  const wa = config.whatsapp || {};
  const subjects = pageCopy.subjects;

  const [form, setForm]     = useState({ name: '', phone: '', email: '', subject: subjects[0], message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const formspreeId = contact.formspreeId || '';
      if (!formspreeId || formspreeId === 'YOUR_FORM_ID') {
        setStatus('missing-config');
        setLoading(false);
        return;
      }
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'ok' : 'err');
      if (res.ok) setForm({ name: '', phone: '', email: '', subject: subjects[0], message: '' });
    } catch { setStatus('err'); }
    setLoading(false);
  };

  const infoItems = [
    contact.address     && { icon: <LocationOnIcon />, label: 'כתובת',     value: contact.address },
    contact.phone       && { icon: <PhoneIcon />,      label: 'טלפון',     value: contact.phone, href: `tel:${contact.phone.replace(/-/g, '')}` },
    contact.email       && { icon: <EmailIcon />,      label: 'אימייל',    value: contact.email, href: `mailto:${contact.email}` },
    contact.officeHours && { icon: <AccessTimeIcon />, label: 'שעות משרד', value: contact.officeHours },
  ].filter(Boolean);

  return (
    <Box>
      <PageHero title="יצירת קשר" subtitle={pageCopy.subtitle} />
      <Box sx={{ py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Grid container spacing={4} mt={1}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: 'secondary.main' }}>{pageCopy.formTitle}</Typography>
                  <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="שם מלא" value={form.name} onChange={update('name')} required fullWidth />
                    <TextField label="טלפון" value={form.phone} onChange={update('phone')} fullWidth inputProps={{ dir: 'ltr' }} />
                    <TextField label="אימייל" value={form.email} onChange={update('email')} type="email" fullWidth inputProps={{ dir: 'ltr' }} />
                    <TextField label="נושא" value={form.subject} onChange={update('subject')} select fullWidth>
                      {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <TextField label="הודעה" value={form.message} onChange={update('message')} required multiline rows={4} fullWidth />
                    {status === 'ok' && <Alert severity="success">ההודעה נשלחה בהצלחה! נחזור אליכם בקרוב.</Alert>}
                    {status === 'err' && <Alert severity="error">שגיאה בשליחה. אנא נסו שנית.</Alert>}
                    {status === 'missing-config' && <Alert severity="warning">טופס יצירת הקשר עדיין לא הוגדר. יש להזין Formspree ID בניהול האתר.</Alert>}
                    <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                      {loading ? 'שולח...' : 'שלח הודעה'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {infoItems.map(item => (
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

                {contact.mapEmbedUrl && (
                  <Card>
                    <CardContent sx={{ p: '0 !important' }}>
                      <iframe
                        src={contact.mapEmbedUrl}
                        style={{ width: '100%', height: 200, border: 'none', display: 'block', borderRadius: 10 }}
                        loading="lazy"
                        title={pageCopy.mapTitle}
                      />
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Grid>
          </Grid>

          {wa.groupLink && (
            <Box sx={{ mt: 6, p: 4, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #0a1f0e, #0D1B2A)', border: '1px solid rgba(37,211,102,0.3)' }}>
              <Typography variant="h4" sx={{ color: '#25D366', mb: 1 }}>{pageCopy.whatsappTitle}</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>{pageCopy.whatsappText}</Typography>
              <Button href={wa.groupLink} target="_blank" rel="noopener" size="large" startIcon={<WhatsAppIcon />}
                sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 1.4, fontSize: '1rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 24px rgba(37,211,102,0.4)' } }}>
                הצטרפו לקבוצה
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
