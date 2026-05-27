import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { readLocalZmanim, saveLocalZmanim } from '../../utils/localTenantAccess';
import { getSiteTypeConfig } from '../../config/siteTypes';
import css from './ZmanimTab.module.css';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emptySection = () => ({ id: createId(), title: '', rows: [{ id: createId(), label: '', time: '' }] });
const withIds = sections => sections.map(section => ({
  id: section.id || createId(),
  title: section.title || '',
  rows: (section.rows?.length ? section.rows : [{ label: '', time: '' }]).map(row => ({
    id: row.id || createId(),
    label: row.label || '',
    time: row.time || '',
  })),
}));

function legacyToSections(data = {}, defaults = []) {
  if (Array.isArray(data.sections)) return data.sections.length ? withIds(data.sections) : withIds(defaults.length ? defaults : [emptySection()]);
  return withIds(defaults.length ? defaults : [emptySection()]);
}

function TimeField({ value, onChange }) {
  return (
    <TextField
      label="שעה"
      value={value}
      onChange={e => onChange(e.target.value)}
      fullWidth
      placeholder="לדוגמה: 06:15"
      inputProps={{ dir: 'ltr', style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 } }}
    />
  );
}

export default function ZmanimTab({ config, onToast, slug, localMode }) {
  const pageCopy = getSiteTypeConfig(config.siteType).pages.schedule;
  const [sections, setSections] = useState(() => [emptySection()]);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localMode) {
      const localData = readLocalZmanim(slug);
      setSections(legacyToSections(localData || {}, pageCopy.defaultSections));
      setNote(localData?.note || '');
      return;
    }

    getDoc(doc(db, 'zmanim', slug)).then(s => {
      if (s.exists()) {
        const d = s.data();
        setSections(legacyToSections(d, pageCopy.defaultSections));
        setNote(d.note || '');
      } else {
        setSections(legacyToSections({}, pageCopy.defaultSections));
        setNote('');
      }
    }).catch(() => {});
  }, [slug, localMode, config.siteType]);

  const updateSection = (sectionId, patch) => {
    setSections(prev => prev.map(section => section.id === sectionId ? { ...section, ...patch } : section));
  };

  const updateRow = (sectionId, rowId, patch) => {
    setSections(prev => prev.map(section => (
      section.id === sectionId
        ? { ...section, rows: section.rows.map(row => row.id === rowId ? { ...row, ...patch } : row) }
        : section
    )));
  };

  const addSection = () => setSections(prev => [...prev, emptySection()]);
  const removeSection = (sectionId) => setSections(prev => prev.length > 1 ? prev.filter(section => section.id !== sectionId) : prev);
  const addRow = (sectionId) => {
    setSections(prev => prev.map(section => (
      section.id === sectionId
        ? { ...section, rows: [...section.rows, { id: createId(), label: '', time: '' }] }
        : section
    )));
  };
  const removeRow = (sectionId, rowId) => {
    setSections(prev => prev.map(section => (
      section.id === sectionId
        ? { ...section, rows: section.rows.length > 1 ? section.rows.filter(row => row.id !== rowId) : section.rows }
        : section
    )));
  };

  const cleanSections = sections
    .map(section => ({
      ...section,
      title: section.title.trim(),
      rows: section.rows
        .map(row => ({ ...row, label: row.label.trim(), time: row.time.trim() }))
        .filter(row => row.label || row.time),
    }))
    .filter(section => section.title || section.rows.length > 0);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { sections: cleanSections, note, last_updated: localMode ? new Date().toISOString() : serverTimestamp() };
      if (localMode) {
        saveLocalZmanim(slug, payload);
        onToast(pageCopy.savedMessage);
        setSaving(false);
        return;
      }

      await setDoc(doc(db, 'zmanim', slug), payload, { merge: true });
      onToast(pageCopy.savedMessage);
    } catch { onToast('שגיאה בשמירה', 'error'); }
    setSaving(false);
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>{pageCopy.adminTitle}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section, sectionIndex) => (
            <Box key={section.id} className={css.sectionBox}>
              <div className={css.sectionHeader}>
                <TextField
                  label="כותרת"
                  value={section.title}
                  onChange={e => updateSection(section.id, { title: e.target.value })}
                  fullWidth
                  placeholder={pageCopy.sectionPlaceholder}
                />
                <IconButton onClick={() => removeSection(section.id)} disabled={sections.length === 1} sx={{ color: 'error.main' }}>
                  <DeleteIcon />
                </IconButton>
              </div>
              <Grid container spacing={1.5}>
                {section.rows.map((row) => (
                  <Grid item xs={12} key={row.id}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={pageCopy.rowLabel}
                          value={row.label}
                          onChange={e => updateRow(section.id, row.id, { label: e.target.value })}
                          fullWidth
                          placeholder={pageCopy.rowPlaceholder}
                        />
                      </Grid>
                      <Grid item xs={8} sm={4}>
                        <TimeField value={row.time} onChange={value => updateRow(section.id, row.id, { time: value })} />
                      </Grid>
                      <Grid item xs={4} sm={2} sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton onClick={() => addRow(section.id)} sx={{ color: 'primary.main' }} title="הוסף שורה אחרי זו">
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => removeRow(section.id, row.id)} disabled={section.rows.length === 1} sx={{ color: 'error.main' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              <Button startIcon={<AddIcon />} onClick={() => addRow(section.id)} variant="outlined" size="small" sx={{ mt: 1.5, color: 'primary.main', borderColor: 'primary.main' }}>
                + הוסף תפילה / שיעור
              </Button>
            </Box>
          ))}
        </Box>
        <Button startIcon={<AddIcon />} onClick={addSection} variant="outlined" sx={{ mt: 2 }}>
          הוסף כותרת
        </Button>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField label="הערה כללית (אופציונלי)" value={note} onChange={e => setNote(e.target.value)} fullWidth multiline rows={2} placeholder='לדוגמה: "זמני החורף בתוקף מא׳ מרחשוון"' />
          </Grid>
        </Grid>
        <Box mt={2.5}>
          <Button variant="contained" size="large" onClick={save} disabled={saving} startIcon={saving ? null : <SaveIcon />} sx={{ px: 5 }}>
            {saving ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : pageCopy.saveLabel}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
