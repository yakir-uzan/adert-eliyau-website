import { createTheme } from '@mui/material/styles';
import { hexToRgba, encodeSvgColor } from './colorUtils';

export default function createTenantTheme(themeConfig = {}) {
  const primary   = themeConfig.primaryColor || '#C9A84C';
  const primaryLt = themeConfig.primaryLight || '#E8D5A3';
  const bgDefault = themeConfig.bgDefault    || '#0D1B2A';
  const bgPaper   = themeConfig.bgPaper      || '#1A2940';
  const textPri   = '#F5F0E8';
  const textSec   = '#A89F94';

  return createTheme({
    direction: 'rtl',
    palette: {
      mode: 'dark',
      primary:    { main: primary, light: primaryLt, contrastText: bgDefault },
      secondary:  { main: primaryLt },
      background: { default: bgDefault, paper: bgPaper },
      text:       { primary: textPri, secondary: textSec },
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpolygon points='30,5 35,20 50,20 38,29 43,44 30,35 17,44 22,29 10,20 25,20' fill='none' stroke='${encodeSvgColor(primary)}' stroke-width='0.4' opacity='0.05'/%3E%3C/svg%3E")`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, fontSize: '1rem', borderRadius: 8 },
          containedPrimary: {
            background: primary,
            color: bgDefault,
            '&:hover': { background: primaryLt, boxShadow: `0 6px 20px ${hexToRgba(primary, 0.4)}` },
          },
          outlinedPrimary: {
            borderColor: primary,
            color: primary,
            '&:hover': { background: hexToRgba(primary, 0.1), borderColor: primaryLt },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: 'transparent',
            border: `1px solid ${hexToRgba(primary, 0.2)}`,
            transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
            '&:hover': {
              borderColor: primary,
              boxShadow: `0 0 28px ${hexToRgba(primary, 0.15)}`,
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
          paper: { background: bgPaper, borderColor: hexToRgba(primary, 0.2) },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: hexToRgba(primary, 0.3) },
              '&:hover fieldset': { borderColor: primary },
              '&.Mui-focused fieldset': { borderColor: primary },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { color: textSec, fontWeight: 700, fontSize: '0.82rem' },
          root: { borderColor: hexToRgba(primary, 0.08) },
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
          root: { borderColor: hexToRgba(primary, 0.2) },
        },
      },
    },
  });
}
