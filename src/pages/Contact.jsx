import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContact } from '../contexts/ContactContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MapIcon from '@mui/icons-material/Map';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

const SUBJECTS = ['שאלה כללית', 'תשלום / חשבון', 'עלייה לתורה', 'שיעורי תורה', 'אירוע / שמחה', 'אחר'];

/* ── Contact form (public) ── */
function ContactForm() {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', subject: 'שאלה כללית', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
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
  );
}

/* ── Editable info field ── */
function InfoField({ icon, label, value, href, editMode, editValue, onChange }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
        <Box sx={{ color: 'primary.main', display: 'flex', flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          {editMode ? (
            <TextField
              value={editValue}
              onChange={e => onChange(e.target.value)}
              size="small"
              fullWidth
              variant="standard"
              inputProps={{ dir: label === 'טלפון' || label === 'אימייל' ? 'ltr' : 'rtl' }}
              sx={{ mt: 0.25 }}
            />
          ) : (
            <Typography fontWeight={600} sx={{ color: 'secondary.main', wordBreak: 'break-word' }}>
              {href
                ? <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{value}</a>
                : value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* ── Main page ── */
export default function Contact() {
  const { isAdmin }           = useAuth();
  const { config, saveConfig } = useContact();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft]       = useState({});
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ open: false, msg: '', sev: 'success' });

  const startEdit = () => {
    setDraft({
      address:     config.address,
      phone:       config.phone,
      phoneHref:   config.phoneHref,
      email:       config.email,
      hours:       config.hours,
      mapUrl:      config.mapUrl,
      waPhone:     config.waPhone,
      waGroupLink: config.waGroupLink,
    });
    setEditMode(true);
  };

  const cancel = () => setEditMode(false);

  const save = async () => {
    setSaving(true);
    try {
      // Auto-build phoneHref from phone
      const cleaned = draft.phone.replace(/[^0-9]/g, '');
      await saveConfig({ ...draft, phoneHref: `tel:${cleaned}` });
      setEditMode(false);
      setToast({ open: true, msg: 'פרטי הקשר עודכנו בהצלחה', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'שגיאה בשמירה', sev: 'error' });
    }
    setSaving(false);
  };

  const set = key => val => setDraft(d => ({ ...d, [key]: val }));

  return (
    <Box>
      <PageHero title="יצירת קשר" subtitle="אנחנו כאן לכל שאלה ובקשה" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />

          {/* Admin toolbar */}
          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -1 }}>
              {editMode ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={save}
                    disabled={saving}
                    startIcon={saving ? null : <SaveIcon />}
                    sx={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3, #C9A84C)', color: '#0D1B2A', fontWeight: 700 }}
                  >
                    {saving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'שמור'}
                  </Button>
                  <Button variant="outlined" onClick={cancel} startIcon={<CancelIcon />} color="inherit" size="small">ביטול</Button>
                </Box>
              ) : (
                <Tooltip title="ערוך פרטי קשר">
                  <Button variant="outlined" onClick={startEdit} startIcon={<EditIcon />}
                    sx={{ borderColor: 'primary.main', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'rgba(201,168,76,0.08)' } }}>
                    ערוך פרטים
                  </Button>
                </Tooltip>
              )}
            </Box>
          )}

          {editMode && (
            <Box sx={{ mt: 2, mb: 1, p: 1.5, bgcolor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2 }}>
              <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.88rem' }}>
                מצב עריכה — שנו את הפרטים ולחצו שמור
              </Typography>
            </Box>
          )}

          <Grid container spacing={4} mt={1}>

            {/* Form */}
            <Grid item xs={12} md={6}>
              <ContactForm />
            </Grid>

            {/* Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                <InfoField
                  icon={<LocationOnIcon />}
                  label="כתובת"
                  value={config.address}
                  editMode={editMode}
                  editValue={draft.address || ''}
                  onChange={set('address')}
                />
                <InfoField
                  icon={<PhoneIcon />}
                  label="טלפון"
                  value={config.phone}
                  href={editMode ? undefined : config.phoneHref}
                  editMode={editMode}
                  editValue={draft.phone || ''}
                  onChange={set('phone')}
                />
                <InfoField
                  icon={<EmailIcon />}
                  label="אימייל"
                  value={config.email}
                  href={editMode ? undefined : `mailto:${config.email}`}
                  editMode={editMode}
                  editValue={draft.email || ''}
                  onChange={set('email')}
                />
                <InfoField
                  icon={<AccessTimeIcon />}
                  label="שעות משרד"
                  value={config.hours}
                  editMode={editMode}
                  editValue={draft.hours || ''}
                  onChange={set('hours')}
                />

                {/* WhatsApp group link */}
                <InfoField
                  icon={<WhatsAppIcon sx={{ color: '#25D366 !important' }} />}
                  label="קישור קבוצת וואטסאפ"
                  value={editMode ? draft.waGroupLink : 'לחץ להצטרפות לקבוצה'}
                  href={editMode ? undefined : config.waGroupLink}
                  editMode={editMode}
                  editValue={draft.waGroupLink || ''}
                  onChange={set('waGroupLink')}
                />

                {/* Map */}
                <Card>
                  {editMode ? (
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <MapIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
                        <Typography variant="caption" color="text.secondary">קוד embed של Google Maps (src של ה-iframe)</Typography>
                      </Box>
                      <TextField
                        value={draft.mapUrl || ''}
                        onChange={e => set('mapUrl')(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="הדבק כאן את ה-src מ-Google Maps → שיתוף → הטמע מפה"
                        inputProps={{ dir: 'ltr', style: { fontSize: '0.75rem' } }}
                      />
                    </CardContent>
                  ) : (
                    <CardContent sx={{ p: '0 !important' }}>
                      <iframe
                        src={config.mapUrl}
                        style={{ width: '100%', height: 200, border: 'none', display: 'block', borderRadius: 10 }}
                        loading="lazy"
                        title="מפת בית הכנסת"
                      />
                    </CardContent>
                  )}
                </Card>
              </Box>
            </Grid>
          </Grid>

          {/* WhatsApp CTA */}
          <Box sx={{ mt: 6, p: 4, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #0a1f0e, #0D1B2A)', border: '1px solid rgba(37,211,102,0.3)' }}>
            <Typography variant="h4" sx={{ color: '#25D366', mb: 1 }}>הצטרפו לקבוצת הוואטסאפ</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>קבלו עדכונים, הודעות ושיעורי תורה ישירות לנייד</Typography>
            {editMode ? (
              <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                <TextField
                  label="מספר וואטסאפ גבאות (לאישורי תשלום)"
                  value={draft.waPhone || ''}
                  onChange={e => set('waPhone')(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ dir: 'ltr' }}
                  sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}
                />
              </Box>
            ) : (
              <Button
                href={config.waGroupLink}
                target="_blank" rel="noopener" size="large" startIcon={<WhatsAppIcon />}
                sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 1.4, fontSize: '1rem', '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 24px rgba(37,211,102,0.4)' } }}
              >
                הצטרפו לקבוצה
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
