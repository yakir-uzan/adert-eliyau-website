import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { formatPlanDate } from '../utils/tenantPlan';
import { hasLocalTenantOwnerAccess } from '../utils/localTenantAccess';
import css from './TrialBanner.module.css';

export default function TrialBanner({ slug, basePath, plan }) {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!plan?.isTrial) return null;

  const endDate = formatPlanDate(plan.trialEndsAt);
  const title = plan.isEndingSoon
    ? 'הניסיון מסתיים היום'
    : `האתר פעיל לניסיון עד ${endDate}`;
  const text = plan.isEndingSoon
    ? 'כדי להשאיר את האתר פעיל גם אחרי סוף היום, צריך להשלים תשלום.'
    : 'בזמן הניסיון אפשר לערוך, לבדוק ולשתף את האתר. כדי להמשיך אחרי התקופה, צריך להפעיל אותו.';
  const open = Boolean(anchorEl);
  const canManageSite = hasLocalTenantOwnerAccess(slug);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 14, sm: 20 },
          right: { xs: 14, sm: 20 },
          zIndex: 1400,
        }}
      >
        <Tooltip title="פרטי תקופת הניסיון">
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            className={`${css.fabButton}${plan.isEndingSoon ? ` ${css.fabPulse}` : ''}`}
            sx={{
              bgcolor: plan.isEndingSoon ? 'rgba(56,39,7,0.94)' : 'rgba(8,15,24,0.94)',
              color: 'primary.main',
              boxShadow: plan.isEndingSoon
                ? '0 10px 28px rgba(201,168,76,0.28)'
                : '0 10px 24px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: plan.isEndingSoon ? 'rgba(64,45,8,0.98)' : 'rgba(10,18,28,0.98)',
              },
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          className: css.popoverPaper,
          sx: {
            bgcolor: 'rgba(8,15,24,0.98)',
            color: '#F5F0E8',
            border: '1px solid rgba(201,168,76,0.22)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.42)',
          },
        }}
      >
        <Stack spacing={1.4} sx={{ direction: 'rtl' }}>
          <div className={css.statusHeader}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'primary.main' }}>
              מצב האתר
            </Typography>
            <LockOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </div>

          <Typography sx={{ fontWeight: 700, lineHeight: 1.5 }}>
            {title}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            {text}
          </Typography>

          <div className={css.infoGrid}>
            <div className={`${css.infoBox} ${css.infoBoxPrimary}`}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {plan.isEndingSoon ? 'מסתיים היום' : `נותרו ${plan.daysLeft} ימים לניסיון`}
              </Typography>
            </div>

            <div className={`${css.infoBox} ${css.infoBoxSecondary}`}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                אפשר להמשיך לערוך ולשתף את האתר עד סוף הניסיון
              </Typography>
            </div>
          </div>

          <Stack direction="row-reverse" spacing={1}>
            {canManageSite && (
              <Button
                component={Link}
                to={`${basePath}/admin`}
                variant="outlined"
                onClick={() => setAnchorEl(null)}
                sx={{ flex: 1 }}
              >
                ניהול האתר
              </Button>
            )}
            <Button
              component={Link}
              to={`${basePath}/activate`}
              variant="contained"
              onClick={() => setAnchorEl(null)}
              sx={{ flex: 1, mt: 0.5 }}
            >
              הפעלת האתר
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
