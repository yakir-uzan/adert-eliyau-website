import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useTenant } from '../config/TenantContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { getSiteTypeConfig } from '../config/siteTypes';
import css from './Navbar.module.css';

export default function Navbar() {
  const { config, basePath } = useTenant();
  const base = basePath;
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const NAV_LINKS = siteTypeConfig.nav.map(item => ({
    ...item,
    to: item.path ? `${base}/${item.path}` : base,
  }));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser]             = useState(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const location = useLocation();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 60 });

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleLogin = () =>
    signInWithPopup(auth, new GoogleAuthProvider())
      .catch(() => window.alert('לא הצלחנו להתחבר עם Google. בדקו שהכניסה מופעלת ונסו שוב.'));
  const closeAccountMenu = () => setAccountMenuAnchor(null);
  const handleLogout = () => {
    closeAccountMenu();
    signOut(auth);
  };

  return (
    <>
      <AppBar
        position="fixed"
        className={css.appBarTransition}
        sx={{
          background: scrolled ? 'rgba(13,27,42,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: { xs: 1, md: 2 }, px: { xs: 1.5, md: 3 }, minHeight: { xs: 58, md: 62 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 }, flex: { xs: '1 1 auto', md: '0 0 260px' }, minWidth: 0 }}>
            <IconButton
              aria-label="פתח תפריט"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' }, color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
            <Box component={Link} to={base} className={css.logoLink}>
              <Typography
                className={css.logoText}
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: 'clamp(1rem, 5.4vw, 1.18rem) !important', md: '1.38rem !important' },
                  maxWidth: { xs: 'calc(100vw - 154px)', sm: 320, md: 'none' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {config.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: '1 1 auto', justifyContent: 'center' }}>
            {NAV_LINKS.map(l => (
              <Button
                key={l.to}
                component={Link}
                to={l.to}
                className={css.navLinkHover}
                sx={{
                  bgcolor: location.pathname === l.to && !l.adminLink ? 'rgba(201,168,76,0.1)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: l.adminLink ? 'primary.main' : (location.pathname === l.to ? 'primary.main' : 'text.primary'),
                }}
              >
                {l.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: '0 0 auto', md: '0 0 260px' }, justifyContent: 'flex-end' }}>
            {user ? (
              <>
                <IconButton
                  aria-label="תפריט חשבון"
                  onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
                  sx={{ p: 0.35 }}
                >
                  <Avatar src={user.photoURL} sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }} />
                </IconButton>
                <Menu
                  anchorEl={accountMenuAnchor}
                  open={!!accountMenuAnchor}
                  onClose={closeAccountMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 170,
                      bgcolor: 'background.paper',
                      border: '1px solid rgba(201,168,76,0.2)',
                      direction: 'rtl',
                    },
                  }}
                >
                  <MenuItem component={Link} to={`${base}/cheshbon`} onClick={closeAccountMenu}>
                    החשבון שלי
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'primary.main', fontWeight: 700 }}>
                    יציאה
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={handleLogin}
                sx={{
                  fontSize: '0.82rem',
                  minHeight: { xs: 42, md: 36 },
                  px: { xs: 1.7, md: 1.4 },
                  py: 0.5,
                }}
              >
                התחבר
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          dir: 'rtl',
          style: { direction: 'rtl', right: 0, left: 'auto' },
          sx: { width: 280 },
        }}
      >
        <div className={css.drawerHeader}>
          <Typography className={css.drawerTitle} sx={{ color: 'primary.main' }}>
            {config.name}
          </Typography>
          <IconButton aria-label="סגור תפריט" onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </div>
        <List>
          {[...NAV_LINKS, { label: 'החשבון שלי', to: `${base}/cheshbon` }].map(l => (
            <ListItem key={l.to} disablePadding>
              <ListItemButton
                component={Link}
                to={l.to}
                onClick={() => setDrawerOpen(false)}
                selected={location.pathname === l.to}
                className={css.drawerItemBorder}
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(201,168,76,0.1)', color: 'primary.main' },
                  ...(l.adminLink ? { color: 'primary.main' } : {}),
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
