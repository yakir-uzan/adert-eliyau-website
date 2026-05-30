import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx } from '../../utils/inputStyles';
import { buildSlugFromName, normalizeSlugInput, cleanSlug, withTimeout } from '../../utils/slugUtils';
import { SectionTitle, FieldGrid, CompactField } from './registerComponents';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StepBasicInfo({ data, update, baseUrl }) {
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'taken' | 'available'
  const timerRef = useRef(null);

  useEffect(() => {
    const slug = cleanSlug(data.slug);
    if (!slug) { setSlugStatus(null); return; }

    setSlugStatus('checking');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'tenants', slug)), 5000);
        setSlugStatus(snap.exists() ? 'taken' : 'available');
      } catch {
        setSlugStatus(null);
      }
    }, 600);

    return () => clearTimeout(timerRef.current);
  }, [data.slug]);

  return (
    <Box>
      <SectionTitle>פרטי בסיס</SectionTitle>

      <FieldGrid>
        <CompactField>
          <TextField
            label="שם העסק *"
            value={data.name}
            onChange={e => {
              update('name', e.target.value);
              if (!data.slugManual) update('slug', buildSlugFromName(e.target.value));
            }}
            fullWidth
            sx={inputSx}
            placeholder="לדוגמה: שם העסק שלכם"
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
            placeholder='לדוגמה: המקום הטוב ביותר בעיר'
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
            placeholder={`${baseUrl}/your-business`}
            inputProps={{ dir: 'ltr', style: { fontFamily: 'monospace' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="הכתובת נוצרת אוטומטית לפי שם העסק.">
                    <InfoOutlinedIcon sx={{ color: COLORS.primary, fontSize: 20, cursor: 'help' }} />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          {slugStatus === 'taken' && (
            <Typography sx={{ color: '#E53E3E', fontSize: '0.82rem', fontWeight: 600, mt: 0.5, direction: 'rtl', textAlign: 'left' }}>
              הכתובת הזו תפוסה, ניתן לערוך אותה למעלה
            </Typography>
          )}
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label="כמה מילים על העסק"
            value={data.aboutText}
            onChange={e => update('aboutText', e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={inputSx}
            placeholder="ספרו בקצרה על העסק, השירותים והייחוד שלכם"
          />
        </CompactField>
      </FieldGrid>
    </Box>
  );
}
