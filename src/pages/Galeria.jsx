import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
  const [images, setImages] = useState(IMAGES);
  const [open, setOpen]     = useState(false);
  const [idx, setIdx]       = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), where('active', '==', true), orderBy('createdAt', 'asc'));
    getDocs(q).then(s => {
      if (s.docs.length > 0) setImages(s.docs.map(d => ({ ...d.data() })));
    }).catch(() => {});
  }, []);

  const openLB  = i => { setIdx(i); setOpen(true); };
  const prev    = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next    = () => setIdx(i => (i + 1) % images.length);

  const handleKey = e => {
    if (e.key === 'ArrowLeft')  next();
    if (e.key === 'ArrowRight') prev();
    if (e.key === 'Escape')     setOpen(false);
  };

  return (
    <Box>
      <PageHero title="גלריה" subtitle="תמונות מבית כנסת אדרת אליהו" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, mt: 3 }}>
            {images.map((img, i) => (
              <Box
                key={i}
                onClick={() => openLB(i)}
                sx={{
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid rgba(201,168,76,0.2)',
                  position: 'relative',
                  '&:hover img': { transform: 'scale(1.07)' },
                  '&:hover .overlay': { opacity: 1 },
                }}
              >
                <Box component="img" src={img.src} alt={img.caption} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                <Box className="overlay" sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.8) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'flex-end', p: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>{img.caption}</Typography>
                </Box>
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
          <IconButton onClick={prev} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'primary.main', bgcolor: 'rgba(201,168,76,0.1)', '&:hover': { bgcolor: 'rgba(201,168,76,0.25)' } }}><ChevronRightIcon fontSize="large" /></IconButton>
          <Box component="img" src={images[idx].src} alt={images[idx].caption} sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 1, display: 'block' }} />
          <IconButton onClick={next} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'primary.main', bgcolor: 'rgba(201,168,76,0.1)', '&:hover': { bgcolor: 'rgba(201,168,76,0.25)' } }}><ChevronLeftIcon fontSize="large" /></IconButton>
          <Box sx={{ position: 'absolute', bottom: 12, width: '100%', textAlign: 'center' }}>
            <Typography sx={{ color: 'secondary.main', fontWeight: 700 }}>{images[idx].caption}</Typography>
            <Typography variant="caption" color="text.secondary">{idx + 1} / {images.length}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
