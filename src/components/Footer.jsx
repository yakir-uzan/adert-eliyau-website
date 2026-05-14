import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Replace with actual WhatsApp group invite link
const WA_LINK = 'https://chat.whatsapp.com/WHATSAPP_INVITE_CODE';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#080f18', pt: 5, pb: 2, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ pb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5 }}>בית כנסת אדרת אליהו</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 2 }}>
              מקום תפילה, לימוד וקהילה<br />
              [כתובת בית הכנסת]<br />
              <MuiLink href="tel:05XXXXXXXX" color="inherit">05X-XXXXXXX</MuiLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5 }}>ניווט מהיר</Typography>
            {[
              { label: 'זמני תפילות', to: '/zmanim' },
              { label: 'הודעות',      to: '/hodaot' },
              { label: 'תשלומים',    to: '/tashlumim' },
              { label: 'החשבון שלי', to: '/cheshbon' },
              { label: 'גלריה',      to: '/galeria' },
            ].map(l => (
              <Typography key={l.to} variant="body2">
                <MuiLink component={Link} to={l.to} color="text.secondary" underline="hover" sx={{ lineHeight: 2.2, display: 'block', '&:hover': { color: 'primary.light' } }}>
                  {l.label}
                </MuiLink>
              </Typography>
            ))}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5 }}>צרו קשר</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 2.2 }}>
              <MuiLink component={Link} to="/contact" color="inherit" underline="hover">טופס יצירת קשר</MuiLink><br />
              <MuiLink href="mailto:info@aderet-eliyahu.co.il" color="inherit" underline="hover">info@aderet-eliyahu.co.il</MuiLink>
            </Typography>
            <Button
              href={WA_LINK}
              target="_blank"
              rel="noopener"
              startIcon={<WhatsAppIcon />}
              sx={{
                mt: 1.5,
                bgcolor: '#25D366',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                px: 2,
                '&:hover': { bgcolor: '#1ebe5d' },
              }}
            >
              קבוצת וואטסאפ
            </Button>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © 2025 בית כנסת אדרת אליהו — כל הזכויות שמורות
        </Typography>
      </Container>
    </Box>
  );
}
