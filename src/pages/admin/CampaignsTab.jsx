import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { db } from '../../firebase';
import { saveLocalTenantDraft } from '../../utils/localTenantAccess';
import { fmtMoney } from '../../utils/formatters';

const makeId = (prefix = 'campaign') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const slugify = value => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u0590-\u05ff]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  || makeId('raiser');

const emptyCampaign = () => ({
  id: makeId(),
  title: '',
  description: '',
  goal: 100000,
  raised: 0,
  matchMultiplier: 1,
  active: true,
  levels: [
    { label: 'שותף', amount: 180 },
    { label: 'תומך', amount: 360 },
    { label: 'מוביל', amount: 1000 },
  ],
  raisers: [],
});

const emptyRaiser = () => ({
  id: makeId('raiser'),
  name: '',
  slug: '',
  message: '',
  goal: 5000,
  raised: 0,
});

function CopyMiniButton({ value }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch {}
  };
  return (
    <IconButton size="small" onClick={copy} sx={{ color: 'primary.main' }}>
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  );
}

export default function CampaignsTab({ config, slug, basePath, onToast, localMode }) {
  const [items, setItems] = useState(config.campaigns?.length ? config.campaigns : [emptyCampaign()]);

  useEffect(() => {
    setItems(config.campaigns?.length ? config.campaigns : [emptyCampaign()]);
  }, [config.campaigns]);

  const updateCampaign = (campaignId, patch) => {
    setItems(prev => prev.map(item => item.id === campaignId ? { ...item, ...patch } : item));
  };

  const updateLevel = (campaignId, index, patch) => {
    setItems(prev => prev.map(item => item.id === campaignId
      ? { ...item, levels: item.levels.map((level, i) => i === index ? { ...level, ...patch } : level) }
      : item));
  };

  const updateRaiser = (campaignId, raiserId, patch) => {
    setItems(prev => prev.map(item => item.id === campaignId
      ? { ...item, raisers: item.raisers.map(raiser => raiser.id === raiserId ? { ...raiser, ...patch } : raiser) }
      : item));
  };

  const addCampaign = () => setItems(prev => [...prev, emptyCampaign()]);
  const removeCampaign = campaignId => setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== campaignId) : prev);
  const addLevel = campaignId => updateCampaign(campaignId, {
    levels: [...(items.find(item => item.id === campaignId)?.levels || []), { label: '', amount: 0 }],
  });
  const removeLevel = (campaignId, index) => {
    const item = items.find(x => x.id === campaignId);
    updateCampaign(campaignId, { levels: (item.levels || []).filter((_, i) => i !== index) });
  };
  const addRaiser = campaignId => {
    const item = items.find(x => x.id === campaignId);
    updateCampaign(campaignId, { raisers: [...(item.raisers || []), emptyRaiser()] });
  };
  const removeRaiser = (campaignId, raiserId) => {
    const item = items.find(x => x.id === campaignId);
    updateCampaign(campaignId, { raisers: (item.raisers || []).filter(raiser => raiser.id !== raiserId) });
  };

  const save = async () => {
    const clean = items.map(campaign => ({
      ...campaign,
      title: campaign.title.trim() || 'קמפיין התרמה',
      description: campaign.description.trim(),
      goal: Number(campaign.goal) || 0,
      raised: Number(campaign.raised) || 0,
      matchMultiplier: Number(campaign.matchMultiplier) || 1,
      levels: (campaign.levels || [])
        .map(level => ({ label: level.label.trim(), amount: Number(level.amount) || 0 }))
        .filter(level => level.amount > 0),
      raisers: (campaign.raisers || [])
        .map(raiser => ({
          ...raiser,
          name: raiser.name.trim(),
          slug: slugify(raiser.slug || raiser.name),
          message: raiser.message.trim(),
          goal: Number(raiser.goal) || 0,
          raised: Number(raiser.raised) || 0,
        }))
        .filter(raiser => raiser.name),
    }));

    try {
      if (localMode) {
        saveLocalTenantDraft(slug, { ...config, campaigns: clean });
      } else {
        await setDoc(doc(db, 'tenants', slug), { campaigns: clean }, { merge: true });
      }
      setItems(clean);
      onToast('הקמפיינים נשמרו בהצלחה');
    } catch {
      onToast('שגיאה בשמירת הקמפיינים', 'error');
    }
  };

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        צרו קמפיין התרמה עם יעד, סכומי תרומה מומלצים ומתרימים שמקבלים קישור אישי לשיתוף.
      </Typography>

      {items.map(campaign => {
        const campaignUrl = `${window.location.origin}${basePath}/campaigns/${campaign.id}`;
        return (
          <Card key={campaign.id} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>{campaign.title || 'קמפיין חדש'}</Typography>
                <IconButton onClick={() => removeCampaign(campaign.id)} disabled={items.length === 1} sx={{ color: 'error.main' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField label="שם הקמפיין" value={campaign.title} onChange={e => updateCampaign(campaign.id, { title: e.target.value })} fullWidth />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={<Switch checked={campaign.active !== false} onChange={e => updateCampaign(campaign.id, { active: e.target.checked })} />}
                    label="פעיל"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="תיאור הקמפיין" value={campaign.description} onChange={e => updateCampaign(campaign.id, { description: e.target.value })} fullWidth multiline rows={3} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="יעד הקמפיין" type="number" value={campaign.goal} onChange={e => updateCampaign(campaign.id, { goal: e.target.value })} fullWidth inputProps={{ dir: 'ltr', min: 0 }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="נאסף עד עכשיו" type="number" value={campaign.raised} onChange={e => updateCampaign(campaign.id, { raised: e.target.value })} fullWidth inputProps={{ dir: 'ltr', min: 0 }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="מכפיל תרומה" type="number" value={campaign.matchMultiplier} onChange={e => updateCampaign(campaign.id, { matchMultiplier: e.target.value })} fullWidth inputProps={{ dir: 'ltr', min: 1, step: 0.5 }} />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(201,168,76,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ direction: 'ltr', overflowWrap: 'anywhere' }}>{campaignUrl}</Typography>
                <CopyMiniButton value={campaignUrl} />
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(201,168,76,0.12)' }} />

              <Typography sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>סכומי תרומה מומלצים</Typography>
              <Grid container spacing={1.5}>
                {(campaign.levels || []).map((level, index) => (
                  <Grid item xs={12} sm={4} key={`${campaign.id}-level-${index}`}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField label="שם" value={level.label} onChange={e => updateLevel(campaign.id, index, { label: e.target.value })} fullWidth />
                      <TextField label="סכום" type="number" value={level.amount} onChange={e => updateLevel(campaign.id, index, { amount: e.target.value })} sx={{ width: 120 }} inputProps={{ dir: 'ltr' }} />
                      <IconButton onClick={() => removeLevel(campaign.id, index)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button startIcon={<AddIcon />} onClick={() => addLevel(campaign.id)} sx={{ mt: 1 }}>הוסף סכום</Button>

              <Divider sx={{ my: 3, borderColor: 'rgba(201,168,76,0.12)' }} />

              <Typography sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>מתרימים וקישורים אישיים</Typography>
              {(campaign.raisers || []).map(raiser => {
                const personalUrl = `${campaignUrl}/${raiser.slug || slugify(raiser.name)}`;
                return (
                  <Card key={raiser.id} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.025)' }}>
                    <CardContent>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField label="שם מתרים" value={raiser.name} onChange={e => updateRaiser(campaign.id, raiser.id, { name: e.target.value, slug: raiser.slug || slugify(e.target.value) })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField label="כתובת אישית" value={raiser.slug} onChange={e => updateRaiser(campaign.id, raiser.id, { slug: slugify(e.target.value) })} fullWidth inputProps={{ dir: 'ltr' }} />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField label="יעד" type="number" value={raiser.goal} onChange={e => updateRaiser(campaign.id, raiser.id, { goal: e.target.value })} fullWidth inputProps={{ dir: 'ltr' }} />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField label="נאסף" type="number" value={raiser.raised} onChange={e => updateRaiser(campaign.id, raiser.id, { raised: e.target.value })} fullWidth inputProps={{ dir: 'ltr' }} helperText={fmtMoney(raiser.raised)} />
                        </Grid>
                        <Grid item xs={10} sm={2}>
                          <TextField label="מסר אישי" value={raiser.message} onChange={e => updateRaiser(campaign.id, raiser.id, { message: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={2} sm={1}>
                          <IconButton onClick={() => removeRaiser(campaign.id, raiser.id)} sx={{ color: 'error.main' }}><DeleteIcon /></IconButton>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.18)', borderRadius: 1.5, px: 1.5, py: 0.8 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ direction: 'ltr', overflowWrap: 'anywhere', flex: 1 }}>{personalUrl}</Typography>
                            <CopyMiniButton value={personalUrl} />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
              <Button startIcon={<AddIcon />} onClick={() => addRaiser(campaign.id)} sx={{ mt: 1 }}>הוסף מתרים</Button>
            </CardContent>
          </Card>
        );
      })}

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addCampaign}>הוסף קמפיין</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>שמור קמפיינים</Button>
      </Box>
    </Box>
  );
}
