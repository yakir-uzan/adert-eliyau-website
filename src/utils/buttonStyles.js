import { PLATFORM_COLORS as C } from './constants';

export const primaryButtonSx = {
  minWidth: 160,
  px: 4.5,
  py: 1.45,
  borderRadius: '14px',
  bgcolor: C.gold,
  color: C.bg,
  border: `1px solid ${C.goldLight}`,
  fontWeight: 700,
  boxShadow: '0 18px 36px rgba(201,168,76,0.24)',
  '&:hover': {
    bgcolor: C.goldLight,
    boxShadow: '0 24px 42px rgba(201,168,76,0.3)',
  },
  '&.Mui-disabled': {
    bgcolor: 'rgba(201,168,76,0.16)',
    color: 'rgba(245,240,232,0.38)',
    borderColor: 'rgba(201,168,76,0.12)',
  },
};

export const secondaryButtonSx = {
  minWidth: 140,
  px: 3.5,
  py: 1.35,
  borderRadius: '14px',
  border: `1px solid ${C.gold}`,
  color: C.goldLight,
  bgcolor: 'rgba(7,17,27,0.28)',
  '&:hover': {
    borderColor: C.goldLight,
    bgcolor: 'rgba(201,168,76,0.08)',
  },
  '&.Mui-disabled': {
    color: 'rgba(183,173,160,0.32)',
    borderColor: 'rgba(201,168,76,0.08)',
  },
};
