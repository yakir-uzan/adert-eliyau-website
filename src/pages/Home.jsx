import { useState, useEffect, useRef } from 'react';
import { useTenant } from '../config/TenantContext';
import Box from '@mui/material/Box';
import NavDot from './home/NavDot';
import HeroSection from './home/HeroSection';
import AboutSection from './home/AboutSection';
import GallerySection from './home/GallerySection';
import WhatsAppSection from './home/WhatsAppSection';
import { DEFAULT_SITE_TYPE, getSiteTypeConfig } from '../config/siteTypes';
import css from './Home.module.css';

const TOTAL_SECTIONS = 4;
const TRANSITION_MS  = 950;
const DEFAULT_TICKER_ITEMS = [
  { cat: 'לרפואה שלמה', text: 'לרפואת משה בן שרה' },
  { cat: 'לעילוי נשמת', text: 'לעילוי נשמת יעקב בן רחל' },
  { cat: 'להצלחה', text: 'להצלחת כל התורמים והמתפללים' },
];
const DEFAULT_HERO_SLIDES = ['/images/hero/building-render.jpg', '/images/hero/interior-01.png', '/images/hero/interior-02.png'];

export default function Home() {
  const { config, basePath } = useTenant();
  const base = basePath;
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const fullName = config.name?.trim() || '';
  const strippedName = config.siteType === DEFAULT_SITE_TYPE
    ? fullName.replace(/^בית\s+כנסת\s*/u, '').trim()
    : fullName;
  const hasCustomName = !!strippedName;

  const heroSlides     = Array.isArray(config.images?.heroSlides) && config.images.heroSlides.length > 0 ? config.images.heroSlides : DEFAULT_HERO_SLIDES;
  const galleryPreview = Array.isArray(config.images?.galleryPreview) ? config.images.galleryPreview : [];
  const tickerItems    = config.ticker?.length ? config.ticker : (siteTypeConfig.ticker || DEFAULT_TICKER_ITEMS);
  const waLink         = config.whatsapp?.groupLink || '';

  const [slide,   setSlide]   = useState(0);
  const [current, setCurrent] = useState(0);

  const currentRef   = useRef(0);
  const animatingRef = useRef(false);
  const deltaAccRef  = useRef(0);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    const id = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const go = (next) => {
    if (animatingRef.current || next < 0 || next >= TOTAL_SECTIONS) return;
    animatingRef.current = true;
    currentRef.current   = next;
    setCurrent(next);
    setTimeout(() => { animatingRef.current = false; deltaAccRef.current = 0; }, TRANSITION_MS);
  };

  useEffect(() => {
    const onWheel = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (e.target?.closest?.('button, a, input, textarea, select, [role="dialog"], [data-native-scroll]')) return;
      e.preventDefault();
      if (animatingRef.current) return;
      deltaAccRef.current += e.deltaY;
      if (deltaAccRef.current > 60)  { go(currentRef.current + 1); deltaAccRef.current = 0; }
      if (deltaAccRef.current < -60) { go(currentRef.current - 1); deltaAccRef.current = 0; }
    };
    document.addEventListener('wheel', onWheel, { passive: false });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    let ty = 0;
    const onStart = (e) => { ty = e.touches[0].clientY; };
    const onEnd   = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (e.target?.closest?.('button, a, input, textarea, select, [role="dialog"], [data-native-scroll]')) return;
      const d = ty - e.changedTouches[0].clientY;
      if (Math.abs(d) > 45) d > 0 ? go(currentRef.current + 1) : go(currentRef.current - 1);
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend',   onEnd);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (e.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') go(currentRef.current + 1);
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   go(currentRef.current - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.title = config.name || siteTypeConfig.defaultName || 'אתר';
  }, [config.name, siteTypeConfig.defaultName]);

  return (
    <Box className={css.root} sx={{ bgcolor: 'background.default' }}>
      <Box
        className={css.navDots}
        sx={{ left: { xs: 10, md: 24 }, gap: 1.8 }}
      >
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <NavDot key={i} active={i === current} onClick={() => go(i)} />
        ))}
      </Box>

      <Box
        className={css.progressBar}
        sx={{
          bgcolor: 'primary.main',
          width: `${((current) / (TOTAL_SECTIONS - 1)) * 100}%`,
          transition: `width ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        }}
      />

      <Box
        className={css.slider}
        sx={{
          height: `${TOTAL_SECTIONS * 100}vh`,
          transform: `translateY(-${current * 100}vh)`,
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        }}
      >
        <HeroSection
          heroSlides={heroSlides}
          slide={slide}
          config={config}
          siteTypeConfig={siteTypeConfig}
          base={base}
          hasCustomName={hasCustomName}
          strippedName={strippedName}
          tickerItems={tickerItems}
          onGoNext={() => go(1)}
        />
        <AboutSection config={config} base={base} current={current} TRANSITION_MS={TRANSITION_MS} heroSlides={heroSlides} slide={slide} />
        <GallerySection galleryPreview={galleryPreview} base={base} current={current} heroSlides={heroSlides} slide={slide} />
        <WhatsAppSection waLink={waLink} current={current} />
      </Box>
    </Box>
  );
}
