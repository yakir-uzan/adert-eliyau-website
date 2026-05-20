import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoginIcon from '@mui/icons-material/Login';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';

const NAV_ITEMS = [
  { label: 'בית', to: '/' },
  { label: 'איך זה עובד?', to: '/how-it-works' },
  { label: 'פיצ׳רים', to: '/features' },
  { label: 'מחירים', to: '/pricing' },
  { label: 'שאלות נפוצות', to: '/faq' },
  { label: 'צור קשר', to: '/contact-us' },
];

export default function PlatformNavbar() {
  const location = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(16px)',
        bgcolor: 'rgba(7,17,27,0.55)',
        borderBottom: `1px solid ${COLORS.borderSoft}`,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 1.4, md: 1.8 },
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '1.65rem',
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: '0.01em',
              color: COLORS.goldLight,
              textShadow: '0 0 24px rgba(201,168,76,0.2)',
            }}
          >
            beit-knesset
          </Typography>
          <Box
            component="span"
            sx={{
              width: 7, height: 7, borderRadius: '50%',
              bgcolor: COLORS.gold,
              boxShadow: '0 0 8px rgba(201,168,76,0.6)',
              flexShrink: 0,
            }}
          />
        </Link>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.to}
              sx={{
                color: location.pathname === item.to ? COLORS.goldLight : 'rgba(245,240,232,0.75)',
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.to ? 700 : 500,
                px: 2, py: 0.6,
                borderRadius: 2,
                minWidth: 'auto',
                transition: 'color 0.2s, background 0.2s',
                '&:hover': { bgcolor: 'rgba(201,168,76,0.06)', color: COLORS.goldLight },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Button
          component={Link}
          to="/login"
          endIcon={<LoginIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: COLORS.goldLight,
            fontWeight: 600,
            fontSize: '0.88rem',
            px: { xs: 2, md: 2.5 }, py: 0.8,
            borderRadius: 2.5,
            border: 'none',
            bgcolor: 'rgba(201,168,76,0.06)',
            '&:hover': { bgcolor: 'rgba(201,168,76,0.12)' },
          }}
        >
          התחברות לגבאים
        </Button>
      </Container>
    </Box>
  );
}
