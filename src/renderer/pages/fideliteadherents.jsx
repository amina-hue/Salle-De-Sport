import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Search, Star, TrendingUp, Users,
  Package, Calendar, Award, RefreshCw, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickActions from '../components/QuickActions';
import gym from '../../images/gym.png';
import gym2 from '../../images/gym2.png';

/* ─── Design Tokens ─── */
const C = {
  bg:           '#0b0c0e',
  bgCard:       '#13151a',
  bgCardHover:  '#181b22',
  bgInput:      'rgba(255,255,255,0.05)',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  accent:       '#e53935',
  accentDim:    'rgba(229,57,53,0.10)',
  accentBorder: 'rgba(229,57,53,0.28)',
  text:         '#f0f0f0',
  muted:        '#6b7280',
  subtle:       '#9ca3af',
  green:        '#22c55e',
  greenDim:     'rgba(34,197,94,0.12)',
  greenBorder:  'rgba(34,197,94,0.28)',
  gold:         '#f59e0b',
  goldDim:      'rgba(245,158,11,0.12)',
  goldBorder:   'rgba(245,158,11,0.28)',
  blue:         '#3b82f6',
  blueDim:      'rgba(59,130,246,0.12)',
  blueBorder:   'rgba(59,130,246,0.28)',
  purple:       '#8b5cf6',
  purpleDim:    'rgba(139,92,246,0.12)',
  purpleBorder: 'rgba(139,92,246,0.28)',
};

/* ─── Système de fidélité ─── */
const NIVEAUX = [
  { nom: 'Bronze',  min: 0,    max: 499,  color: '#cd7f32', dim: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.3)',  remise: 0,  achatsMois: 0, depenseMois: 0    },
  { nom: 'Silver',  min: 500,  max: 1499, color: '#9ca3af', dim: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.3)', remise: 5,  achatsMois: 2, depenseMois: 1500 },
  { nom: 'Gold',    min: 1500, max: 2999, color: '#f59e0b', dim: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  remise: 10, achatsMois: 3, depenseMois: 3000 },
  { nom: 'Platine', min: 3000, max: Infinity, color: '#8b5cf6', dim: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', remise: 15, achatsMois: 3, depenseMois: 5000 },
];

function getNiveau(points) {
  return NIVEAUX.find(n => points >= n.min && points <= n.max) || NIVEAUX[0];
}

function getPointsVersProchain(points) {
  const idx = NIVEAUX.findIndex(n => points >= n.min && points <= n.max);
  if (idx === NIVEAUX.length - 1) return null; // Platine = max
  return { prochain: NIVEAUX[idx + 1], manquants: NIVEAUX[idx + 1].min - points };
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmt(n) {
  return Number(n || 0).toLocaleString('fr-DZ');
}

function daysSince(d) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d)) / 86400000);
}

/* ─── Badge niveau ─── */
function NiveauBadge({ points, size = 'sm' }) {
  const n = getNiveau(points);
  const pad = size === 'lg' ? '6px 16px' : '3px 10px';
  const fs  = size === 'lg' ? '0.8rem'   : '0.65rem';
  return (
    <span style={{
      fontSize: fs, fontWeight: 800, padding: pad, borderRadius: 20,
      background: n.dim, color: n.color, border: `1px solid ${n.border}`,
      textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
    }}>
      ★ {n.nom}
    </span>
  );
}

/* ─── Barre de progression points ─── */
function ProgressBar({ points, niveau_expire, niveau }) {
  const n    = getNiveau(points);
  const info = getPointsVersProchain(points);

  const joursRestants = niveau_expire 
    ? Math.ceil((new Date(niveau_expire) - new Date()) / 86400000)
    : null;

  const expireColor = joursRestants !== null
    ? joursRestants <= 15 ? '#e53935'
    : joursRestants <= 30 ? '#f59e0b'
    : '#22c55e'
    : null;

  return (
    <div>
      {/* Barre progression vers prochain niveau */}
      {info ? (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.65rem', color: C.muted }}>
              {info.manquants} pts pour {info.prochain.nom}
            </span>
            <span style={{ fontSize: '0.65rem', color: n.color, fontWeight: 700 }}>
              {Math.round(Math.min(100, ((points - n.min) / (info.prochain.min - n.min)) * 100))}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, ((points - n.min) / (info.prochain.min - n.min)) * 100)}%`,
              background: n.color, borderRadius: 2, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.7rem', color: n.color, fontWeight: 700, marginBottom: 8 }}>
          Niveau maximum atteint ✓
        </div>
      )}

      {/* Expiration du niveau */}
      {joursRestants !== null && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 6,
          background: `${expireColor}15`,
          border: `1px solid ${expireColor}30`,
          marginTop: 4,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: expireColor, flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', color: expireColor, fontWeight: 700 }}>
            {joursRestants <= 0
              ? 'Niveau expiré — en cours de mise à jour'
              : joursRestants === 1
              ? 'Expire demain !'
              : `Niveau valable encore ${joursRestants} jours`}
          </span>
          {joursRestants <= 30 && joursRestants > 0 && (
            <span style={{ fontSize: '0.6rem', color: C.muted, marginLeft: 'auto' }}>
              Achetez pour renouveler
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      style={{
        flex: 1, background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '20px 22px', position: 'relative',
        overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = C.borderStrong; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={accent} />
        </div>
        <span style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 6 }}>{sub}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}60, transparent)` }} />
    </div>
  );
}

/* ─── Modal historique d'un adhérent ─── */
function HistoriqueModal({ adherent, onClose }) {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await window.api.getHistoriqueAchatsAdherent?.(adherent.idAdherent) ?? [];
        setHistorique(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adherent.idAdherent]);

  const niveau = getNiveau(adherent.points);
  const totalDepense = historique.reduce((s, h) => s + (h.quantite * (h.prix || 0)), 0);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 640, maxHeight: '85vh', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#161012', border: `1px solid ${C.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.9)', fontFamily: "'Barlow', sans-serif" }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: niveau.dim, border: `1px solid ${niveau.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  ★
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>
                    {adherent.nom} {adherent.prenom}
                  </div>
                  <NiveauBadge points={adherent.points} size="sm" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                {[
                  { label: 'Points',    value: `${adherent.points} pts`,     color: niveau.color },
                  { label: 'Remise',    value: `${niveau.remise}%`,           color: C.green   },
                  { label: 'Achats',    value: `${adherent.nb_achats}`,        color: C.blue    },
                  { label: 'Total dépensé', value: `${fmt(adherent.total_depense)} DZD`, color: C.muted },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.62rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>

          {/* Barre progression */}
          <div style={{ marginTop: 16 }}>
            <ProgressBar points={adherent.points} />
          </div>
        </div>

        {/* Historique liste */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px 24px' }}>
          <div style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 14 }}>
            Historique des achats
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: C.muted, padding: 40, fontSize: '0.85rem' }}>Chargement...</div>
          ) : historique.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.muted, padding: 40, fontSize: '0.85rem' }}>Aucun achat enregistré</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historique.map((h, i) => {
                const total  = h.quantite * (h.prix || 0);
                const pts    = Math.floor(total / 100);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px', borderRadius: 10,
                      background: C.bgCard, border: `1px solid ${C.border}`,
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderStrong}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={13} color={C.accent} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {h.produit_nom}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>
                        {fmtDate(h.date)} · Qté: {h.quantite}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 800, color: C.text }}>
                        {fmt(total)} <span style={{ color: C.accent, fontSize: '0.72rem' }}>DZD</span>
                      </div>
                      {pts > 0 && (
                        <div style={{ fontSize: '0.65rem', color: C.gold, fontWeight: 700, marginTop: 2 }}>
                          +{pts} pts
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
const FideliteAdherents = () => {
  const navigate = useNavigate();
  const [clients, setClients]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [niveauFilter, setNiveauFilter] = useState('');
  const [selected, setSelected]       = useState(null); // pour modal historique
  const [sortKey, setSortKey]         = useState('points');
  const [sortDir, setSortDir]         = useState(-1); // desc par défaut
  

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await window.api.getPointsFidelite?.() ?? [];
      setClients(data);
    } catch (e) {
      console.error('Erreur chargement fidélité:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ─── Filtres & tri ─── */
  const filtered = clients
    .filter(c => {
      const q = search.toLowerCase();
      const nom = `${c.nom} ${c.prenom}`.toLowerCase();
      const matchQ = !q || nom.includes(q);
      const matchN = !niveauFilter || getNiveau(c.points).nom === niveauFilter;
      return matchQ && matchN;
    })
.sort((a, b) => {
  if (sortKey === 'points' || sortKey === 'nb_achats' || sortKey === 'total_depense') {
    const va = Number(a[sortKey]) || 0;
    const vb = Number(b[sortKey]) || 0;
    return sortDir === -1 ? vb - va : va - vb;
  }
  if (sortKey === 'dernier_achat' || sortKey === 'niveau_expire') {
    const va = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
    const vb = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
    return sortDir === -1 ? vb - va : va - vb;
  }
  const va = String(a[sortKey] ?? '');
  const vb = String(b[sortKey] ?? '');
  return va.localeCompare(vb) * sortDir;
});

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(-1); }
  };

  /* ─── Stats globales ─── */
  const totalClients   = clients.filter(c => c.nb_achats > 0).length;
  const topClient      = clients[0];
  const clientsActifs  = clients.filter(c => {
    const j = daysSince(c.dernier_achat);
    return j !== null && j <= 30;
  }).length;
  const clientsInactifs = clients.filter(c => {
    const j = daysSince(c.dernier_achat);
    return j !== null && j > 60;
  }).length;

  /* ─── Comptage par niveau ─── */
  const countByNiveau = NIVEAUX.reduce((acc, n) => {
    acc[n.nom] = clients.filter(c => getNiveau(c.points).nom === n.nom).length;
    return acc;
  }, {});

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: C.muted, fontSize: 10, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: C.accent, fontSize: 10, marginLeft: 4 }}>{sortDir === -1 ? '↓' : '↑'}</span>;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      backgroundImage: `url(${gym2})`, backgroundSize: 'cover',
      backgroundPosition: 'center 35%', backgroundAttachment: 'fixed', position: 'relative',
    }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,15,17,0.62)', pointerEvents: 'none', zIndex: -1 }} />

      {/* ── Hero Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${gym})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,12,14,0.96) 0%, rgba(11,12,14,0.80) 55%, rgba(245,158,11,0.06) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: 'relative', padding: '36px 40px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: '0.68rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.68rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Magasin</span>
                            <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.68rem', color: C.gold, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Fidélité</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3.4rem', fontWeight: 800, letterSpacing: 2, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>
              Fidélité Clients
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { count: totalClients,    label: 'clients actifs',   color: C.green  },
                { count: clientsActifs,   label: 'actifs ce mois',   color: C.blue   },
                ...(clientsInactifs > 0 ? [{ count: clientsInactifs, label: 'inactifs 60j+', color: C.accent }] : []),
              ].map(({ count, label, color }, i, arr) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.82rem', color: C.muted }}>
                      <strong style={{ color, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700 }}>{count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <button
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bgCard, border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: '11px 20px', color: C.muted, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.muted; }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 48px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <StatCard icon={Users}    label="Clients fidèles"  value={totalClients}    sub="avec au moins 1 achat"        accent={C.green}  />
          <StatCard icon={Star}     label="Top client"       value={topClient ? `${topClient.points} pts` : '—'} sub={topClient ? `${topClient.nom} ${topClient.prenom}` : 'Aucun'} accent={C.gold} />
          <StatCard icon={TrendingUp} label="Actifs ce mois" value={clientsActifs}   sub="dernier achat ≤ 30 jours"     accent={C.blue}   />
          {clientsInactifs > 0 && (
            <StatCard icon={Calendar} label="Inactifs"       value={clientsInactifs} sub="aucun achat depuis 60j+"      accent={C.accent} />
          )}
        </div>

        {/* Niveaux overview */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {NIVEAUX.map(n => (
            <div
              key={n.nom}
              onClick={() => setNiveauFilter(niveauFilter === n.nom ? '' : n.nom)}
              style={{
                flex: 1, padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                background: niveauFilter === n.nom ? n.dim : C.bgCard,
                border: `1px solid ${niveauFilter === n.nom ? n.border : C.border}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = n.border}
              onMouseLeave={e => { if (niveauFilter !== n.nom) e.currentTarget.style.borderColor = C.border; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: n.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  ★ {n.nom}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: n.color }}>
                  {countByNiveau[n.nom] || 0}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: C.muted }}>
                {n.min} – {n.max === Infinity ? '∞' : n.max} pts
              </div>
              {n.remise > 0 && (
                <div style={{ fontSize: '0.65rem', color: C.green, fontWeight: 700, marginTop: 4 }}>
                  -{n.remise}% remise
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 24px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Classement fidélité
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: C.goldDim, color: C.gold, padding: '3px 9px', borderRadius: 20, border: `1px solid ${C.goldBorder}` }}>
              {filtered.length} clients
            </span>

            <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
              <Search size={13} color={C.muted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Rechercher un adhérent..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px 8px 32px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.goldBorder}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {[
                    { key: 'rang',          label: '#',              sortable: false },
                    { key: 'nom',           label: 'Adhérent',       sortable: true  },
                    { key: 'points',        label: 'Points',         sortable: true  },
                    { key: 'niveau',        label: 'Niveau',         sortable: false },
                    { key: 'nb_achats',     label: 'Achats',         sortable: true  },
                    { key: 'total_depense', label: 'Total dépensé',  sortable: true  },
                    { key: 'dernier_achat', label: 'Dernier achat',  sortable: true  },
                    { key: 'remise',        label: 'Remise',         sortable: false },
                    { key: 'niveau_expire', label: 'Expire le', sortable: true },
                    { key: 'actions',       label: '',               sortable: false },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      style={{
                        textAlign: 'left', padding: '11px 18px',
                        fontSize: '0.65rem', color: sortKey === col.key ? C.gold : C.muted,
                        letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase',
                        cursor: col.sortable ? 'pointer' : 'default',
                        userSelect: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}{col.sortable && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '56px 0', color: C.muted, fontSize: '0.875rem' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '56px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={22} color={C.gold} />
                        </div>
                        <div style={{ color: C.muted, fontSize: '0.875rem' }}>Aucun client trouvé</div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((c, i) => {
                  const niveau   = getNiveau(c.points);
                  const jours    = daysSince(c.dernier_achat);
                  const inactif  = jours !== null && jours > 60;
                  const recents  = jours !== null && jours <= 7;
                  const isLast   = i === filtered.length - 1;

                  return (
                    <tr
                      key={c.idAdherent}
                      style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Rang */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem',
                          fontWeight: 800, color: i < 3 ? [C.gold, C.muted, '#cd7f32'][i] : C.muted,
                        }}>
                          #{i + 1}
                        </span>
                      </td>

                      {/* Adhérent */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: niveau.dim, border: `1px solid ${niveau.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.9rem',
                            fontWeight: 800, color: niveau.color, flexShrink: 0,
                          }}>
                            {(c.nom?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>
                              {c.nom} {c.prenom}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Points */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: niveau.color }}>
                            {c.points}
                          </div>
                          <div style={{ width: 60, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', marginTop: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (c.points / 3000) * 100)}%`,
                              background: niveau.color, borderRadius: 2,
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Niveau */}
                      <td style={{ padding: '14px 18px' }}>
                        <NiveauBadge points={c.points} />
                      </td>

                      {/* Nb achats */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text }}>
                          {c.nb_achats}
                        </span>
                      </td>

                      {/* Total dépensé */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 800, color: C.text }}>
                          {fmt(c.total_depense)}
                          <span style={{ color: C.accent, fontWeight: 700, fontSize: '0.72rem', marginLeft: 4 }}>DZD</span>
                        </span>
                      </td>

                      {/* Dernier achat */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: inactif ? C.accent : recents ? C.green : C.subtle, fontFamily: 'monospace' }}>
                            {fmtDate(c.dernier_achat)}
                          </div>
                          {jours !== null && (
                            <div style={{ fontSize: '0.65rem', marginTop: 2, color: inactif ? C.accent : C.muted }}>
                              {inactif ? '⚠ ' : ''}{jours}j
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Remise */}
                      <td style={{ padding: '14px 18px' }}>
                        {niveau.remise > 0 ? (
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                            background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
                          }}>
                            -{niveau.remise}%
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: C.muted }}>—</span>
                        )}
                      </td>
{/* Expiration niveau */}
<td style={{ padding: '14px 18px' }}>
  {c.niveau_expire ? (() => {
    const jours = Math.ceil((new Date(c.niveau_expire) - new Date()) / 86400000);
    const color = jours <= 15 ? C.accent : jours <= 30 ? C.gold : C.green;
    return (
      <div>
        <div style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>
          {jours <= 0 ? 'Expiré' : `${jours}j`}
        </div>
        <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 2 }}>
          {fmtDate(c.niveau_expire)}
        </div>
      </div>
    );
  })() : (
    <span style={{ fontSize: '0.75rem', color: C.muted }}>—</span>
  )}
</td>
                      {/* Action */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          title="Voir l'historique"
                          onClick={() => setSelected(c)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            background: 'transparent', border: `1px solid ${C.border}`,
                            color: C.muted, fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.goldDim; e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.color = C.gold; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                        >
                          <Award size={12} /> Historique
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Légende niveaux */}
        <div style={{ marginTop: 20, padding: '16px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
            Système de points — 1 point pour chaque 100 DZD dépensés
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {NIVEAUX.map(n => (
              <div key={n.nom} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color }} />
                <span style={{ fontSize: '0.75rem', color: C.muted }}>
                  <strong style={{ color: n.color }}>★ {n.nom}</strong>
                  {' '}· {n.min}–{n.max === Infinity ? '∞' : n.max} pts
                  {n.remise > 0 && <span style={{ color: C.green }}> · -{n.remise}% remise</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal historique */}
      {selected && (
        <HistoriqueModal
          adherent={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default FideliteAdherents;