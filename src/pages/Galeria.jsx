import { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';

const IMAGES = [
  { src: '/images/gallery/building-render.jpg',       caption: 'חזית בית הכנסת' },
  { src: '/images/gallery/interior-01.png',           caption: 'ארון הקודש' },
  { src: '/images/gallery/interior-02.png',           caption: 'אולם התפילה' },
  { src: '/images/gallery/interior-03.png',           caption: 'ארון הקודש — תקריב' },
  { src: '/images/gallery/interior-04.png',           caption: 'פנים בית הכנסת' },
  { src: '/images/gallery/interior-05.png',           caption: 'העיצוב הפנימי' },
  { src: '/images/gallery/interior-06.png',           caption: 'מנורת הזהב' },
  { src: '/images/gallery/building-construction.jpg', caption: 'שלב הבניה' },
];

export default function Galeria() {
  const { isAdmin } = useAuth();
  const [images, setImages]       = useState(IMAGES);
  const [fromFirestore, setFromFirestore] = useState(false);
  const [open, setOpen]           = useState(false);
  const [idx, setIdx]             = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [caption, setCaption]     = useState('');
  const [file, setFile]           = useState(null);
  const [toast, setToast]         = useState({ open: false, msg: '', sev: 'success' });
  const fileRef = useRef();

  const loadFromFirestore = async () => {
    try {
      const q = query(collection(db, 'gallery'), where('active', '==', true), orderBy('createdAt', 'asc'));
      const s = await getDocs(q);
      if (s.docs.length > 0) {
        setImages(s.docs.map(d => ({ id: d.id, ...d.data() })));
        setFromFirestore(true);
      }
    } catch {}
  };

  useEffect(() => { loadFromFirestore(); }, []);

  const openLB  = i => { setIdx(i); setOpen(true); };
  const prev    = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next    = () => setIdx(i => (i + 1) % images.length);

  const handleKey = e => {
    if (e.key === 'ArrowLeft')  next();
    if (e.key === 'ArrowRight') prev();
    if (e.key === 'Escape')     setOpen(false);
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!caption) setCaption(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file) { fileRef.current?.click(); return; }
    setUploading(true);
    setProgress(10);
    try {
      const filename = `gallery/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      setProgress(40);
      await uploadBytes(storageRef, file);
      setProgress(75);
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
      setToast({ open: true, msg: 'התמונה הועלתה בהצלחה', sev: 'success' });
      setFile(null); setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      loadFromFirestore();
    } catch {
      setToast({ open: true, msg: 'שגיאה בהעלאה — וודאו שה-Storage מוגדר ב-Firebase', sev: 'error' });
    }
    setUploading(false);
    setProgress(0);
  };

  const handleDelete = async img => {
    if (!img.id) { setToast({ open: true, msg: 'תמונה זו היא תמונת ברירת מחדל — לא ניתן למחוק', sev: 'warning' }); return; }
    if (!window.confirm(`למחוק את "${img.caption}"?`)) return;
    try {
      await updateDoc(doc(db, 'gallery', img.id), { active: false });
      if (img.storagePath) {
        try { await deleteObject(ref(storage, img.storagePath)); } catch {}
      }
      setToast({ open: true, msg: 'התמונה נמחקה', sev: 'success' });
      if (open) setOpen(false);
      loadFromFirestore();
    } catch { setToast({ open: true, msg: 'שגיאה במחיקה', sev: 'error' }); }
  };

  return (
    <Box>
      <PageHero title="גלריה" subtitle="תמונות מבית כנסת אדרת אליהו" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />

          {/* Admin upload toolbar */}
          {isAdmin && (
            <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 120 }}>
                    {file.name}
                  </Typography>
                  <input
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="כיתוב התמונה"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      borderRadius: 6,
                      color: '#F5F0E8',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      width: 180,
                      fontFamily: '"Assistant", sans-serif',
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)', color: '#0D1B2A', fontWeight: 700 }}
                  >
                    {uploading ? 'מעלה...' : 'העלה'}
                  </Button>
                  <Button variant="text" color="inherit" size="small" onClick={() => { setFile(null); setCaption(''); }}>
                    ביטול
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => fileRef.current?.click()}
                  sx={{ borderColor: 'primary.main', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'rgba(201,168,76,0.08)' } }}
                >
                  העלה תמונה חדשה
                </Button>
              )}
              {!fromFirestore && (
                <Typography variant="caption" color="text.secondary">
                  כרגע מוצגות תמונות ברירת מחדל — תמונות שתעלה יוצגו במקומן
                </Typography>
              )}
            </Box>
          )}

          {/* Upload progress */}
          {uploading && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 2, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
            />
          )}

          {/* Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, mt: isAdmin ? 0 : 3 }}>
            {images.map((img, i) => (
              <Box
                key={img.id || i}
                sx={{
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid rgba(201,168,76,0.2)',
                  position: 'relative',
                  '&:hover img': { transform: 'scale(1.07)' },
                  '&:hover .overlay': { opacity: 1 },
                  '&:hover .del-btn': isAdmin ? { opacity: 1 } : {},
                }}
              >
                <Box
                  component="img"
                  src={img.src}
                  alt={img.caption}
                  onClick={() => openLB(i)}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                />
                <Box
                  className="overlay"
                  onClick={() => openLB(i)}
                  sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.8) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'flex-end', p: 1.5 }}
                >
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>{img.caption}</Typography>
                </Box>
                {isAdmin && (
                  <Tooltip title={img.id ? 'מחק תמונה' : 'תמונת ברירת מחדל'} placement="top">
                    <IconButton
                      className="del-btn"
                      size="small"
                      onClick={e => { e.stopPropagation(); handleDelete(img); }}
                      sx={{
                        position: 'absolute', top: 5, left: 5,
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: img.id ? 'error.main' : 'text.secondary',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { bgcolor: img.id ? 'rgba(200,30,30,0.85)' : 'rgba(60,60,60,0.9)', color: '#fff' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Lightbox */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        onKeyDown={handleKey}
        PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', boxShadow: 'none', m: 1 } }}
        BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.93)' } }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 8, left: 8, color: 'primary.light', zIndex: 10 }}><CloseIcon /></IconButton>
          {isAdmin && images[idx]?.id && (
            <Tooltip title="מחק תמונה זו">
              <IconButton
                onClick={() => handleDelete(images[idx])}
                sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 10, '&:hover': { bgcolor: 'rgba(200,30,30,0.8)', color: '#fff' } }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={prev} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'primary.main', bgcolor: 'rgba(201,168,76,0.1)', '&:hover': { bgcolor: 'rgba(201,168,76,0.25)' } }}>
            <ChevronRightIcon fontSize="large" />
          </IconButton>
          <Box component="img" src={images[idx]?.src} alt={images[idx]?.caption} sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 1, display: 'block' }} />
          <IconButton onClick={next} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'primary.main', bgcolor: 'rgba(201,168,76,0.1)', '&:hover': { bgcolor: 'rgba(201,168,76,0.25)' } }}>
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
          <Box sx={{ position: 'absolute', bottom: 12, width: '100%', textAlign: 'center' }}>
            <Typography sx={{ color: 'secondary.main', fontWeight: 700 }}>{images[idx]?.caption}</Typography>
            <Typography variant="caption" color="text.secondary">{idx + 1} / {images.length}</Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
