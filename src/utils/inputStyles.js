import { PLATFORM_COLORS as C } from './constants';

export const platformInputSx = {
  '& .MuiOutlinedInput-root': {
    color: C.text,
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: C.primary },
    '&.Mui-focused fieldset': { borderColor: C.primary },
  },
  '& .MuiInputLabel-root': { color: C.textSecondary },
  '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
};

export const registerInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#FFFFFF',
    border: 'none',
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: C.primary },
    '&.Mui-focused fieldset': { borderColor: C.primary },
  },
  '& .MuiInputLabel-root': { color: C.textSecondary },
  '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
  '& .MuiInputBase-input': { color: C.text, textAlign: 'right', direction: 'rtl' },
  '& .MuiInputBase-inputMultiline': { color: C.text, textAlign: 'right', direction: 'rtl' },
  '& .MuiFormHelperText-root': { color: C.textSecondary },
  '& .MuiInputAdornment-root .MuiTypography-root': { color: C.textSecondary },
};

export const autocompleteSx = {
  ...registerInputSx,
  '& .MuiAutocomplete-popupIndicator': { color: C.textSecondary },
  '& .MuiAutocomplete-clearIndicator': { color: C.muted },
};

export const autocompleteDropdownSx = {
  bgcolor: '#FFFFFF',
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 2,
  boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
  direction: 'rtl',
  textAlign: 'right',
  '& .MuiAutocomplete-option': {
    minHeight: 44,
    borderBottom: `1px solid ${C.borderSoft}`,
    width: '100%',
    textAlign: 'right',
    direction: 'rtl',
    display: 'block',
    paddingInline: '16px',
  },
  '& .MuiAutocomplete-option[aria-selected="true"]': {
    bgcolor: 'rgba(37,99,235,0.08)',
  },
  '& .MuiAutocomplete-option.Mui-focused': {
    bgcolor: 'rgba(37,99,235,0.05)',
  },
};
