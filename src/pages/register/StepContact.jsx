import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx } from '../../utils/inputStyles';
import { SectionTitle, FieldGrid, CompactField } from './registerComponents';

export default function StepContact({ data, update }) {
  return (
    <Box>
      <SectionTitle>יצירת קשר</SectionTitle>

      <FieldGrid>
        <CompactField xs={4} sm={4} md={4}>
          <TextField
            label="עיר"
            value={data.city}
            onChange={(e) => update('city', e.target.value)}
            fullWidth
            sx={inputSx}
            placeholder="לדוגמה: קריית גת"
          />
        </CompactField>
        <CompactField xs={8} sm={8} md={8}>
          <TextField
            label="כתובת"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            fullWidth
            sx={inputSx}
            placeholder="לדוגמה: שדרות גת 124"
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label="קישור לגוגל מאפס"
            value={data.mapEmbedUrl}
            onChange={e => update('mapEmbedUrl', e.target.value)}
            fullWidth
            sx={inputSx}
            inputProps={{ dir: 'ltr' }}
            placeholder="https://maps.google.com/..."
          />
        </CompactField>
        <CompactField>
          <TextField label="טלפון" value={data.phone} onChange={e => update('phone', e.target.value)} fullWidth sx={inputSx} inputProps={{ dir: 'ltr' }} placeholder="050-1234567" />
        </CompactField>
        <CompactField>
          <Box sx={{ width: '100%' }} style={{ direction: 'rtl', textAlign: 'right' }}>
            <TextField
              label="אימייל"
              value={data.email}
              onChange={e => update('email', e.target.value)}
              fullWidth
              sx={inputSx}
              inputProps={{ dir: 'ltr' }}
              placeholder="info@example.com"
            />
            {data.email.trim() && (
              <Box
                component="p"
                style={{ direction: 'rtl', textAlign: 'right' }}
                sx={{
                  color: COLORS.gold,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  lineHeight: 1.45,
                  m: 0,
                  mt: 0.75,
                  width: '100%',
                }}
              >
                המייל הזה ישמש כאדמין של האתר שיווצר
              </Box>
            )}
          </Box>
        </CompactField>
        <CompactField>
          <TextField
            label="מספר וואטסאפ של הגבאי"
            value={data.gabaiPhone}
            onChange={e => update('gabaiPhone', e.target.value)}
            fullWidth
            sx={inputSx}
            inputProps={{ dir: 'ltr' }}
            placeholder="050-1234567"
          />
        </CompactField>
        <CompactField>
          <TextField
            label="קישור לקבוצת וואטסאפ"
            value={data.waGroupLink}
            onChange={e => update('waGroupLink', e.target.value)}
            fullWidth
            sx={inputSx}
            inputProps={{ dir: 'ltr' }}
            placeholder="https://chat.whatsapp.com/..."
          />
        </CompactField>
      </FieldGrid>
    </Box>
  );
}
