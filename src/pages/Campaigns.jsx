import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import CreditCardDialog from '../components/CreditCardDialog';
import { useTenant } from '../config/TenantContext';
import { getSiteTypeConfig } from '../config/siteTypes';
import { fmtMoney } from '../utils/formatters';

function pct(value, goal) {
  if (!goal) return 0;
  return Math.min(100, Math.round(((Number(value) || 0) / Number(goal)) * 100));
}

function CopyButton({ value, label = 'העתק' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };
  return (
    <Tooltip title={copied ? 'הועתק' : label}>
      <IconButton onClick={copy} sx={{ color: copied ? '#4ade80' : 'primary.main' }}>
        {copied ? <CheckIcon /> : <ContentCopyIcon />}
      </IconButton>
    </Tooltip>
  );
}

function DonationDialog({ campaign, raiser, onClose }) {
  const [amount, setAmount] = useState(campaign?.levels?.[0]?.amount || '');
  const [creditOpen, setCreditOpen] = useState(false);
  if (!campaign) return null;

  const description = raiser
    ? `${campaign.title} - דרך ${raiser.name}`
    : campaign.title;

  return (
    <>
      <Dialog open={!!campaign} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#101A25', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          תרומה לקמפיין
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Typography variant="h5" sx={{ color: 'primary.main', mb: 0.5 }}>{campaign.title}</Typography>
          {raiser && <Typography color="text.secondary" sx={{ mb: 2 }}>התרומה תשויך אל: {raiser.name}</Typography>}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(campaign.levels || []).map(level => (
              <Button
                key={`${level.label}-${level.amount}`}
                variant={Number(amount) === Number(level.amount) ? 'contained' : 'outlined'}
                onClick={() => setAmount(level.amount)}
                sx={{ minWidth: 112 }}
              >
                {level.label || fmtMoney(level.amount)}
              </Button>
            ))}
          </Box>

          <TextField
            label="סכום אחר"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
            inputProps={{ min: 1, dir: 'ltr' }}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!Number(amount)}
            startIcon={<VolunteerActivismIcon />}
            onClick={() => setCreditOpen(true)}
          >
            המשך לתשלום מאובטח
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 1.5 }}>
            בשלב הבא התשלום יעבור דרך תשתית האשראי המוגדרת באתר.
          </Typography>
        </DialogContent>
      </Dialog>

      <CreditCardDialog
        open={creditOpen}
        onClose={() => setCreditOpen(false)}
        amount={Number(amount) || 0}
        description={description}
        paymentMetadata={{
          purpose: 'campaign_donation',
          campaignId: campaign.id,
          raiserSlug: raiser?.slug || '',
        }}
        onSuccess={() => {
          setCreditOpen(false);
        }}
      />
    </>
  );
}

function CampaignCard({ campaign, personalRaiser, copy }) {
  const { basePath } = useTenant();
  const [donation, setDonation] = useState(null);
  const raised = Number(campaign.raised) || 0;
  const goal = Number(campaign.goal) || 0;
  const multiplier = Number(campaign.matchMultiplier) || 1;
  const displayRaised = raised * multiplier;
  const progress = pct(displayRaised, goal);
  const shareUrl = `${window.location.origin}${basePath}/campaigns/${campaign.id}`;

  return (
    <Card sx={{ overflow: 'hidden', borderColor: 'rgba(201,168,76,0.22)' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ color: 'primary.main', fontSize: { xs: '2rem', md: '3rem' }, mb: 1 }}>
              {campaign.title}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.9, maxWidth: 680 }}>
              {campaign.description}
            </Typography>
          </Box>
          {multiplier > 1 && (
            <Chip
              icon={<EmojiEventsIcon />}
              label={`כל תרומה מוכפלת פי ${multiplier}`}
              sx={{ color: 'primary.main', borderColor: 'rgba(201,168,76,0.35)', bgcolor: 'rgba(201,168,76,0.08)', fontWeight: 800 }}
              variant="outlined"
            />
          )}
        </Box>

        {personalRaiser && (
          <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 800 }}>הגעתם דרך {personalRaiser.name}</Typography>
            {personalRaiser.message && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{personalRaiser.message}</Typography>}
          </Box>
        )}

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">{copy.raisedLabel}</Typography>
            <Typography sx={{ color: 'secondary.main', fontWeight: 900, fontSize: '1.55rem' }}>{fmtMoney(raised)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">{copy.matchedLabel}</Typography>
            <Typography sx={{ color: 'primary.main', fontWeight: 900, fontSize: '1.55rem' }}>{fmtMoney(displayRaised)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">{copy.goalLabel}</Typography>
            <Typography sx={{ color: 'secondary.main', fontWeight: 900, fontSize: '1.55rem' }}>{fmtMoney(goal)}</Typography>
          </Grid>
        </Grid>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 14,
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              background: 'linear-gradient(90deg, #C9A84C, #E8D5A3)',
            },
          }}
        />
        <Typography textAlign="left" sx={{ color: 'primary.main', fontWeight: 800, mt: 0.8 }}>{progress}%</Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
          <Button variant="contained" size="large" startIcon={<VolunteerActivismIcon />} onClick={() => setDonation({ campaign, raiser: personalRaiser })}>
            {copy.donateLabel}
          </Button>
          <Button variant="outlined" size="large" startIcon={<ShareIcon />} href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener">
            {copy.shareLabel}
          </Button>
          <CopyButton value={shareUrl} label="העתקת קישור קמפיין" />
        </Box>
      </CardContent>

      <DonationDialog campaign={donation?.campaign} raiser={donation?.raiser} onClose={() => setDonation(null)} />
    </Card>
  );
}

function RaiserCard({ campaign, raiser, copy }) {
  const { basePath } = useTenant();
  const [donation, setDonation] = useState(null);
  const link = `${window.location.origin}${basePath}/campaigns/${campaign.id}/${raiser.slug}`;
  const raised = Number(raiser.raised) || 0;
  const goal = Number(raiser.goal) || 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon sx={{ color: 'primary.main' }} />
          <Typography sx={{ color: 'secondary.main', fontWeight: 900 }}>{raiser.name}</Typography>
        </Box>
        {raiser.message && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{raiser.message}</Typography>}
        <Box>
          <Typography variant="caption" color="text.secondary">{fmtMoney(raised)} מתוך {fmtMoney(goal)}</Typography>
          <LinearProgress variant="determinate" value={pct(raised, goal)} sx={{ mt: 0.8, height: 8, borderRadius: 999 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button size="small" variant="outlined" onClick={() => setDonation({ campaign, raiser })}>תרומה דרכי</Button>
          <CopyButton value={link} label="העתקת קישור אישי" />
        </Box>
      </CardContent>
      <DonationDialog campaign={donation?.campaign} raiser={donation?.raiser} onClose={() => setDonation(null)} />
    </Card>
  );
}

export default function Campaigns() {
  const { config } = useTenant();
  const { campaignId, raiserSlug } = useParams();
  const siteTypeConfig = getSiteTypeConfig(config.siteType);
  const copy = siteTypeConfig.pages.campaigns;
  const campaigns = (config.campaigns || []).filter(item => item.active !== false);

  const selectedCampaign = useMemo(() => {
    if (!campaignId) return campaigns[0];
    return campaigns.find(item => item.id === campaignId) || campaigns[0];
  }, [campaigns, campaignId]);

  const personalRaiser = selectedCampaign?.raisers?.find(item => item.slug === raiserSlug);

  return (
    <Box>
      <PageHero title={copy.title} subtitle={copy.subtitle} />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="lg">
          <GoldDivider />
          {!selectedCampaign ? (
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>{copy.emptyText}</Typography>
          ) : (
            <>
              <CampaignCard campaign={selectedCampaign} personalRaiser={personalRaiser} copy={copy} />

              {!!selectedCampaign.raisers?.length && (
                <Box sx={{ mt: 5 }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>{copy.raiserTitle}</Typography>
                  <Grid container spacing={2}>
                    {selectedCampaign.raisers.map(raiser => (
                      <Grid item xs={12} sm={6} md={4} key={raiser.id || raiser.slug}>
                        <RaiserCard campaign={selectedCampaign} raiser={raiser} copy={copy} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}
