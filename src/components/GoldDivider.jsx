import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function GoldDivider() {
  const theme = useTheme();
  const color = theme.palette.primary.main;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5 }}>
      <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${color})` }} />
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ fill: color, flexShrink: 0 }}>
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
      </svg>
      <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${color})` }} />
    </Box>
  );
}
