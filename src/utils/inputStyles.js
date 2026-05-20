import { PLATFORM_COLORS as C } from './constants';

export const platformInputSx = {
  '& .MuiOutlinedInput-root': {
    color: C.ivory,
    '& fieldset': { borderColor: 'rgba(201,168,76,0.24)' },
    '&:hover fieldset': { borderColor: C.gold },
    '&.Mui-focused fieldset': { borderColor: C.goldLight },
  },
  '& .MuiInputLabel-root': { color: C.muted },
  '& .MuiInputLabel-root.Mui-focused': { color: C.goldLight },
};

export const registerInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    bgcolor: 'rgba(8,18,28,0.48)',
    backdropFilter: 'blur(10px)',
    '& fieldset': { borderColor: 'rgba(201,168,76,0.22)' },
    '&:hover fieldset': { borderColor: C.gold },
    '&.Mui-focused fieldset': { borderColor: C.gold },
  },
  '& .MuiInputLabel-root': { color: C.muted },
  '& .MuiInputLabel-root.Mui-focused': { color: C.gold },
  '& .MuiInputBase-input': { color: C.ivory, textAlign: 'right', direction: 'rtl' },
  '& .MuiInputBase-inputMultiline': { color: C.ivory, textAlign: 'right', direction: 'rtl' },
  '& .MuiFormHelperText-root': { color: C.muted },
  '& .MuiInputAdornment-root .MuiTypography-root': { color: C.muted },
};

export const autocompleteSx = {
  ...registerInputSx,
  '& .MuiAutocomplete-popupIndicator': { color: C.goldLight },
  '& .MuiAutocomplete-clearIndicator': { color: C.muted },
};

export const autocompleteDropdownSx = {
  bgcolor: '#101A25',
  color: C.ivory,
  border: `1px solid ${C.border}`,
  borderRadius: 2,
  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
  direction: 'rtl',
  textAlign: 'right',
  '& .MuiAutocomplete-option': {
    minHeight: 44,
    borderBottom: '1px solid rgba(201,168,76,0.06)',
    width: '100%',
    textAlign: 'right',
    direction: 'rtl',
    display: 'block',
    paddingInline: '16px',
  },
  '& .MuiAutocomplete-option[aria-selected="true"]': {
    bgcolor: 'rgba(201,168,76,0.16)',
  },
  '& .MuiAutocomplete-option.Mui-focused': {
    bgcolor: 'rgba(201,168,76,0.1)',
  },
};
