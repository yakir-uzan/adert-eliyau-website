import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
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

const WEEKDAY = [
  ['shacharit_weekday', 'שחרית'],
  ['mincha_summer',     'מנחה (קיץ)'],
  ['mincha_winter',     'מנחה (חורף)'],
  ['arvit',             'ערבית'],
];
const SHABBAT = [
  ['kabbalat_shabbat', 'קבלת שבת'],
  ['shacharit_shabbat','שחרית'],
  ['mincha_summer',    'מנחה גדולה'],
  ['arvit',            'ערבית מוצ"ש'],
];

function buildPrintHtml(data, isDark) {
  const bg      = isDark ? '#0D1B2A' : '#ffffff';
  const text    = isDark ? '#F5F0E8' : '#1a1a1a';
  const subText = isDark ? '#A89F94' : '#666666';
  const gold    = '#C9A84C';
  const cardBg  = isDark ? '#1A2940' : '#f8f6ef';
  const border  = 'rgba(201,168,76,0.3)';

  const rows = (arr) => arr.map(([k, l]) =>
    `<div class="row"><span class="label">${l}</span><span class="time">${data?.[k] || '--:--'}</span></div>`
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>זמני תפילות — בית כנסת אדרת אליהו</title>
<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${bg};color:${text};font-family:'Assistant',sans-serif;padding:48px 40px;direction:rtl;min-height:100vh}
  .header{text-align:center;margin-bottom:32px}
  h1{font-family:'Secular One',serif;color:${gold};font-size:2.4rem;margin-bottom:6px}
  .sub{color:${subText};font-size:1rem;margin-bottom:4px}
  .syn{color:${gold};font-size:1.1rem;font-weight:700}
  .divider{height:2px;background:linear-gradient(90deg,transparent,${gold},transparent);margin:24px auto;width:55%;border:none}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:700px;margin:0 auto}
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
    <h1>זמני תפילות ושיעורים</h1>
    <div class="sub">ע"ש אליהו אוזן ז"ל</div>
    <div class="syn">בית כנסת אדרת אליהו</div>
  </div>
  <hr class="divider"/>
  <div class="grid">
    <div class="card">
      <div class="card-title">ימי חול</div>
      ${rows(WEEKDAY)}
    </div>
    <div class="card">
      <div class="card-title">שבת קודש</div>
      ${rows(SHABBAT)}
    </div>
  </div>
  <div class="footer">הודפס מאתר בית כנסת אדרת אליהו</div>
  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;
}

const SAMPLE_DATA = {
  shacharit_weekday: '06:15',
  mincha_summer:     '19:45',
  mincha_winter:     '17:00',
  arvit:             '20:30',
  kabbalat_shabbat:  '18:45',
  shacharit_shabbat: '08:30',
};

function openPdf(data, mode) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(buildPrintHtml(data || SAMPLE_DATA, mode === 'dark'));
  win.document.close();
}

function TimeBlock({ title, rows, data }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ color: 'primary.main', textAlign: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {title}
        </Typography>
        {rows.map(([key, label]) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: '1px solid rgba(201,168,76,0.06)', '&:last-child': { borderBottom: 'none' } }}>
            <Typography sx={{ color: 'text.primary', fontSize: '1.02rem' }}>{label}</Typography>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.5rem', direction: 'ltr' }}>
              {data?.[key] || '--:--'}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Zmanim() {
  const [data, setData]     = useState(SAMPLE_DATA); // show sample immediately
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'zmanim', 'current'))
      .then(s => { if (s.exists()) setData(s.data()); })
      .catch(() => {}); // keep sample data on error
  }, []);

  return (
    <Box>
      <PageHero title="זמני תפילות ושיעורים" subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="md">
          <GoldDivider />

          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} sm={6}><TimeBlock title="ימי חול" rows={WEEKDAY} data={data} /></Grid>
            <Grid item xs={12} sm={6}><TimeBlock title="שבת קודש" rows={SHABBAT} data={data} /></Grid>
          </Grid>

          {data.note && (
            <Card sx={{ mt: 3, p: 2.5, textAlign: 'center', bgcolor: 'rgba(201,168,76,0.06)', borderColor: 'primary.main' }}>
              <Typography color="text.secondary">{data.note}</Typography>
            </Card>
          )}

          {data.last_updated && (
            <Typography textAlign="center" variant="caption" color="text.secondary" display="block" mt={2}>
              עודכן: {data.last_updated?.toDate?.().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}

          {/* PDF Download — always visible */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PictureAsPdfIcon />}
              onClick={e => setAnchor(e.currentTarget)}
              sx={{
                px: 5, py: 1.4, fontSize: '1rem',
                background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
                color: '#0D1B2A',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
                '&:hover': { boxShadow: '0 6px 28px rgba(201,168,76,0.5)', background: 'linear-gradient(135deg, #b8943e 0%, #d4c090 50%, #b8943e 100%)' },
              }}
            >
              הורדה / הדפסה כ-PDF
            </Button>
            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, border: '1px solid rgba(201,168,76,0.3)' } }}
            >
              <MenuItem onClick={() => { setAnchor(null); openPdf(data ?? SAMPLE_DATA, 'light'); }} sx={{ gap: 1.5, py: 1.5 }}>
                <WbSunnyIcon sx={{ color: '#C9A84C' }} />
                <Box>
                  <Typography fontWeight={700}>מצב בהיר</Typography>
                  <Typography variant="caption" color="text.secondary">רקע לבן — אידיאלי להדפסה</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { setAnchor(null); openPdf(data ?? SAMPLE_DATA, 'dark'); }} sx={{ gap: 1.5, py: 1.5 }}>
                <DarkModeIcon sx={{ color: '#C9A84C' }} />
                <Box>
                  <Typography fontWeight={700}>מצב כהה</Typography>
                  <Typography variant="caption" color="text.secondary">רקע כהה — לשמירה דיגיטלית</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
