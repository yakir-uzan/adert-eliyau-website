import { PLATFORM_COLORS as C } from './constants';

export const primaryButtonSx = {
  minWidth: 160,
  px: 4.5,
  py: 1.45,
  borderRadius: '12px',
  bgcolor: C.primary,
  color: '#FFFFFF',
  border: 'none',
  fontWeight: 700,
  boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
  '&:hover': {
    bgcolor: C.primaryDark,
    boxShadow: '0 12px 32px rgba(37,99,235,0.3)',
  },
  '&.Mui-disabled': {
    bgcolor: 'rgba(37,99,235,0.12)',
    color: 'rgba(30,41,59,0.38)',
  },
};

export const secondaryButtonSx = {
  minWidth: 140,
  px: 3.5,
  py: 1.35,
  borderRadius: '12px',
  border: `1px solid ${C.border}`,
  color: C.textSecondary,
  bgcolor: 'transparent',
  '&:hover': {
    borderColor: C.primary,
    color: C.primary,
    bgcolor: 'rgba(37,99,235,0.04)',
  },
  '&.Mui-disabled': {
    color: C.muted,
    borderColor: C.borderSoft,
  },
};
