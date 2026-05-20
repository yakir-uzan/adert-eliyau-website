import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx, autocompleteSx, autocompleteDropdownSx } from '../../utils/inputStyles';
import { BANK_OPTIONS, BRANCH_OPTIONS } from './registerConstants';
import { SectionTitle, FieldGrid, CompactField, getBranchLabel, BankOptionContent, BranchOptionContent } from './registerComponents';

const autocompletePopperSx = {
  '& .MuiAutocomplete-listbox': { p: 0, direction: 'rtl', textAlign: 'right' },
  '& .MuiAutocomplete-option': { textAlign: 'right', direction: 'rtl', display: 'block' },
};

const optionStyle = { direction: 'rtl', textAlign: 'right', justifyContent: 'flex-end', display: 'flex' };

export default function StepPayments({ data, update }) {
  const branchOptionsForBank = data.bankName
    ? BRANCH_OPTIONS.filter(option => option.bank === data.bankName)
    : BRANCH_OPTIONS;

  return (
    <Box>
      <SectionTitle>תשלומים</SectionTitle>

      <FieldGrid>
        <CompactField>
          <TextField label="מספר לביט" value={data.bitPhone} onChange={e => update('bitPhone', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} placeholder="050-1234567" />
        </CompactField>
        <CompactField>
          <TextField label="קישור לנדרים פלוס" value={data.nedarimLink} onChange={e => update('nedarimLink', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} placeholder="https://..." />
        </CompactField>
        <CompactField>
          <TextField label="מספר לפייבוקס" value={data.payboxPhone} onChange={e => update('payboxPhone', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} placeholder="051-1234567" />
        </CompactField>
        <CompactField>
          <TextField label="קישור לפייבוקס" value={data.payboxLink} onChange={e => update('payboxLink', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} placeholder="https://..." />
        </CompactField>
      </FieldGrid>

      <Box sx={{ mt: 3, direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Typography sx={{ color: COLORS.gold, fontFamily: '"Secular One", serif', mb: 1.2, textAlign: 'right', width: 'fit-content' }}>
            פרטי העברה בנקאית
          </Typography>
        </Box>
        <FieldGrid>
          <CompactField>
            <Autocomplete
              options={BANK_OPTIONS}
              value={BANK_OPTIONS.find(option => option.name === data.bankName) || null}
              onChange={(_, value) => {
                update('bankName', value?.name || '');
                update('bankBranch', '');
              }}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.code})`}
              sx={autocompleteSx}
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
          </CompactField>
          <CompactField>
            <Autocomplete
              freeSolo
              options={branchOptionsForBank}
              value={data.bankBranch || ''}
              onChange={(_, value) => update('bankBranch', typeof value === 'string' ? value : getBranchLabel(value))}
              inputValue={data.bankBranch || ''}
              onInputChange={(_, value) => update('bankBranch', value)}
              getOptionLabel={getBranchLabel}
              filterOptions={(options, state) => {
                const query = state.inputValue.trim().toLowerCase();
                if (!query) return options;
                return options.filter(option => {
                  const label = getBranchLabel(option).toLowerCase();
                  return label.includes(query)
                    || option.branchName.toLowerCase().includes(query)
                    || option.branchCode.includes(query)
                    || option.city.toLowerCase().includes(query)
                    || option.address.toLowerCase().includes(query);
                });
              }}
              sx={autocompleteSx}
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
          </CompactField>
          <CompactField>
            <TextField label="מספר חשבון" value={data.accountNumber} onChange={e => update('accountNumber', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} />
          </CompactField>
          <CompactField>
            <TextField label="לפקודת" value={data.accountOwner} onChange={e => update('accountOwner', e.target.value)} fullWidth sx={inputSx} />
          </CompactField>
        </FieldGrid>
      </Box>
    </Box>
  );
}
