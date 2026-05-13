

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, Search, Download, TrendingUp, TrendingDown,
  ShoppingCart, Package, Calendar, X, BarChart2,
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickActions from '../components/QuickActions';
import gym from '../../images/gym.png';
import gym2 from '../../images/gym2.png';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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
};

const PAGE_SIZE = 12;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(n)     { return Number(n || 0).toLocaleString('fr-DZ'); }
function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-DZ', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'Africa/Algiers'
  });
}
function getPages(current, total) {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '…', total];
  if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      style={{ flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'transform 0.2s, border-color 0.2s' }}
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

/* ─────────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d24', border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: '10px 14px', fontFamily: "'Barlow', sans-serif", boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
      <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: C.text, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: C.muted }}>{p.name} :</span>
          <strong style={{ color: p.color }}>{fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const HistoriqueTransactions = () => {
  const navigate = useNavigate();

  /* ── State ── */
  const [achats,    setAchats]    = useState([]);
  const [ventes,    setVentes]    = useState([]);
  const [produits,  setProduits]  = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [activeTab,      setActiveTab]      = useState('tous');
  const [search,         setSearch]         = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [prodFilter,     setProdFilter]     = useState('');
  const [adherentFilter, setAdherentFilter] = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [chartMode,      setChartMode]      = useState('bar');
 const [exportingPDF, setExportingPDF] = useState(false);
  /* ── Chargement
       API attendue :
         window.api.getHistoriqueAchats()  → HistoriqueAchat[]
         window.api.getHistoriqueVentes()  → HistoriqueVente[]  (avec adherent_id, prix_vente)
         window.api.getProduits()          → Produit[]
         window.api.getAdherents()         → Adherent[]
  ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [a, v, p, adh] = await Promise.all([
        window.api.getHistoriqueAchats?.()  ?? [],
        window.api.getHistoriqueVentes?.()  ?? [],
        window.api.getProduits?.()          ?? [],
        window.api.getAdherents?.()         ?? [],
      ]);
      setAchats(a);
      setVentes(v);
      setProduits(p);
      setAdherents(adh);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Lookups ── */
  const getProduitNom = (id) =>
    produits.find(p => p.idProduit === id)?.nom || `Produit #${id}`;

  const getAdherentNom = (id) => {
  if (!id) return null;
  const a = adherents.find(a => Number(a.idAdherent) === Number(id));
  return a ? `${a.nom} ${a.prenom}` : null;
};

  /* ── Merge : on récupère le prix unitaire selon le type
       • vente → prix_vente (colonne ajoutée) ou fallback prix catalogue
       • achat → prix_achat
  ── */
  const allTransactions = [
    ...achats.map(a => ({
      ...a,
      type:         'achat',
      prix_unitaire: a.prix_achat ?? 0,
      adherent_id:  null,
    })),
    ...ventes.map(v => ({
      ...v,
      type:         'vente',
      prix_unitaire: v.prix_vente ?? produits.find(p => p.idProduit === v.produit_id)?.prix ?? 0,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  /* ── Filtres ── */
  const filtered = allTransactions.filter(t => {
    const prodNom = getProduitNom(t.produit_id);
    const adhNom  = getAdherentNom(t.adherent_id) || '';
    const q       = search.toLowerCase();
    const matchQ   = !q || prodNom.toLowerCase().includes(q) || adhNom.toLowerCase().includes(q);
    const matchTab = activeTab === 'tous' || t.type === activeTab.replace(/s$/, '');
    const matchP   = !prodFilter     || String(t.produit_id)  === prodFilter;
    const matchA   = !adherentFilter || String(t.adherent_id) === adherentFilter;
    const tDate    = new Date(t.date);
    const matchF   = !dateFrom || tDate >= new Date(dateFrom);
    const matchTo2 = !dateTo   || tDate <= new Date(dateTo + 'T23:59:59');
    return matchQ && matchTab && matchP && matchA && matchF && matchTo2;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Stats globales ── */
  const totalAchats = achats.length;
  const totalVentes = ventes.length;
  const qtyAchats   = achats.reduce((s, a) => s + (a.quantite || 0), 0);
  const qtyVentes   = ventes.reduce((s, v) => s + (v.quantite || 0), 0);
  const coutAchats  = achats.reduce((s, a) => s + ((a.quantite || 0) * (a.prix_achat || 0)), 0);
  const caVentes    = ventes.reduce((s, v) => {
    const prix = v.prix_vente ?? produits.find(p => p.idProduit === v.produit_id)?.prix ?? 0;
    return s + ((v.quantite || 0) * prix);
  }, 0);
  const ventesAvecAdherent = ventes.filter(v => v.adherent_id).length;

  /* ── Chart : 6 derniers mois ── */
  const chartData = (() => {
    const now    = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { mois: d.toLocaleDateString('fr-DZ', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth(), achats: 0, ventes: 0 };
    });
    achats.forEach(a => {
      const d = new Date(a.date);
      const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (m) m.achats += a.quantite || 0;
    });
    ventes.forEach(v => {
      const d = new Date(v.date);
      const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (m) m.ventes += v.quantite || 0;
    });
    return months;
  })();

  /* ── Top produits vendus ── */
  const topProduits = (() => {
    const map = {};
    ventes.forEach(v => { map[v.produit_id] = (map[v.produit_id] || 0) + (v.quantite || 0); });
    return Object.entries(map)
      .map(([id, qty]) => ({ nom: getProduitNom(Number(id)), qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  })();

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Produit', 'Adhérent', 'Quantité', 'Prix unitaire', 'Total'],
      ...filtered.map(t => {
        const total = (t.quantite || 0) * (t.prix_unitaire || 0);
        return [fmtDate(t.date), t.type, getProduitNom(t.produit_id), getAdherentNom(t.adherent_id) || 'Anonyme', t.quantite, t.prix_unitaire || 0, total];
      }),
    ];
    const csv  = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Export PDF ── */
  const exportPDF = async () => {
    try {
      setExportingPDF(true);
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // ── Couleurs optimisées pour PDF (fond blanc, texte sombre) ──
      const colors = {
        headerBg:   [30, 30, 40],       // header tableau : fond très sombre
        headerText: [255, 255, 255],     // header tableau : texte blanc
        accent:     [229, 57, 53],       // rouge
        blue:       [30, 90, 200],       // bleu lisible sur blanc
        green:      [20, 150, 70],       // vert lisible sur blanc
        text:       [30, 30, 30],        // texte principal : quasi-noir
        muted:      [100, 100, 110],     // texte secondaire : gris moyen
        altRow:     [245, 246, 250],     // rangées alternées : gris très clair
        border:     [200, 200, 210],     // bordures : gris clair
      };

      // Header du PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...colors.text);
      doc.text('Historique des Transactions', 20, 25);

      // Sous-titre avec stats
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.muted);
      doc.text(
        `Période: ${dateFrom || '*'} - ${dateTo || '*'} | Total: ${filtered.length} transactions | Achats: ${totalAchats} | Ventes: ${totalVentes}`,
        20, 35
      );

      // Date et heure
      const now = new Date().toLocaleString('fr-DZ');
      doc.setFontSize(8);
      doc.text(`Généré le: ${now}`, 20, 42);

      // Préparation des données du tableau
      const tableData = filtered.map(t => {
        const prodNom = produits.find(p => p.idProduit === t.produit_id)?.nom || `#${t.produit_id}`;
        const isVente = t.type === 'vente';
        const prix = isVente ? t.prix_vente : t.prix_achat;
        const total = (t.quantite || 0) * (prix || 0);

        return [
          fmtDate(t.date),
          isVente ? 'VENTE' : 'ACHAT',
          prodNom.substring(0, 25) + (prodNom.length > 25 ? '...' : ''),
          t.quantite || 0,
          prix ? `${fmt(prix)} DZD` : '—',
          total ? `${fmt(total)} DZD` : '—',
          t.utilisateur_nom || `User #${t.utilisateur_id || 1}`
        ];
      });

      // Tableau avec autoTable
      autoTable(doc, {
        startY: 55,
        head: [['Date', 'Type', 'Produit', 'Quantité', 'Prix unitaire', 'Total', 'Utilisateur']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.headerBg,
          textColor: colors.headerText,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 4,
          lineWidth: 0.5,
          lineColor: colors.border,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 4,
          lineWidth: 0.2,
          lineColor: colors.border,
          halign: 'left',
          textColor: colors.text,       // ← texte sombre lisible sur fond blanc
          fillColor: [255, 255, 255],   // ← fond blanc par défaut
        },
        alternateRowStyles: {
          fillColor: colors.altRow,     // ← gris très clair, texte reste sombre
          textColor: colors.text,
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 45 },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 25 }
        },
        // Colorier la colonne Type selon VENTE / ACHAT
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const val = data.cell.text[0];
            if (val === 'VENTE') {
              data.cell.styles.textColor = colors.green;
              data.cell.styles.fontStyle = 'bold';
            } else if (val === 'ACHAT') {
              data.cell.styles.textColor = colors.blue;
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Colonne Total en rouge pour les achats, vert pour les ventes
          if (data.section === 'body' && data.column.index === 5) {
            const typeCell = data.row.cells[1];
            if (typeCell?.text[0] === 'VENTE') {
              data.cell.styles.textColor = colors.green;
            }
          }
        },
        styles: {
          overflow: 'linebreak',
          font: 'helvetica'
        },
        margin: { top: 55, left: 20, right: 20 },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(...colors.muted);
          doc.text(
            `Page ${data.pageNumber} sur ${pageCount} | FitManager - Magasin`,
            20,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Stats récapitulatives en bas
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...colors.accent);
      doc.text('RÉCAPITULATIF', 20, finalY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);

      const statsY = finalY + 10;
      doc.text(`Total Achats: ${totalAchats} (${fmt(coutAchats)} DZD)`, 20, statsY);
      doc.text(`Total Ventes: ${totalVentes} (${fmt(caVentes)} DZD)`, 20, statsY + 6);
      doc.text(`Unités achetées: ${qtyAchats} | Unités vendues: ${qtyVentes}`, 20, statsY + 12);

      // Sauvegarde
      const filename = `transactions_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.');
    } finally {
      setExportingPDF(false);
    }
  };

  const clearFilters = () => {
    setSearch(''); setDateFrom(''); setDateTo('');
    setProdFilter(''); setAdherentFilter('');
    setActiveTab('tous'); setCurrentPage(1);
  };

  const hasFilters = search || dateFrom || dateTo || prodFilter || adherentFilter || activeTab !== 'tous';

  /* ── Tab ── */
  const Tab = ({ id, label, count, color }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setCurrentPage(1); }}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 22, border: `1px solid ${active ? color + '55' : C.border}`, background: active ? color + '18' : 'transparent', color: active ? color : C.muted, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {label}
        <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 10, background: active ? color + '30' : 'rgba(255,255,255,0.06)', color: active ? color : C.muted, fontWeight: 800 }}>{count}</span>
      </button>
    );
  };

  return (
   <div style={{
            display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
            backgroundImage: `url(${gym2})`,
            backgroundSize: "cover", backgroundPosition: "center 35%", backgroundAttachment: "fixed",
            position: "relative"
          }}>

            {/* ── Overlay sombre — sous tout le contenu ── */}
            <div style={{
              position: "fixed", inset: 0,
              background: "rgba(14,15,17,0.62)",
              pointerEvents: "none",
              zIndex: -1
            }} />
      {/* ── Hero Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${gym})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,12,14,0.96) 0%, rgba(11,12,14,0.80) 55%, rgba(59,130,246,0.06) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: 2, background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: 'relative', padding: '36px 40px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: '0.68rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.68rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Magasin</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.68rem', color: C.blue, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Transactions</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3.4rem', fontWeight: 800, letterSpacing: 2, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>Transactions</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { count: totalAchats,         label: 'achats',           color: C.blue   },
                { count: totalVentes,         label: 'ventes',           color: C.green  },
                { count: qtyAchats,           label: 'unités achetées',  color: C.gold   },
                { count: qtyVentes,           label: 'unités vendues',   color: C.accent },
                { count: ventesAvecAdherent,  label: 'ventes identifiées', color: C.muted },
              ].map(({ count, label, color }, i) => (
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

          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={exportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bgCard, border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: '11px 20px', color: C.green, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Barlow', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.greenDim; e.currentTarget.style.borderColor = C.greenBorder; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.borderColor = C.borderStrong; }}>
              <Download size={15} /> Excel / CSV
            </button>
            <button
              onClick={exportPDF}
              disabled={exportingPDF}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: C.bgCard, border: `1px solid ${C.borderStrong}`,
                borderRadius: 10, padding: '11px 20px',
                color: exportingPDF ? C.muted : C.accent,
                fontSize: '0.85rem', fontWeight: 700,
                cursor: exportingPDF ? 'default' : 'pointer',
                transition: 'all 0.2s', fontFamily: "'Barlow', sans-serif"
              }}
              onMouseEnter={e => {
                if (!exportingPDF) {
                  e.currentTarget.style.background = C.accentDim;
                  e.currentTarget.style.borderColor = C.accentBorder;
                }
              }}
              onMouseLeave={e => {
                if (!exportingPDF) {
                  e.currentTarget.style.background = C.bgCard;
                  e.currentTarget.style.borderColor = C.borderStrong;
                }
              }}
            >
              {exportingPDF ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Génération...
                </>
              ) : (
                <>
                  <FileText size={15} /> PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 48px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <StatCard icon={ShoppingCart} label="Total Achats" value={totalAchats}              sub={`${qtyAchats} unités reçues`}     accent={C.blue}   />
          <StatCard icon={TrendingUp}   label="Total Ventes" value={totalVentes}              sub={`${qtyVentes} unités vendues`}    accent={C.green}  />
          <StatCard icon={Package}      label="Coût Achats"  value={`${fmt(coutAchats)} DZD`} sub="montant total dépensé"            accent={C.gold}   />
          <StatCard icon={TrendingDown} label="CA Ventes"    value={`${fmt(caVentes)} DZD`}   sub="chiffre d'affaires total"         accent={C.accent} />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 28 }}>

          {/* Bar / Area chart */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Achats vs Ventes</div>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 3 }}>Quantités — 6 derniers mois</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['bar', <BarChart2 size={12} />], ['area', <TrendingUp size={12} />]].map(([mode, icon]) => (
                  <button key={mode} onClick={() => setChartMode(mode)}
                    style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${chartMode === mode ? C.accentBorder : C.border}`, background: chartMode === mode ? C.accentDim : 'transparent', color: chartMode === mode ? C.accent : C.muted, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartMode === 'bar' ? (
                <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', color: C.muted, paddingTop: 12 }} />
                  <Bar dataKey="achats" name="Achats" fill={C.blue}  radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ventes" name="Ventes" fill={C.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue}  stopOpacity={0.3}/><stop offset="95%" stopColor={C.blue}  stopOpacity={0}/></linearGradient>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', color: C.muted, paddingTop: 12 }} />
                  <Area type="monotone" dataKey="achats" name="Achats" stroke={C.blue}  fill="url(#gA)" strokeWidth={2} dot={{ r: 3, fill: C.blue  }} />
                  <Area type="monotone" dataKey="ventes" name="Ventes" stroke={C.green} fill="url(#gV)" strokeWidth={2} dot={{ r: 3, fill: C.green }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Top produits */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Top Produits</div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 18 }}>Les plus vendus</div>
            {topProduits.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 40 }}>Aucune donnée</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topProduits.map((p, i) => {
                  const max    = topProduits[0].qty;
                  const pct    = max > 0 ? (p.qty / max) * 100 : 0;
                  const colors = [C.accent, C.blue, C.green, C.gold, C.subtle];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 800, color: colors[i], minWidth: 18 }}>#{i + 1}</span>
                          <span style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{p.nom}</span>
                        </div>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: colors[i] }}>{p.qty}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Table Section ── */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

          {/* Toolbar table */}
          <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Historique</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, background: C.blueDim, color: C.blue, padding: '3px 9px', borderRadius: 20, border: `1px solid ${C.blueBorder}` }}>{filtered.length} entrées</span>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Barlow', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <X size={12} /> Effacer filtres
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <Tab id="tous"   label="Tous"   count={allTransactions.length} color={C.subtle} />
              <Tab id="achats" label="Achats" count={achats.length}           color={C.blue}   />
              <Tab id="ventes" label="Ventes" count={ventes.length}           color={C.green}  />
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Recherche */}
              <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 280 }}>
                <Search size={13} color={C.muted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" placeholder="Produit ou adhérent..." value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px 8px 32px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = C.accentBorder}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Filtre adhérent */}
              <select value={adherentFilter} onChange={e => { setAdherentFilter(e.target.value); setCurrentPage(1); }}
                style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: adherentFilter ? C.text : C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', cursor: 'pointer', colorScheme: 'dark', minWidth: 150 }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e  => e.target.style.borderColor = C.border}>
                <option value="">Tous adhérents</option>
                {adherents.map(a => (
                  <option key={a.idAdherent} value={a.idAdherent}>{a.nom} {a.prenom}</option>
                ))}
              </select>

              {/* Filtre produit */}
              <select value={prodFilter} onChange={e => { setProdFilter(e.target.value); setCurrentPage(1); }}
                style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: prodFilter ? C.text : C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', cursor: 'pointer', colorScheme: 'dark', minWidth: 150 }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e  => e.target.style.borderColor = C.border}>
                <option value="">Tous produits</option>
                {produits.map(p => <option key={p.idProduit} value={p.idProduit}>{p.nom}</option>)}
              </select>

              {/* Date from */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} color={C.muted} />
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', colorScheme: 'dark' }}
                  onFocus={e => e.target.style.borderColor = C.accentBorder}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>
              <span style={{ color: C.muted, fontSize: '0.8rem' }}>→</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', outline: 'none', colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e  => e.target.style.borderColor = C.border}
              />

              <button onClick={loadData} title="Actualiser"
                style={{ width: 34, height: 34, borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.blueDim; e.currentTarget.style.color = C.blue; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {['Date', 'Type', 'Produit', 'Adhérent', 'Quantité', 'Prix unitaire', 'Total'].map(col => (
                    <th key={col} style={{ textAlign: 'left', padding: '11px 22px', fontSize: '0.65rem', color: C.muted, letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ color: C.muted, fontSize: '0.875rem' }}>Chargement...</div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={22} color={C.accent} /></div>
                      <div style={{ color: C.muted, fontSize: '0.875rem' }}>Aucune transaction trouvée</div>
                    </div>
                  </td></tr>
                ) : paginated.map((t, i) => {
                  const isVente  = t.type === 'vente';
                  const total    = (t.quantite || 0) * (t.prix_unitaire || 0);
                  const adhNom   = getAdherentNom(t.adherent_id);
                  const isLast   = i === paginated.length - 1;
                  const pointsGagnes = isVente && t.adherent_id ? Math.floor(total / 100) : 0;

                  return (
                    <tr key={`${t.type}-${t.id || i}`}
                      style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Date */}
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: '0.82rem', color: C.subtle, fontFamily: 'monospace' }}>{fmtDate(t.date)}</span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', fontWeight: 800, padding: '4px 11px', borderRadius: 20, background: isVente ? C.greenDim : C.blueDim, color: isVente ? C.green : C.blue, border: `1px solid ${isVente ? C.greenBorder : C.blueBorder}`, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {isVente ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isVente ? 'Vente' : 'Achat'}
                        </span>
                      </td>

                      {/* Produit */}
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={12} color={C.accent} /></div>
                          <span style={{ fontSize: '0.875rem', color: C.text, fontWeight: 600 }}>{getProduitNom(t.produit_id)}</span>
                        </div>
                      </td>

                      {/* Adhérent */}
                      <td style={{ padding: '14px 22px' }}>
                        {adhNom ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <User size={11} color={C.gold} />
                              <span style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{adhNom}</span>
                            </div>
                            {pointsGagnes > 0 && (
                              <div style={{ fontSize: '0.65rem', color: C.gold, marginTop: 2 }}>+{pointsGagnes} pts</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: C.muted, fontStyle: 'italic' }}>Anonyme</span>
                        )}
                      </td>

                      {/* Quantité */}
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: isVente ? C.green : C.blue }}>
                          {isVente ? '-' : '+'}{t.quantite}
                        </span>
                      </td>

                      {/* Prix unitaire */}
                      <td style={{ padding: '14px 22px' }}>
                        {t.prix_unitaire != null && t.prix_unitaire > 0 ? (
                          <span style={{ fontSize: '0.85rem', color: C.subtle }}>
                            {fmt(t.prix_unitaire)} <span style={{ color: C.muted, fontSize: '0.72rem' }}>DZD</span>
                          </span>
                        ) : <span style={{ color: C.muted, fontSize: '0.8rem' }}>—</span>}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 22px' }}>
                        {total > 0 ? (
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 800, color: isVente ? C.green : C.text }}>
                            {fmt(total)} <span style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700 }}>DZD</span>
                          </span>
                        ) : <span style={{ color: C.muted, fontSize: '0.8rem' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '0.75rem', color: C.muted }}>Page <strong style={{ color: C.subtle }}>{safePage}</strong> sur <strong style={{ color: C.subtle }}>{totalPages}</strong></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === 1 ? C.border : C.muted, cursor: safePage === 1 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>← Préc.</button>
                {getPages(safePage, totalPages).map((page, idx) =>
                  page === '…' ? <span key={`d-${idx}`} style={{ color: C.muted, fontSize: '0.82rem', padding: '0 4px' }}>…</span> : (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: page === safePage ? 'none' : `1px solid ${C.border}`, background: page === safePage ? C.blue : 'transparent', color: page === safePage ? '#fff' : C.muted, fontSize: '0.82rem', cursor: 'pointer', fontWeight: page === safePage ? 700 : 400, fontFamily: "'Barlow', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: page === safePage ? '0 4px 12px rgba(59,130,246,0.35)' : 'none' }}>{page}</button>
                  )
                )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === totalPages ? C.border : C.muted, cursor: safePage === totalPages ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Suiv. →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HistoriqueTransactions;