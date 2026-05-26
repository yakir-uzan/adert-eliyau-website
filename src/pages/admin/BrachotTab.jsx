import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { fmtMoney } from '../../utils/formatters';
import { getDefaultContentItems } from '../Brachot';
import { getSiteTypeConfig } from '../../config/siteTypes';
import { saveLocalTenantDraft } from '../../utils/localTenantAccess';
import { BRACHA_ICONS, BRACHA_ICON_LABELS } from './brachotConstants';
import ConfirmActionDialog from '../../components/ConfirmActionDialog';
import css from './BrachotTab.module.css';

export default function BrachotTab({ config, slug, onToast, localMode }) {
  const pageCopy = getSiteTypeConfig(config.siteType).pages.content;
  const fallbackItems = getDefaultContentItems(config.siteType);
  const [items, setItems] = useState(config.brachot?.length ? config.brachot : fallbackItems);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    tag: '',
    icon: 'key',
  });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setItems(config.brachot?.length ? config.brachot : fallbackItems);
  }, [config.brachot, config.siteType]);

  const update = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const saveItems = async (nextItems, toastMessage) => {
    try {
      if (localMode) {
        saveLocalTenantDraft(slug, { ...config, brachot: nextItems });
      } else {
        await setDoc(doc(db, 'tenants', slug), { brachot: nextItems }, { merge: true });
      }
      setItems(nextItems);
      onToast(toastMessage);
    } catch {
      onToast('שגיאה בשמירת הברכות', 'error');
    }
  };

  const resetForm = () => {
    setForm({ id: '', title: '', description: '', price: '', tag: '', icon: 'key' });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      onToast(`יש למלא ${pageCopy.itemNameLabel}, ${pageCopy.itemDescriptionLabel} ומחיר`, 'error');
      return;
    }

    const nextItem = {
      id: form.id || `bracha-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      tag: form.tag.trim() || null,
      icon: form.icon,
    };

    const nextItems = form.id
      ? items.map(item => item.id === form.id ? nextItem : item)
      : [...items, nextItem];

    await saveItems(nextItems, form.id ? 'הפריט עודכן' : 'הפריט נוסף');
    resetForm();
  };

  const edit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description,
      price: String(item.price || ''),
      tag: item.tag || '',
      icon: item.icon || 'key',
    });
  };

  const remove = async (id) => {
    await saveItems(items.filter(item => item.id !== id), 'הפריט נמחק');
    if (form.id === id) resetForm();
    setDeleteId(null);
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>{pageCopy.adminTitle}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label={pageCopy.itemNameLabel} value={form.title} onChange={update('title')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="מחיר" value={form.price} onChange={update('price')} type="number" fullWidth inputProps={{ min: 0, dir: 'ltr' }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>אייקון</InputLabel>
              <Select value={form.icon} onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))} label="אייקון">
                {BRACHA_ICONS.map(icon => (
                  <MenuItem key={icon} value={icon}>{BRACHA_ICON_LABELS[icon]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField label={pageCopy.itemDescriptionLabel} value={form.description} onChange={update('description')} fullWidth multiline rows={3} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="תג קטן (אופציונלי)" value={form.tag} onChange={update('tag')} fullWidth placeholder="פופולרי / מיוחד" />
          </Grid>
        </Grid>
        <div className={css.formActions}>
          <Button variant="contained" onClick={submit} startIcon={<SaveIcon />}>
            {form.id ? pageCopy.saveLabel : pageCopy.addLabel}
          </Button>
          {form.id && (
            <Button variant="outlined" onClick={resetForm}>
              ביטול עריכה
            </Button>
          )}
        </div>
      </Card>

      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>{pageCopy.activeTitle}</Typography>
      {items.map(item => (
        <Card key={item.id} sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: '14px !important' }}>
            <div className={css.cardRow}>
              <div className={css.cardBody}>
                <Typography fontWeight={700} color="secondary.main">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{item.description}</Typography>
                <div className={css.tagsRow}>
                  <Chip size="small" label={fmtMoney(item.price)} className={css.priceChip} sx={{ color: 'primary.main' }} />
                  {item.tag && <Chip size="small" label={item.tag} variant="outlined" />}
                </div>
              </div>
              <div className={css.cardActions}>
                <IconButton size="small" onClick={() => edit(item)} sx={{ color: 'primary.main' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="מחיקת פריט" size="small" onClick={() => setDeleteId(item.id)} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmActionDialog
        open={!!deleteId}
        title="מחיקת פריט"
        message="הפעולה תמחק את הפריט מהרשימה. להמשיך?"
        confirmLabel="מחק"
        onClose={() => setDeleteId(null)}
        onConfirm={() => remove(deleteId)}
      />
    </Box>
  );
}
