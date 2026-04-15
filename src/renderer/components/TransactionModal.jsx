function TransactionModal({ type, produit, onClose, onConfirm }) {
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');

  const isVente = type === "vente";

  const handleSubmit = () => {
    if (!quantite || Number(quantite) <= 0) {
      alert("Quantité invalide");
      return;
    }

    if (!isVente && (!prix || Number(prix) <= 0)) {
      alert("Prix d'achat invalide");
      return;
    }

    if (isVente && Number(quantite) > produit.stock) {
      alert("Stock insuffisant !");
      return;
    }

    onConfirm({
      produit_id: produit.idProduit,
      quantite: Number(quantite),
      prix: isVente ? null : Number(prix),
      type
    });

    onClose();
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
      }}
    >
      <div style={{
        width: 420,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#161012',
        border: `1px solid ${C.border}`,
        fontFamily: "'Barlow', sans-serif"
      }}>

        {/* HEADER */}
        <div style={{
          padding: '20px',
          background: isVente ? C.accentDim : C.blueDim,
          borderBottom: `1px solid ${C.border}`
        }}>
          <h2 style={{
            margin: 0,
            color: isVente ? C.accent : C.blue,
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: 'uppercase'
          }}>
            {isVente ? "Vente produit" : "Achat produit"}
          </h2>
          <p style={{ color: C.muted, fontSize: '0.8rem', marginTop: 6 }}>
            {produit.nom}
          </p>
        </div>

        {/* BODY */}
        <div style={{ padding: 20 }}>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Quantité *</label>
            <FocusInput
              type="number"
              value={quantite}
              onChange={e => setQuantite(e.target.value)}
              placeholder="ex: 5"
            />
          </div>

          {!isVente && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Prix d'achat (DZD) *</label>
              <FocusInput
                type="number"
                value={prix}
                onChange={e => setPrix(e.target.value)}
                placeholder="ex: 3000"
              />
            </div>
          )}

          {/* Preview */}
          <div style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 12,
            marginTop: 10
          }}>
            <div style={{ fontSize: '0.75rem', color: C.muted }}>
              Stock actuel : <strong>{produit.stock}</strong>
            </div>

            {quantite && (
              <div style={{ fontSize: '0.75rem', marginTop: 6 }}>
                Stock après :
                <strong style={{ marginLeft: 6 }}>
                  {isVente
                    ? produit.stock - Number(quantite)
                    : produit.stock + Number(quantite)}
                </strong>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 20
          }}>
            <button onClick={onClose} style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              padding: '8px 16px',
              borderRadius: 8,
              color: C.muted,
              cursor: 'pointer'
            }}>
              Annuler
            </button>

            <button onClick={handleSubmit} style={{
              background: isVente ? C.accent : C.blue,
              border: 'none',
              padding: '8px 18px',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}>
              {isVente ? "Vendre" : "Acheter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}