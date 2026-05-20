import { useTenant } from '../config/TenantContext';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import css from './Footer.module.css';

export default function Footer() {
  const { config } = useTenant();

  return (
    <footer className={css.footer}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © {config.meta?.copyrightYear || new Date().getFullYear()} {config.name} — כל הזכויות שמורות
        </Typography>
      </Container>
    </footer>
  );
}
