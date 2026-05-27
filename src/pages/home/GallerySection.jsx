import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GoldDivider from '../../components/GoldDivider';
import css from './GallerySection.module.css';

export default function GallerySection({ galleryPreview, base, current, heroSlides, slide }) {
  const hasImages = galleryPreview.length > 0;

  return (
    <Box className={css.root} sx={{ py: 3, position: 'relative' }}>
      {heroSlides.map((src, i) => (
        <Box
          key={src}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === slide ? 1 : 0,
            transform: i === slide ? 'scale(1)' : 'scale(1.03)',
            transition: 'opacity 1.4s ease, transform 1.4s ease',
          }}
        />
      ))}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,27,42,0.94) 0%, rgba(17,29,45,0.84) 100%)' }} />
      <Container maxWidth="lg" sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <Typography variant="h2" textAlign="center" gutterBottom sx={{
          fontSize: { xs: '1.8rem', md: '2.6rem' },
          opacity: current === 2 ? 1 : 0, transform: current === 2 ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
        }}>
          גלריה
        </Typography>
        <Box sx={{ opacity: current === 2 ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>
          <GoldDivider />
        </Box>
        {hasImages ? (
          <>
            <Box sx={{
              display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, mt: 2,
              opacity: current === 2 ? 1 : 0, transform: current === 2 ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
            }}>
              {galleryPreview.map((src, i) => (
                <Box
                  key={i}
                  component={Link}
                  to={`${base}/galeria`}
                  className={css.galleryItem}
                  sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main' } }}
                >
                  <img src={src} alt="" className={css.galleryImg} />
                </Box>
              ))}
            </Box>
            <Box textAlign="center" mt={2} sx={{ opacity: current === 2 ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
              <Button component={Link} to={`${base}/galeria`} variant="outlined" size="small">לגלריה המלאה</Button>
            </Box>
          </>
        ) : (
          <Typography color="text.secondary" textAlign="center" sx={{
            mt: 4,
            opacity: current === 2 ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}>
            אין תמונות עדיין
          </Typography>
        )}
      </Container>
    </Box>
  );
}
