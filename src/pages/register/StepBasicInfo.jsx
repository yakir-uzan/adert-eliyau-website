import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx } from '../../utils/inputStyles';
import { stripSynagoguePrefix, buildSlugFromName, normalizeSlugInput } from '../../utils/slugUtils';
import { SectionTitle, FieldGrid, CompactField, ImageField } from './registerComponents';

export default function StepBasicInfo({ data, update, baseUrl, uploads, onUpload }) {
  return (
    <Box>
      <SectionTitle>פרטי בסיס</SectionTitle>

      <FieldGrid>
        <CompactField>
          <TextField
            label="שם בית הכנסת *"
            value={stripSynagoguePrefix(data.name)}
            onChange={e => {
              const rawName = e.target.value;
              update('name', rawName ? `בית כנסת ${rawName}` : '');
              if (!data.slugManual) update('slug', buildSlugFromName(e.target.value));
            }}
            fullWidth
            sx={inputSx}
            placeholder="לדוגמה: אדרת אליהו"
            inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
          />
        </CompactField>
        <CompactField>
          <TextField
            label="כותרת משנה"
            value={data.subtitle}
            onChange={e => update('subtitle', e.target.value)}
            fullWidth
            sx={inputSx}
            placeholder='לדוגמה: קהילה, תפילה וחסד'
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label="כתובת האתר *"
            value={data.slug ? `${baseUrl}/${data.slug}` : ''}
            onChange={e => {
              const nextValue = e.target.value.startsWith(`${baseUrl}/`)
                ? e.target.value.slice(`${baseUrl}/`.length)
                : e.target.value;
              update('slug', normalizeSlugInput(nextValue));
              update('slugManual', true);
            }}
            fullWidth
            sx={inputSx}
            placeholder={`${baseUrl}/your-synagogue`}
            inputProps={{ dir: 'ltr', style: { fontFamily: 'monospace' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="אם תרצה, הכתובת נוצרת לבד לפי שם בית הכנסת.">
                    <InfoOutlinedIcon sx={{ color: COLORS.gold, fontSize: 20, cursor: 'help' }} />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label="כמה מילים על בית הכנסת"
            value={data.aboutText}
            onChange={e => update('aboutText', e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={inputSx}
            placeholder="ספרו בקצרה על הקהילה, האווירה והייחוד של המקום"
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={6}>
          <ImageField
            label="לוגו"
            value={data.logo}
            onChange={value => update('logo', value)}
            onUpload={file => onUpload('logo', file)}
            uploading={uploads.logo}
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={6}>
          <ImageField
            label="תמונת רקע לדפים"
            value={data.pageHeroBg}
            onChange={value => update('pageHeroBg', value)}
            onUpload={file => onUpload('pageHeroBg', file)}
            uploading={uploads.pageHeroBg}
          />
        </CompactField>
      </FieldGrid>
    </Box>
  );
}
