import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import Navbar      from './components/Navbar';
import Footer      from './components/Footer';
import Home        from './pages/Home';
import Zmanim      from './pages/Zmanim';
import Hodaot      from './pages/Hodaot';
import Tashlumim   from './pages/Tashlumim';
import Galeria     from './pages/Galeria';
import Contact     from './pages/Contact';
import Cheshbon    from './pages/Cheshbon';
import Brachot     from './pages/Brachot';
import Box from '@mui/material/Box';

function Layout() {
  const location = useLocation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/zmanim"    element={<Zmanim />} />
          <Route path="/hodaot"    element={<Hodaot />} />
          <Route path="/tashlumim" element={<Tashlumim />} />
          <Route path="/galeria"   element={<Galeria />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/cheshbon"  element={<Cheshbon />} />
          <Route path="/brachot"   element={<Brachot />} />
        </Routes>
      </Box>
      {location.pathname !== '/' && <Footer />}
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ContactProvider>
    </AuthProvider>
  );
}
