import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, where, orderBy, limit, getDocs,
  startAfter, addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PushPinIcon from '@mui/icons-material/PushPin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

function fmt(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FAKE_HODAOT = [
  {
    id: 'f1',
    title: 'שיעור תורה שבועי — פרשת השבוע',
    body: 'מוסר הגמרא בכל יום שישי בשעה 18:30 ברב המקום.\nהשיעור מוקדש לעילוי נשמת ראובן בן יוסף ז"ל.\nכולם מוזמנים — כניסה חופשית.',
    date: { toDate: () => new Date('2025-05-09') },
    pinned: true,
  },
  {
    id: 'f2',
    title: 'קבלת שבת מיוחדת — שבת נחמו',
    body: 'השבת הקרובה תתקיים קבלת שבת מיוחדת בשעה 19:00 עם שירה וניגונים.\nמוזמנים כל בני הקהילה ומשפחותיהם.',
    date: { toDate: () => new Date('2025-05-06') },
    pinned: true,
  },
  {
    id: 'f3',
    title: 'הזדמנות לרכוש ברכה לעילוי נשמה',
    body: 'לרגל יארצייט — ניתן לרכוש ברכה מיוחדת שתיאמר בציבור בתפילת שחרית של שבת.\nלפרטים ולהרשמה — פנו לגבאות.',
    date: { toDate: () => new Date('2025-05-02') },
    pinned: false,
  },
  {
    id: 'f4',
    title: 'שינוי זמן מנחה — קיץ תשפ"ה',
    body: 'החל מראש חודש סיון, תפילת מנחה תתקיים בשעה 19:45.\nערבית כ-20 דקות לאחר מנחה.',
    date: { toDate: () => new Date('2025-04-28') },
    pinned: false,
  },
  {
    id: 'f5',
    title: 'לימוד משניות לעילוי נשמות',
    body: 'בכל בוקר לאחר שחרית — לימוד משניות לעילוי נשמת נפטרי הקהילה.\nמי שמעוניין לציין יום פטירה — פנו לגבאות.',
    date: { toDate: () => new Date('2025-04-20') },
    pinned: false,
  },
  {
    id: 'f6',
    title: 'גביית דמי חבר — תשפ"ה',
    body: 'מתפללים יקרים, מתבקשים לשלם דמי חבר לשנת תשפ"ה.\nניתן לשלם בביט, פייבוקס, או בהעברה בנקאית.\nלפרטים — דף התשלומים באתר.',
    date: { toDate: () => new Date('2025-04-15') },
    pinned: false,
  },
];

function HodaaCard({ h, isAdmin, onEdit, onDelete, onPin }) {
  const isFake = h.id.startsWith('f');
  return (
    <Card
      sx={{
        borderInlineStart: h.pinned ? '3px solid' : '3px solid transparent',
        borderInlineStartColor: h.pinned ? 'primary.main' : 'transparent',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 24px rgba(201,168,76,0.12)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Top row: pin chip + date + admin actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {h.pinned ? (
              <Chip
                label="מוצמד"
                size="small"
                icon={<PushPinIcon sx={{ fontSize: '0.8rem !important' }} />}
                sx={{ bgcolor: 'rgba(201,168,76,0.12)', color: 'primary.main', fontWeight: 600, border: '1px solid rgba(201,168,76,0.25)' }}
              />
            ) : <Box />}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.8rem', color: 'primary.main', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ color: 'primary.main', opacity: 0.8, fontWeight: 600 }}>
              {fmt(h.date)}
            </Typography>
            {isAdmin && !isFake && (
              <>
                <IconButton size="small" onClick={() => onPin(h)} title={h.pinned ? 'הסר הצמדה' : 'הצמד'} sx={{ color: h.pinned ? 'primary.main' : 'text.secondary', p: 0.3, mr: -0.5 }}>
                  <PushPinIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
                <IconButton size="small" onClick={() => onEdit(h)} title="ערוך" sx={{ color: 'primary.main', p: 0.3 }}>
                  <EditIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(h)} title="מחק" sx={{ color: 'error.main', p: 0.3 }}>
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(201,168,76,0.1)', mb: 1.5 }} />

        <Typography
          variant="h6"
          sx={{ fontFamily: '"Secular One", serif', color: 'secondary.main', fontSize: '1.15rem', mb: 1.2, lineHeight: 1.4 }}
        >
          {h.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', color: 'text.primary', fontFamily: '"Assistant", sans-serif', fontSize: '0.97rem' }}
        >
          {h.body}
        </Typography>
      </CardContent>
    </Card>
  );
}

const EMPTY_FORM = { title: '', body: '', pinned: false };

export default function Hodaot() {
  const { isAdmin } = useAuth();
  const [items, setItems]       = useState(FAKE_HODAOT);
  const [fromFirestore, setFromFirestore] = useState(false);
  const [lastDoc, setLastDoc]   = useState(null);
  const [hasMore, setHasMore]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ open: false, msg: '', sev: 'success' });

  async function fetchItems(after = null) {
    setLoading(true);
    const PAGE = 10;
    let q = query(
      collection(db, 'hodaot'),
      where('active', '==', true),
      orderBy('pinned', 'desc'),
      orderBy('date', 'desc'),
      limit(PAGE)
    );
    if (after) q = query(collection(db, 'hodaot'), where('active','==',true), orderBy('pinned','desc'), orderBy('date','desc'), startAfter(after), limit(PAGE));
    try {
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (snap.docs.length > 0 || after) {
        setItems(prev => after ? [...prev, ...docs] : docs);
        setFromFirestore(true);
      }
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE);
    } catch { /* keep fake data */ }
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = h => { setEditTarget(h); setForm({ title: h.title, body: h.body, pinned: h.pinned || false }); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setToast({ open: true, msg: 'כותרת ותוכן הם שדות חובה', sev: 'error' }); return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateDoc(doc(db, 'hodaot', editTarget.id), { title: form.title, body: form.body, pinned: form.pinned });
        setToast({ open: true, msg: 'ההודעה עודכנה', sev: 'success' });
      } else {
        await addDoc(collection(db, 'hodaot'), { title: form.title, body: form.body, pinned: form.pinned, active: true, date: serverTimestamp() });
        setToast({ open: true, msg: 'ההודעה פורסמה', sev: 'success' });
      }
      closeDialog();
      fetchItems();
    } catch { setToast({ open: true, msg: 'שגיאה — נסו שוב', sev: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async h => {
    if (!window.confirm(`למחוק את "${h.title}"?`)) return;
    try {
      await updateDoc(doc(db, 'hodaot', h.id), { active: false });
      setToast({ open: true, msg: 'ההודעה נמחקה', sev: 'success' });
      fetchItems();
    } catch { setToast({ open: true, msg: 'שגיאה במחיקה', sev: 'error' }); }
  };

  const handlePin = async h => {
    try {
      await updateDoc(doc(db, 'hodaot', h.id), { pinned: !h.pinned });
      fetchItems();
    } catch { setToast({ open: true, msg: 'שגיאה', sev: 'error' }); }
  };

  const displayItems = isAdmin && !fromFirestore ? [] : items;

  return (
    <Box>
      <PageHero title="הודעות" subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="sm">
          <GoldDivider />

          {/* Admin add button — visible within page */}
          {isAdmin && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={openAdd}
                sx={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
                  color: '#0D1B2A',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': { boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
                }}
              >
                הוסף הודעה חדשה
              </Button>
            </Box>
          )}

          {/* Admin notice when no Firestore data yet */}
          {isAdmin && !fromFirestore && (
            <Box sx={{ mt: 2, p: 2.5, textAlign: 'center', border: '1px dashed rgba(201,168,76,0.3)', borderRadius: 2 }}>
              <Typography color="text.secondary" fontSize="0.9rem">עדיין לא הוספת הודעות — לחץ על הכפתור למעלה</Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayItems.map(h => (
              <HodaaCard
                key={h.id}
                h={h}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            ))}
          </Box>

          {hasMore && (
            <Box textAlign="center" mt={3}>
              <Button variant="outlined" onClick={() => fetchItems(lastDoc)} disabled={loading}>
                {loading ? 'טוען...' : 'טען עוד הודעות'}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Admin FAB */}
      {isAdmin && (
        <Fab
          onClick={openAdd}
          sx={{
            position: 'fixed', bottom: 28, left: 28,
            background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)',
            color: '#0D1B2A',
            '&:hover': { boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editTarget ? 'ערוך הודעה' : 'הוסף הודעה חדשה'}
          <IconButton onClick={closeDialog} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="כותרת *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label="תוכן ההודעה *"
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            multiline
            rows={5}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.pinned}
                onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PushPinIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Typography>הצמד לראש הרשימה</Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} color="inherit">ביטול</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? null : <SaveIcon />}>
            {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : editTarget ? 'שמור שינויים' : 'פרסם הודעה'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
