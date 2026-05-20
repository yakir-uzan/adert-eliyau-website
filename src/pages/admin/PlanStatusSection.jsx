import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatPlanDate, getTenantPlanState } from '../../utils/tenantPlan';
import { saveLocalTenantDraft } from '../../utils/localTenantAccess';
import css from './PlanStatusSection.module.css';

export default function PlanStatusSection({ config, slug, onToast, currentUser, isPlatformAdmin, localMode }) {
  const [planSaving, setPlanSaving] = useState(false);
  const plan = getTenantPlanState(config);
  const paymentStatus = config.paymentStatus || 'pending';
  const planStatusLabel = plan.isActive ? 'פעיל' : plan.isExpired ? 'מושהה' : 'ניסיון';
  const paymentStatusLabel = {
    pending: 'ממתין לתשלום',
    checkout_started: 'התשלום נפתח ב-Stripe',
    submitted: 'נשלחה בקשת הפעלה',
    paid: 'שולם',
    expired: 'סשן התשלום פג',
    failed: 'נכשל',
    refunded: 'זוכה',
  }[paymentStatus] || paymentStatus;

  const updatePlanState = async ({ nextPlanStatus, nextPaymentStatus, toastMessage }) => {
    setPlanSaving(true);
    try {
      if (localMode) {
        saveLocalTenantDraft(slug, {
          ...config,
          planStatus: nextPlanStatus,
          paymentStatus: nextPaymentStatus,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.uid || 'local-owner',
          reviewedByEmail: currentUser?.email || 'local@trial',
          ...(nextPlanStatus === 'active'
            ? { paidAt: new Date().toISOString(), activatedAt: new Date().toISOString() }
            : {}),
          ...(nextPlanStatus === 'suspended'
            ? { suspendedAt: new Date().toISOString() }
            : {}),
        });
        onToast(toastMessage);
        setPlanSaving(false);
        return;
      }

      const payload = {
        planStatus: nextPlanStatus,
        paymentStatus: nextPaymentStatus,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser?.uid || '',
        reviewedByEmail: currentUser?.email || '',
      };

      if (nextPlanStatus === 'active') {
        payload.paidAt = serverTimestamp();
        payload.activatedAt = serverTimestamp();
      }

      if (nextPlanStatus === 'suspended') {
        payload.suspendedAt = serverTimestamp();
      }

      await setDoc(doc(db, 'tenants', slug), payload, { merge: true });
      onToast(toastMessage);
    } catch {
      onToast('שגיאה בעדכון סטטוס האתר', 'error');
    }
    setPlanSaving(false);
  };

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>מצב האתר והמנוי</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <div className={css.statusBox}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>סטטוס אתר</Typography>
              <Chip
                label={planStatusLabel}
                sx={{
                  bgcolor: plan.isActive ? 'rgba(34,197,94,0.15)' : plan.isExpired ? 'rgba(239,68,68,0.15)' : 'rgba(201,168,76,0.15)',
                  color: plan.isActive ? '#4ade80' : plan.isExpired ? '#f87171' : 'primary.main',
                  fontWeight: 700,
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className={css.statusBox}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>סטטוס תשלום</Typography>
              <Typography sx={{ fontWeight: 700 }}>{paymentStatusLabel}</Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className={css.statusBox}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {plan.isActive ? 'האתר הופעל בתשלום' : 'תוקף הניסיון'}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {plan.trialEndsAt ? formatPlanDate(plan.trialEndsAt) : 'לא הוגדר'}
              </Typography>
            </div>
          </Grid>
        </Grid>

        <div className={css.actionsRow}>
          <Alert severity={plan.isExpired ? 'warning' : 'info'} sx={{ flex: 1, minWidth: 280 }}>
            {plan.isExpired
              ? 'האתר מושהה כרגע עד להשלמת תשלום והפעלה.'
              : plan.isActive
                ? 'האתר פעיל כרגע וממשיך להיות זמין לציבור.'
                : `האתר פעיל לניסיון${plan.trialEndsAt ? ` עד ${formatPlanDate(plan.trialEndsAt)}` : ''}.`}
          </Alert>
          <Button
            component={Link}
            to={`/${slug}/activate`}
            variant="outlined"
            startIcon={<OpenInNewIcon />}
          >
            מסך הפעלה ותשלום
          </Button>
        </div>
      </Card>

      {isPlatformAdmin && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', mb: 1.5 }}>כלי מנהל מערכת</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            הפעולות כאן זמינות רק למנהל הפלטפורמה, כדי לאפשר אישור ידני עד שנחבר סליקה אוטומטית.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              disabled={planSaving || (plan.isActive && paymentStatus === 'paid')}
              onClick={() => updatePlanState({
                nextPlanStatus: 'active',
                nextPaymentStatus: 'paid',
                toastMessage: 'האתר הופעל בהצלחה',
              })}
            >
              {planSaving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'אשר תשלום והפעל אתר'}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              disabled={planSaving || plan.isExpired}
              onClick={() => updatePlanState({
                nextPlanStatus: 'suspended',
                nextPaymentStatus: config.paymentStatus || 'pending',
                toastMessage: 'האתר הושהה',
              })}
            >
              השהה אתר
            </Button>
            <Button
              variant="text"
              disabled={planSaving || (config.planStatus === 'trial' && config.paymentStatus === 'pending')}
              onClick={() => updatePlanState({
                nextPlanStatus: 'trial',
                nextPaymentStatus: 'pending',
                toastMessage: 'האתר הוחזר למצב ניסיון',
              })}
            >
              החזר לניסיון
            </Button>
          </Box>
        </Card>
      )}
    </>
  );
}
