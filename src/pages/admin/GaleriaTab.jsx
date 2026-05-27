import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { uploadToImgBB } from '../../utils/imgbbUpload';
import {
  doc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { readFileAsDataUrl } from '../../utils/fileUtils';
import { readLocalGallery, saveLocalGallery } from '../../utils/localTenantAccess';
import ConfirmActionDialog from '../../components/ConfirmActionDialog';
import css from './GaleriaTab.module.css';

export default function GaleriaTab({ onToast, slug, localMode }) {
  const [images, setImages]       = useState([]);
  const [files, setFiles]         = useState([]);   // array of selected files
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ done: 0, total: 0 });
  const [deleteItem, setDeleteItem] = useState(null);
  const [lightbox, setLightbox]     = useState(null); // image object or null
  const fileRef = useRef();

  const load = async () => {
    if (localMode) {
      setImages(readLocalGallery(slug).filter(img => img.active !== false));
      return;
    }
    try {
      const q = query(
        collection(db, 'gallery'),
        where('active', '==', true),
        where('tenantId', '==', slug),
        orderBy('createdAt', 'asc'),
      );
      const s = await getDocs(q);
      setImages(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      onToast('שגיאה בטעינת הגלריה', 'error');
    }
  };
  useEffect(() => { load(); }, [slug, localMode]);

  const handleFileChange = e => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const upload = async () => {
    if (!files.length) { onToast('בחרו קבצים תחילה', 'error'); return; }
    setUploading(true);
    setUploadStatus({ done: 0, total: files.length });

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (localMode) {
          const src = await readFileAsDataUrl(file);
          const localGallery = readLocalGallery(slug);
          saveLocalGallery(slug, [
            ...localGallery,
            { id: `local-${Date.now()}-${i}`, src, caption: file.name, active: true, createdAt: new Date().toISOString(), tenantId: slug },
          ]);
        } else {
          const url = await uploadToImgBB(file);
          await addDoc(collection(db, 'gallery'), {
            src: url,
            caption: file.name.replace(/\.[^.]+$/, ''),
            active: true,
            createdAt: serverTimestamp(),
            tenantId: slug,
          });
        }
        successCount++;
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);
        onToast(`שגיאה בהעלאת "${file.name}"`, 'error');
      }
      setUploadStatus({ done: i + 1, total: files.length });
    }

    if (successCount > 0) {
      onToast(
        files.length === 1
          ? 'התמונה הועלתה בהצלחה'
          : `${successCount} תמונות הועלו בהצלחה`,
      );
    }

    setFiles([]);
    if (fileRef.current) fileRef.current.value = '';
    setUploading(false);
    setUploadStatus({ done: 0, total: 0 });
    load();
  };

  const remove = async img => {
    try {
      if (localMode) {
        saveLocalGallery(slug, readLocalGallery(slug).map(item =>
          item.id === img.id ? { ...item, active: false } : item,
        ));
      } else {
        await updateDoc(doc(db, 'gallery', img.id), { active: false });
      }
      onToast('התמונה נמחקה');
      setDeleteItem(null);
      load();
    } catch {
      onToast('שגיאה במחיקה', 'error');
      setDeleteItem(null);
    }
  };

  const dropzoneLabel = () => {
    if (files.length === 1) return files[0].name;
    if (files.length > 1)  return `${files.length} תמונות נבחרו`;
    return 'לחצו לבחירת תמונות (JPG, PNG, WEBP) — אפשר לבחור כמה בבת אחת';
  };

  const progress = uploadStatus.total
    ? Math.round((uploadStatus.done / uploadStatus.total) * 100)
    : 0;

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>העלאת תמונות</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          <div className={css.dropzone} onClick={() => !uploading && fileRef.current?.click()}>
            <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', opacity: 0.7, mb: 1 }} />
            <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
              {dropzoneLabel()}
            </Typography>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {uploading && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                מעלה תמונה {uploadStatus.done} מתוך {uploadStatus.total}...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={upload}
            disabled={uploading || !files.length}
            startIcon={uploading ? null : <CloudUploadIcon />}
            sx={{ alignSelf: 'flex-start', px: 4 }}
          >
            {uploading
              ? <CircularProgress size={22} sx={{ color: 'inherit' }} />
              : files.length > 1 ? `העלה ${files.length} תמונות` : 'העלה תמונה'}
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>תמונות הגלריה</Typography>
      {images.length === 0 && (
        <Typography color="text.secondary">
          אין תמונות עדיין — העלו תמונות ראשונות כדי שיופיעו בגלריה הציבורית
        </Typography>
      )}
      <div className={css.imageGrid}>
        {images.map(img => (
          <div key={img.id} className={css.imageCard} onClick={() => setLightbox(img)} style={{ cursor: 'zoom-in' }}>
            <img src={img.src} alt={img.caption} />
            <div className={css.imageOverlay}>
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, lineHeight: 1.3 }}>
                {img.caption}
              </Typography>
            </div>
            <IconButton
              aria-label="מחיקת תמונה"
              size="small"
              onClick={e => { e.stopPropagation(); setDeleteItem(img); }}
              className={css.deleteBtn}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            m: 1,
            maxWidth: '95vw',
            maxHeight: '95vh',
          },
        }}
        slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.88)' } } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setLightbox(null)}
            sx={{
              position: 'absolute', top: 8, right: 8, zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={lightbox?.src}
            alt={lightbox?.caption}
            style={{ display: 'block', maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
          />
          {lightbox?.caption && (
            <Typography
              sx={{
                textAlign: 'center', color: '#fff', mt: 1, pb: 0.5,
                fontSize: '0.92rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              {lightbox.caption}
            </Typography>
          )}
        </Box>
      </Dialog>

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
