import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DEFAULT_SITE_TYPE, getSiteTypeConfig } from '../config/siteTypes';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import { withTimeout } from '../utils/slugUtils';
import { listLocalOwnedTenants, isLocalDevHost } from '../utils/localTenantAccess';
import { getGoogleAuthErrorMessage, readGoogleRedirectResult, signInWithGoogle } from '../utils/googleAuth';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

function tenantAdminPath(site) {
  const siteType = site.siteType || site.templateId || DEFAULT_SITE_TYPE;
  return `/${siteType}/${site.slug}/admin`;
}

function normalizeTenant(docSnap) {
  const data = docSnap.data();
  return {
    ...data,
    slug: docSnap.id,
    siteType: data.siteType || data.templateId || DEFAULT_SITE_TYPE,
  };
}

async function findManagedSites(user) {
  if (!user) return [];

  const bySlug = new Map();
  const addSites = (sites) => {
    sites.forEach(site => {
      if (!site?.slug) return;
      bySlug.set(site.slug, {
        ...site,
        siteType: site.siteType || site.templateId || DEFAULT_SITE_TYPE,
      });
    });
  };

  if (isLocalDevHost()) {
    addSites(listLocalOwnedTenants());
  }

  const email = user.email?.trim().toLowerCase();
  const queries = [
    query(collection(db, 'tenants'), where('admins', 'array-contains', user.uid)),
  ];
  if (email) {
    queries.push(query(collection(db, 'tenants'), where('adminEmails', 'array-contains', email)));
  }

  const snapshots = await Promise.allSettled(queries.map(q => withTimeout(getDocs(q), 3500)));
  snapshots.forEach(result => {
    if (result.status !== 'fulfilled') return;
    addSites(result.value.docs.map(normalizeTenant));
  });

  return Array.from(bySlug.values());
}

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setAuthLoading(false);
  }), []);

  useEffect(() => {
    readGoogleRedirectResult()
      .catch(err => {
        if (err?.code) setError(getGoogleAuthErrorMessage(err));
      })
      .finally(() => setCheckingRedirect(false));
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setError('');
    setLoadingSites(true);
    findManagedSites(user)
      .then(found => {
        if (!active) return;
        setSites(found);
        if (found.length === 1) {
          navigate(tenantAdminPath(found[0]), { replace: true });
        }
      })
      .catch(() => {
        if (active) setError('לא הצלחנו לבדוק את האתרים שמחוברים לחשבון הזה. נסו שוב בעוד רגע.');
      })
      .finally(() => {
        if (active) setLoadingSites(false);
      });
    return () => { active = false; };
  }, [user, navigate]);

  const userName = useMemo(() => user?.displayName || user?.email || '', [user]);

  const login = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getGoogleAuthErrorMessage(err));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setSites([]);
  };

  return (
    <PlatformLayout>
      <Container maxWidth="md" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="כניסת גבאים ומנהלי אתרים"
          subtitle="התחברו עם חשבון Google שמוגדר כמנהל, ואנחנו נפתח לכם את ממשק העריכה המתאים."
        />

        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 5 },
            borderRadius: { xs: 3, md: 4 },
            bgcolor: 'rgba(16,26,37,0.86)',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 28px 70px rgba(0,0,0,0.28)',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          <Box
            sx={{
              width: 66,
              height: 66,
              borderRadius: 3,
              mx: 'auto',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.gold,
              bgcolor: 'rgba(201,168,76,0.08)',
              border: `1px solid ${COLORS.borderSoft}`,
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 36 }} />
          </Box>

          {/* Loading while checking auth state or redirect result */}
          {(authLoading || checkingRedirect) && !user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 3 }}>
              <CircularProgress size={28} sx={{ color: COLORS.gold }} />
              <Typography sx={{ color: COLORS.muted }}>בודק הרשאות...</Typography>
            </Box>
          )}

          {!user && !authLoading && !checkingRedirect && (
            <>
              <Typography variant="h5" sx={{ color: COLORS.goldLight, fontWeight: 800, mb: 1 }}>
                התחברות לניהול האתר
              </Typography>
              <Typography sx={{ color: COLORS.muted, lineHeight: 1.8, mb: 3, maxWidth: 520, mx: 'auto' }}>
                אין צורך לבחור סוג אתר או להקליד כתובת. התחברו, והמערכת תזהה לבד אילו אתרים שייכים לחשבון שלכם.
              </Typography>
              <Button
                onClick={login}
                size="large"
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 260 },
                  minHeight: 52,
                  bgcolor: COLORS.gold,
                  color: COLORS.bg,
                  fontWeight: 900,
                  borderRadius: 3,
                  px: 4,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.goldLight, transform: 'translateY(-1px)' },
                  transition: 'all 0.22s ease',
                }}
              >
                כניסה עם גוגל
              </Button>
            </>
          )}

          {user && (
            <>
              <Typography variant="h5" sx={{ color: COLORS.goldLight, fontWeight: 800, mb: 0.5 }}>
                שלום {userName}
              </Typography>
              <Typography sx={{ color: COLORS.muted, mb: 3 }}>
                בודקים את הרשאות הניהול שלך.
              </Typography>

              {loadingSites && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 2 }}>
                  <CircularProgress size={24} sx={{ color: COLORS.gold }} />
                  <Typography sx={{ color: COLORS.muted }}>מחפשים את האתרים שלך...</Typography>
                </Box>
              )}

              {!loadingSites && sites.length > 1 && (
                <>
                  <Typography sx={{ color: COLORS.muted, mb: 2 }}>
                    נמצאו כמה אתרים. בחרו לאיזה ממשק ניהול להיכנס.
                  </Typography>
                  <Grid container spacing={2}>
                    {sites.map(site => {
                      const siteType = getSiteTypeConfig(site.siteType || DEFAULT_SITE_TYPE);
                      return (
                        <Grid item xs={12} sm={6} key={site.slug}>
                          <Card
                            sx={{
                              height: '100%',
                              bgcolor: 'rgba(7,17,27,0.62)',
                              border: `1px solid ${COLORS.border}`,
                              textAlign: 'right',
                              '&:hover': { borderColor: COLORS.gold, transform: 'translateY(-2px)' },
                              transition: 'all 0.22s ease',
                            }}
                          >
                            <CardContent>
                              <Typography sx={{ color: COLORS.goldLight, fontWeight: 900, mb: 0.5 }}>
                                {site.name || site.slug}
                              </Typography>
                              <Typography variant="body2" sx={{ color: COLORS.muted, mb: 2 }}>
                                {siteType.label} · /{site.siteType || DEFAULT_SITE_TYPE}/{site.slug}
                              </Typography>
                              <Button
                                component={Link}
                                to={tenantAdminPath(site)}
                                fullWidth
                                variant="contained"
                                endIcon={<ArrowBackIcon />}
                                sx={{ bgcolor: COLORS.gold, color: COLORS.bg, fontWeight: 900 }}
                              >
                                כניסה לניהול
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}

              {!loadingSites && sites.length === 0 && (
                <Box
                  sx={{
                    textAlign: 'right',
                    direction: 'rtl',
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: 'rgba(16,26,37,0.6)',
                    border: `1px solid ${COLORS.borderSoft}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: COLORS.goldLight, fontWeight: 800, mb: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}
                  >
                    לא נמצא אתר מחובר לחשבון הזה
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.muted, lineHeight: 1.9, mb: 2.5 }}>
                    אם כבר יצרתם אתר — ודאו שנכנסתם עם אותו חשבון Google שבו יצרתם אותו.
                    <br />
                    אם עדיין לא יצרתם, אפשר לפתוח עכשיו.
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    fullWidth
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{
                      bgcolor: COLORS.gold,
                      color: COLORS.bg,
                      fontWeight: 900,
                      borderRadius: 3,
                      textTransform: 'none',
                      minHeight: 48,
                      mb: 1.25,
                      '&:hover': { bgcolor: COLORS.goldLight, transform: 'translateY(-1px)' },
                      transition: 'all 0.22s ease',
                    }}
                  >
                    פתיחת אתר חדש
                  </Button>
                  <Button
                    onClick={logout}
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: COLORS.border,
                      color: COLORS.muted,
                      borderRadius: 3,
                      textTransform: 'none',
                      minHeight: 44,
                      '&:hover': { borderColor: COLORS.goldLight, color: COLORS.ivory },
                    }}
                  >
                    כניסה עם חשבון Google אחר
                  </Button>
                </Box>
              )}

              {!loadingSites && sites.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    onClick={logout}
                    variant="text"
                    sx={{ color: COLORS.muted, textTransform: 'none', '&:hover': { color: COLORS.ivory } }}
                  >
                    התנתקות
                  </Button>
                </Box>
              )}
            </>
          )}

          {error && <Alert severity="error" sx={{ mt: 3, textAlign: 'right' }}>{error}</Alert>}
        </Box>
      </Container>
    </PlatformLayout>
  );
}
