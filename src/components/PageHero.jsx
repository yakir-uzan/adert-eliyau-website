import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTenant } from '../config/TenantContext';
import css from './PageHero.module.css';

export default function PageHero({ title, subtitle }) {
  const { config } = useTenant();
  const heroBg = config.images?.pageHeroBg?.trim();

  return (
    <div
      className={css.hero}
      style={heroBg ? { '--hero-bg': `url(${heroBg})` } : undefined}
    >
      <Typography variant="h2" className={css.title} sx={{ color: 'primary.light' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography className={css.subtitle} sx={{ color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </div>
  );
}
