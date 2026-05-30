import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { auth, db } from '../firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import PlatformLayout from '../components/PlatformLayout';
import { isLocalDevHost, LOCAL_TENANT_PREFIX, LOCAL_TENANT_OWNER_PREFIX } from '../utils/localTenantAccess';

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sites, setSites] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  }), []);

  useEffect(() => {
    if (!user) { setSites(null); return; }
    findUserSites(user);
  }, [user]);

  const findUserSites = async (u) => {
    setSearching(true);
    setError('');
    try {
      const found = new Map();

      const firestoreSearch = async () => {
        const tenantsRef = collection(db, 'tenants');
        const byUid = query(tenantsRef, where('createdBy', '==', u.uid));
        const byEmail = query(tenantsRef, where('adminEmails', 'array-contains', u.email.toLowerCase()));
        const [uidSnap, emailSnap] = await Promise.all([getDocs(byUid), getDocs(byEmail)]);
        uidSnap.forEach(doc => found.set(doc.id, { slug: doc.id, name: doc.data().name || doc.id }));
        emailSnap.forEach(doc => found.set(doc.id, { slug: doc.id, name: doc.data().name || doc.id }));
      };

      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

      try {
        await Promise.race([firestoreSearch(), timeout(6000)]);
      } catch {
        // Firestore timed out or failed — continue with local sites
      }

      if (isLocalDevHost()) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(LOCAL_TENANT_OWNER_PREFIX)) {
            const slug = key.replace(LOCAL_TENANT_OWNER_PREFIX, '');
            if (!found.has(slug)) {
              const raw = localStorage.getItem(`${LOCAL_TENANT_PREFIX}${slug}`);
              const data = raw ? JSON.parse(raw) : {};
              found.set(slug, { slug, name: data.name || slug });
            }
          }
        }
      }

      const siteList = Array.from(found.values());

      if (siteList.length === 1) {
        navigate(`/${siteList[0].slug}/admin`, { replace: true });
        return;
      }
      setSites(siteList);
    } catch (err) {
      setError('שגיאה בחיפוש אתרים. נסו שנית.');
      setSites([]);
    }
    setSearching(false);
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(() => {
      setError('ההתחברות נכשלה. נסו שנית.');
    });
  };

  if (loading) {
    return (
      <PlatformLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Container maxWidth="sm" sx={{ pb: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', pt: { xs: 7, md: 10 }, mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Inter", "Assistant", sans-serif',
              fontSize: { xs: '2.2rem', md: '3.2rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              color: COLORS.text,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            התחברות
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.9, maxWidth: 680, mx: 'auto' }}>
            {!user ? 'התחברו עם חשבון גוגל כדי לנהל את האתר שלכם' : searching ? 'מחפש את האתרים שלך...' : 'בחרו את האתר שברצונכם לנהל'}
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 3.5, md: 5 },
            borderRadius: 4,
            bgcolor: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 8px 32px rgba(15,23,42,0.06)',
            textAlign: 'center',
          }}
        >
          {!user ? (
            <>
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: COLORS.primary, bgcolor: 'rgba(37,99,235,0.06)',
                }}
              >
                <AccountCircleOutlinedIcon sx={{ fontSize: 30 }} />
              </Box>

              <Button
                onClick={handleGoogleLogin}
                size="large"
                startIcon={<GoogleIcon />}
                sx={{
                  width: '100%',
                  bgcolor: COLORS.primary,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  py: 1.55,
                  borderRadius: 3,
                  '&:hover': { bgcolor: COLORS.primaryDark, transform: 'translateY(-1px)' },
                  transition: 'all 0.22s ease',
                }}
              >
                התחברות עם Google
              </Button>

              {error && (
                <Typography sx={{ color: 'error.main', mt: 2, fontSize: '0.9rem' }}>{error}</Typography>
              )}
            </>
          ) : searching ? (
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
              <Typography sx={{ color: COLORS.textSecondary }}>מחפש אתרים...</Typography>
            </Box>
          ) : sites && sites.length === 0 ? (
            <Box sx={{ py: 2 }}>
              <Typography sx={{ color: COLORS.textSecondary, mb: 3, fontSize: '1rem' }}>
                לא נמצאו אתרים עבור {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  sx={{
                    bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, borderRadius: 3, px: 4, py: 1.3,
                    '&:hover': { bgcolor: COLORS.primaryDark },
                  }}
                >
                  צרו אתר חדש
                </Button>
                <Button
                  onClick={() => signOut(auth)}
                  variant="outlined"
                  sx={{
                    color: COLORS.textSecondary, borderColor: COLORS.border, borderRadius: 3, px: 3, py: 1.3,
                    '&:hover': { borderColor: COLORS.muted },
                  }}
                >
                  התנתקות
                </Button>
              </Box>
              {error && (
                <Typography sx={{ color: 'error.main', mt: 2, fontSize: '0.9rem' }}>{error}</Typography>
              )}
            </Box>
          ) : sites && sites.length > 1 ? (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {sites.map((site) => (
                <Button
                  key={site.slug}
                  onClick={() => navigate(`/${site.slug}/admin`)}
                  endIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    justifyContent: 'space-between',
                    textAlign: 'right',
                    px: 3, py: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': { borderColor: COLORS.primary, bgcolor: 'rgba(37,99,235,0.04)' },
                  }}
                >
                  {site.name}
                </Button>
              ))}
              <Button
                onClick={() => signOut(auth)}
                sx={{ mt: 1, color: COLORS.muted, fontSize: '0.85rem' }}
              >
                התנתקות
              </Button>
            </Box>
          ) : null}
        </Box>
      </Container>
    </PlatformLayout>
  );
}
