import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import css from './ProgressSteps.module.css';

export default function ProgressSteps({ steps, activeStep }) {
  return (
    <div className={css.stepsContainer}>
      {steps.map((item, index) => {
        const completed = index < activeStep;
        const active = index === activeStep;
        const isLast = index === steps.length - 1;

        return (
          <Fragment key={item.label}>
            <div className={css.stepItem}>
              <div className={css.stepCircleWrap}>
                <Box
                  className={css.stepCircle}
                  sx={{
                    bgcolor: completed || active ? COLORS.gold : 'rgba(201,168,76,0.1)',
                    border: `1px solid ${completed || active ? COLORS.goldLight : 'rgba(201,168,76,0.12)'}`,
                    color: completed || active ? COLORS.bg : COLORS.muted,
                    boxShadow: active ? '0 0 0 6px rgba(201,168,76,0.08)' : 'none',
                  }}
                >
                  {completed ? <CheckIcon sx={{ fontSize: 17 }} /> : (
                    <div className={css.stepIconWrap}>{item.icon}</div>
                  )}
                </Box>
              </div>

              <Typography
                className={css.stepLabel}
                sx={{ color: completed || active ? COLORS.ivory : 'rgba(183,173,160,0.62)' }}
              >
                {item.label}
              </Typography>
            </div>

            {!isLast && (
              <div className={`${css.connector} ${completed ? css.connectorCompleted : css.connectorIncomplete}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
