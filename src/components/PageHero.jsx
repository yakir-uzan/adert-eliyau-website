import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PageHero({ title, subtitle }) {
  return (
    <Box
      sx={{
        height: 260,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pb: 5,
        overflow: 'hidden',
        textAlign: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/hero/interior-01.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #0D1B2A 0%, transparent 100%)',
        },
      }}
    >
      <Typography variant="h2" sx={{ position: 'relative', zIndex: 1, color: 'primary.light' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ position: 'relative', zIndex: 1, color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
