// ─── Composant : HistoriqueAbonnements ──────────────────────────────────────
function HistoriqueAbonnements({ idAdherent }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idAdherent) { setLoading(false); return; }
    window.api.getHistoriqueAbonnements(idAdherent)
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [idAdherent]);

  const statutColor = (s) => {
    const st = (s || '').toLowerCase();
    if (st === 'actif')    return { color: C.green,  bg: 'rgba(34,197,94,0.15)'  };
    if (st === 'suspendu') return { color: C.orange, bg: 'rgba(249,115,22,0.15)' };
    return                        { color: C.accent, bg: 'rgba(229,57,53,0.15)'  };
  };

  const payColor = (du, paye) => {
    const reste = (du || 0) - (paye || 0);
    if (reste <= 0) return { label: 'Soldé',   color: C.green,  bg: 'rgba(34,197,94,0.12)'  };
    if (paye > 0)   return { label: 'Partiel', color: C.gold,   bg: 'rgba(245,158,11,0.12)' };
    return                 { label: 'Impayé',  color: C.accent, bg: 'rgba(229,57,53,0.12)'  };
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        Historique des abonnements
      </div>

      <div style={{ border: `1px solid #3d3233`, borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '14px', textAlign: 'center', color: C.muted, fontSize: '0.78rem' }}>
            Chargement…
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '14px', textAlign: 'center', color: C.muted, fontSize: '0.78rem' }}>
            Aucun historique disponible
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Type', 'Début', 'Fin', 'Statut', 'Paiement'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const sc  = statutColor(row.statut);
                const pc  = payColor(row.montantDu, row.totalPaye);
                const reste = (parseFloat(row.montantDu) || 0) - (parseFloat(row.totalPaye) || 0);
                return (
                  <tr key={row.idAbonnement} style={{ borderTop: '1px solid #3d3233', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '7px 10px', color: C.text, fontWeight: 600 }}>
                      {row.typeNom || '—'}
                    </td>
                    <td style={{ padding: '7px 10px', color: C.muted }}>
                      {formatDate(row.dateDebut)}
                    </td>
                    <td style={{ padding: '7px 10px', color: C.muted }}>
                      {formatDate(row.dateFin)}
                    </td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 4, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
                        {row.statut || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ background: pc.bg, color: pc.color, borderRadius: 4, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}
                            title={reste > 0 ? `Reste : ${reste.toFixed(2)} DA` : 'Entièrement payé'}>
                        {pc.label}
                        {reste > 0 && <span style={{ opacity: 0.8, marginLeft: 4 }}>({reste.toFixed(0)} DA)</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}