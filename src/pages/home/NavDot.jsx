import Box from '@mui/material/Box';
import css from './NavDot.module.css';

export default function NavDot({ active, onClick }) {
  return (
    <Box
      onClick={onClick}
      className={css.dot}
      sx={{
        width: active ? 10 : 7,
        height: active ? 10 : 7,
        bgcolor: active ? 'primary.main' : 'rgba(201,168,76,0.28)',
        border: active ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.2)',
        boxShadow: active ? '0 0 10px rgba(201,168,76,0.5)' : 'none',
        '&:hover': { bgcolor: 'primary.light' },
      }}
    />
  );
}
