import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import GlobalStyles from '@mui/material/GlobalStyles';
import TenantProvider from './config/TenantContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home        from './pages/Home';
import Zmanim      from './pages/Zmanim';
import Hodaot      from './pages/Hodaot';
import Tashlumim   from './pages/Tashlumim';
import Galeria     from './pages/Galeria';
import Contact     from './pages/Contact';
import Cheshbon    from './pages/Cheshbon';
import Brachot     from './pages/Brachot';
import Admin       from './pages/Admin';
import Landing        from './pages/Landing';
import HowItWorks    from './pages/HowItWorks';
import Features      from './pages/Features';
import Pricing       from './pages/Pricing';
import FAQ           from './pages/FAQ';
import Login         from './pages/Login';
import RegisterTenant from './pages/RegisterTenant';
import PublicContact  from './pages/PublicContact';
import TenantActivate from './pages/TenantActivate';
import Box from '@mui/material/Box';
import TrialBanner from './components/TrialBanner';
import { useTenant } from './config/TenantContext';

function Layout() {
  const { tenantSlug } = useParams();
  const location = useLocation();
  const { plan } = useTenant();
  const isHome = location.pathname === `/${tenantSlug}` || location.pathname === `/${tenantSlug}/`;
  const isActivate = location.pathname === `/${tenantSlug}/activate`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      {!isActivate && <TrialBanner slug={tenantSlug} plan={plan} />}
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route index              element={<Home />} />
          <Route path="zmanim"      element={<Zmanim />} />
          <Route path="hodaot"      element={<Hodaot />} />
          <Route path="tashlumim"   element={<Tashlumim />} />
          <Route path="galeria"     element={<Galeria />} />
          <Route path="contact"     element={<Contact />} />
          <Route path="cheshbon"    element={<Cheshbon />} />
          <Route path="brachot"     element={<Brachot />} />
          <Route path="admin"       element={<Admin />} />
          <Route path="activate"    element={<TenantActivate />} />
        </Routes>
      </Box>
      {!isHome && !isActivate && <Footer />}
    </Box>
  );
}

function TenantWrapper() {
  const { tenantSlug } = useParams();
  return (
    <TenantProvider slug={tenantSlug}>
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
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterTenant />} />
          <Route path="/contact-us" element={<PublicContact />} />
          <Route path="/:tenantSlug/*" element={<TenantWrapper />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
