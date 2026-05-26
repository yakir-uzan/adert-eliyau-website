import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GoldDivider from '../../components/GoldDivider';
import { getSiteTypeConfig } from '../../config/siteTypes';
import css from './AboutSection.module.css';

export default function AboutSection({ config, base, current, TRANSITION_MS, heroSlides, slide }) {
  const hasGalleryLink = Array.isArray(config.images?.galleryPreview) && config.images.galleryPreview.length > 0;
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const aboutTitle = `על ${siteTypeConfig.label}`;
  const fallbackAbout = `${config.name} — ${siteTypeConfig.ctaDescription}`;

  return (
    <div className={css.root}>
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
      <div className={css.bgOverlay} />
      <Container maxWidth="md" className={css.content}>
        <Typography variant="h2" gutterBottom sx={{
          fontSize: { xs: '2rem', md: '3rem' },
          opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(30px)',
          transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.3}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.3}ms`,
        }}>
          {aboutTitle}
        </Typography>
        <Box sx={{ opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)', transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.4}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.4}ms` }}>
          <GoldDivider />
        </Box>
        <Typography sx={{
          mt: 3, lineHeight: 2, color: 'text.primary', fontSize: { xs: '1rem', md: '1.12rem' },
          opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.5}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.5}ms`,
        }}>
          {config.aboutText || fallbackAbout}
        </Typography>
        <Box className={css.buttons} sx={{ mt: 4,
          opacity: current === 1 ? 1 : 0, transform: current === 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.6}ms, transform ${TRANSITION_MS * 0.6}ms ease ${TRANSITION_MS * 0.6}ms`,
        }}>
          <Button component={Link} to={`${base}/contact`} variant="outlined" size="large">צרו קשר</Button>
          {hasGalleryLink && <Button component={Link} to={`${base}/galeria`} variant="contained" size="large">לגלריה</Button>}
        </Box>
      </Container>
    </div>
  );
}
