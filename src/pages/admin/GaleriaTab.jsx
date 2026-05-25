import { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  doc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { readFileAsDataUrl } from '../../utils/fileUtils';
import { readLocalGallery, saveLocalGallery } from '../../utils/localTenantAccess';
import ConfirmActionDialog from '../../components/ConfirmActionDialog';
import css from './GaleriaTab.module.css';

export default function GaleriaTab({ onToast, slug, localMode }) {
  const [images, setImages]     = useState([]);
  const [caption, setCaption]   = useState('');
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleteItem, setDeleteItem] = useState(null);
  const fileRef = useRef();

  const load = async () => {
    if (localMode) {
      setImages(readLocalGallery(slug).filter(image => image.active !== false));
      return;
    }

    try {
      const q = query(collection(db, 'gallery'), where('active', '==', true), where('tenantId', '==', slug), orderBy('createdAt', 'asc'));
      const s = await getDocs(q);
      setImages(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      onToast('שגיאה בטעינת הגלריה', 'error');
    }
  };
  useEffect(() => { load(); }, [slug, localMode]);

  const upload = async () => {
    if (!file) { onToast('בחרו קובץ תחילה', 'error'); return; }
    setUploading(true);
    setProgress(10);
    try {
      if (localMode) {
        const src = await readFileAsDataUrl(file);
        const next = [
          ...readLocalGallery(slug),
          {
            id: `local-${Date.now()}`,
            src,
            caption: caption || file.name,
            active: true,
            createdAt: new Date().toISOString(),
            tenantId: slug,
          },
        ];
        setProgress(95);
        saveLocalGallery(slug, next);
        setProgress(100);
        onToast('התמונה הועלתה בהצלחה');
        setFile(null); setCaption('');
        if (fileRef.current) fileRef.current.value = '';
        load();
        setUploading(false);
        setProgress(0);
        return;
      }

      const filename = `gallery/${slug}/${Date.now()}_${file.name}`;
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
        tenantId: slug,
      });
      setProgress(100);
      onToast('התמונה הועלתה בהצלחה');
      setFile(null); setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch {
      onToast('שגיאה בהעלאה — וודאו שה-Firebase מוגדר', 'error');
    }
    setUploading(false);
    setProgress(0);
  };

  const remove = async img => {
    try {
      if (localMode) {
        saveLocalGallery(slug, readLocalGallery(slug).map(item => item.id === img.id ? { ...item, active: false } : item));
        onToast('התמונה נמחקה');
        setDeleteItem(null);
        load();
        return;
      }
      await updateDoc(doc(db, 'gallery', img.id), { active: false });
      if (img.storagePath) {
        try { await deleteObject(ref(storage, img.storagePath)); } catch { onToast('הרשומה נמחקה, אבל מחיקת הקובץ מהאחסון נכשלה', 'warning'); }
      }
      onToast('התמונה נמחקה');
      setDeleteItem(null);
      load();
    } catch { onToast('שגיאה במחיקה', 'error'); setDeleteItem(null); }
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>העלאת תמונה חדשה</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className={css.dropzone} onClick={() => fileRef.current?.click()}>
            <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', opacity: 0.7, mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {file ? file.name : 'לחצו לבחירת קובץ תמונה (JPG, PNG, WEBP)'}
            </Typography>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
          </div>
          <TextField label="כיתוב / תיאור התמונה" value={caption} onChange={e => setCaption(e.target.value)} fullWidth placeholder='לדוגמה: "ארון הקודש"' />
          {uploading && <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />}
          <Button variant="contained" onClick={upload} disabled={uploading || !file} startIcon={uploading ? null : <CloudUploadIcon />} sx={{ alignSelf: 'flex-start', px: 4 }}>
            {uploading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'העלה תמונה'}
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>תמונות הגלריה</Typography>
      {images.length === 0 && <Typography color="text.secondary">אין תמונות עדיין — העלו תמונות ראשונות כדי שיופיעו בגלריה הציבורית</Typography>}
      <div className={css.imageGrid}>
        {images.map(img => (
          <div key={img.id} className={css.imageCard}>
            <img src={img.src} alt={img.caption} />
            <div className={css.imageOverlay}>
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, lineHeight: 1.3 }}>{img.caption}</Typography>
            </div>
            <IconButton aria-label="מחיקת תמונה" size="small" onClick={() => setDeleteItem(img)} className={css.deleteBtn} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>
      <ConfirmActionDialog
        open={!!deleteItem}
        title="מחיקת תמונה"
        message={`הפעולה תמחק את "${deleteItem?.caption || 'התמונה'}" מהגלריה. להמשיך?`}
        confirmLabel="מחק"
        onClose={() => setDeleteItem(null)}
        onConfirm={() => remove(deleteItem)}
      />
    </Box>
  );
}
