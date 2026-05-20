import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
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
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import { cleanSlug, buildSlugFromName, withTimeout } from '../utils/slugUtils';
import { buildTenantDocFromForm } from '../utils/tenantFormUtils';
import { primaryButtonSx, secondaryButtonSx } from '../utils/buttonStyles';
import { createTrialEndDate, TRIAL_DAYS } from '../utils/tenantPlan';
import { markLocalTenantOwnerAccess, saveLocalTenantDraft } from '../utils/localTenantAccess';
import PlatformGoldDivider from '../components/PlatformGoldDivider';
import { STEPS, LIVE_PREVIEW_SLUG, LIVE_PREVIEW_MESSAGE_TYPE } from './register/registerConstants';
import ProgressSteps from './register/ProgressSteps';
import LiveSitePreview from './register/LiveSitePreview';
import StepBasicInfo from './register/StepBasicInfo';
import StepContact from './register/StepContact';
import css from './register/RegisterTenant.module.css';

const INITIAL_DATA = {
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
  const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://beit-knesset.com';
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
  const canNext = () => (step === 0 ? data.name.trim() && data.slug.trim() : true);
  const handleNext = () => { if (step < STEPS.length - 1) setStep(c => c + 1); };
  const handleBack = () => { if (step > 0) setStep(c => c - 1); };

  const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

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
      const slugBase = data.slug || buildSlugFromName(data.name) || user?.uid || 'tenant';
      const imageRef = ref(storage, `tenants/${slugBase}/branding/${field}-${Date.now()}-${file.name}`);
      await uploadBytes(imageRef, file);
      update(field, await getDownloadURL(imageRef));
      setToast('התמונה הועלתה בהצלחה');
    } catch { setError('לא הצלחנו להעלות את התמונה. נסו שוב.'); }
    setUploads(prev => ({ ...prev, [field]: false }));
  };

  const previewSlug = cleanSlug(data.slug || buildSlugFromName(data.name) || 'your-synagogue');
  const previewUrl = `${previewBaseUrl}/${LIVE_PREVIEW_SLUG}`;
  const publicPreviewUrl = `${baseUrl}/${previewSlug || 'your-synagogue'}`;

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
    setSaving(true);
    setError('');
    try {
      const slugClean = cleanSlug(data.slug);
      if (isLocalhost) {
        const localDoc = buildTenantDocFromForm(data, user?.uid || '');
        localDoc.trialEndsAt = createTrialEndDate().toISOString();
        markLocalTenantOwnerAccess(slugClean);
        saveLocalTenantDraft(slugClean, localDoc);
        setToast('בית הכנסת נשמר במצב תצוגה מקומית');
        setSaving(false);
        navigate(`/${slugClean}/admin`);
        return;
      }
      try {
        const existing = await withTimeout(getDoc(doc(db, 'tenants', slugClean)));
        if (existing.exists()) { setError(`הכתובת "${slugClean}" כבר תפוסה. בחרו כתובת אחרת.`); setSaving(false); return; }
      } catch (lookupError) { if (!isLocalhost) throw lookupError; }

      const tenantDoc = buildTenantDocFromForm(data, user?.uid || '');
      markLocalTenantOwnerAccess(slugClean);
      try {
        await withTimeout(setDoc(doc(db, 'tenants', slugClean), tenantDoc));
        if (isLocalhost) saveLocalTenantDraft(slugClean, tenantDoc);
        setToast(`בית הכנסת נוצר בהצלחה. הופעל ניסיון ל-${TRIAL_DAYS} ימים`);
      } catch (writeError) {
        if (isLocalhost) { saveLocalTenantDraft(slugClean, tenantDoc); setToast('בית הכנסת נשמר במצב תצוגה מקומית'); }
        else throw writeError;
      }
      setTimeout(() => navigate(`/${slugClean}/admin`), 1500);
    } catch (err) {
      if (isLocalhost) {
        const slugClean = cleanSlug(data.slug);
        const fallbackDoc = buildTenantDocFromForm(data, user?.uid || '');
        fallbackDoc.trialEndsAt = createTrialEndDate().toISOString();
        markLocalTenantOwnerAccess(slugClean);
        saveLocalTenantDraft(slugClean, fallbackDoc);
        setToast('בית הכנסת נשמר במצב תצוגה מקומית');
        setTimeout(() => navigate(`/${slugClean}/admin`), 1200);
      } else { setError(`שגיאה ביצירת בית הכנסת. ${err.message || ''}`); }
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
    <StepBasicInfo key="basic" data={data} update={update} baseUrl={baseUrl} uploads={uploads} onUpload={uploadImage} />,
    <StepContact key="contact" data={data} update={update} />,
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, py: { xs: 2, md: 4 }, px: 2, position: 'relative', overflow: 'hidden' }}>
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
          <Typography variant="h3" sx={{ fontFamily: '"Secular One", serif', color: COLORS.gold, mb: 0.5, fontSize: { xs: '1.6rem', sm: '2rem', md: '2.6rem' } }}>
            צור אתר בקלות לבית הכנסת שלך
          </Typography>
          <PlatformGoldDivider width={140} sideWidth={26} sideOffset={36} sx={{ mx: 'auto', my: 1.75 }} />
        </Box>

        <Box
          sx={{
            display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, lg: 6, xl: 8 },
            mt: { xs: 3.25, md: 4.5, lg: 5.5 }, alignItems: 'flex-start', justifyContent: { lg: 'center' },
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

            <Box sx={{ py: 1, direction: 'rtl', textAlign: 'right', height: { xs: 'auto', lg: 'calc(100% - 128px)' }, overflowY: { xs: 'visible', lg: 'auto' }, overflowX: 'hidden', pr: 0.5 }}>
              {stepContent[step]}
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 2.5, borderTop: '1px solid rgba(201,168,76,0.14)', flexDirection: 'row-reverse', direction: 'rtl', position: { xs: 'static', lg: 'absolute' }, right: 0, left: 0, bottom: { xs: 0, lg: 60 }, bgcolor: 'transparent' }}>
              <Button onClick={handleBack} disabled={step === 0} sx={{ ...secondaryButtonSx, visibility: step === 0 ? 'hidden' : 'visible' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, direction: 'rtl' }}>
                  <span>הקודם</span>
                  <ArrowForwardIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                </Box>
              </Button>

              <Typography variant="caption" sx={{ color: COLORS.muted }}>{step + 1} / {STEPS.length}</Typography>

              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canNext()} variant="contained" sx={primaryButtonSx}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, direction: 'rtl' }}>
                    <ArrowBackIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                    <span>הבא</span>
                  </Box>
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving} variant="contained" sx={primaryButtonSx}>
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
