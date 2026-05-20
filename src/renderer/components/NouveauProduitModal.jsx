function NouveauProduitModal({ onSave, onClose }) {
  const [form, setForm] = useState({ nom: '', reference: '', categorie: '', stock: '', prix: '', note: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const catStyle = CAT_STYLE[form.categorie];
  const hasPreview = form.nom || form.categorie || form.prix;

  const handleSave = () => {
    const { nom, reference, categorie, stock, prix } = form;
    if (!nom || !reference || !categorie || !stock || !prix) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    onSave({ nom, reference, categorie, stock: Number(stock), prix: Number(prix) });
    onClose();
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: '#161012',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Div intérieur empêche le clic de remonter au parent */}
      <div
        onClick={e => e.stopPropagation()} // ← empêche la propagation, donc on peut cliquer dans la modale
        style={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
          fontFamily: "'Barlow', sans-serif",
          background: '#161012',
        }}
      >
        {/* Hero */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1c0a0a 0%, #2a1010 50%, #160808 100%)', padding: '28px 28px 24px' }}>
          <h2 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 800 }}>
            Nouveau Produit
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.text,
              cursor: 'pointer',
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '26px 28px 30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Nom du produit *</label>
              <FocusInput type="text" placeholder="ex: Haltères 10kg" value={form.nom} onChange={e => set('nom', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Référence *</label>
              <FocusInput type="text" placeholder="ex: ALG016" value={form.reference} onChange={e => set('reference', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Catégorie *</label>
              <FocusInput tag="select" value={form.categorie} onChange={e => set('categorie', e.target.value)}>
                <option value="" style={{ background: '#1a1516', color: '#7a7f8e' }}>Sélectionner...</option>
                {CATEGORIES.map(c => <option key={c} value={c}style={{ background: '#1a1516', color: '#f0f0f0' }}>{c}</option>)}
              </FocusInput>
            </div>
            <div>
              <label style={lbl}>Stock initial *</label>
              <FocusInput type="number" placeholder="ex: 20" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Prix unitaire (DZD) *</label>
            <FocusInput type="number" placeholder="ex: 6 000" min="0" value={form.prix} onChange={e => set('prix', e.target.value)} />
          </div>

          {/* Note */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Note</label>
            <FocusInput tag="textarea" rows={3} placeholder="Informations supplémentaires..." value={form.note} onChange={e => set('note', e.target.value)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose} style={{ border: `1px solid ${C.borderStrong}`, borderRadius: 9, padding: '10px 20px', color: C.muted }}>
              Annuler
            </button>
            <button onClick={handleSave} style={{ background: C.accent, color: '#fff', borderRadius: 9, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={15} /> Ajouter le produit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}