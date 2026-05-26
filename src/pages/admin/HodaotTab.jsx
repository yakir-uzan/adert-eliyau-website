import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  doc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { fmtDate } from '../../utils/formatters';
import { readLocalHodaot, saveLocalHodaot } from '../../utils/localTenantAccess';
import { getSiteTypeConfig } from '../../config/siteTypes';
import ConfirmActionDialog from '../../components/ConfirmActionDialog';
import css from './HodaotTab.module.css';

export default function HodaotTab({ config, onToast, slug, localMode }) {
  const pageCopy = getSiteTypeConfig(config.siteType).pages.announcements;
  const [list, setList]       = useState([]);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [pinned, setPinned]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    if (localMode) {
      const items = readLocalHodaot(slug)
        .filter(item => item.active !== false)
        .sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return Number(b.pinned) - Number(a.pinned);
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
      setList(items);
      return;
    }

    try {
      const q = query(collection(db, 'hodaot'), where('active', '==', true), where('tenantId', '==', slug), orderBy('date', 'desc'));
      const s = await getDocs(q);
      setList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      onToast('שגיאה בטעינת ההודעות', 'error');
    }
  };
  useEffect(() => { load(); }, [slug, localMode]);

  const add = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      if (localMode) {
        const next = [
          {
            id: `local-${Date.now()}`,
            title,
            body,
            pinned,
            active: true,
            date: new Date().toISOString(),
            tenantId: slug,
          },
          ...readLocalHodaot(slug),
        ];
        saveLocalHodaot(slug, next);
        setTitle(''); setBody(''); setPinned(false);
        onToast(`${pageCopy.title} עודכנו`);
        load();
        setSaving(false);
        return;
      }

      await addDoc(collection(db, 'hodaot'), { title, body, pinned, active: true, date: serverTimestamp(), tenantId: slug });
      setTitle(''); setBody(''); setPinned(false);
      onToast(`${pageCopy.title} עודכנו`);
      load();
    } catch { onToast('שגיאה', 'error'); }
    setSaving(false);
  };

  const del = async id => {
    try {
      if (localMode) {
        saveLocalHodaot(slug, readLocalHodaot(slug).map(item => item.id === id ? { ...item, active: false } : item));
        onToast('נמחקה');
        load();
        setDeleteId(null);
        return;
      }
      await updateDoc(doc(db, 'hodaot', id), { active: false }); onToast('נמחקה'); load(); setDeleteId(null);
    }
    catch { onToast('שגיאה', 'error'); setDeleteId(null); }
  };

  const pin = async (id, v) => {
    try {
      if (localMode) {
        saveLocalHodaot(slug, readLocalHodaot(slug).map(item => item.id === id ? { ...item, pinned: v } : item));
        load();
        return;
      }
      await updateDoc(doc(db, 'hodaot', id), { pinned: v }); load();
    }
    catch { onToast('שגיאה', 'error'); }
  };

  const saveEdit = async () => {
    if (!editItem?.title?.trim() || !editItem?.body?.trim()) return;
    try {
      if (localMode) {
        saveLocalHodaot(slug, readLocalHodaot(slug).map(item => item.id === editItem.id ? { ...item, title: editItem.title, body: editItem.body, pinned: editItem.pinned } : item));
        onToast(`${pageCopy.title} עודכנו`);
        setEditItem(null);
        load();
        return;
      }
      await updateDoc(doc(db, 'hodaot', editItem.id), { title: editItem.title, body: editItem.body, pinned: editItem.pinned });
      onToast(`${pageCopy.title} עודכנו`);
      setEditItem(null);
      load();
    } catch { onToast('שגיאה', 'error'); }
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>{pageCopy.addTitle}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="כותרת *" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
          <TextField label="תוכן ההודעה *" value={body} onChange={e => setBody(e.target.value)} multiline rows={4} fullWidth />
          <FormControlLabel
            control={<Checkbox checked={pinned} onChange={e => setPinned(e.target.checked)} sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PushPinIcon sx={{ fontSize: '1rem', color: 'primary.main' }} /><span>{pageCopy.pinnedLabel}</span></Box>}
          />
          <Button variant="contained" onClick={add} disabled={saving} sx={{ alignSelf: 'flex-start', px: 3 }}>
            {saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : `+ ${pageCopy.publishLabel}`}
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>{pageCopy.activeTitle}</Typography>
      {list.length === 0 && <Typography color="text.secondary">{pageCopy.emptyText}</Typography>}
      {list.map(h => (
        <Card key={h.id} sx={{ mb: 1.5, borderColor: h.pinned ? 'primary.main' : undefined }}>
          <CardContent sx={{ py: '12px !important' }}>
            <div className={css.cardRow}>
              <div className={css.cardBody}>
                {h.pinned && <Chip size="small" icon={<PushPinIcon />} label="מוצמד" className={css.pinnedChip} sx={{ color: 'primary.main' }} />}
                <Typography fontWeight={700} color="secondary.main">{h.title}</Typography>
                <Typography variant="caption" color="text.secondary">{fmtDate(h.date)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {(h.body || '').substring(0, 80)}{h.body?.length > 80 ? '…' : ''}
                </Typography>
              </div>
              <div className={css.cardActions}>
                <IconButton size="small" onClick={() => setEditItem({ id: h.id, title: h.title, body: h.body, pinned: h.pinned || false })} sx={{ color: 'primary.main' }} title="עריכה"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => pin(h.id, !h.pinned)} sx={{ color: h.pinned ? 'primary.main' : 'text.secondary' }} title={h.pinned ? 'הסר הצמדה' : 'הצמד'}><PushPinIcon fontSize="small" /></IconButton>
                <IconButton aria-label="מחיקת הודעה" size="small" onClick={() => setDeleteId(h.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth
        PaperProps={{ className: css.editDialog }}>
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
      <ConfirmActionDialog
        open={!!deleteId}
        title="מחיקת הודעה"
        message="הפעולה תמחק את ההודעה מהאתר. להמשיך?"
        confirmLabel="מחק"
        onClose={() => setDeleteId(null)}
        onConfirm={() => del(deleteId)}
      />
    </Box>
  );
}
