import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import createTenantTheme from './createTenantTheme';
import { useLocation, Link } from 'react-router-dom';
import { getTenantPlanState } from '../utils/tenantPlan';
import {
  hasLocalTenantOwnerAccess,
  isLocalDevHost,
  LOCAL_TENANT_UPDATED_EVENT,
  readLocalTenantDraft,
} from '../utils/localTenantAccess';

const TenantContext = createContext(null);
const LIVE_PREVIEW_MESSAGE_TYPE = 'tenant-preview-update';

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider');
  return ctx;
}

export default function TenantProvider({ slug, children }) {
  const [config, setConfig] = useState(null);
  const [error, setError]   = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!slug) { setError('missing'); return; }
    setConfig(null);
    setError(null);
    const localDraft = readLocalTenantDraft(slug);
    const isLocalHost = isLocalDevHost();
    const preferLocalDraft = isLocalHost && hasLocalTenantOwnerAccess(slug) && !!localDraft;

    if (localDraft && isLocalHost) {
      setConfig(localDraft);
    }

    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        if (localDraft && isLocalHost) {
          setConfig(localDraft);
          setError(null);
        } else {
          setError('not-found');
        }
      }
    }, 8000);

    const unsubscribe = onSnapshot(
      doc(db, 'tenants', slug),
      snap => {
        settled = true;
        clearTimeout(timeoutId);
        if (snap.exists()) {
          setConfig(preferLocalDraft ? localDraft : snap.data());
          setError(null);
        } else {
          if (localDraft && isLocalHost) {
            setConfig(localDraft);
            setError(null);
          } else {
            setError('not-found');
          }
        }
      },
      () => {
        settled = true;
        clearTimeout(timeoutId);
        if (localDraft && isLocalHost) {
          setConfig(localDraft);
          setError(null);
        } else {
          setError('not-found');
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleLocalUpdate = (event) => {
      if (event.detail?.slug !== slug || event.detail?.type !== 'tenant') return;
      const nextDraft = readLocalTenantDraft(slug);
      if (nextDraft) {
        setConfig(nextDraft);
        setError(null);
      }
    };

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== LIVE_PREVIEW_MESSAGE_TYPE) return;
      if (event.data?.slug !== slug) return;
      if (!event.data?.config) return;
      setConfig(event.data.config);
      setError(null);
    };

    window.addEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
      window.removeEventListener('message', handleMessage);
    };
  }, [slug]);

  const theme = useMemo(
    () => createTenantTheme(config?.theme || {}),
    [config?.theme?.primaryColor, config?.theme?.bgDefault, config?.theme?.bgPaper, config?.theme?.primaryLight]
  );
  const plan = useMemo(() => getTenantPlanState(config || {}), [config]);
  const isActivateRoute = location.pathname === `/${slug}/activate`;

  if (error === 'not-found') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0D1B2A', color: '#F5F0E8', textAlign: 'center', p: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontFamily: '"Secular One", serif', color: '#C9A84C', mb: 2 }}>404</Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>בית הכנסת לא נמצא</Typography>
          <Typography color="#A89F94">הכתובת <strong>/{slug}</strong> אינה קיימת במערכת</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0D1B2A', color: '#F5F0E8', textAlign: 'center', p: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>שגיאה בטעינה</Typography>
          <Typography color="#A89F94">לא הצלחנו לטעון את פרטי בית הכנסת. נסו שוב מאוחר יותר.</Typography>
        </Box>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0D1B2A' }}>
        <CircularProgress sx={{ color: '#C9A84C' }} />
      </Box>
    );
  }

  if (plan.isExpired && !isActivateRoute) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', color: 'text.primary', textAlign: 'center', p: 4 }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="h3" sx={{ fontFamily: '"Secular One", serif', color: 'primary.main', mb: 2 }}>
              האתר מוכן ומחכה להפעלה
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              תקופת הניסיון הסתיימה. כדי להמשיך לפרסם ולנהל את האתר, צריך להשלים תשלום.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button component={Link} to={`/${slug}/activate`} variant="contained" size="large">
                הפעלת האתר
              </Button>
              <Button component={Link} to="/contact-us" variant="outlined" size="large">
                צור קשר
              </Button>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <TenantContext.Provider value={{ config, slug, plan }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TenantContext.Provider>
  );
}
