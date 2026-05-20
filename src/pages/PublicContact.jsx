import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import { PLATFORM_COLORS } from '../utils/constants';
import { platformInputSx as inputSx } from '../utils/inputStyles';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';
import css from './PublicContact.module.css';

const COLORS = { ...PLATFORM_COLORS, panel: 'rgba(11,20,33,0.78)' };

function ContactCard({ icon, title, text, href, buttonText, buttonColor, onClick }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        bgcolor: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent sx={{ p: 3.2 }}>
        <div className={css.contactIconWrap} style={{ color: buttonColor }}>
          {icon}
        </div>
        <Typography sx={{ color: COLORS.ivory, fontWeight: 700, fontSize: '1.2rem', mb: 0.75 }}>{title}</Typography>
        <Typography sx={{ color: COLORS.muted, lineHeight: 1.8, mb: 2.2 }}>{text}</Typography>
        <Button
          component="a"
          href={href}
          onClick={onClick}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          variant="outlined"
          sx={{
            color: buttonColor,
            borderColor: `${buttonColor}55`,
            '&:hover': {
              borderColor: buttonColor,
              bgcolor: `${buttonColor}12`,
            },
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PublicContact() {
  const whatsappHref = import.meta.env.VITE_PUBLIC_CONTACT_WHATSAPP || 'https://wa.me/972000000000';
  const emailAddress = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL || 'info@example.com';
  const formspreeId = import.meta.env.VITE_PUBLIC_CONTACT_FORMSPREE_ID || '';

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const update = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formspreeId) {
      setStatus('missing');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('ok');
        setForm({ name: '', phone: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }

    setLoading(false);
  };

  return (
    <PlatformLayout>
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="צור קשר"
          subtitle="אם אתם רוצים אתר לבית הכנסת שלכם, אפשר לפנות אלינו דרך וואטסאפ, מייל או לפתוח טופס פנייה."
        />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <ContactCard
              icon={<WhatsAppIcon />}
              title="וואטסאפ"
              text="להודעה מהירה, תיאום קצר או שאלה ראשונה בדרך."
              href={whatsappHref}
              buttonText="פנייה בוואטסאפ"
              buttonColor="#25D366"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ContactCard
              icon={<EmailOutlinedIcon />}
              title="מייל"
              text={`אפשר לכתוב לנו ישירות לכתובת ${emailAddress}`}
              href={`mailto:${emailAddress}`}
              buttonText="שלחו מייל"
              buttonColor={COLORS.goldLight}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ContactCard
              icon={<PhoneInTalkOutlinedIcon />}
              title="השארת פרטים"
              text="ממלאים את הטופס ונחזור אליכם עם כל הפרטים להקמת האתר."
              href="#lead-form"
              buttonText="לטופס"
              buttonColor={COLORS.gold}
              onClick={(event) => {
                event.preventDefault();
                setShowForm(true);
                setTimeout(() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
            />
          </Grid>
        </Grid>

        {showForm && (
          <Card
            id="lead-form"
            sx={{
              borderRadius: 4,
              bgcolor: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 22px 50px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography sx={{ color: COLORS.goldLight, fontWeight: 700, fontSize: '1.3rem', mb: 2 }}>
                טופס פנייה
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="שם מלא" value={form.name} onChange={update('name')} fullWidth required sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="טלפון" value={form.phone} onChange={update('phone')} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="אימייל" type="email" value={form.email} onChange={update('email')} fullWidth required sx={inputSx} inputProps={{ dir: 'ltr' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="איך נוכל לעזור?" value={form.message} onChange={update('message')} fullWidth multiline rows={4} required sx={inputSx} />
                  </Grid>
                </Grid>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mt: 3 }}>
                  <Box>
                    {status === 'ok' && <Alert severity="success">הפרטים נשלחו בהצלחה. נחזור אליכם בקרוב.</Alert>}
                    {status === 'error' && <Alert severity="error">הייתה שגיאה בשליחה. נסו שוב.</Alert>}
                    {status === 'missing' && <Alert severity="warning">יש להגדיר `VITE_PUBLIC_CONTACT_FORMSPREE_ID` כדי שהטופס יעבוד.</Alert>}
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.3,
                      bgcolor: COLORS.gold,
                      color: COLORS.bg,
                      fontWeight: 700,
                      '&:hover': { bgcolor: COLORS.goldLight },
                    }}
                  >
                    {loading ? 'שולח...' : 'שלחו פרטים'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </PlatformLayout>
  );
}
