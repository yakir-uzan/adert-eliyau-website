import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';

const SECTION_ITEMS = [
  { label: 'תבניות', sectionId: 'templates' },
  { label: 'פיצ׳רים', sectionId: 'features' },
  { label: 'איך זה עובד?', sectionId: 'how-it-works' },
  { label: 'מחירים', sectionId: 'pricing' },
  { label: 'שאלות נפוצות', sectionId: 'faq' },
  { label: 'צור קשר', sectionId: 'contact' },
];

const EXTRA_ITEMS = [];

export default function PlatformNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isLanding) return;

    const ids = SECTION_ITEMS.map(s => s.sectionId);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLanding]);

  const scrollToSection = useCallback((sectionId) => {
    const doScroll = () => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const navHeight = document.querySelector('nav')?.offsetHeight || 0;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    };

    if (isLanding) {
      doScroll();
    } else {
      navigate('/');
      setTimeout(doScroll, 150);
    }
  }, [isLanding, navigate]);

  const handleNavClick = (item) => {
    if (item.sectionId) {
      scrollToSection(item.sectionId);
    }
    setDrawerOpen(false);
  };

  const isActive = (item) => {
    if (item.sectionId && isLanding) return activeSection === item.sectionId;
    if (item.to) return location.pathname === item.to;
    return false;
  };

  const allItems = [
    ...SECTION_ITEMS.map(s => ({ ...s, type: 'section' })),
    ...EXTRA_ITEMS.map(s => ({ ...s, type: 'route' })),
  ];

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 1.2, md: 1.5 },
        }}
      >
        <Box
          onClick={() => {
            if (isLanding) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src="/images/genisite-logo.png"
            alt="genisite"
            style={{ height: 80, width: 'auto', display: 'block' }}
          />
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {allItems.map((item) => {
            const active = isActive(item);
            if (item.type === 'route') {
              return (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.to}
                  sx={{
                    color: active ? COLORS.primary : COLORS.textSecondary,
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 500,
                    px: 2, py: 0.6,
                    borderRadius: 2,
                    minWidth: 'auto',
                    transition: 'color 0.2s, background 0.2s',
                    '&:hover': { bgcolor: 'rgba(37,99,235,0.04)', color: COLORS.primary },
                  }}
                >
                  {item.label}
                </Button>
              );
            }
            return (
              <Button
                key={item.label}
                onClick={() => handleNavClick(item)}
                sx={{
                  color: active ? COLORS.primary : COLORS.textSecondary,
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  px: 2, py: 0.6,
                  borderRadius: 2,
                  minWidth: 'auto',
                  transition: 'color 0.2s, background 0.2s',
                  '&:hover': { bgcolor: 'rgba(37,99,235,0.04)', color: COLORS.primary },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={Link}
            to="/login"
            endIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              display: { xs: 'none', md: 'flex' },
              color: COLORS.primary,
              fontWeight: 600,
              fontSize: '0.88rem',
              px: 2.5, py: 0.8,
              borderRadius: 2.5,
              border: `1px solid ${COLORS.border}`,
              '&:hover': { bgcolor: 'rgba(37,99,235,0.04)', borderColor: COLORS.primary },
            }}
          >
            התחברות
          </Button>

          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, color: COLORS.text }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: COLORS.bg, direction: 'rtl' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/images/genisite-logo.png" alt="genisite" style={{ height: 28, width: 'auto' }} />
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {allItems.map((item) => {
            const active = isActive(item);
            if (item.type === 'route') {
              return (
                <ListItemButton
                  key={item.label}
                  component={Link}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  selected={active}
                  sx={{ '&.Mui-selected': { bgcolor: 'rgba(37,99,235,0.06)', color: COLORS.primary } }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            }
            return (
              <ListItemButton
                key={item.label}
                onClick={() => handleNavClick(item)}
                selected={active}
                sx={{ '&.Mui-selected': { bgcolor: 'rgba(37,99,235,0.06)', color: COLORS.primary } }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
          <ListItemButton
            component={Link}
            to="/login"
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemText primary="התחברות" />
            <AccountCircleOutlinedIcon sx={{ fontSize: 20, color: COLORS.primary }} />
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
}
