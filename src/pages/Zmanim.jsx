import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

const DEFAULT_SECTIONS = [
  {
    id: 'weekday',
    title: 'ימי חול',
    rows: [
      { key: 'r1', label: 'שחרית',       time: '06:15' },
      { key: 'r2', label: 'מנחה (קיץ)',  time: '19:45' },
      { key: 'r3', label: 'מנחה (חורף)', time: '17:00' },
      { key: 'r4', label: 'ערבית',        time: '20:30' },
    ],
  },
  {
    id: 'shabbat',
    title: 'שבת קודש',
    rows: [
      { key: 'r5', label: 'קבלת שבת',     time: '18:45' },
      { key: 'r6', label: 'שחרית',         time: '08:30' },
      { key: 'r7', label: 'מנחה גדולה',   time: '' },
      { key: 'r8', label: 'ערבית מוצ"ש',  time: '' },
    ],
  },
];

/* ── PDF builder ── */
function buildPrintHtml(sections, note, isDark) {
  const bg      = isDark ? '#0D1B2A' : '#ffffff';
  const text    = isDark ? '#F5F0E8' : '#1a1a1a';
  const subText = isDark ? '#A89F94' : '#666666';
  const gold    = '#C9A84C';
  const cardBg  = isDark ? '#1A2940' : '#f8f6ef';
  const border  = 'rgba(201,168,76,0.3)';

  const sectionHtml = sections.map(s => `
    <div class="card">
      <div class="card-title">${s.title}</div>
      ${s.rows.map(r => `
        <div class="row">
          <span class="label">${r.label}</span>
          <span class="time">${r.time || '--:--'}</span>
        </div>`).join('')}
    </div>`).join('');

  return `<!DOCTYPE html><html dir="rtl" lang="he">
<head><meta charset="UTF-8"><title>זמני תפילות — בית כנסת אדרת אליהו</title>
<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${bg};color:${text};font-family:'Assistant',sans-serif;padding:48px 40px;direction:rtl;min-height:100vh}
  .header{text-align:center;margin-bottom:32px}
  h1{font-family:'Secular One',serif;color:${gold};font-size:2.4rem;margin-bottom:6px}
  .sub{color:${subText};font-size:1rem;margin-bottom:4px}
  .syn{color:${gold};font-size:1.1rem;font-weight:700}
  .divider{height:2px;background:linear-gradient(90deg,transparent,${gold},transparent);margin:24px auto;width:55%;border:none}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:900px;margin:0 auto}
  .card{background:${cardBg};border:1px solid ${border};border-radius:14px;padding:24px}
  .card-title{font-family:'Secular One',serif;color:${gold};font-size:1.35rem;text-align:center;padding-bottom:14px;border-bottom:1px solid ${border};margin-bottom:16px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.06)}
  .row:last-child{border-bottom:none}
  .label{font-size:1rem;color:${text}}
  .time{color:${gold};font-weight:700;font-size:1.5rem;direction:ltr}
  .note{text-align:center;margin-top:24px;color:${subText};font-style:italic}
  .footer{text-align:center;margin-top:36px;color:${subText};font-size:0.82rem}
  @media print{body{padding:20px}@page{margin:1.5cm}}
</style></head>
<body>
  <div class="header">
    <h1>זמני תפילות ושיעורים</h1>
    <div class="sub">ע"ש אליהו אוזן ז"ל</div>
    <div class="syn">בית כנסת אדרת אליהו</div>
  </div>
  <hr class="divider"/>
  <div class="grid">${sectionHtml}</div>
  ${note ? `<div class="note">${note}</div>` : ''}
  <div class="footer">הודפס מאתר בית כנסת אדרת אליהו</div>
  <script>window.onload=()=>{window.print()}</script>
</body></html>`;
}

function openPdf(sections, note, mode) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(buildPrintHtml(sections, note, mode === 'dark'));
  win.document.close();
}

/* ── Section card ── */
function SectionCard({ section, editMode, onChange, onDelete }) {
  const updateTitle = v => onChange({ ...section, title: v });

  const updateRow = (key, field, val) => onChange({
    ...section,
    rows: section.rows.map(r => r.key === key ? { ...r, [field]: val } : r),
  });

  const deleteRow = key => onChange({
    ...section,
    rows: section.rows.filter(r => r.key !== key),
  });

  const addRow = () => onChange({
    ...section,
    rows: [...section.rows, { key: uid(), label: 'תפילה חדשה', time: '' }],
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>

        {editMode ? (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, pb: 1.5, borderBottom: '1px solid rgba(201,168,76,0.2)', alignItems: 'center' }}>
            <TextField
              value={section.title}
              onChange={e => updateTitle(e.target.value)}
              size="small"
              fullWidth
              placeholder="שם הקטגוריה"
              sx={{
                '& input': { fontWeight: 700, fontSize: '1.05rem', color: '#C9A84C' },
                '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(201,168,76,0.4)' },
              }}
            />
            <Tooltip title="מחק קטגוריה">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.light', flexShrink: 0 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="h5" sx={{ color: 'primary.main', textAlign: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {section.title}
          </Typography>
        )}

        {section.rows.map(row => (
          <Box
            key={row.key}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              py: 1.25,
              borderBottom: '1px solid rgba(201,168,76,0.06)',
              '&:last-of-type': { borderBottom: editMode ? '1px solid rgba(201,168,76,0.06)' : 'none' },
            }}
          >
            {editMode ? (
              <>
                <TextField
                  value={row.label}
                  onChange={e => updateRow(row.key, 'label', e.target.value)}
                  size="small"
                  placeholder="שם התפילה"
                  sx={{ flex: 1, minWidth: 90 }}
                />
                <TextField
                  type="time"
                  value={row.time}
                  onChange={e => updateRow(row.key, 'time', e.target.value)}
                  size="small"
                  inputProps={{ dir: 'ltr' }}
                  sx={{
                    width: 120,
                    '& input': { color: '#C9A84C', fontWeight: 700, textAlign: 'center' },
                    '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(201,168,76,0.4)' },
                  }}
                />
                <Tooltip title="מחק שורה">
                  <IconButton size="small" onClick={() => deleteRow(row.key)} sx={{ color: 'error.light', p: 0.4, flexShrink: 0 }}>
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography sx={{ color: 'text.primary', fontSize: '1.02rem', flex: 1 }}>{row.label}</Typography>
                <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.5rem', direction: 'ltr' }}>
                  {row.time || '--:--'}
                </Typography>
              </>
            )}
          </Box>
        ))}

        {editMode && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addRow}
            sx={{ mt: 1.5, color: 'primary.main', fontSize: '0.82rem' }}
          >
            הוסף שורה
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Main page ── */
export default function Zmanim() {
  const { isAdmin } = useAuth();
  const [sections, setSections]       = useState(DEFAULT_SECTIONS);
  const [note, setNote]               = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [anchor, setAnchor]           = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [draft, setDraft]             = useState([]);
  const [draftNote, setDraftNote]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    getDoc(doc(db, 'zmanim', 'current')).then(s => {
      if (!s.exists()) return;
      const d = s.data();
      if (Array.isArray(d.sections)) {
        setSections(d.sections);
        setNote(d.note || '');
        setLastUpdated(d.last_updated);
      } else {
        // Migrate old flat-key format: keep defaults, read times by key match
        const migrated = DEFAULT_SECTIONS.map(sec => ({
          ...sec,
          rows: sec.rows.map(r => {
            const legacyKeys = {
              r1: 'shacharit_weekday', r2: 'mincha_summer',
              r3: 'mincha_winter',     r4: 'arvit',
              r5: 'kabbalat_shabbat',  r6: 'shacharit_shabbat',
            };
            const lk = legacyKeys[r.key];
            return lk && d[lk] ? { ...r, time: d[lk] } : r;
          }),
        }));
        setSections(migrated);
        setNote(d.note || '');
        setLastUpdated(d.last_updated);
      }
    }).catch(() => {});
  }, []);

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(sections)));
    setDraftNote(note);
    setEditMode(true);
  };
  const cancel = () => setEditMode(false);

  const updateSection = (id, updated) =>
    setDraft(prev => prev.map(s => s.id === id ? updated : s));
  const deleteSection = id =>
    setDraft(prev => prev.filter(s => s.id !== id));
  const addSection = () =>
    setDraft(prev => [
      ...prev,
      { id: uid(), title: 'קטגוריה חדשה', rows: [{ key: uid(), label: 'תפילה', time: '' }] },
    ]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'zmanim', 'current'), {
        sections: draft,
        note: draftNote,
        last_updated: serverTimestamp(),
      });
      setSections(draft);
      setNote(draftNote);
      setEditMode(false);
      setToast({ open: true, msg: 'זמני התפילות עודכנו בהצלחה', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'שגיאה בשמירה — נסו שוב', sev: 'error' });
    }
    setSaving(false);
  };

  const displaySections = editMode ? draft : sections;

  return (
    <Box>
      <PageHero title="זמני תפילות ושיעורים" subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="md">
          <GoldDivider />

          {isAdmin && editMode && (
            <Box sx={{ mt: 2, mb: 2, p: 1.5, bgcolor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2, textAlign: 'center' }}>
              <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.9rem' }}>
                מצב עריכה — ערכו קטגוריות, שורות וזמנים, ולחצו שמור
              </Typography>
            </Box>
          )}

          <Grid container spacing={3} mt={1}>
            {displaySections.map(sec => (
              <Grid item xs={12} sm={6} key={sec.id}>
                <SectionCard
                  section={sec}
                  editMode={editMode}
                  onChange={updated => updateSection(sec.id, updated)}
                  onDelete={() => deleteSection(sec.id)}
                />
              </Grid>
            ))}
          </Grid>

          {isAdmin && editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSection}
                sx={{ borderColor: 'rgba(201,168,76,0.4)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(201,168,76,0.06)' } }}
              >
                הוסף קטגוריה
              </Button>
            </Box>
          )}

          {isAdmin && editMode ? (
            <Box sx={{ mt: 3 }}>
              <TextField
                label="הערה כללית (תוצג מתחת לזמנים)"
                value={draftNote}
                onChange={e => setDraftNote(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder='לדוגמה: "זמני החורף בתוקף מא׳ מרחשוון"'
              />
            </Box>
          ) : note ? (
            <Card sx={{ mt: 3, p: 2.5, textAlign: 'center', bgcolor: 'rgba(201,168,76,0.06)', borderColor: 'primary.main' }}>
              <Typography color="text.secondary">{note}</Typography>
            </Card>
          ) : null}

          {lastUpdated && !editMode && (
            <Typography textAlign="center" variant="caption" color="text.secondary" display="block" mt={2}>
              עודכן: {lastUpdated?.toDate?.().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}

          {/* Admin toolbar */}
          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={save}
                    disabled={saving}
                    startIcon={saving ? null : <SaveIcon />}
                    sx={{ px: 4, background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)', color: '#0D1B2A', fontWeight: 700 }}
                  >
                    {saving ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'שמור זמנים'}
                  </Button>
                  <Button variant="outlined" size="large" onClick={cancel} startIcon={<CancelIcon />} color="inherit">
                    ביטול
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={startEdit}
                  startIcon={<EditIcon />}
                  sx={{ px: 4, borderColor: 'primary.main', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'rgba(201,168,76,0.08)' } }}
                >
                  ערוך זמנים
                </Button>
              )}
            </Box>
          )}

          {!editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: isAdmin ? 2 : 4 }}>
              <Button
                variant={isAdmin ? 'text' : 'contained'}
                size={isAdmin ? 'medium' : 'large'}
                startIcon={<PictureAsPdfIcon />}
                onClick={e => setAnchor(e.currentTarget)}
                sx={isAdmin ? { color: 'text.secondary', fontSize: '0.85rem' } : {
                  px: 5, py: 1.4, fontSize: '1rem',
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
                  color: '#0D1B2A', fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
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
                <MenuItem onClick={() => { setAnchor(null); openPdf(sections, note, 'light'); }} sx={{ gap: 1.5, py: 1.5 }}>
                  <WbSunnyIcon sx={{ color: '#C9A84C' }} />
                  <Box>
                    <Typography fontWeight={700}>מצב בהיר</Typography>
                    <Typography variant="caption" color="text.secondary">רקע לבן — אידיאלי להדפסה</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => { setAnchor(null); openPdf(sections, note, 'dark'); }} sx={{ gap: 1.5, py: 1.5 }}>
                  <DarkModeIcon sx={{ color: '#C9A84C' }} />
                  <Box>
                    <Typography fontWeight={700}>מצב כהה</Typography>
                    <Typography variant="caption" color="text.secondary">רקע כהה — לשמירה דיגיטלית</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Container>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
