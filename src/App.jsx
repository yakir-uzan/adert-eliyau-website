import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import GlobalStyles from '@mui/material/GlobalStyles';
import TenantProvider from './config/TenantContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TrialBanner from './components/TrialBanner';
import { useTenant } from './config/TenantContext';

const Home = lazy(() => import('./pages/Home'));
const Zmanim = lazy(() => import('./pages/Zmanim'));
const Hodaot = lazy(() => import('./pages/Hodaot'));
const Tashlumim = lazy(() => import('./pages/Tashlumim'));
const Galeria = lazy(() => import('./pages/Galeria'));
const Contact = lazy(() => import('./pages/Contact'));
const Cheshbon = lazy(() => import('./pages/Cheshbon'));
const Brachot = lazy(() => import('./pages/Brachot'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Admin = lazy(() => import('./pages/Admin'));
const Landing = lazy(() => import('./pages/Landing'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Login = lazy(() => import('./pages/Login'));
const RegisterTenant = lazy(() => import('./pages/RegisterTenant'));
const PublicContact = lazy(() => import('./pages/PublicContact'));
const TenantActivate = lazy(() => import('./pages/TenantActivate'));

function PageLoader() {
  return (
    <Box
      sx={{
        minHeight: '55vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );
}

function Layout() {
  const { tenantSlug } = useParams();
  const location = useLocation();
  const { plan, basePath, slug } = useTenant();
  const isHome = location.pathname === basePath || location.pathname === `${basePath}/`;
  const isActivate = location.pathname === `${basePath}/activate`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      {!isActivate && <TrialBanner slug={slug} basePath={basePath} plan={plan} />}
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index              element={<Home />} />
            <Route path="zmanim"      element={<Zmanim />} />
            <Route path="hodaot"      element={<Hodaot />} />
            <Route path="tashlumim"   element={<Tashlumim />} />
            <Route path="galeria"     element={<Galeria />} />
            <Route path="contact"     element={<Contact />} />
            <Route path="cheshbon"    element={<Cheshbon />} />
            <Route path="brachot"     element={<Brachot />} />
            <Route path="campaigns"   element={<Campaigns />} />
            <Route path="campaigns/:campaignId" element={<Campaigns />} />
            <Route path="campaigns/:campaignId/:raiserSlug" element={<Campaigns />} />
            <Route path="admin"       element={<Admin />} />
            <Route path="activate"    element={<TenantActivate />} />
          </Routes>
        </Suspense>
      </Box>
      {!isHome && !isActivate && <Footer />}
    </Box>
  );
}

function TenantWrapper() {
  const { siteType, tenantSlug } = useParams();
  return (
    <TenantProvider slug={tenantSlug} urlSiteType={siteType}>
      <Layout />
    </TenantProvider>
  );
}

export default function App() {
  useEffect(() => {
    const applyRtlToInputs = (root = document) => {
      root.querySelectorAll('input:not([dir="ltr"]), textarea:not([dir="ltr"])').forEach((element) => {
        element.setAttribute('dir', 'rtl');
        element.style.setProperty('direction', 'rtl', 'important');
        element.style.setProperty('text-align', 'right', 'important');
      });
    };

    applyRtlToInputs();

    const observer = new MutationObserver(() => {
      applyRtlToInputs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <GlobalStyles
        styles={{
          'input:not([dir="ltr"])': {
            direction: 'rtl !important',
            textAlign: 'right !important',
          },
          'textarea:not([dir="ltr"])': {
            direction: 'rtl !important',
            textAlign: 'right !important',
          },
        }}
      />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterTenant />} />
            <Route path="/contact-us" element={<PublicContact />} />
            <Route path="/:siteType/:tenantSlug/*" element={<TenantWrapper />} />
            <Route path="/:tenantSlug/*" element={<TenantWrapper />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
