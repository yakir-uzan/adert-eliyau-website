import { useRef } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx } from '../../utils/inputStyles';
import { sanitizeDisplayText } from '../../utils/slugUtils';
import css from './registerComponents.module.css';

export function SectionTitle({ children, description, accessory }) {
  return (
    <div className={css.sectionTitleWrap}>
      <div className={css.sectionTitleInner}>
        <div className={css.sectionTitleHeadingRow}>
          <Typography variant="h6" className={css.sectionTitleText}>
            {children}
          </Typography>
          {accessory}
        </div>
        {description && (
          <Typography className={css.sectionDescription}>
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
}

export function FieldGrid({ children }) {
  return <Grid container spacing={2.2} direction="row-reverse">{children}</Grid>;
}

export function CompactField({ children, xs = 12, sm = 6, md = 6 }) {
  return (
    <Grid item xs={xs} sm={sm} md={md}>
      {children}
    </Grid>
  );
}

export function ImageField({ label, value, onChange, onUpload, uploading, helperText }) {
  const fileInputRef = useRef(null);

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        fullWidth
        sx={inputSx}
        inputProps={{ dir: 'ltr' }}
        placeholder="https://..."
        helperText={helperText}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                sx={{ color: COLORS.goldLight }}
              >
                {uploading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <AddPhotoAlternateOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={e => onUpload(e.target.files?.[0])}
        style={{ display: 'none' }}
      />
    </>
  );
}

export function getBranchLabel(option) {
  if (typeof option === 'string') return option;
  return option?.branchCode
    ? `${option.branchCode} - ${sanitizeDisplayText(option.branchName)} · ${sanitizeDisplayText(option.city)}`
    : sanitizeDisplayText(option?.branchName || '');
}

export function BankOptionContent({ option }) {
  const bankName = typeof option === 'string' ? option : option?.name || '';
  const bankCode = typeof option === 'string' ? '' : option?.code || '';

  return (
    <div className={css.bankOptionRow}>
      <span className={css.bankOptionName}>{bankName}</span>
      {bankCode ? (
        <span className={css.bankOptionCode}>({bankCode})</span>
      ) : null}
    </div>
  );
}

export function BranchOptionContent({ option }) {
  if (typeof option === 'string') {
    return (
      <div className={css.branchOptionRow}>
        {option}
      </div>
    );
  }

  return (
    <div className={css.branchOptionRowFull}>
      <span className={css.branchName}>{sanitizeDisplayText(option.branchName)}</span>
      <span className={css.branchCode}>{option.branchCode}</span>
      <span className={css.branchCity}>{sanitizeDisplayText(option.city)}</span>
    </div>
  );
}
