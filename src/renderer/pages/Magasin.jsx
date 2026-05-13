import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Search, Package, Edit2, Trash2, AlertTriangle, User } from 'lucide-react';
import gym2 from "../../images/gym2.png";
import { useNavigate } from "react-router-dom";
import QuickActions from "../components/QuickActions";
import gym from "../../images/gym.png";
import DeleteConfirm, { useDeleteConfirm } from "../components/DeleteConfirm";

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

const CATEGORIES = ['Musculation', 'Cardio', 'Accessoire', 'Cardio / Accessoire'];

const CAT_STYLE = {
  'Musculation':         { bg: C.accentDim, color: C.accent, border: C.accentBorder },
  'Accessoire':          { bg: C.blueDim,   color: C.blue,   border: 'rgba(59,130,246,0.25)' },
  'Cardio':              { bg: C.greenDim,  color: C.green,  border: 'rgba(34,197,94,0.25)' },
  'Cardio / Accessoire': { bg: C.goldDim,   color: C.gold,   border: 'rgba(245,158,11,0.25)' },
};

const PAGE_SIZE = 8;

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

function getPages(current, total) {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '…', total];
  if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ─────────────────────────────────────────────
   MODAL — NOUVEAU PRODUIT / MODIFICATION
───────────────────────────────────────────── */
function NouveauProduitModal({ onSave, onClose, initialData }) {
  const [form, setForm] = useState({
    idProduit: initialData?.idProduit || null,
    nom:       initialData?.nom       || '',
    reference: initialData?.reference || '',
    categorie: initialData?.categorie || '',
    stock:     initialData?.stock?.toString() || '',
    prix:      initialData?.prix?.toString()  || '',
    note:      '',
  });

  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const catStyle   = CAT_STYLE[form.categorie];
  const hasPreview = form.nom || form.categorie || form.prix;

  const handleSave = () => {
    const { nom, reference, categorie, stock, prix, idProduit } = form;
    if (!nom || !reference || !categorie || !stock || !prix) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const productData = { nom, reference, categorie, stock: Number(stock), prix: Number(prix) };
    if (idProduit) productData.idProduit = idProduit;
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
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${gym})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,12,14,0.96) 0%, rgba(11,12,14,0.80) 55%, rgba(59,130,246,0.06) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: 2, background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${C.bg})` }} />
          <div style={{ position: 'relative', padding: '28px 28px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>FitManager</span>
                <ChevronRight size={10} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: '0.65rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>Magasin</span>
                <ChevronRight size={10} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>{initialData ? 'Modifier' : 'Nouveau'}</span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1, color: C.text, textTransform: 'uppercase', letterSpacing: 1 }}>
                {initialData ? 'Modifier le Produit' : 'Nouveau Produit'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 6, marginBottom: 0 }}>
                {initialData ? 'Modifier les informations du produit' : "Ajouter un article à l'inventaire"}
              </p>
            </div>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            ><IconX /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#161012', padding: '26px 28px 30px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>Informations du produit</div>

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

          {hasPreview && (
            <div style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Aperçu</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text }}>{form.nom || '—'}</div>
                {form.reference && <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>{form.reference}</div>}
              </div>
              {catStyle && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, whiteSpace: 'nowrap' }}>{form.categorie}</span>}
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
            <button onClick={onClose}
              style={{ background: 'transparent', border: `1px solid ${C.borderStrong}`, borderRadius: 9, padding: '10px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Annuler</button>
            <button onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 9, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(229,57,53,0.4)', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(229,57,53,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(229,57,53,0.4)'; }}
            ><Plus size={15} /> {initialData ? 'Mettre à jour' : 'Ajouter le produit'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODAL — TRANSACTION
───────────────────────────────────────────── */
function TransactionModal({ type, produit, onClose, onConfirm }) {
  const [quantite,       setQuantite]      = useState('');
  const [prixAchat,      setPrixAchat]     = useState('');
  const [adherentId,     setAdherentId]    = useState('');
  const [adherents,      setAdherents]     = useState([]);
  const [loadingAdh,     setLoadingAdh]    = useState(false);
  const [remiseAdherent, setRemiseAdherent] = useState(0);

  const isVente = type === 'vente';

  useEffect(() => {
    if (!adherentId) { setRemiseAdherent(0); return; }
    window.api.getAdherentNiveau?.(Number(adherentId))
      .then(data => setRemiseAdherent(data?.remise ?? 0))
      .catch(() => setRemiseAdherent(0));
  }, [adherentId]);

  useEffect(() => {
    if (!isVente) return;
    setLoadingAdh(true);
    window.api.getAdherents?.()
      .then(data  => setAdherents(data || []))
      .catch(err  => console.error('Erreur chargement adhérents:', err))
      .finally(() => setLoadingAdh(false));
  }, [isVente]);

  const qte             = Number(quantite) || 0;
  const prixApresRemise = isVente ? (produit.prix || 0) * (1 - remiseAdherent / 100) : 0;
  const prixUnitaire    = isVente ? prixApresRemise : (Number(prixAchat) || 0);
  const totalTx         = qte * prixUnitaire;
  const pointsGagnes    = isVente && adherentId && totalTx > 0 ? Math.floor(totalTx / 100) : 0;
  const stockApres      = isVente ? produit.stock - qte : produit.stock + qte;
  const stockInsuff     = isVente && qte > produit.stock;

  const handleSubmit = () => {
    if (!quantite || qte <= 0)                              { alert('Quantité invalide'); return; }
    if (!isVente && (!prixAchat || Number(prixAchat) <= 0)) { alert("Prix d'achat invalide"); return; }
    if (stockInsuff)                                        { alert('Stock insuffisant !'); return; }
    onConfirm({
      produit_id:  produit.idProduit,
      quantite:    qte,
      prix:        isVente ? (produit.prix || 0) : Number(prixAchat),
      prix_vente:  isVente ? prixApresRemise : null,
      type,
      adherent_id: isVente && adherentId ? Number(adherentId) : null,
    });
    onClose();
  };

  const hColor    = isVente ? C.accent : C.blue;
  const hDim      = isVente ? C.accentDim : C.blueDim;
  const btnShadow = isVente ? 'rgba(229,57,53,0.4)' : 'rgba(59,130,246,0.4)';

  const inputSt = {
    width: '100%', background: C.bgInput,
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '10px 13px', color: C.text,
    fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
    >
      <div style={{ width: 460, borderRadius: 18, overflow: 'hidden', background: '#161012', border: `1px solid ${C.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.9)', fontFamily: "'Barlow', sans-serif" }}>

        <div style={{ padding: '22px 24px 18px', background: hDim, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, color: hColor, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
              {isVente ? 'Vente produit' : 'Achat stock'}
            </h2>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginTop: 4, marginBottom: 0 }}>
              {produit.nom}
              <code style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.6 }}>{produit.reference}</code>
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer' }}>
            <IconX />
          </button>
        </div>

        <div style={{ padding: '22px 24px 26px' }}>
          {isVente && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>
                <User size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Adhérent
                <span style={{ color: C.muted, fontWeight: 400, marginLeft: 4 }}>(optionnel)</span>
              </label>
              <select value={adherentId} onChange={e => setAdherentId(e.target.value)} disabled={loadingAdh}
                style={{ ...inputSt, appearance: 'none', cursor: loadingAdh ? 'wait' : 'pointer', color: adherentId ? C.text : C.muted }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e  => e.target.style.borderColor = C.border}
              >
                <option value="">— Vente anonyme —</option>
                {adherents.map(a => <option key={a.idAdherent} value={a.idAdherent}>{a.nom} {a.prenom}</option>)}
              </select>
              {adherentId && remiseAdherent > 0 && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: C.greenDim, border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: C.green, fontWeight: 700 }}>-{remiseAdherent}% remise fidélité appliquée</span>
                </div>
              )}
              {adherentId && pointsGagnes > 0 && (
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: C.goldDim, border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: C.gold, fontWeight: 700 }}>★ +{pointsGagnes} point{pointsGagnes > 1 ? 's' : ''} de fidélité</span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Quantité <span style={{ color: C.accent }}>*</span></label>
            <input type="number" value={quantite} min="1" placeholder="ex: 5"
              onChange={e => setQuantite(e.target.value)}
              style={inputSt}
              onFocus={e => e.target.style.borderColor = isVente ? C.accentBorder : 'rgba(59,130,246,0.4)'}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>

          {!isVente && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Prix d'achat unitaire (DZD) <span style={{ color: C.accent }}>*</span></label>
              <input type="number" value={prixAchat} min="0" placeholder="ex: 3 000"
                onChange={e => setPrixAchat(e.target.value)}
                style={inputSt}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Stock actuel</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: C.text }}>{produit.stock}</div>
              </div>
              {isVente && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Prix unitaire</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: C.accent }}>
                    {prixUnitaire.toLocaleString('fr-DZ')} DZD
                    {remiseAdherent > 0 && (
                      <span style={{ fontSize: '0.65rem', color: C.muted, marginLeft: 6, textDecoration: 'line-through' }}>
                        {(produit.prix || 0).toLocaleString('fr-DZ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {qte > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: C.muted, marginBottom: 3 }}>Stock après</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: stockInsuff ? C.accent : stockApres <= 5 ? C.gold : C.green }}>
                    {stockApres}
                    {!stockInsuff && stockApres <= 5 && <span style={{ fontSize: '0.65rem', color: C.gold, fontWeight: 700, marginLeft: 8 }}>⚠ Stock faible</span>}
                  </div>
                </div>
                {totalTx > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.62rem', color: C.muted, marginBottom: 3 }}>{isVente ? 'Total vente' : 'Coût total'}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: isVente ? C.green : C.blue }}>
                      {totalTx.toLocaleString('fr-DZ')} DZD
                    </div>
                  </div>
                )}
              </div>
            )}
            {stockInsuff && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontSize: '0.75rem', fontWeight: 700 }}>
                <AlertTriangle size={13} /> Stock insuffisant — {produit.stock} disponible{produit.stock > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: 9, color: C.muted, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderStrong}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >Annuler</button>
            <button onClick={handleSubmit} disabled={stockInsuff}
              style={{ background: stockInsuff ? C.muted : hColor, border: 'none', padding: '10px 22px', borderRadius: 9, color: '#fff', fontWeight: 700, cursor: stockInsuff ? 'not-allowed' : 'pointer', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', boxShadow: stockInsuff ? 'none' : `0 6px 20px ${btnShadow}`, transition: 'all 0.18s' }}
              onMouseEnter={e => { if (!stockInsuff) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              {isVente ? '✓ Confirmer la vente' : "✓ Confirmer l'achat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
   PAGE PRINCIPALE — MAGASIN
───────────────────────────────────────────── */
const Magasin = () => {
  const [products,        setProducts]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState('');
  const [catFilter,       setCatFilter]       = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [showModal,       setShowModal]       = useState(false);
  const [sortKey,         setSortKey]         = useState('nom');
  const [sortDir,         setSortDir]         = useState(1);
  const [editingProduct,  setEditingProduct]  = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  // ── Hook DeleteConfirm ──
  const { confirmProps, askConfirm } = useDeleteConfirm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await window.api.getProduits();
      setProducts(result.map(p => ({
        id: p.idProduit, idProduit: p.idProduit,
        nom: p.nom, reference: p.reference,
        stock: p.stock, prix: parseFloat(p.prix) || 0,
        categorie: p.categorie,
      })));
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      alert('Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleAdd    = async (p) => { try { await window.api.addProduit(p);    await loadProducts(); } catch (e) { alert("Erreur ajout : " + e.message); } };
  const handleUpdate = async (p) => { try { await window.api.updateProduit(p); await loadProducts(); setEditingProduct(null); } catch (e) { alert("Erreur modification : " + e.message); } };

  // ── Suppression avec confirmation ──
  const handleDelete = async (id, idProduit, nom) => {
    const ok = await askConfirm({
      title: "Supprimer le produit",
      message: `Le produit "${nom}" sera supprimé définitivement de l'inventaire. Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await window.api.deleteProduit(idProduit || id);
      await loadProducts();
    } catch (e) {
      alert("Erreur suppression : " + e.message);
    }
  };

  const handleTransaction = async (data) => {
    try { await window.api.addTransaction(data); await loadProducts(); } catch (e) { alert("Erreur transaction : " + e.message); }
  };

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      return (!q || p.nom.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q))
          && (!catFilter || p.categorie === catFilter);
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

  const handleSort = key => { if (sortKey === key) setSortDir(d => -d); else { setSortKey(key); setSortDir(1); } };
  const SortIcon   = ({ col }) => sortKey !== col
    ? <span style={{ color: C.muted, fontSize: 10, marginLeft: 4 }}>↕</span>
    : <span style={{ color: C.accent, fontSize: 10, marginLeft: 4 }}>{sortDir === 1 ? '↑' : '↓'}</span>;

  const COLS = [
    { key: 'nom',       label: 'Produit',   sortable: true  },
    { key: 'reference', label: 'Référence', sortable: true  },
    { key: 'categorie', label: 'Catégorie', sortable: true  },
    { key: 'stock',     label: 'Stock',     sortable: true  },
    { key: 'prix',      label: 'Prix',      sortable: true  },
    { key: 'actions',   label: '',          sortable: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundImage: `url(${gym2})`, backgroundSize: 'cover', backgroundPosition: 'center 35%', backgroundAttachment: 'fixed', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,15,17,0.62)', pointerEvents: 'none', zIndex: -1 }} />

      {/* Hero */}
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
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3.4rem', fontWeight: 800, letterSpacing: 2, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>Magasin</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { count: products.length, label: 'produits',     color: C.muted  },
                { count: totalStock,      label: 'en stock',     color: C.green  },
                ...(lowStock > 0 ? [{ count: lowStock, label: 'stock faible', color: C.accent }] : []),
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
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.accent, color: '#fff', border: 'none', borderRadius: 11, padding: '13px 24px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(229,57,53,0.4)', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(229,57,53,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(229,57,53,0.4)'; }}
          ><Plus size={17} /> Ajouter un produit</button>
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 48px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <StatCard icon={Package}       label="Produits" value={products.length} sub="articles au catalogue"    accent={C.accent} />
          {lowStock > 0 && <StatCard icon={AlertTriangle} label="Alerte" value={lowStock} sub="articles en stock faible" accent={C.gold} />}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 420 }}>
            <Search size={14} color={C.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Rechercher nom, référence, catégorie..." value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px 10px 36px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = C.accentBorder}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['', ...CATEGORIES].map(cat => {
              const cs = CAT_STYLE[cat]; const active = catFilter === cat;
              return (
                <button key={cat || 'all'} onClick={() => { setCatFilter(cat); setCurrentPage(1); }}
                  style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${active ? (cs?.border || C.accentBorder) : C.border}`, background: active ? (cs?.bg || C.accentDim) : 'transparent', color: active ? (cs?.color || C.accent) : C.muted, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Barlow', sans-serif", transition: 'all 0.15s' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px 12px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Liste des produits</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: C.accentDim, color: C.accent, padding: '3px 9px', borderRadius: 20, border: `1px solid ${C.accentBorder}` }}>{products.length} articles</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {COLS.map(col => (
                    <th key={col.key} onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      style={{ textAlign: 'left', padding: '11px 22px', fontSize: '0.65rem', color: sortKey === col.key ? C.accent : C.muted, letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {col.label}{col.sortable && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} color={C.accent} /></div>
                      <div style={{ color: C.muted, fontSize: '0.875rem' }}>Chargement des produits...</div>
                    </div>
                  </td></tr>
                ) : paginated.length > 0 ? paginated.map((p, i) => {
                  const cs = CAT_STYLE[p.categorie] || { bg: 'rgba(255,255,255,0.06)', color: C.muted, border: C.border };
                  const stockLow = p.stock <= 5;
                  const isLast   = i === paginated.length - 1;
                  return (
                    <tr key={p.id}
                      style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={14} color={C.accent} /></div>
                          <span style={{ color: C.text, fontSize: '0.875rem', fontWeight: 600 }}>{p.nom}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 22px' }}>
                        <code style={{ color: C.muted, fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5, border: `1px solid ${C.border}` }}>{p.reference}</code>
                      </td>
                      <td style={{ padding: '15px 22px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>{p.categorie}</span>
                      </td>
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (p.stock / 60) * 100)}%`, background: stockLow ? C.accent : p.stock <= 15 ? C.gold : C.green, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: stockLow ? C.accent : C.text }}>{p.stock}</span>
                          {stockLow && <span style={{ fontSize: '0.6rem', fontWeight: 800, color: C.accent, background: C.accentDim, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Faible</span>}
                        </div>
                      </td>
                      <td style={{ padding: '15px 22px' }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 800, color: C.text }}>
                          {p.prix.toLocaleString('fr-DZ')}<span style={{ color: C.accent, fontWeight: 700, fontSize: '0.8rem', marginLeft: 4 }}>DZD</span>
                        </span>
                      </td>
                      <td style={{ padding: '15px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Modifier */}
                          <button title="Modifier" onClick={() => { setEditingProduct(p); setShowModal(true); }}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.blueDim; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = C.blue; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                            <Edit2 size={12} />
                          </button>
                          {/* Supprimer */}
                          <button title="Supprimer" onClick={() => handleDelete(p.id, p.idProduit, p.nom)}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                            <Trash2 size={12} />
                          </button>
                          {/* Achat + */}
                          <button title="Achat réappro" onClick={() => { setSelectedProduct(p); setTransactionType('achat'); }}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.blue, fontSize: '1rem', fontWeight: 700, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.blueDim; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}>+</button>
                          {/* Vente − */}
                          <button title="Vendre" onClick={() => { setSelectedProduct(p); setTransactionType('vente'); }}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.accent, fontSize: '1rem', fontWeight: 700, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.borderColor = C.accentBorder; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}>−</button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} color={C.accent} /></div>
                      <div style={{ color: C.muted, fontSize: '0.875rem' }}>Aucun produit trouvé</div>
                      {search && <div style={{ fontSize: '0.75rem', color: C.muted }}>pour « {search} »</div>}
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '0.75rem', color: C.muted }}>Page <strong style={{ color: C.subtle }}>{safePage}</strong> sur <strong style={{ color: C.subtle }}>{totalPages}</strong></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === 1 ? C.border : C.muted, cursor: safePage === 1 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>← Préc.</button>
                {getPages(safePage, totalPages).map((page, idx) =>
                  page === '…' ? <span key={`d-${idx}`} style={{ color: C.muted, fontSize: '0.82rem', padding: '0 4px' }}>…</span> : (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: page === safePage ? 'none' : `1px solid ${C.border}`, background: page === safePage ? C.accent : 'transparent', color: page === safePage ? '#fff' : C.muted, fontSize: '0.82rem', cursor: 'pointer', fontWeight: page === safePage ? 700 : 400, fontFamily: "'Barlow', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: page === safePage ? '0 4px 12px rgba(229,57,53,0.35)' : 'none' }}>{page}</button>
                  )
                )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: safePage === totalPages ? C.border : C.muted, cursor: safePage === totalPages ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Suiv. →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {transactionType && selectedProduct && (
        <TransactionModal
          type={transactionType} produit={selectedProduct}
          onClose={() => { setTransactionType(null); setSelectedProduct(null); }}
          onConfirm={handleTransaction}
        />
      )}
      {showModal && (
        <NouveauProduitModal
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={editingProduct ? handleUpdate : handleAdd}
          initialData={editingProduct}
        />
      )}

      {/* Modal confirmation suppression */}
      <DeleteConfirm {...confirmProps} />
    </div>
  );
};

export default Magasin;