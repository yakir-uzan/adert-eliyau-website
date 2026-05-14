import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary:    { main: '#C9A84C', contrastText: '#0D1B2A' },
    secondary:  { main: '#E8D5A3' },
    background: { default: '#0D1B2A', paper: '#1A2940' },
    text:       { primary: '#F5F0E8', secondary: '#A89F94' },
    success:    { main: '#4ade80' },
    error:      { main: '#f87171' },
  },
  typography: {
    fontFamily: '"Assistant", "Noto Sans Hebrew", sans-serif',
    h1: { fontFamily: '"Secular One", "Assistant", sans-serif', lineHeight: 1.25 },
    h2: { fontFamily: '"Secular One", "Assistant", sans-serif', lineHeight: 1.3 },
    h3: { fontFamily: '"Secular One", "Assistant", sans-serif', lineHeight: 1.3 },
    h4: { fontFamily: '"Secular One", "Assistant", sans-serif' },
    button: { fontFamily: '"Assistant", "Noto Sans Hebrew", sans-serif', fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpolygon points='30,5 35,20 50,20 38,29 43,44 30,35 17,44 22,29 10,20 25,20' fill='none' stroke='%23C9A84C' stroke-width='0.4' opacity='0.05'/%3E%3C/svg%3E")`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, fontSize: '1rem', borderRadius: 8 },
        containedPrimary: {
          background: '#C9A84C',
          color: '#0D1B2A',
          '&:hover': { background: '#E8D5A3', boxShadow: '0 6px 20px rgba(201,168,76,0.4)' },
        },
        outlinedPrimary: {
          borderColor: '#C9A84C',
          color: '#C9A84C',
          '&:hover': { background: 'rgba(201,168,76,0.1)', borderColor: '#E8D5A3' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#1A2940',
          border: '1px solid rgba(201,168,76,0.2)',
          transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
          '&:hover': {
            borderColor: '#C9A84C',
            boxShadow: '0 0 28px rgba(201,168,76,0.15)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none', boxShadow: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#1A2940', borderColor: 'rgba(201,168,76,0.2)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(201,168,76,0.3)' },
            '&:hover fieldset': { borderColor: '#C9A84C' },
            '&.Mui-focused fieldset': { borderColor: '#C9A84C' },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { color: '#A89F94', fontWeight: 700, fontSize: '0.82rem' },
        root: { borderColor: 'rgba(201,168,76,0.08)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Assistant", sans-serif', fontWeight: 700 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Assistant", sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          minHeight: 56,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(201,168,76,0.2)' },
      },
    },
  },
});

export default theme;
