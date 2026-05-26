import { useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { registerInputSx as inputSx } from '../../utils/inputStyles';
import { stripSynagoguePrefix, buildSlugFromName, buildLegacySlugFromName, extractSlugFromUrlInput } from '../../utils/slugUtils';
import { DEFAULT_SITE_TYPE, getSiteTypeConfig } from '../../config/siteTypes';
import { SectionTitle, FieldGrid, CompactField, ImageField } from './registerComponents';

export default function StepBasicInfo({ data, update, baseUrl, uploads, onUpload }) {
  const siteType = data.siteType || DEFAULT_SITE_TYPE;
  const siteTypeConfig = getSiteTypeConfig(siteType);
  const displayName = siteType === DEFAULT_SITE_TYPE ? stripSynagoguePrefix(data.name) : data.name;
  const urlPrefix = `${baseUrl.replace(/\/+$/g, '')}/${siteType}`;
  const slugExample = siteTypeConfig.slugPlaceholder?.split('/').pop() || 'your-site';
  const generatedSlug = buildSlugFromName(data.name);
  const legacyGeneratedSlug = buildLegacySlugFromName(data.name);

  useEffect(() => {
    if (!data.name.trim() || !generatedSlug) return;
    if (!data.slug || (!data.slugManual && data.slug !== generatedSlug) || data.slug === legacyGeneratedSlug) {
      update('slug', generatedSlug);
    }
  }, [data.name, data.slug, data.slugManual, generatedSlug, legacyGeneratedSlug, update]);

  return (
    <Box>
      <SectionTitle description={`הגדרת בסיס עבור ${siteTypeConfig.label}. העיצוב נשאר זהה, והתוכן יתאים לסוג האתר שנבחר.`}>
        פרטי בסיס
      </SectionTitle>

      <FieldGrid>
        <CompactField>
          <TextField
            label={siteTypeConfig.nameFieldLabel}
            value={displayName}
            onChange={e => {
              const rawName = e.target.value;
              update('name', rawName);
              if (!data.slugManual) update('slug', buildSlugFromName(e.target.value));
            }}
            fullWidth
            sx={inputSx}
            placeholder={siteTypeConfig.namePlaceholder}
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
            placeholder={`לדוגמה: ${siteTypeConfig.defaultSubtitle}`}
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label="כתובת האתר *"
            value={data.slug ? `${urlPrefix}/${data.slug}` : ''}
            onChange={e => {
              update('slug', extractSlugFromUrlInput(e.target.value, baseUrl, siteType));
              update('slugManual', true);
            }}
            fullWidth
            sx={inputSx}
            placeholder={`${baseUrl.replace(/\/+$/g, '')}/${siteType}/${slugExample}`}
            inputProps={{ dir: 'ltr', style: { fontFamily: 'monospace' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title={`אם תרצה, הכתובת נוצרת לבד לפי שם ${siteTypeConfig.label}.`}>
                    <InfoOutlinedIcon sx={{ color: COLORS.gold, fontSize: 20, cursor: 'help' }} />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </CompactField>
        <CompactField xs={12} sm={12} md={12}>
          <TextField
            label={siteTypeConfig.aboutLabel}
            value={data.aboutText}
            onChange={e => update('aboutText', e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={inputSx}
            placeholder={siteTypeConfig.aboutPlaceholder}
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
