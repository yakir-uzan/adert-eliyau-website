import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PLATFORM_COLORS as COLORS } from '../utils/constants';
import { platformInputSx as inputSx } from '../utils/inputStyles';
import { cleanSlug } from '../utils/slugUtils';
import { DEFAULT_SITE_TYPE, SITE_TYPE_OPTIONS } from '../config/siteTypes';
import PlatformLayout, { PlatformPageHeader } from '../components/PlatformLayout';

export default function Login() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [siteType, setSiteType] = useState(DEFAULT_SITE_TYPE);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const clean = cleanSlug(slug);
    if (!clean) {
      setError('יש להזין את כתובת האתר');
      return;
    }
    navigate(`/${siteType}/${clean}/admin`);
  };

  return (
    <PlatformLayout>
      <Container maxWidth="sm" sx={{ pb: { xs: 2, md: 4 } }}>
        <PlatformPageHeader
          title="התחברות למנהלים"
          subtitle="בחרו את סוג האתר והזינו את הכתובת שבחרתם, ונעביר אתכם לממשק הניהול."
        />
        <Box
          sx={{
            p: { xs: 3.2, md: 5 },
            borderRadius: 4,
            bgcolor: 'rgba(16,26,37,0.86)',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 28px 70px rgba(0,0,0,0.28)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 62,
              height: 62,
              borderRadius: 3,
              mx: 'auto',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.gold,
              bgcolor: 'rgba(201,168,76,0.08)',
            }}
          >
            <LoginIcon sx={{ fontSize: 34 }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              select
              label="סוג האתר"
              value={siteType}
              onChange={(event) => setSiteType(event.target.value)}
              fullWidth
              sx={{ ...inputSx, mb: 2 }}
            >
              {SITE_TYPE_OPTIONS.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="כתובת האתר"
              placeholder="לדוגמה: beit-yaakov"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setError('');
              }}
              fullWidth
              sx={inputSx}
              error={!!error}
              helperText={error || 'הכתובת שמופיעה אחרי סוג האתר, לדוגמה: amuta/hasde-david'}
              inputProps={{ dir: 'ltr' }}
            />

            <Button
              type="submit"
              size="large"
              endIcon={<ArrowBackIcon />}
              sx={{
                mt: 3,
                width: '100%',
                bgcolor: COLORS.gold,
                color: COLORS.bg,
                fontWeight: 800,
                fontSize: '1.05rem',
                py: 1.55,
                borderRadius: 3,
                '&:hover': { bgcolor: COLORS.goldLight, transform: 'translateY(-1px)' },
                transition: 'all 0.22s ease',
              }}
            >
              כניסה לניהול
            </Button>
          </Box>
        </Box>
      </Container>
    </PlatformLayout>
  );
}
