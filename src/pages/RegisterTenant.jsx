import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { uploadToImgBB } from '../utils/imgbbUpload';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import { cleanSlug, buildSlugFromName, withTimeout } from '../utils/slugUtils';
import { buildTenantDocFromForm } from '../utils/tenantFormUtils';
import { primaryButtonSx, secondaryButtonSx } from '../utils/buttonStyles';
import { createTrialEndDate, TRIAL_DAYS } from '../utils/tenantPlan';
import { markLocalTenantOwnerAccess, saveLocalTenantDraft } from '../utils/localTenantAccess';
import { getGoogleAuthErrorMessage, signInWithGoogle } from '../utils/googleAuth';
import { DEFAULT_SITE_TYPE, getSiteTypeConfig } from '../config/siteTypes';
import PlatformGoldDivider from '../components/PlatformGoldDivider';
import { STEPS, LIVE_PREVIEW_SLUG, LIVE_PREVIEW_MESSAGE_TYPE } from './register/registerConstants';
import ProgressSteps from './register/ProgressSteps';
import LiveSitePreview from './register/LiveSitePreview';
import StepSiteType from './register/StepSiteType';
import StepBasicInfo from './register/StepBasicInfo';
import StepContact from './register/StepContact';
import css from './register/RegisterTenant.module.css';

const INITIAL_DATA = {
  siteType: DEFAULT_SITE_TYPE,
  name: '', subtitle: '', slug: '', slugManual: false, aboutText: '',
  address: '', city: '', phone: '', email: '', mapEmbedUrl: '',
  formspreeId: '', waGroupLink: '', gabaiPhone: '',
  bitPhone: '', payboxPhone: '', payboxLink: '', nedarimLink: '', stripeKey: '',
  bankName: '', bankBranch: '', accountNumber: '', accountOwner: '', bankRows: [],
  logo: '', pageHeroBg: '',
  emailServiceId: '', emailTemplateId: '', emailPublicKey: '',
};

export default function RegisterTenant() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://www.genisite.com';
  const previewBaseUrl = typeof window !== 'undefined' ? window.location.origin : baseUrl;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [uploads, setUploads] = useState({ logo: false, pageHeroBg: false });
  const previewIframeRef = useRef(null);
  const [data, setData] = useState(INITIAL_DATA);

  useEffect(() => { if (step > STEPS.length - 1) setStep(STEPS.length - 1); }, [step]);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); }), []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const canNext = () => {
    if (step === 0) return !!data.siteType;
    if (step === 1) return data.name.trim() && data.slug.trim();
    return true;
  };
  const handleNext = () => { if (step < STEPS.length - 1) setStep(c => c + 1); };
  const handleBack = () => { if (step > 0) setStep(c => c - 1); };

  const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const requiresAuth = !isLocalhost;

  const loginWithGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getGoogleAuthErrorMessage(err));
    }
  };

  const uploadImage = async (field, file) => {
    if (!file) return;
    setUploads(prev => ({ ...prev, [field]: true }));
    setError('');
    try {
      if (isLocalhost) {
        update(field, URL.createObjectURL(file));
        setToast('התמונה נטענה לתצוגה המקדימה');
        return;
      }
      const { url } = await uploadToImgBB(file);
      update(field, url);
      setToast('התמונה הועלתה בהצלחה');
    } catch { setError('לא הצלחנו להעלות את התמונה. נסו שוב.'); }
    setUploads(prev => ({ ...prev, [field]: false }));
  };

  const siteTypeConfig = getSiteTypeConfig(data.siteType);
  const fallbackSlug = siteTypeConfig.slugPlaceholder?.split('/').pop() || (data.siteType === DEFAULT_SITE_TYPE ? 'shaarei-tefila' : 'your-site');
  const previewSlug = cleanSlug(data.slug || buildSlugFromName(data.name) || fallbackSlug);
  const previewUrl = `${previewBaseUrl}/${data.siteType}/${LIVE_PREVIEW_SLUG}`;
  const publicPreviewUrl = `${baseUrl}/${data.siteType}/${previewSlug || fallbackSlug}`;

  const pushPreviewUpdate = () => {
    if (typeof window === 'undefined') return;
    const previewDoc = buildTenantDocFromForm(data, user?.uid || '', { forPreview: true });
    saveLocalTenantDraft(LIVE_PREVIEW_SLUG, previewDoc);
    previewIframeRef.current?.contentWindow?.postMessage(
      { type: LIVE_PREVIEW_MESSAGE_TYPE, slug: LIVE_PREVIEW_SLUG, config: previewDoc },
      window.location.origin,
    );
  };

  useEffect(() => { pushPreviewUpdate(); }, [data, user?.uid]);

  const handleSubmit = async () => {
    if (!data.name.trim() || !data.slug.trim()) { setError('יש למלא שם וכתובת אתר'); return; }
    if (requiresAuth && !user) {
      setError('לפני השמירה צריך להתחבר עם Google, כדי שנוכל לשייך את האתר לחשבון הניהול שלכם.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const slugClean = cleanSlug(data.slug);
      if (isLocalhost) {
        const localDoc = buildTenantDocFromForm(data, user?.uid || '', { googleEmail: user?.email || '' });
        localDoc.trialEndsAt = createTrialEndDate().toISOString();
        markLocalTenantOwnerAccess(slugClean);
        saveLocalTenantDraft(slugClean, localDoc);
        setToast('האתר נשמר במצב תצוגה מקומית');
        setSaving(false);
        navigate(`/${data.siteType}/${slugClean}/admin`);
        return;
      }
      try {
        const existing = await withTimeout(getDoc(doc(db, 'tenants', slugClean)));
        if (existing.exists()) { setError(`הכתובת "${slugClean}" כבר תפוסה. בחרו כתובת אחרת.`); setSaving(false); return; }
      } catch (lookupError) { if (!isLocalhost) throw lookupError; }

      const tenantDoc = buildTenantDocFromForm(data, user?.uid || '', { googleEmail: user?.email || '' });
      markLocalTenantOwnerAccess(slugClean);
      try {
        await withTimeout(setDoc(doc(db, 'tenants', slugClean), tenantDoc));
        if (isLocalhost) saveLocalTenantDraft(slugClean, tenantDoc);
        setToast(`האתר נוצר בהצלחה. הופעל ניסיון ל-${TRIAL_DAYS} ימים`);
      } catch (writeError) {
        if (isLocalhost) { saveLocalTenantDraft(slugClean, tenantDoc); setToast('האתר נשמר במצב תצוגה מקומית'); }
        else throw writeError;
      }
      setTimeout(() => navigate(`/${data.siteType}/${slugClean}/admin`), 1500);
    } catch (err) {
      if (isLocalhost) {
        const slugClean = cleanSlug(data.slug);
        const fallbackDoc = buildTenantDocFromForm(data, user?.uid || '', { googleEmail: user?.email || '' });
        fallbackDoc.trialEndsAt = createTrialEndDate().toISOString();
        markLocalTenantOwnerAccess(slugClean);
        saveLocalTenantDraft(slugClean, fallbackDoc);
        setToast('האתר נשמר במצב תצוגה מקומית');
        setTimeout(() => navigate(`/${data.siteType}/${slugClean}/admin`), 1200);
      } else { setError(`שגיאה ביצירת האתר. ${err.message || ''}`); }
    }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: COLORS.bg }}>
        <CircularProgress sx={{ color: COLORS.gold }} />
      </Box>
    );
  }

  const stepContent = [
    <StepSiteType key="site-type" value={data.siteType} update={update} />,
    <StepBasicInfo key="basic" data={data} update={update} baseUrl={baseUrl} uploads={uploads} onUpload={uploadImage} />,
    <StepContact key="contact" data={data} update={update} />,
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, py: { xs: 2.25, md: 4 }, px: { xs: 1.5, sm: 2 }, position: 'relative', overflow: 'hidden' }}>
      <div className={css.bgImage} />
      <div className={css.bgGradient} />
      <div className={css.bgRadial} />
      <div className={css.curveOuter} />
      <div className={css.curveInner} />

      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, md: 3 } }}>
          <Typography variant="caption" sx={{ color: COLORS.goldLight, letterSpacing: '0.22em', display: { xs: 'none', sm: 'block' }, mb: 0.8 }}>
            פתיחת אתר
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: '"Secular One", serif', color: COLORS.gold, mb: 0.5, fontSize: { xs: 'clamp(1.55rem, 8.6vw, 2.05rem)', sm: '2rem', md: '2.6rem' }, lineHeight: 1.15 }}>
            {siteTypeConfig.registerTitle}
          </Typography>
          <PlatformGoldDivider width={140} sideWidth={26} sideOffset={36} sx={{ mx: 'auto', my: 1.75 }} />
        </Box>

        <Box
          sx={{
            display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, lg: 6, xl: 8 },
            mt: { xs: 2.5, md: 4.5, lg: 5.5 }, alignItems: 'flex-start', justifyContent: { lg: 'center' },
            width: '100%', overflow: 'hidden', direction: 'ltr', maxWidth: 1480, mx: 'auto',
          }}
        >
          <Box
            sx={{
              direction: 'rtl', width: '100%', minWidth: 0, flex: { lg: '0 1 760px' }, maxWidth: 760,
              textAlign: 'right', position: 'relative', height: { xs: 'auto', lg: 650 },
              pb: { xs: 0, lg: 0 }, overflowX: 'hidden',
              transform: { lg: 'translateX(-18px)', xl: 'translateX(-24px)' },
            }}
          >
            <ProgressSteps steps={STEPS} activeStep={step} />

            <Box sx={{ py: 1, direction: 'rtl', textAlign: 'right', height: { xs: 'auto', lg: 'calc(100% - 128px)' }, overflowY: { xs: 'visible', lg: 'auto' }, overflowX: 'hidden', pr: { xs: 0, lg: 0.5 } }}>
              {stepContent[step]}
            </Box>

            {requiresAuth && !user && (
              <Box
                sx={{
                  mt: 2,
                  mb: 1,
                  p: { xs: 1.6, sm: 2 },
                  borderRadius: 3,
                  border: '1px solid rgba(201,168,76,0.22)',
                  bgcolor: 'rgba(201,168,76,0.07)',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'right',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: COLORS.gold,
                      bgcolor: 'rgba(7,17,27,0.42)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 21 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: COLORS.goldLight, fontWeight: 900, lineHeight: 1.3 }}>
                      עוד רגע שומרים את האתר
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.muted, lineHeight: 1.6 }}>
                      התחברו עם Google כדי שנוכל לשייך את האתר לחשבון הניהול שלכם.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  onClick={loginWithGoogle}
                  variant="outlined"
                  sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 42, px: 2.5, fontWeight: 800, textTransform: 'none' }}
                >
                  כניסה עם גוגל
                </Button>
              </Box>
            )}

            {error && <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' }, alignItems: 'center', gap: { xs: 1.25, sm: 2 }, pt: 2.5, borderTop: '1px solid rgba(201,168,76,0.14)', direction: 'rtl', position: { xs: 'static', lg: 'absolute' }, right: 0, left: 0, bottom: { xs: 0, lg: 60 }, bgcolor: 'transparent' }}>
              <Typography variant="caption" sx={{ color: COLORS.muted, justifySelf: 'center', whiteSpace: 'nowrap', display: { xs: 'block', sm: 'none' } }}>{step + 1} / {STEPS.length}</Typography>

              {step > 0 ? (
                <Button onClick={handleBack} sx={{ ...secondaryButtonSx, justifySelf: { xs: 'stretch', sm: 'start' }, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 120 }, px: { xs: 1.25, sm: 2.2 }, order: { xs: 3, sm: 0 } }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, direction: 'rtl' }}>
                    <span>הקודם</span>
                    <ArrowForwardIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                  </Box>
                </Button>
              ) : (
                <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
              )}

              <Typography variant="caption" sx={{ color: COLORS.muted, justifySelf: 'center', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>{step + 1} / {STEPS.length}</Typography>

              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canNext()} variant="contained" sx={{ ...primaryButtonSx, justifySelf: { xs: 'stretch', sm: 'end' }, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 170 }, px: { xs: 2.2, sm: 3 } }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, direction: 'rtl' }}>
                    <ArrowBackIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                    <span>הבא</span>
                  </Box>
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving} variant="contained" sx={{ ...primaryButtonSx, justifySelf: { xs: 'stretch', sm: 'end' }, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 170 }, px: { xs: 2.2, sm: 3 } }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, direction: 'ltr' }}>
                    <span>{saving ? 'יוצר...' : 'צור את האתר'}</span>
                    {saving ? <CircularProgress size={20} sx={{ color: COLORS.bg, flexShrink: 0 }} /> : <CheckCircleIcon sx={{ fontSize: 19, flexShrink: 0 }} />}
                  </Box>
                </Button>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              direction: 'rtl', width: '100%', minWidth: 0,
              flex: { lg: '0 0 540px', xl: '0 0 560px' }, maxWidth: { lg: 540, xl: 560 },
              display: { xs: 'none', lg: 'block' },
              transform: { lg: 'translateX(27px)', xl: 'translateX(47px)' },
            }}
          >
            <LiveSitePreview previewUrl={previewUrl} publicUrl={publicPreviewUrl} iframeRef={previewIframeRef} onLoad={pushPreviewUpdate} />
          </Box>
        </Box>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={3200} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
