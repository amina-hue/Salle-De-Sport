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
    .then(data => {
      console.log('niveau reçu:', data);       // ← AJOUTER
      setRemiseAdherent(data?.remise ?? 0);
    })
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

  /* Calculs */
  const qte             = Number(quantite) || 0;
  const prixApresRemise = isVente
    ? (produit.prix || 0) * (1 - remiseAdherent / 100)
    : 0;
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

  const hColor    = isVente ? C.accent  : C.blue;
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

        {/* Header */}
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

        {/* Body */}
        <div style={{ padding: '22px 24px 26px' }}>

          {/* Sélection adhérent */}
          {isVente && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>
                <User size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Adhérent
                <span style={{ color: C.muted, fontWeight: 400, marginLeft: 4 }}>(optionnel)</span>
              </label>
              <select
                value={adherentId}
                onChange={e => setAdherentId(e.target.value)}
                disabled={loadingAdh}
                style={{ ...inputSt, appearance: 'none', cursor: loadingAdh ? 'wait' : 'pointer', color: adherentId ? C.text : C.muted , background: '#161012' }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e  => e.target.style.borderColor = C.border}
              >
                <option value="" style={{ background: '#161012', color: '#6b7280' }}>— Vente anonyme —</option>
                {adherents.map(a => (
                  <option key={a.idAdherent} value={a.idAdherent} style={{ background: '#161012', color: '#f0f0f0' }}>
                    {a.nom} {a.prenom}
                  </option>
                ))}
              </select>

              {/* Badge remise */}
              {adherentId && remiseAdherent > 0 && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: C.greenDim, border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: C.green, fontWeight: 700 }}>
                    -{remiseAdherent}% remise fidélité appliquée
                  </span>
                </div>
              )}

              {/* Badge points gagnés */}
              {adherentId && pointsGagnes > 0 && (
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: C.goldDim, border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: C.gold, fontWeight: 700 }}>
                    ★ +{pointsGagnes} point{pointsGagnes > 1 ? 's' : ''} de fidélité
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quantité */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Quantité <span style={{ color: C.accent }}>*</span></label>
            <input
              type="number" value={quantite} min="1" placeholder="ex: 5"
              onChange={e => setQuantite(e.target.value)}
              style={inputSt}
              onFocus={e => e.target.style.borderColor = isVente ? C.accentBorder : 'rgba(59,130,246,0.4)'}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Prix d'achat */}
          {!isVente && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Prix d'achat unitaire (DZD) <span style={{ color: C.accent }}>*</span></label>
              <input
                type="number" value={prixAchat} min="0" placeholder="ex: 3 000"
                onChange={e => setPrixAchat(e.target.value)}
                style={inputSt}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          {/* Preview */}
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
                    {!stockInsuff && stockApres <= 5 && (
                      <span style={{ fontSize: '0.65rem', color: C.gold, fontWeight: 700, marginLeft: 8 }}>⚠ Stock faible</span>
                    )}
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

          {/* Boutons */}
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