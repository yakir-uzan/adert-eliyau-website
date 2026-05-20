import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  doc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fmtMoney } from '../../utils/formatters';
import css from './ChargesTab.module.css';

export default function ChargesTab({ onToast, slug }) {
  const [users, setUsers]     = useState([]);
  const [charges, setCharges] = useState([]);
  const [uid, setUid]         = useState('');
  const [type, setType]       = useState('');
  const [desc, setDesc]       = useState('');
  const [amount, setAmount]   = useState('');
  const [date, setDate]       = useState('');
  const [saving, setSaving]   = useState(false);

  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('tenantId', '==', slug));
      const s = await getDocs(q);
      setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch {}
  };
  const loadCharges = async () => {
    try {
      const q = query(collection(db, 'cheshbonot'), where('paid', '==', false), where('tenantId', '==', slug), orderBy('date', 'desc'));
      const s = await getDocs(q);
      setCharges(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };
  useEffect(() => { loadUsers(); loadCharges(); }, [slug]);

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
      await addDoc(collection(db, 'cheshbonot'), { uid, type, description: desc, amount: parseFloat(amount), date: d, paid: false, tenantId: slug });
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
              <div className={css.userHeader}>
                <Typography fontWeight={700} color="secondary.main">{usr?.displayName || usr?.email || u}</Typography>
                <Chip label={`סה״כ: ${fmtMoney(info.total)}`} className={css.totalChip} />
              </div>
              {info.charges.map(c => (
                <div key={c.id} className={css.chargeRow}>
                  <Chip size="small" label={c.type === 'aliya' ? 'עלייה' : 'נדר'} className={c.type === 'aliya' ? css.aliyaChip : css.nederChip} sx={{ color: c.type === 'aliya' ? 'primary.main' : '#f87171' }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{c.description}</Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>{fmtMoney(c.amount)}</Typography>
                  <Button size="small" startIcon={<CheckCircleIcon />} onClick={() => markPaid(c.id)} sx={{ color: 'success.main', borderColor: 'success.main', border: '1px solid', fontSize: '0.78rem' }}>שולם</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
