import Button from '@mui/material/Button';
import css from './HeroButton.module.css';

const primarySx = {
  border: '1px solid #E8D5A3',
  bgcolor: '#C9A84C',
  color: '#07111B',
  boxShadow: '0 18px 36px rgba(201,168,76,0.24)',
  '&:hover': {
    bgcolor: '#E8D5A3',
    borderColor: '#E8D5A3',
    boxShadow: '0 24px 42px rgba(201,168,76,0.3)',
  },
};

const secondarySx = {
  border: '1px solid #C9A84C',
  bgcolor: 'rgba(7,17,27,0.28)',
  color: '#E8D5A3',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
  '&:hover': {
    bgcolor: 'rgba(201,168,76,0.08)',
    borderColor: '#E8D5A3',
    boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
  },
};

export default function HeroButton({ primary = false, children, sx, className, ...props }) {
  return (
    <Button
      {...props}
      className={`${css.base}${className ? ` ${className}` : ''}`}
      sx={{ ...(primary ? primarySx : secondarySx), ...sx }}
    >
      {children}
    </Button>
  );
}
