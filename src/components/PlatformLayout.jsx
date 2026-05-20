import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformNavbar from './PlatformNavbar';

export function PlatformPageHeader({ title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', pt: { xs: 7, md: 10 }, mb: { xs: 5, md: 7 } }}>
      <Typography
        variant="h1"
        sx={{
          fontFamily: '"Secular One", "Assistant", sans-serif',
          fontSize: { xs: '2.45rem', md: '3.8rem' },
          lineHeight: 1.1,
          color: COLORS.ivory,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: COLORS.muted, fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.9, maxWidth: 680, mx: 'auto' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function PlatformLayout({ children }) {
  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        color: COLORS.ivory,
        bgcolor: COLORS.bg,
        background: `
          radial-gradient(circle at 78% 20%, rgba(201,168,76,0.08), transparent 18%),
          radial-gradient(circle at 16% 80%, rgba(201,168,76,0.05), transparent 16%),
          linear-gradient(135deg, #06101A 0%, #0A1521 44%, #0D1B2A 100%)
        `,
      }}
    >
      <PlatformNavbar />
      {children}

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${COLORS.borderSoft}`,
          py: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: 'rgba(183,173,160,0.55)', textAlign: 'center' }}>
            2026 &copy; beit-knesset. כל הזכויות שמורות.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
