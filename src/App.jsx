import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import Box from '@mui/material/Box';

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/zmanim"       element={<Zmanim />} />
          <Route path="/hodaot"       element={<Hodaot />} />
          <Route path="/tashlumim"    element={<Tashlumim />} />
          <Route path="/galeria"      element={<Galeria />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/cheshbon"     element={<Cheshbon />} />
          <Route path="/brachot"      element={<Brachot />} />
          <Route path="/admin"        element={<Admin />} />
        </Routes>
      </Box>
      {!isHome && <Footer />}
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
