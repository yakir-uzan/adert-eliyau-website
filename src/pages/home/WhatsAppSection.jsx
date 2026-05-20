import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Footer from '../../components/Footer';
import css from './WhatsAppSection.module.css';

export default function WhatsAppSection({ waLink, current }) {
  return (
    <div className={css.root}>
      <div className={css.content}>
        <Container maxWidth="sm">
          <Typography variant="h2" gutterBottom sx={{
            fontSize: { xs: '1.8rem', md: '2.6rem' },
            opacity: current === 3 ? 1 : 0, transform: current === 3 ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
          }}>
            הצטרפו לקבוצת הוואטסאפ
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, opacity: current === 3 ? 1 : 0, transition: 'opacity 0.6s ease 0.45s' }}>
            קבלו עדכונים, הודעות ושיעורי תורה ישירות לנייד
          </Typography>
          <Box sx={{ opacity: current === 3 ? 1 : 0, transform: current === 3 ? 'scale(1)' : 'scale(0.9)', transition: 'opacity 0.6s ease 0.55s, transform 0.6s ease 0.55s' }}>
            {waLink && (
              <Button
                href={waLink}
                target="_blank" rel="noopener" size="large"
                startIcon={<WhatsAppIcon />}
                sx={{ bgcolor: '#25D366', color: '#fff', fontSize: '1.05rem', px: 5, py: 1.4, '&:hover': { bgcolor: '#1ebe5d', boxShadow: '0 6px 28px rgba(37,211,102,0.45)' } }}
              >
                הצטרפו לקבוצה
              </Button>
            )}
          </Box>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
