import { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '../firebase';
import { signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  doc, getDoc, setDoc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// אימייל המנהל — רק כתובת זו תקבל גישה לממשק הניהול
const ADMIN_EMAIL = 'yakiruzangreen@gmail.com';

const fmtMoney = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate  = ts => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('he-IL'); };

const ZMANIM_FIELDS = [
  { key: 'shacharit_weekday', label: 'שחרית (חול)' },
  { key: 'shacharit_shabbat', label: 'שחרית (שבת)' },
  { key: 'mincha_summer',     label: 'מנחה (קיץ)' },
  { key: 'mincha_winter',     label: 'מנחה (חורף)' },
  { key: 'arvit',             label: 'ערבית' },
  { key: 'kabbalat_shabbat',  label: 'קבלת שבת' },
];

function TabPanel({ value, index, children }) {
  return value === index ? <Box pt={3}>{children}</Box> : null;
}

// ── ZMANIM TAB ──
function ZmanimTab({ onToast }) {
  const [times, setTimes]   = useState({});
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'zmanim', 'current')).then(s => {
      if (s.exists()) { const d = s.data(); setTimes(d); setNote(d.note || ''); }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'zmanim', 'current'), { ...times, note, last_updated: serverTimestamp() }, { merge: true });
      onToast('זמני התפילות עודכנו בהצלחה');
    } catch { onToast('שגיאה בשמירה', 'error'); }
    setSaving(false);
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>ימי חול ושבת</Typography>
        <Grid container spacing={2}>
          {ZMANIM_FIELDS.map(f => (
            <Grid item xs={12} sm={6} key={f.key}>
              <TextField
                label={f.label}
                type="time"
                value={times[f.key] || ''}
                onChange={e => setTimes(t => ({ ...t, [f.key]: e.target.value }))}
                fullWidth
                inputProps={{ dir: 'ltr', style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 } }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <TextField label="הערה כללית (אופציונלי)" value={note} onChange={e => setNote(e.target.value)} fullWidth multiline rows={2} placeholder='לדוגמה: "זמני החורף בתוקף מא׳ מרחשוון"' />
          </Grid>
        </Grid>
        <Box mt={2.5}>
          <Button variant="contained" size="large" onClick={save} disabled={saving} startIcon={saving ? null : <SaveIcon />} sx={{ px: 5 }}>
            {saving ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'שמור זמנים'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

// ── HODAOT TAB ──
function HodaotTab({ onToast }) {
  const [list, setList]       = useState([]);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [pinned, setPinned]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [editItem, setEditItem] = useState(null); // { id, title, body, pinned }

  const load = async () => {
    try {
      const q = query(collection(db, 'hodaot'), where('active', '==', true), orderBy('date', 'desc'));
      const s = await getDocs(q);
      setList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'hodaot'), { title, body, pinned, active: true, date: serverTimestamp() });
      setTitle(''); setBody(''); setPinned(false);
      onToast('ההודעה נוספה');
      load();
    } catch { onToast('שגיאה', 'error'); }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('למחוק את ההודעה?')) return;
    try { await updateDoc(doc(db, 'hodaot', id), { active: false }); onToast('נמחקה'); load(); }
    catch { onToast('שגיאה', 'error'); }
  };

  const pin = async (id, v) => {
    try { await updateDoc(doc(db, 'hodaot', id), { pinned: v }); load(); }
    catch { onToast('שגיאה', 'error'); }
  };

  const saveEdit = async () => {
    if (!editItem?.title?.trim() || !editItem?.body?.trim()) return;
    try {
      await updateDoc(doc(db, 'hodaot', editItem.id), { title: editItem.title, body: editItem.body, pinned: editItem.pinned });
      onToast('ההודעה עודכנה');
      setEditItem(null);
      load();
    } catch { onToast('שגיאה', 'error'); }
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>הוסף הודעה חדשה</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="כותרת *" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
          <TextField label="תוכן ההודעה *" value={body} onChange={e => setBody(e.target.value)} multiline rows={4} fullWidth />
          <FormControlLabel
            control={<Checkbox checked={pinned} onChange={e => setPinned(e.target.checked)} sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PushPinIcon sx={{ fontSize: '1rem', color: 'primary.main' }} /><span>הצמד הודעה לראש הרשימה</span></Box>}
          />
          <Button variant="contained" onClick={add} disabled={saving} sx={{ alignSelf: 'flex-start', px: 3 }}>
            {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : '+ פרסם הודעה'}
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>הודעות פעילות</Typography>
      {list.length === 0 && <Typography color="text.secondary">אין הודעות</Typography>}
      {list.map(h => (
        <Card key={h.id} sx={{ mb: 1.5, borderColor: h.pinned ? 'primary.main' : undefined }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                {h.pinned && <Chip size="small" icon={<PushPinIcon />} label="מוצמד" sx={{ mb: 0.75, bgcolor: 'rgba(201,168,76,0.15)', color: 'primary.main' }} />}
                <Typography fontWeight={700} color="secondary.main">{h.title}</Typography>
                <Typography variant="caption" color="text.secondary">{fmtDate(h.date)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {(h.body || '').substring(0, 80)}{h.body?.length > 80 ? '…' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton size="small" onClick={() => setEditItem({ id: h.id, title: h.title, body: h.body, pinned: h.pinned || false })} sx={{ color: 'primary.main' }} title="עריכה">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => pin(h.id, !h.pinned)} sx={{ color: h.pinned ? 'primary.main' : 'text.secondary' }} title={h.pinned ? 'הסר הצמדה' : 'הצמד'}>
                  <PushPinIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => del(h.id)} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A2940', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          עריכת הודעה
          <IconButton onClick={() => setEditItem(null)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="כותרת" value={editItem?.title || ''} onChange={e => setEditItem(x => ({ ...x, title: e.target.value }))} fullWidth />
          <TextField label="תוכן" value={editItem?.body || ''} onChange={e => setEditItem(x => ({ ...x, body: e.target.value }))} multiline rows={5} fullWidth />
          <FormControlLabel
            control={<Checkbox checked={editItem?.pinned || false} onChange={e => setEditItem(x => ({ ...x, pinned: e.target.checked }))} sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PushPinIcon sx={{ fontSize: '1rem', color: 'primary.main' }} /><span>מוצמד</span></Box>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditItem(null)} color="inherit">ביטול</Button>
          <Button variant="contained" onClick={saveEdit} startIcon={<SaveIcon />}>שמור שינויים</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── GALLERY TAB ──
function GaleriaTab({ onToast }) {
  const [images, setImages]     = useState([]);
  const [caption, setCaption]   = useState('');
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const load = async () => {
    try {
      const q = query(collection(db, 'gallery'), where('active', '==', true), orderBy('createdAt', 'asc'));
      const s = await getDocs(q);
      setImages(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) { onToast('בחרו קובץ תחילה', 'error'); return; }
    setUploading(true);
    setProgress(10);
    try {
      const filename = `gallery/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      setProgress(40);
      await uploadBytes(storageRef, file);
      setProgress(70);
      const url = await getDownloadURL(storageRef);
      setProgress(90);
      await addDoc(collection(db, 'gallery'), {
        src: url,
        storagePath: filename,
        caption: caption || file.name,
        active: true,
        createdAt: serverTimestamp(),
      });
      setProgress(100);
      onToast('התמונה הועלתה בהצלחה');
      setFile(null); setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      onToast('שגיאה בהעלאה — וודאו שה-Firebase מוגדר', 'error');
    }
    setUploading(false);
    setProgress(0);
  };

  const remove = async img => {
    if (!confirm(`למחוק את "${img.caption}"?`)) return;
    try {
      await updateDoc(doc(db, 'gallery', img.id), { active: false });
      if (img.storagePath) {
        try { await deleteObject(ref(storage, img.storagePath)); } catch {}
      }
      onToast('התמונה נמחקה');
      load();
    } catch { onToast('שגיאה במחיקה', 'error'); }
  };

  return (
    <Box>
      {/* Upload card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>העלאת תמונה חדשה</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{
              border: '2px dashed rgba(201,168,76,0.4)',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(201,168,76,0.05)' },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', opacity: 0.7, mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {file ? file.name : 'לחצו לבחירת קובץ תמונה (JPG, PNG, WEBP)'}
            </Typography>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0] || null)}
            />
          </Box>
          <TextField label="כיתוב / תיאור התמונה" value={caption} onChange={e => setCaption(e.target.value)} fullWidth placeholder='לדוגמה: "ארון הקודש"' />
          {uploading && <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />}
          <Button
            variant="contained"
            onClick={upload}
            disabled={uploading || !file}
            startIcon={uploading ? null : <CloudUploadIcon />}
            sx={{ alignSelf: 'flex-start', px: 4 }}
          >
            {uploading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'העלה תמונה'}
          </Button>
        </Box>
      </Card>

      {/* Gallery grid */}
      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>תמונות הגלריה</Typography>
      {images.length === 0 && (
        <Typography color="text.secondary">
          אין תמונות עדיין — העלו תמונות ראשונות כדי שיופיעו בגלריה הציבורית
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {images.map(img => (
          <Box key={img.id} sx={{ position: 'relative', aspectRatio: '1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Box component="img" src={img.src} alt={img.caption} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 1,
            }}>
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, lineHeight: 1.3 }}>{img.caption}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => remove(img)}
              sx={{
                position: 'absolute', top: 6, left: 6,
                bgcolor: 'rgba(0,0,0,0.65)', color: 'error.main',
                '&:hover': { bgcolor: 'rgba(200,30,30,0.85)', color: '#fff' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── CHARGES TAB ──
function ChargesTab({ onToast }) {
  const [users, setUsers]     = useState([]);
  const [charges, setCharges] = useState([]);
  const [uid, setUid]         = useState('');
  const [type, setType]       = useState('');
  const [desc, setDesc]       = useState('');
  const [amount, setAmount]   = useState('');
  const [date, setDate]       = useState('');
  const [saving, setSaving]   = useState(false);

  const loadUsers   = async () => { try { const s = await getDocs(collection(db, 'users')); setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() }))); } catch {} };
  const loadCharges = async () => {
    try {
      const q = query(collection(db, 'cheshbonot'), where('paid', '==', false), orderBy('date', 'desc'));
      const s = await getDocs(q);
      setCharges(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };
  useEffect(() => { loadUsers(); loadCharges(); }, []);

  const byUid = {};
  charges.forEach(c => {
    if (!byUid[c.uid]) byUid[c.uid] = { charges: [], total: 0 };
    byUid[c.uid].charges.push(c);
    byUid[c.uid].total += c.amount || 0;
  });

  const addCharge = async () => {
    if (!uid || !type || !amount || isNaN(parseFloat(amount))) { onToast('נא למלא את כל השדות', 'error'); return; }
    setSaving(true);
    try {
      const d = date ? Timestamp.fromDate(new Date(date)) : serverTimestamp();
      await addDoc(collection(db, 'cheshbonot'), { uid, type, description: desc, amount: parseFloat(amount), date: d, paid: false });
      setUid(''); setType(''); setDesc(''); setAmount(''); setDate('');
      onToast('החיוב נוסף');
      loadCharges();
    } catch { onToast('שגיאה', 'error'); }
    setSaving(false);
  };

  const markPaid = async id => {
    if (!confirm('לסמן כשולם?')) return;
    try {
      await updateDoc(doc(db, 'cheshbonot', id), { paid: true, paidAt: serverTimestamp() });
      onToast('סומן כשולם');
      loadCharges();
    } catch { onToast('שגיאה', 'error'); }
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>הוסף חיוב חדש</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>מתפלל *</InputLabel>
              <Select value={uid} onChange={e => setUid(e.target.value)} label="מתפלל *">
                <MenuItem value="">-- בחר --</MenuItem>
                {users.map(u => <MenuItem key={u.uid} value={u.uid}>{u.displayName || u.email}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>סוג *</InputLabel>
              <Select value={type} onChange={e => setType(e.target.value)} label="סוג *">
                <MenuItem value="">-- בחר --</MenuItem>
                <MenuItem value="aliya">עלייה לתורה</MenuItem>
                <MenuItem value="neder">נדר / תרומה</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="תיאור" value={desc} onChange={e => setDesc(e.target.value)} fullWidth placeholder='לדוגמה: "ראשון, שבת פרשת בהר"' />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label="סכום (₪) *" value={amount} onChange={e => setAmount(e.target.value)} type="number" fullWidth inputProps={{ dir: 'ltr', min: 1 }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label="תאריך" value={date} onChange={e => setDate(e.target.value)} type="date" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ dir: 'ltr' }} />
          </Grid>
        </Grid>
        <Box mt={2.5}>
          <Button variant="contained" onClick={addCharge} disabled={saving} sx={{ px: 3 }}>
            {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : '+ הוסף חיוב'}
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>חיובים פתוחים לפי מתפלל</Typography>
      {Object.entries(byUid).length === 0 && <Typography color="text.secondary">אין חיובים פתוחים</Typography>}
      {Object.entries(byUid).map(([u, info]) => {
        const usr = users.find(x => x.uid === u);
        return (
          <Card key={u} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1.5, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                <Typography fontWeight={700} color="secondary.main">{usr?.displayName || usr?.email || u}</Typography>
                <Chip label={`סה״כ: ${fmtMoney(info.total)}`} sx={{ bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171', fontWeight: 700 }} />
              </Box>
              {info.charges.map(c => (
                <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: '1px solid rgba(201,168,76,0.05)', flexWrap: 'wrap', '&:last-child': { borderBottom: 'none' } }}>
                  <Chip size="small" label={c.type === 'aliya' ? 'עלייה' : 'נדר'} sx={{ bgcolor: c.type === 'aliya' ? 'rgba(201,168,76,0.15)' : 'rgba(139,26,26,0.2)', color: c.type === 'aliya' ? 'primary.main' : '#f87171' }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{c.description}</Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>{fmtMoney(c.amount)}</Typography>
                  <Button size="small" startIcon={<CheckCircleIcon />} onClick={() => markPaid(c.id)} sx={{ color: 'success.main', borderColor: 'success.main', border: '1px solid', fontSize: '0.78rem' }}>שולם</Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

// ── MAIN ADMIN ──
export default function Admin() {
  const [authState, setAuthState] = useState('loading');
  const [adminUser, setAdminUser] = useState(null);
  const [loginErr, setLoginErr]   = useState('');
  const [tab, setTab]             = useState(0);
  const [toast, setToast]         = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => onAuthStateChanged(auth, u => {
    setAdminUser(u);
    if (!u) setAuthState('guest');
    else if (u.email === ADMIN_EMAIL) setAuthState('admin');
    else setAuthState('unauthorized');
  }), []);

  const login = async () => {
    setLoginErr('');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setLoginErr('שגיאת כניסה — נסו שוב');
    }
  };

  const onToast = (msg, sev = 'success') => setToast({ open: true, msg, sev });

  if (authState === 'loading') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );

  if (authState === 'unauthorized') return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#080f18' }}>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: '3rem', color: 'error.main', mb: 1 }} />
        <Typography variant="h5" gutterBottom color="error">אין הרשאת גישה</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          החשבון <strong>{adminUser?.email}</strong> אינו מורשה לגשת לממשק הניהול
        </Typography>
        <Button variant="outlined" onClick={() => signOut(auth)}>התנתק וחזור</Button>
      </Card>
    </Box>
  );

  if (authState === 'guest') return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#080f18' }}>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: '3rem', color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" gutterBottom>כניסה לניהול</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>בית כנסת אדרת אליהו — גבאות</Typography>
        {loginErr && <Alert severity="error" sx={{ mb: 2 }}>{loginErr}</Alert>}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={login}
          sx={{ gap: 1.5, py: 1.4, fontSize: '1rem' }}
        >
          <Box component="img" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" sx={{ width: 22, height: 22 }} />
          כניסה עם Google
        </Button>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#080f18', minHeight: '100vh' }}>
      {/* Top bar */}
      <Box sx={{ bgcolor: '#060d15', borderBottom: '1px solid rgba(201,168,76,0.2)', px: 3, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
          <Typography sx={{ fontFamily: '"Secular One",serif', color: 'primary.main', fontSize: '1.1rem' }}>ממשק ניהול — אדרת אליהו</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary">{adminUser?.email}</Typography>
          <Button size="small" variant="outlined" onClick={() => signOut(auth)} sx={{ fontSize: '0.78rem' }}>יציאה</Button>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: '1px solid rgba(201,168,76,0.2)', mb: 1 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AccessTimeIcon />} iconPosition="start" label="זמני תפילות" />
          <Tab icon={<CampaignIcon />}   iconPosition="start" label="הודעות" />
          <Tab icon={<PhotoLibraryIcon />} iconPosition="start" label="גלריה" />
          <Tab icon={<CreditCardIcon />} iconPosition="start" label="חיובי מתפללים" />
        </Tabs>
        <TabPanel value={tab} index={0}><ZmanimTab   onToast={onToast} /></TabPanel>
        <TabPanel value={tab} index={1}><HodaotTab   onToast={onToast} /></TabPanel>
        <TabPanel value={tab} index={2}><GaleriaTab  onToast={onToast} /></TabPanel>
        <TabPanel value={tab} index={3}><ChargesTab  onToast={onToast} /></TabPanel>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
