import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import { saveLocalTenantDraft } from '../../utils/localTenantAccess';
import { tenantToForm, mergeTenantConfig } from './adminFormUtils';
import { registerInputSx as inputSx, autocompleteSx, autocompleteDropdownSx } from '../../utils/inputStyles';
import { BANK_OPTIONS, BRANCH_OPTIONS } from '../register/registerConstants';
import { getBranchLabel, BankOptionContent, BranchOptionContent } from '../register/registerComponents';
import css from './SettingsTab.module.css';

const autocompletePopperSx = {
  direction: 'rtl',
  '& .MuiAutocomplete-listbox': { p: 0, direction: 'rtl', textAlign: 'right' },
  '& .MuiAutocomplete-option': { textAlign: 'right', direction: 'rtl', display: 'block' },
};

const optionStyle = { direction: 'rtl', textAlign: 'right', justifyContent: 'flex-end', display: 'flex' };
const adminAutocompleteSx = {
  ...autocompleteSx,
  direction: 'rtl',
  '& .MuiInputBase-root': { direction: 'rtl', textAlign: 'right' },
  '& .MuiInputBase-input': { direction: 'rtl !important', textAlign: 'right !important' },
  '& .MuiAutocomplete-endAdornment': { left: 9, right: 'auto' },
};

export default function SettingsTab({ config, slug, onToast, localMode }) {
  const [form, setForm] = useState(() => tenantToForm(config));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(tenantToForm(config));
  }, [config]);

  const update = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const updateValue = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const branchOptionsForBank = form.bankName
    ? BRANCH_OPTIONS.filter(option => option.bank === form.bankName)
    : BRANCH_OPTIONS;

  const save = async () => {
    setSaving(true);
    try {
      const nextConfig = mergeTenantConfig(config, form);

      if (localMode) {
        saveLocalTenantDraft(slug, nextConfig);
        onToast('פרטי האתר נשמרו בהצלחה');
        setSaving(false);
        return;
      }

      await setDoc(doc(db, 'tenants', slug), {
        name: nextConfig.name,
        subtitle: nextConfig.subtitle,
        aboutText: nextConfig.aboutText,
        contact: nextConfig.contact,
        whatsapp: nextConfig.whatsapp,
        payments: nextConfig.payments,
        images: nextConfig.images,
      }, { merge: true });

      onToast('פרטי האתר נשמרו בהצלחה');
    } catch {
      onToast('שגיאה בשמירת פרטי האתר', 'error');
    }
    setSaving(false);
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>פרטי בית הכנסת</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="שם בית הכנסת" value={form.name} onChange={update('name')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="כותרת משנה" value={form.subtitle} onChange={update('subtitle')} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="תיאור / אודות" value={form.aboutText} onChange={update('aboutText')} multiline rows={4} fullWidth />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>יצירת קשר</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField label="כתובת" value={form.address} onChange={update('address')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="עיר" value={form.city} onChange={update('city')} fullWidth />
          </Grid>
           <Grid item xs={12}>
            <TextField label="קישור למפה" value={form.mapEmbedUrl} onChange={update('mapEmbedUrl')} fullWidth inputProps={{ dir: 'ltr' }} placeholder="https://maps.google.com/..." />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="טלפון" value={form.phone} onChange={update('phone')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="אימייל" value={form.email} onChange={update('email')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="וואטסאפ של הגבאי" value={form.waGabaiLink} onChange={update('waGabaiLink')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
         
          <Grid item xs={12}>
            <TextField label="קבוצת וואטסאפ" value={form.waGroupLink} onChange={update('waGroupLink')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>תשלומים</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="מספר ביט" value={form.bitPhone} onChange={update('bitPhone')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="מספר פייבוקס" value={form.payboxPhone} onChange={update('payboxPhone')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="קישור לפייבוקס" value={form.payboxLink} onChange={update('payboxLink')} fullWidth inputProps={{ dir: 'ltr' }} placeholder="https://..." />
          </Grid>
          <Grid item xs={12}>
            <TextField label="קישור לנדרים פלוס" value={form.nedarimLink} onChange={update('nedarimLink')} fullWidth inputProps={{ dir: 'ltr' }} placeholder="https://..." />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>פרטי העברה בנקאית</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={BANK_OPTIONS}
              value={BANK_OPTIONS.find(option => option.name === form.bankName) || null}
              onChange={(_, value) => {
                updateValue('bankName', value?.name || '');
                updateValue('bankBranch', '');
              }}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.code})`}
              sx={adminAutocompleteSx}
              slotProps={{
                paper: { sx: autocompleteDropdownSx },
                popper: { sx: autocompletePopperSx },
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ ...(props.style || {}), ...optionStyle }}>
                  <BankOptionContent option={option} />
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="בנק" fullWidth sx={inputSx} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={branchOptionsForBank}
              value={form.bankBranch || ''}
              onChange={(_, value) => updateValue('bankBranch', typeof value === 'string' ? value : getBranchLabel(value))}
              inputValue={form.bankBranch || ''}
              onInputChange={(_, value) => updateValue('bankBranch', value)}
              getOptionLabel={getBranchLabel}
              filterOptions={(options, state) => {
                const search = state.inputValue.trim().toLowerCase();
                if (!search) return options;
                return options.filter(option => {
                  const label = getBranchLabel(option).toLowerCase();
                  return label.includes(search)
                    || option.branchName.toLowerCase().includes(search)
                    || option.branchCode.includes(search)
                    || option.city.toLowerCase().includes(search)
                    || option.address.toLowerCase().includes(search);
                });
              }}
              sx={adminAutocompleteSx}
              slotProps={{
                paper: { sx: autocompleteDropdownSx },
                popper: { sx: autocompletePopperSx },
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ ...(props.style || {}), ...optionStyle }}>
                  <BranchOptionContent option={option} />
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="סניף" fullWidth sx={inputSx} helperText="אפשר לחפש לפי מספר סניף או לפי שם" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="מספר חשבון" value={form.accountNumber} onChange={update('accountNumber')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="שם בעל החשבון" value={form.accountOwner} onChange={update('accountOwner')} fullWidth />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>תמונות</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="לוגו" value={form.logo} onChange={update('logo')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="תמונת רקע לדפים" value={form.pageHeroBg} onChange={update('pageHeroBg')} fullWidth inputProps={{ dir: 'ltr' }} />
          </Grid>
        </Grid>

        <div className={css.saveRow}>
          <Alert severity="info" sx={{ flex: 1, minWidth: 260 }}>
            אחרי שמירה, השינויים יופיעו בכל האתר של בית הכנסת הזה בלבד.
          </Alert>
          <Button variant="contained" onClick={save} disabled={saving} startIcon={saving ? null : <SaveIcon />} sx={{ px: 4 }}>
            {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'שמור פרטי אתר'}
          </Button>
        </div>
      </Card>
    </Box>
  );
}
