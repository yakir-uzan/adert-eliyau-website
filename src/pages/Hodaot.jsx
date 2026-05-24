import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { useTenant } from '../config/TenantContext';
import { getSiteTypeConfig } from '../config/siteTypes';
import { LOCAL_TENANT_UPDATED_EVENT, isLocalDevHost, readLocalHodaot } from '../utils/localTenantAccess';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import PushPinIcon from '@mui/icons-material/PushPin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageHero from '../components/PageHero';
import GoldDivider from '../components/GoldDivider';
import css from './Hodaot.module.css';

function fmt(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function HodaaCard({ h }) {
  return (
    <Card
      sx={{
        borderInlineStart: h.pinned ? '3px solid' : '3px solid transparent',
        borderInlineStartColor: h.pinned ? 'primary.main' : 'transparent',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 24px rgba(201,168,76,0.12)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {h.pinned ? (
            <Chip
              label="מוצמד" size="small"
              icon={<PushPinIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{ bgcolor: 'rgba(201,168,76,0.12)', color: 'primary.main', fontWeight: 600, border: '1px solid rgba(201,168,76,0.25)' }}
            />
          ) : <Box />}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.8rem', color: 'primary.main', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ color: 'primary.main', opacity: 0.8, fontWeight: 600 }}>
              {fmt(h.date)}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(201,168,76,0.1)', mb: 1.5 }} />
        <Typography variant="h6" sx={{ fontFamily: '"Secular One", serif', color: 'secondary.main', fontSize: '1.15rem', mb: 1.2, lineHeight: 1.4 }}>
          {h.title}
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', color: 'text.primary', fontFamily: '"Assistant", sans-serif', fontSize: '0.97rem' }}>
          {h.body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Hodaot() {
  const { config, slug } = useTenant();
  const pageCopy = getSiteTypeConfig(config.siteType).pages.announcements;
  const [items, setItems]     = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchItems(after = null) {
    setLoading(true);
    if (isLocalDevHost()) {
      const items = readLocalHodaot(slug)
        .filter(item => item.active !== false)
        .sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return Number(b.pinned) - Number(a.pinned);
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
      setItems(items);
      setHasMore(false);
      setLastDoc(null);
      setLoading(false);
      return;
    }

    const PAGE = 10;
    const constraints = [
      where('active', '==', true),
      where('tenantId', '==', slug),
      orderBy('pinned', 'desc'),
      orderBy('date', 'desc'),
      limit(PAGE),
    ];
    let q = after
      ? query(collection(db, 'hodaot'), ...constraints.slice(0, -1), startAfter(after), limit(PAGE))
      : query(collection(db, 'hodaot'), ...constraints);
    try {
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(prev => after ? [...prev, ...docs] : docs);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE);
      }
    } catch { /* no data */ }
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, [slug]);

  useEffect(() => {
    const handleLocalUpdate = (event) => {
      if (event.detail?.slug !== slug || event.detail?.type !== 'hodaot') return;
      fetchItems();
    };

    window.addEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
    return () => window.removeEventListener(LOCAL_TENANT_UPDATED_EVENT, handleLocalUpdate);
  }, [slug]);

  return (
    <Box>
      <PageHero title={pageCopy.title} subtitle="" />
      <Box sx={{ py: 7 }}>
        <Container maxWidth="sm">
          <GoldDivider />
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.length === 0 && !loading && (
              <Typography color="text.secondary" textAlign="center">{pageCopy.emptyText}</Typography>
            )}
            {items.map(h => <HodaaCard key={h.id} h={h} />)}
          </Box>
          {hasMore && (
            <Box textAlign="center" mt={3}>
              <Button variant="outlined" onClick={() => fetchItems(lastDoc)} disabled={loading}>
                {loading ? 'טוען...' : `טען עוד ${pageCopy.title}`}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
