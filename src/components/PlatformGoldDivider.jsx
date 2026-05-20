import Box from '@mui/material/Box';
import { PLATFORM_COLORS as C } from '../utils/constants';
import css from './PlatformGoldDivider.module.css';

export default function PlatformGoldDivider({ width = 190, sideWidth = 44, sideOffset = 56, sx }) {
  return (
    <Box
      className={css.divider}
      sx={{
        width,
        bgcolor: C.gold,
        '&::before': { right: -sideOffset, width: sideWidth },
        '&::after': { left: -sideOffset, width: sideWidth },
        ...sx,
      }}
    />
  );
}
