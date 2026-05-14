import Box from '@mui/material/Box';

const Star = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} style={{ fill: '#C9A84C', flexShrink: 0 }}>
    <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
  </svg>
);

export default function GoldDivider() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5 }}>
      <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
      <Star />
      <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
    </Box>
  );
}
