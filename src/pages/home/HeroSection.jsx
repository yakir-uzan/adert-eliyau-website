import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TickerContent from './TickerContent';
import css from './HeroSection.module.css';

export default function HeroSection({ heroSlides, slide, config, siteTypeConfig, base, hasCustomName, strippedName, tickerItems, onGoNext }) {
  const heroTypeLabel = siteTypeConfig?.id === 'yeshiva' ? 'ישיבת' : siteTypeConfig?.label;
  const primaryCta = siteTypeConfig?.id === 'beit-knesset'
    ? { label: 'זמני תפילות', to: `${base}/zmanim` }
    : { label: siteTypeConfig?.nav?.[1]?.label || 'פעילות', to: `${base}/${siteTypeConfig?.nav?.[1]?.path || 'hodaot'}` };
  const secondaryCta = siteTypeConfig?.nav?.find(item => item.path === 'hodaot')
    || siteTypeConfig?.nav?.find(item => item.path === 'tashlumim')
    || { label: 'הודעות', path: 'hodaot' };

  return (
    <div className={css.root}>
      <div className={css.slideArea}>
        {heroSlides.map((src, i) => (
          <div
            key={src}
            className={css.slide}
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? 'scale(1)' : 'scale(1.03)',
            }}
          />
        ))}
        <div className={css.gradientOverlay} />
        <Box className={css.heroContent} sx={{ px: 2 }}>
          <Typography className={css.welcome} sx={{ color: 'primary.main', mb: 1 }}>
            ברוכים הבאים
          </Typography>
          <Typography
            variant="h1"
            className={css.titleH1}
            sx={{
              fontSize: { xs: 'clamp(1.9rem, 8vw, 2.8rem)', md: '5rem' }, mb: 1.5,
              '& span': {
                backgroundImage: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 45%, ${theme.palette.primary.main} 100%)`,
              },
            }}
          >
            <span className={css.titleGold}>{heroTypeLabel || 'בית כנסת'}<br /></span>
            {hasCustomName ? (
              <span className={css.titleGold}>{strippedName}</span>
            ) : (
              <span className={css.previewPlaceholder}>שם {siteTypeConfig?.label || 'האתר'} שלך</span>
            )}
          </Typography>
          {config.subtitle && (
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', md: '1.2rem' }, mb: 4 }}>
              {config.subtitle}
            </Typography>
          )}
          <div className={css.ctaButtons}>
            <Button component={Link} to={primaryCta.to} variant="contained" size="large" sx={{ px: 4 }}>{primaryCta.label}</Button>
            <Button component={Link} to={`${base}/${secondaryCta.path}`} variant="outlined" size="large" sx={{ px: 4 }}>{secondaryCta.label}</Button>
          </div>
        </Box>
        <Box
          onClick={onGoNext}
          className={css.scrollDown}
          sx={{ color: 'primary.main' }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 16l-6-6h12z" fill="currentColor" /></svg>
        </Box>
      </div>

      {tickerItems.length > 0 && (
        <Box
          className={css.ticker}
          sx={{
            py: 1,
            '--ticker-cat': (theme) => theme.palette.primary.main,
            color: 'secondary.main',
          }}
        >
          <div className={css.tickerTrack}>
            <TickerContent items={tickerItems} /><TickerContent items={tickerItems} />
          </div>
        </Box>
      )}
    </div>
  );
}
