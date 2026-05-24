import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useTenant } from '../config/TenantContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import CampaignIcon from '@mui/icons-material/Campaign';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaletteIcon from '@mui/icons-material/Palette';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { hasLocalTenantOwnerAccess, isLocalDevHost } from '../utils/localTenantAccess';
import css from './Admin.module.css';
import SettingsTab from './admin/SettingsTab';
import ZmanimTab from './admin/ZmanimTab';
import HodaotTab from './admin/HodaotTab';
import GaleriaTab from './admin/GaleriaTab';
import BrachotTab from './admin/BrachotTab';
import CampaignsTab from './admin/CampaignsTab';
import ChargesTab from './admin/ChargesTab';
import { getSiteTypeConfig } from '../config/siteTypes';

function TabPanel({ value, index, children }) {
  return value === index ? <Box pt={3}>{children}</Box> : null;
}

export default function Admin() {
  const { config, slug, basePath } = useTenant();
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const pageCopy = siteTypeConfig.pages;
  const [authState, setAuthState] = useState('loading');
  const [adminUser, setAdminUser] = useState(null);
  const [tab, setTab]             = useState(0);
  const [toast, setToast]         = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => onAuthStateChanged(auth, u => { setAdminUser(u); setAuthState(u ? 'user' : 'guest'); }), []);

  const admins = config.admins || [];
  const adminEmails = (config.adminEmails || [])
    .map(email => String(email).trim().toLowerCase())
    .filter(Boolean);
  const creatorAccess = hasLocalTenantOwnerAccess(slug);
  const localMode = isLocalDevHost() && creatorAccess;
  const adminEmail = adminUser?.email?.toLowerCase() || '';
  const isEmailAdmin = !!adminEmail && adminEmails.includes(adminEmail);
  const isUidAdmin = !!adminUser && admins.includes(adminUser.uid);
  const isLegacyAdmin = !!adminUser && admins.length === 0 && adminEmails.length === 0;
  const isAdmin = isUidAdmin || isEmailAdmin || isLegacyAdmin;
  const platformAdminEmails = (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  const isPlatformAdmin = !!adminUser?.email && platformAdminEmails.includes(adminUser.email.toLowerCase());
  const canAccessAdmin = creatorAccess || isAdmin;

  const login = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);

  const onToast = (msg, sev = 'success') => setToast({ open: true, msg, sev });

  if (authState === 'loading') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );

  if (authState === 'guest' && !creatorAccess) return (
    <div className={css.loginScreen}>
      <Card className={css.loginCard} sx={{ p: 4 }}>
        <LockIcon sx={{ fontSize: '3rem', color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" gutterBottom>כניסה לניהול</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>{config.name} — {pageCopy.admin.loginSubtitle}</Typography>
        <Button onClick={login} fullWidth size="large" variant="contained">כניסה עם Google</Button>
      </Card>
    </div>
  );

  if (!canAccessAdmin) return (
    <div className={css.loginScreen}>
      <Card className={css.loginCard} sx={{ p: 4 }}>
        <LockIcon sx={{ fontSize: '3rem', color: 'error.main', mb: 1 }} />
        <Typography variant="h5" gutterBottom>אין הרשאת גישה</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>המשתמש {adminUser.email} אינו מורשה לנהל את {config.name}</Typography>
        <Button variant="outlined" onClick={() => signOut(auth)}>התנתק</Button>
      </Card>
    </div>
  );

  return (
    <Box className={css.root} sx={{ pt: { xs: 7, md: 8 } }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary"
          className={css.tabBorder}
          sx={{ mb: 1,
            '& .MuiTabs-flexContainer': { justifyContent: 'center' },
          }}
          variant="scrollable"
          scrollButtons="auto"
          centered
        >
          <Tab icon={<PaletteIcon />} iconPosition="start" label={pageCopy.admin.settings} />
          <Tab icon={<AccessTimeIcon />} iconPosition="start" label={pageCopy.admin.schedule} />
          <Tab icon={<CampaignIcon />}   iconPosition="start" label={siteTypeConfig.nav.find(item => item.path === 'hodaot')?.label || 'הודעות'} />
          <Tab icon={<VolunteerActivismIcon />} iconPosition="start" label="קמפיינים" />
          <Tab icon={<PhotoLibraryIcon />} iconPosition="start" label="גלריה" />
          <Tab icon={<MenuBookIcon />} iconPosition="start" label={siteTypeConfig.nav.find(item => item.path === 'brachot')?.label || 'תוכן'} />
          <Tab icon={<CreditCardIcon />} iconPosition="start" label={pageCopy.admin.charges} />
        </Tabs>
        <TabPanel value={tab} index={0}><SettingsTab config={config} slug={slug} onToast={onToast} currentUser={adminUser} isPlatformAdmin={isPlatformAdmin} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={1}><ZmanimTab config={config} onToast={onToast} slug={slug} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={2}><HodaotTab config={config} onToast={onToast} slug={slug} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={3}><CampaignsTab config={config} slug={slug} basePath={basePath} onToast={onToast} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={4}><GaleriaTab onToast={onToast} slug={slug} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={5}><BrachotTab config={config} slug={slug} onToast={onToast} localMode={localMode} /></TabPanel>
        <TabPanel value={tab} index={6}><ChargesTab config={config} onToast={onToast} slug={slug} /></TabPanel>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ fontWeight: 700 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
