import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Search, Package, ShoppingCart, TrendingUp, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import gymBg from '../../images/gym1.png';
import { useLocation, useNavigate } from "react-router-dom"; 
import QuickActions from "../components/QuickActions";

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
  accentHover:  '#f44336',
  accentDim:    'rgba(229,57,53,0.10)',
  accentBorder: 'rgba(229,57,53,0.28)',
  text:         '#f0f0f0',
  muted:        '#6b7280',
  subtle:       '#9ca3af',
  green:        '#22c55e',
  greenDim:     'rgba(34,197,94,0.12)',
  gold:         '#f59e0b',
  goldDim:      'rgba(245,158,11,0.12)',
  blue:         '#3b82f6',
  blueDim:      'rgba(59,130,246,0.12)',
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATEGORIES = ['Musculation', 'Cardio', 'Accessoire', 'Cardio / Accessoire'];

const CAT_STYLE = {
  'Musculation':         { bg: C.accentDim,  color: C.accent, border: C.accentBorder },
  'Accessoire':          { bg: C.blueDim,    color: C.blue,   border: 'rgba(59,130,246,0.25)' },
  'Cardio':              { bg: C.greenDim,   color: C.green,  border: 'rgba(34,197,94,0.25)' },
  'Cardio / Accessoire': { bg: C.goldDim,    color: C.gold,   border: 'rgba(245,158,11,0.25)' },
};

const PAGE_SIZE = 8;

/* ─────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────── */
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const lbl = {
  fontSize: '0.72rem', color: C.muted, fontWeight: 600,
  marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px',
};

function FocusInput({ tag: Tag = 'input', style, ...props }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%',
    background: focused ? 'rgba(255,255,255,0.08)' : C.bgInput,
    border: `1px solid ${focused ? C.accentBorder : 'rgba(229,57,53,0.3)'}`,
    borderRadius: 8,
    padding: '11px 14px',
    color: C.text,
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.18s, background 0.18s',
  };
  return (
    <Tag
      style={{ ...base, ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   MODAL — NOUVEAU PRODUIT / MODIFICATION
───────────────────────────────────────────── */
function NouveauProduitModal({ onSave, onClose, initialData }) {
  const [form, setForm] = useState({
    idProduit: initialData?.idProduit || null,
    nom: initialData?.nom || '',
    reference: initialData?.reference || '',
    categorie: initialData?.categorie || '',
    stock: initialData?.stock?.toString() || '',
    prix: initialData?.prix?.toString() || '',
    note: ''
  });
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const catStyle = CAT_STYLE[form.categorie];
  const hasPreview = form.nom || form.categorie || form.prix;

  const handleSave = () => {
    const { nom, reference, categorie, stock, prix, idProduit } = form;
    if (!nom || !reference || !categorie || !stock || !prix) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    const productData = {
      nom,
      reference,
      categorie,
      stock: Number(stock),
      prix: Number(prix)
    };
    
    // Ajouter idProduit uniquement pour une modification
    if (idProduit) {
      productData.idProduit = idProduit;
    }
    
    onSave(productData);
    onClose();
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 560, borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.9)', fontFamily: "'Barlow', sans-serif" }}>

        {/* Hero */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1c0a0a 0%, #2a1010 50%, #160808 100%)', padding: '28px 28px 24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(229,57,53,0.04) 0, rgba(229,57,53,0.04) 1px, transparent 1px, transparent 20px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: 60, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>FitManager</span>
                <ChevronRight size={10} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: '0.65rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>Magasin</span>
                <ChevronRight size={10} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>
                  {initialData ? 'Modifier' : 'Nouveau'}
                </span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1, color: C.text, textTransform: 'uppercase', letterSpacing: 1 }}>
                {initialData ? 'Modifier le Produit' : 'Nouveau Produit'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 6, marginBottom: 0 }}>
                {initialData ? 'Modifier les informations du produit' : 'Ajouter un article à l\'inventaire'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#161012', padding: '26px 28px 30px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
            Informations du produit
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Nom du produit <span style={{ color: C.accent }}>*</span></label>
              <FocusInput type="text" placeholder="ex: Haltères 10kg" value={form.nom} onChange={e => set('nom', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Référence <span style={{ color: C.accent }}>*</span></label>
              <FocusInput type="text" placeholder="ex: ALG016" value={form.reference} onChange={e => set('reference', e.target.value)} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Catégorie <span style={{ color: C.accent }}>*</span></label>
              <FocusInput tag="select" value={form.categorie} onChange={e => set('categorie', e.target.value)} style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </FocusInput>
            </div>
            <div>
              <label style={lbl}>Stock initial <span style={{ color: C.accent }}>*</span></label>
              <FocusInput type="number" placeholder="ex: 20" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Prix unitaire (DZD) <span style={{ color: C.accent }}>*</span></label>
            <FocusInput type="number" placeholder="ex: 6 000" min="0" value={form.prix} onChange={e => set('prix', e.target.value)} />
          </div>

          {/* Preview */}
          {hasPreview && (
            <div style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Aperçu</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text }}>{form.nom || '—'}</div>
                {form.reference && <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>{form.reference}</div>}
              </div>
              {catStyle && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, whiteSpace: 'nowrap' }}>
                  {form.categorie}
                </span>
              )}
              {form.stock && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: C.muted, marginBottom: 2 }}>Stock</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text }}>{form.stock}</div>
                </div>
              )}
              {form.prix && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: C.muted, marginBottom: 2 }}>Prix</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: C.accent }}>{Number(form.prix).toLocaleString('fr-DZ')} DZD</div>
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: `1px solid ${C.border}`, margin: '6px 0 16px' }} />

          <div style={{ marginBottom: 6 }}>
            <label style={lbl}>Note</label>
            <FocusInput tag="textarea" rows={3} placeholder="Informations supplémentaires..." value={form.note} onChange={e => set('note', e.target.value)} style={{ resize: 'vertical', minHeight: 70 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: `1px solid ${C.borderStrong}`, borderRadius: 9, padding: '10px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 9, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(229,57,53,0.4)', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(229,57,53,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(229,57,53,0.4)'; }}
            >
              <Plus size={15} /> {initialData ? 'Mettre à jour' : 'Ajouter le produit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGINATION HELPER
───────────────────────────────────────────── */
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
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.6rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 6 }}>{sub}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}60, transparent)` }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const Magasin = () => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal]     = useState(false);
  const [sortKey, setSortKey]         = useState('nom');
  const [sortDir, setSortDir]         = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);

  /* ── Chargement des produits depuis la BDD ── */
  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await window.api.getProduits();
      console.log('📦 Produits chargés depuis BDD:', result);
      
      // Adapter les champs : idProduit -> id pour compatibilité avec le code existant
      const formattedProducts = result.map(p => ({
        id: p.idProduit,
        idProduit: p.idProduit, // Gardé pour les updates
        nom: p.nom,
        reference: p.reference,
        stock: p.stock,
        prix: parseFloat(p.prix) || 0,
        categorie: p.categorie
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      alert('Impossible de charger les produits depuis la base de données.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Chargement initial ── */
  useEffect(() => {
    loadProducts();
  }, []);

  /* ── Ajouter un produit ── */
  const handleAdd = async (produit) => {
    try {
      console.log('➕ Ajout produit:', produit);
      const result = await window.api.addProduit(produit);
      console.log('✅ Produit ajouté, ID:', result.idProduit);
      await loadProducts(); // Recharger la liste
    } catch (error) {
      console.error('❌ Erreur ajout produit:', error);
      alert('Erreur lors de l\'ajout du produit: ' + error.message);
    }
  };

  /* ── Modifier un produit ── */
  const handleUpdate = async (produit) => {
    try {
      console.log('✏️ Modification produit:', produit);
      const result = await window.api.updateProduit(produit);
      console.log('✅ Produit modifié:', result);
      await loadProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error('❌ Erreur modification produit:', error);
      alert('Erreur lors de la modification du produit: ' + error.message);
    }
  };

  /* ── Supprimer un produit ── */
  const handleDelete = async (id, idProduit) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    
    try {
      const idToDelete = idProduit || id;
      console.log('🗑️ Suppression produit, ID:', idToDelete);
      const result = await window.api.deleteProduit(idToDelete);
      console.log('✅ Produit supprimé:', result);
      await loadProducts();
    } catch (error) {
      console.error('❌ Erreur suppression produit:', error);
      alert('Erreur lors de la suppression du produit: ' + error.message);
    }
  };

  /* ── Ouvrir la modal d'édition ── */
  const handleEditClick = (product) => {
    console.log('✏️ Édition du produit:', product);
    setEditingProduct(product);
    setShowModal(true);
  };

  /* ── Derived data ── */
  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchQ = !q || p.nom.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q);
      const matchC = !catFilter || p.categorie === catFilter;
      return matchQ && matchC;
    })
    .sort((a, b) => {
      const va = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : a[sortKey];
      const vb = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : b[sortKey];
      return va < vb ? -sortDir : va > vb ? sortDir : 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock   = products.filter(p => p.stock <= 5).length;

  const handleSearch = v => { setSearch(v); setCurrentPage(1); };
  const handleCat    = v => { setCatFilter(v); setCurrentPage(1); };

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: C.muted, fontSize: 10, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: C.accent, fontSize: 10, marginLeft: 4 }}>{sortDir === 1 ? '↑' : '↓'}</span>;
  };

  const COLS = [
    { key: 'nom',       label: 'Produit',    sortable: true  },
    { key: 'reference', label: 'Référence',  sortable: true  },
    { key: 'categorie', label: 'Catégorie',  sortable: true  },
    { key: 'stock',     label: 'Stock',      sortable: true  },
    { key: 'prix',      label: 'Prix',       sortable: true  },
    { key: 'actions',   label: '',           sortable: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg, fontFamily: "'Barlow', sans-serif" }}>

      {/* ── Hero Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${gymBg})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,12,14,0.96) 0%, rgba(11,12,14,0.80) 55%, rgba(229,57,53,0.08) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: 'relative', padding: '36px 40px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: '0.68rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.68rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Magasin</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3.4rem', fontWeight: 800, letterSpacing: 2, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>
              Magasin
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { count: products.length, label: 'produits',  color: C.muted  },
                { count: totalStock,      label: 'en stock',  color: C.green  },
                { count: '304',           label: 'achats',    color: C.blue   },
                { count: '503',           label: 'ventes',    color: C.gold   },
                ...(lowStock > 0 ? [{ count: lowStock, label: 'stock faible', color: C.accent }] : []),
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
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.accent, color: '#fff', border: 'none', borderRadius: 11, padding: '13px 24px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(229,57,53,0.4)', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(229,57,53,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(229,57,53,0.4)'; }}
          >
            <Plus size={17} /> Ajouter un produit
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 48px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <StatCard icon={Package}     label="Produits"  value={products.length} sub="articles au catalogue"  accent={C.accent} />
          <StatCard icon={ShoppingCart} label="Achats"    value="304"             sub="achats enregistrés"     accent={C.blue}   />
          <StatCard icon={TrendingUp}   label="Ventes"    value="503"             sub="ventes effectuées"      accent={C.green}  />
          {lowStock > 0 && (
            <StatCard icon={AlertTriangle} label="Alerte" value={lowStock} sub="articles en stock faible" accent={C.gold} />
          )}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 420 }}>
            <Search size={14} color={C.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Rechercher nom, référence, catégorie..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px 10px 36px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s' }}
              onFocus={e => e.target.style.borderColor = C.accentBorder}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['', ...CATEGORIES].map(cat => {
              const cs = CAT_STYLE[cat];
              const active = catFilter === cat;
              return (
                <button
                  key={cat || 'all'}
                  onClick={() => handleCat(cat)}
                  style={{
                    padding: '7px 14px', borderRadius: 20, border: `1px solid ${active ? (cs?.border || C.accentBorder) : C.border}`,
                    background: active ? (cs?.bg || C.accentDim) : 'transparent',
                    color: active ? (cs?.color || C.accent) : C.muted,
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    fontFamily: "'Barlow', sans-serif", transition: 'all 0.15s',
                  }}
                >
                  {cat || 'Tous'}
                </button>
              );
            })}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: C.muted, whiteSpace: 'nowrap' }}>
            <strong style={{ color: C.subtle }}>{filtered.length}</strong> résultat{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {/* Table header bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Liste des produits
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: C.accentDim, color: C.accent, padding: '3px 9px', borderRadius: 20, border: `1px solid ${C.accentBorder}` }}>
                {products.length} articles
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      style={{
                        textAlign: 'left', padding: '11px 22px',
                        fontSize: '0.65rem', color: sortKey === col.key ? C.accent : C.muted,
                        letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase',
                        cursor: col.sortable ? 'pointer' : 'default',
                        userSelect: 'none', whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '56px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={22} color={C.accent} />
                        </div>
                        <div style={{ color: C.muted, fontSize: '0.875rem' }}>Chargement des produits...</div>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? paginated.map((p, i) => {
                  const cs = CAT_STYLE[p.categorie] || { bg: 'rgba(255,255,255,0.06)', color: C.muted, border: C.border };
                  const stockLow = p.stock <= 5;
                  const isLast = i === paginated.length - 1;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Nom */}
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={14} color={C.accent} />
                          </div>
                          <span style={{ color: C.text, fontSize: '0.875rem', fontWeight: 600 }}>{p.nom}</span>
                        </div>
                      </td>

                      {/* Référence */}
                      <td style={{ padding: '15px 22px' }}>
                        <code style={{ color: C.muted, fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5, border: `1px solid ${C.border}` }}>
                          {p.reference}
                        </code>
                      </td>

                      {/* Catégorie */}
                      <td style={{ padding: '15px 22px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                          {p.categorie}
                        </span>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (p.stock / 60) * 100)}%`, background: stockLow ? C.accent : p.stock <= 15 ? C.gold : C.green, borderRadius: 3, transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: stockLow ? C.accent : C.text }}>{p.stock}</span>
                          {stockLow && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: C.accent, background: C.accentDim, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Faible
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prix */}
                      <td style={{ padding: '15px 22px' }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 800, color: C.text }}>
                          {p.prix.toLocaleString('fr-DZ')}
                          <span style={{ color: C.accent, fontWeight: 700, fontSize: '0.8rem', marginLeft: 4 }}>DZD</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            title="Modifier"
                            onClick={() => handleEditClick(p)}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.blueDim; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = C.blue; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            title="Supprimer"
                            onClick={() => handleDelete(p.id, p.idProduit)}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '56px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={22} color={C.accent} />
                        </div>
                        <div style={{ color: C.muted, fontSize: '0.875rem' }}>Aucun produit trouvé</div>
                        {search && <div style={{ fontSize: '0.75rem', color: C.muted }}>pour « {search} »</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '0.75rem', color: C.muted }}>
                Page <strong style={{ color: C.subtle }}>{safePage}</strong> sur <strong style={{ color: C.subtle }}>{totalPages}</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === 1 ? C.border : C.muted, cursor: safePage === 1 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}
                >
                  ← Préc.
                </button>
                {getPages(safePage, totalPages).map((page, idx) =>
                  page === '…' ? (
                    <span key={`dots-${idx}`} style={{ color: C.muted, fontSize: '0.82rem', padding: '0 4px' }}>…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: page === safePage ? 'none' : `1px solid ${C.border}`, background: page === safePage ? C.accent : 'transparent', color: page === safePage ? '#fff' : C.muted, fontSize: '0.82rem', cursor: 'pointer', fontWeight: page === safePage ? 700 : 400, fontFamily: "'Barlow', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: page === safePage ? '0 4px 12px rgba(229,57,53,0.35)' : 'none' }}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === totalPages ? C.border : C.muted, cursor: safePage === totalPages ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}
                >
                  Suiv. →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <NouveauProduitModal
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={editingProduct ? handleUpdate : handleAdd}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default Magasin;