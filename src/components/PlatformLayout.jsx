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
          fontFamily: '"Inter", "Assistant", sans-serif',
          fontSize: { xs: '2.2rem', md: '3.2rem' },
          fontWeight: 800,
          lineHeight: 1.15,
          color: COLORS.text,
          mb: 2,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: COLORS.textSecondary, fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.9, maxWidth: 680, mx: 'auto' }}>
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
        color: COLORS.text,
        bgcolor: COLORS.bg,
      }}
    >
      <PlatformNavbar />
      {children}

      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          py: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: COLORS.muted, textAlign: 'center' }}>
            2026 &copy; genisite. כל הזכויות שמורות.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
