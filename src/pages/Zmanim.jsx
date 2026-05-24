import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTenant } from '../config/TenantContext';
import { getSiteTypeConfig } from '../config/siteTypes';
import { escapeHtml } from '../utils/sanitize';
import { LOCAL_TENANT_UPDATED_EVENT, isLocalDevHost, readLocalZmanim } from '../utils/localTenantAccess';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import css from './Zmanim.module.css';

const LEGACY_SECTIONS = [
  {
    title: 'ימי חול',
    rows: [
      ['shacharit_weekday', 'שחרית'],
      ['mincha_summer', 'מנחה (קיץ)'],
      ['mincha_winter', 'מנחה (חורף)'],
      ['arvit', 'ערבית'],
    ],
  },
  {
    title: 'שבת קודש',
    rows: [
      ['kabbalat_shabbat', 'קבלת שבת'],
      ['shacharit_shabbat', 'שחרית'],
      ['mincha_summer', 'מנחה גדולה'],
      ['arvit', 'ערבית מוצ"ש'],
    ],
  },
];

function normalizeSections(data = {}) {
  if (Array.isArray(data.sections)) {
    return data.sections
      .map(section => ({
        title: section.title || '',
        rows: Array.isArray(section.rows) ? section.rows.filter(row => row.label || row.time) : [],
      }))
      .filter(section => section.title || section.rows.length > 0);
  }

  const hasLegacyTimes = LEGACY_SECTIONS.some(section => section.rows.some(([key]) => data?.[key]));
  if (!hasLegacyTimes) return [];
  return LEGACY_SECTIONS.map(section => ({
    title: section.title,
    rows: section.rows.map(([key, label]) => ({ label, time: data?.[key] || '' })).filter(row => row.time),
  })).filter(section => section.rows.length > 0);
}

function buildPrintHtml(data, isDark, tenantConfig, pageCopy) {
  const primary = tenantConfig?.theme?.primaryColor || '#C9A84C';
  const bgDef   = tenantConfig?.theme?.bgDefault    || '#0D1B2A';
  const bgPap   = tenantConfig?.theme?.bgPaper      || '#1A2940';

  const bg      = isDark ? bgDef : '#ffffff';
  const text    = isDark ? '#F5F0E8' : '#1a1a1a';
  const subText = isDark ? '#A89F94' : '#666666';
  const gold    = primary;
  const cardBg  = isDark ? bgPap : '#f8f6ef';
  const border  = 'rgba(201,168,76,0.3)';

  const name     = escapeHtml(tenantConfig?.name || 'בית כנסת');
  const subtitle = escapeHtml(tenantConfig?.subtitle || '');
  const pdfTitle = escapeHtml(pageCopy.pdfTitle || pageCopy.title || 'זמנים');

  const sections = normalizeSections(data);
  const printableSections = sections.length > 0 ? sections : (pageCopy.defaultSections || []);
  const sectionHtml = printableSections.map(section =>
    `<div class="card">
      <div class="card-title">${escapeHtml(section.title || 'זמנים')}</div>
      ${section.rows.map(row => `<div class="row"><span class="label">${escapeHtml(row.label || '')}</span><span class="time">${escapeHtml(row.time || '')}</span></div>`).join('')}
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>${pdfTitle} — ${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${bg};color:${text};font-family:'Assistant',sans-serif;padding:48px 40px;direction:rtl;min-height:100vh}
  .header{text-align:center;margin-bottom:32px}
  h1{font-family:'Secular One',serif;color:${gold};font-size:2.4rem;margin-bottom:6px}
  .sub{color:${subText};font-size:1rem;margin-bottom:4px}
  .syn{color:${gold};font-size:1.1rem;font-weight:700}
  .divider{height:2px;background:linear-gradient(90deg,transparent,${gold},transparent);margin:24px auto;width:55%;border:none}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:760px;margin:0 auto}
  .card{background:${cardBg};border:1px solid ${border};border-radius:14px;padding:24px}
  .card-title{font-family:'Secular One',serif;color:${gold};font-size:1.35rem;text-align:center;padding-bottom:14px;border-bottom:1px solid ${border};margin-bottom:16px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.06)}
  .row:last-child{border-bottom:none}
  .label{font-size:1rem;color:${text}}
  .time{color:${gold};font-weight:700;font-size:1.5rem;direction:ltr}
  .footer{text-align:center;margin-top:36px;color:${subText};font-size:0.82rem}
  @media print{body{padding:20px}@page{margin:1.5cm}}
</style>
</head>
<body>
  <div class="header">
    <h1>${pdfTitle}</h1>
    ${subtitle ? `<div class="sub">${subtitle}</div>` : ''}
    <div class="syn">${name}</div>
  </div>
  <hr class="divider"/>
  <div class="grid">
    ${sectionHtml || `<div class="footer">${escapeHtml(pageCopy.emptyText || 'לא הוזנו זמנים עדיין')}</div>`}
  </div>
  <div class="footer">הודפס מאתר ${name}</div>
  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;
}

function TimeBlock({ section }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" className={css.titleBorder} sx={{ color: 'primary.main', mb: 2, pb: 1.5 }}>
          {section.title || 'זמנים'}
        </Typography>
        {section.rows.map((row, index) => (
          <Box key={`${row.label}-${row.time}-${index}`} className={css.timeRow} sx={{ py: 1.25 }}>
            <Typography sx={{ color: 'text.primary', fontSize: '1.02rem' }}>{row.label}</Typography>
            <Typography className={css.timeValue} sx={{ color: 'primary.main' }}>
              {row.time}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Zmanim() {
  const { config, slug } = useTenant();
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const pageCopy = siteTypeConfig.pages.schedule;
  const [data, setData]     = useState({});
  const [anchor, setAnchor] = useState(null);
  const sections = normalizeSections(data);
  const visibleSections = sections.length > 0 ? sections : (pageCopy.defaultSections || []);

  useEffect(() => {
    if (isLocalDevHost()) {
      const localData = readLocalZmanim(slug);
      if (Object.keys(localData || {}).length > 0) setData(localData);
    }

    getDoc(doc(db, 'zmanim', slug))
      .then(s => { if (s.exists()) setData(s.data()); })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    const handleLocalUpdate = (event) => {
      if (event.detail?.slug !== slug || event.detail?.type !== 'zmanim') return;
      const localData = readLocalZmanim(slug);
      if (Object.keys(localData || {}).length > 0) setData(localData);
    };

    window.addEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
    return () => window.removeEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
  }, [slug]);

  const openPdf = (mode) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildPrintHtml(data || {}, mode === 'dark', config, pageCopy));
    win.document.close();
  };

  return (
    <Box>
      <PageHero title={pageCopy.title} subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="md">
          <GoldDivider />
          {visibleSections.length > 0 ? (
            <Grid container spacing={3} mt={1}>
              {visibleSections.map((section, index) => (
                <Grid item xs={12} sm={visibleSections.length === 1 ? 12 : 6} key={`${section.title}-${index}`}>
                  <TimeBlock section={section} />
                </Grid>
              ))}
            </Grid>
          ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>{pageCopy.emptyText}</Typography>
          )}

          {data.note && (
            <Card className={css.noteCard} sx={{ mt: 3, p: 2.5, borderColor: 'primary.main' }}>
              <Typography color="text.secondary">{data.note}</Typography>
            </Card>
          )}

          {data.last_updated && (
            <Typography textAlign="center" variant="caption" color="text.secondary" display="block" mt={2}>
              עודכן: {data.last_updated?.toDate?.().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}

          <div className={css.printBtn} style={{ marginTop: 32 }}>
            <Button
              variant="contained" size="large" startIcon={<PictureAsPdfIcon />}
              onClick={e => setAnchor(e.currentTarget)}
              sx={{
                px: 5, py: 1.4, fontSize: '1rem',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
                color: 'primary.contrastText', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
              }}
            >
              הורדה / הדפסה כ-PDF
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, border: '1px solid rgba(201,168,76,0.3)' } }}>
              <MenuItem onClick={() => { setAnchor(null); openPdf('light'); }} sx={{ gap: 1.5, py: 1.5 }}>
                <WbSunnyIcon sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography fontWeight={700}>מצב בהיר</Typography>
                  <Typography variant="caption" color="text.secondary">רקע לבן — אידיאלי להדפסה</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { setAnchor(null); openPdf('dark'); }} sx={{ gap: 1.5, py: 1.5 }}>
                <DarkModeIcon sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography fontWeight={700}>מצב כהה</Typography>
                  <Typography variant="caption" color="text.secondary">רקע כהה — לשמירה דיגיטלית</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </div>
        </Container>
      </Box>
    </Box>
  );
}
