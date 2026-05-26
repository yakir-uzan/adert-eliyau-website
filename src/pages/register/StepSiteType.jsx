import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PLATFORM_COLORS as COLORS } from '../../utils/constants';
import { SITE_TYPE_OPTIONS } from '../../config/siteTypes';
import { SectionTitle } from './registerComponents';

export default function StepSiteType({ value, update }) {
  return (
    <Box>
      <SectionTitle description="בחרו את סוג האתר.">
        איזה אתר תרצו ליצור?
      </SectionTitle>

      <Box
        dir="rtl"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: { xs: 1.1, sm: 1.4 },
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        {SITE_TYPE_OPTIONS.map(({ id, label, Icon }) => {
          const selected = value === id;
          return (
            <Card
              key={id}
              sx={{
                bgcolor: selected ? 'rgba(201,168,76,0.12)' : 'rgba(16,26,37,0.78)',
                border: '1px solid',
                borderColor: selected ? COLORS.gold : COLORS.border,
                boxShadow: selected ? '0 10px 28px rgba(201,168,76,0.14)' : 'none',
                transition: 'all 0.22s ease',
                borderRadius: 2,
              }}
            >
              <CardActionArea
                onClick={() => update('siteType', id)}
                sx={{
                  p: { xs: 1.35, sm: 1.6 },
                  minHeight: { xs: 70, sm: 72 },
                  position: 'relative',
                  direction: 'rtl',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1.2,
                  textAlign: 'right',
                }}
              >
                {selected && (
                  <CheckCircleIcon
                    sx={{ position: 'absolute', top: 8, left: 8, color: COLORS.goldLight, fontSize: 19 }}
                  />
                )}
                <Icon sx={{ color: COLORS.gold, fontSize: { xs: 25, sm: 28 }, flexShrink: 0 }} />
                <Typography
                  sx={{
                    color: COLORS.ivory,
                    flex: '0 1 auto',
                    fontFamily: '"Assistant", sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: '0.92rem', sm: '1rem' },
                    lineHeight: 1.2,
                    textAlign: 'right',
                  }}
                >
                  {label}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
