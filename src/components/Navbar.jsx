import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useScrollTrigger from '@mui/material/useScrollTrigger';

const NAV_LINKS = [
  { label: 'ראשי',        to: '/' },
  { label: 'זמני תפילות', to: '/zmanim' },
  { label: 'הודעות',      to: '/hodaot' },
  { label: 'תשלומים',    to: '/tashlumim' },
  { label: 'ברכות',      to: '/brachot' },
  { label: 'גלריה',      to: '/galeria' },
  { label: 'יצירת קשר',  to: '/contact' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser]             = useState(null);
  const location = useLocation();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 60 });

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleLogin = () =>
    signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: scrolled ? 'rgba(13,27,42,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
          transition: 'background 0.35s, box-shadow 0.35s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>

          {/* Brand — hamburger first so it sits at far-right in RTL mobile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' }, color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Typography
                sx={{
                  fontFamily: '"Secular One", serif',
                  fontSize: '1.2rem',
                  color: 'primary.light',
                  lineHeight: 1.2,
                }}
              >
                אדרת אליהו
              </Typography>
            </Box>
          </Box>

          {/* Desktop links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {NAV_LINKS.map(l => (
              <Button
                key={l.to}
                component={Link}
                to={l.to}
                sx={{
                  color: location.pathname === l.to ? 'primary.main' : 'text.primary',
                  bgcolor: location.pathname === l.to ? 'rgba(201,168,76,0.1)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(201,168,76,0.1)' },
                }}
              >
                {l.label}
              </Button>
            ))}
          </Box>

          {/* Auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Box
                  component={Link}
                  to="/cheshbon"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none' }}
                >
                  <Avatar src={user.photoURL} sx={{ width: 32, height: 32, border: '2px solid #C9A84C' }} />
                  <Typography sx={{ color: 'primary.light', fontSize: '0.88rem', display: { xs: 'none', sm: 'block' } }}>
                    {user.displayName?.split(' ')[0]}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => signOut(auth)}
                  sx={{ fontSize: '0.78rem', py: 0.4, px: 1.2 }}
                >
                  יציאה
                </Button>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={handleLogin}
                sx={{ fontSize: '0.82rem', py: 0.5, px: 1.4 }}
              >
                כניסה
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          <Typography sx={{ fontFamily: '"Secular One", serif', color: 'primary.main', fontSize: '1.1rem' }}>
            אדרת אליהו
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {[...NAV_LINKS, { label: 'החשבון שלי', to: '/cheshbon' }].map(l => (
            <ListItem key={l.to} disablePadding>
              <ListItemButton
                component={Link}
                to={l.to}
                onClick={() => setDrawerOpen(false)}
                selected={location.pathname === l.to}
                sx={{
                  borderBottom: '1px solid rgba(201,168,76,0.08)',
                  '&.Mui-selected': { bgcolor: 'rgba(201,168,76,0.1)', color: 'primary.main' },
                }}
              >
                <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
