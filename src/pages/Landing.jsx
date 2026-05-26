import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformGoldDivider from '../components/PlatformGoldDivider';
import PlatformNavbar from '../components/PlatformNavbar';
import GoldTrails from './landing/GoldTrails';
import LaptopPreview from './landing/LaptopPreview';
import css from './landing/Landing.module.css';

export default function Landing() {
  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        color: COLORS.ivory,
        bgcolor: COLORS.bg,
        background: `
          radial-gradient(circle at 78% 20%, rgba(201,168,76,0.14), transparent 18%),
          radial-gradient(circle at 16% 12%, rgba(201,168,76,0.07), transparent 16%),
          linear-gradient(135deg, #06101A 0%, #0A1521 44%, #0D1B2A 100%)
        `,
        position: 'relative',
      }}
    >
      <div className={css.bgImage} />
      <div className={css.bgOverlay} />

      <GoldTrails />

      <PlatformNavbar />

      {/* ── Hero Content ── */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: { xs: 'auto', md: 'calc(100vh - 74px)' },
          py: { xs: 5, sm: 6, md: 0 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1.15fr' },
            gap: { xs: 3.5, lg: 2 },
            alignItems: 'center',
          }}
        >
          {/* ── Left: Text ── */}
          <Box
            className={css.heroContent}
            sx={{
              width: '100%',
              maxWidth: { xs: 560, lg: 610 },
              mx: 'auto',
              pr: 0,
              direction: 'rtl',
            }}
          >
            <Box className={css.heroTitleCluster}>
              <Typography
                variant="h1"
                className={css.heroHeading}
                sx={{
                  fontFamily: '"Secular One", "Assistant", sans-serif',
                  fontSize: { xs: 'clamp(2.3rem, 12vw, 3.15rem)', sm: '3.8rem', lg: '5rem' },
                  lineHeight: { xs: 1.12, md: 1.08 },
                  color: COLORS.ivory,
                  mb: { xs: 2, md: 2.5 },
                  width: '100%',
                }}
              >
                <Box component="span" className={css.heroLine}>
                  צור אתר לעמותה,
                </Box>
                <Box component="span" className={css.heroLine}>
                  ישיבה, בית כנסת
                </Box>
                <Box
                  component="span"
                  className={`${css.heroLine} ${css.gradientText}`}
                  sx={{
                    background: `linear-gradient(90deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 50%, ${COLORS.gold} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                  }}
                >
                  או ארגון
                </Box>
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <PlatformGoldDivider width={160} sx={{ mb: { xs: 2, md: 2.5 } }} />
              </Box>

              <Typography
                sx={{
                  color: 'rgba(245,240,232,0.8)',
                  fontSize: { xs: '1rem', md: '1.18rem' },
                  lineHeight: { xs: 1.78, md: 1.95 },
                  mb: { xs: 3, md: 4 },
                  textAlign: 'center',
                }}
              >
                אתר מוכן, תשלומים, הודעות, גלריה, יצירת קשר, ניהול תוכן ותרומות — הכל באותו סגנון יוקרתי.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Button
                  component={Link}
                  to="/register"
                  size="large"
                  className={css.heroCta}
                  sx={{
                    bgcolor: COLORS.gold,
                    color: COLORS.bg,
                    fontWeight: 700,
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: 300, sm: 'none' },
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    px: { xs: 3, md: 4.5 },
                    py: { xs: 1.45, md: 1.6 },
                    borderRadius: 3,
                    boxShadow: '0 12px 36px rgba(201,168,76,0.28)',
                    border: `1px solid ${COLORS.goldLight}`,
                    '&:hover': {
                      bgcolor: COLORS.goldLight,
                      boxShadow: '0 16px 44px rgba(201,168,76,0.38)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    יצירת אתר
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                  </Box>
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ── Right: Device ── */}
          <Box
            className={css.deviceWrap}
            sx={{
              position: 'relative',
              minHeight: { xs: 300, sm: 430, lg: 560 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', lg: 'flex-start' },
            }}
          >
            <div className={css.deviceGlow} />
            <LaptopPreview />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
