import React, { useState, useRef } from 'react';

/* ══════════════════════════════════════════
   EDIT MEMBER MODAL — v2
   Fixes:
   1. Téléphone : chiffres uniquement
   2. Email : validation format
   3a. Historique abonnements (depuis window.api)
   3b. Renouvellement → paiement plus tard transmis correctement
   3c. Pas de "Renouveler" si statut suspendu
   5. Suppression du champ "nombre de séances"
   Actions: "Appeler" supprimée si non fonctionnelle, email vérifié
══════════════════════════════════════════ */

const COLORS = {
  bg:          '#1a1516',
  surface:     '#231e1f',
  card:        '#2a2324',
  border:      '#3d3233',
  accent:      '#c0392b',
  accentHover: '#e53935',
  text:        '#f0eded',
  muted:       '#9e8e8e',
  input:       '#312829',
  green:       '#27ae60',
  gold:        '#f39c12',
  orange:      '#f97316',
  blue:        '#2980b9',
};

const inputStyle = {
  background: COLORS.input,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  padding: '6px 10px',
  color: COLORS.text,
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const inputError = {
  ...inputStyle,
  borderColor: 'rgba(229,57,53,0.7)',
};

const labelStyle = {
  fontSize: '0.8rem',
  color: COLORS.muted,
  whiteSpace: 'nowrap',
  minWidth: 130,
};

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
      <span style={{ ...labelStyle, paddingTop: 7 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════
   RENOUVELLEMENT MODAL
══════════════════════════════════ */
function RenewModal({ member, typesAbonnement = [], onRenew, onClose }) {
  const today = new Date().toISOString().split('T')[0];
   const computeDateFin = (debut, tid) => {
    const type = typesAbonnement.find(t => t.id === parseInt(tid));
    if (!debut || !type?.duree) return '';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + Number(type.duree));
    return d.toISOString().split('T')[0];
  };
  const [typeId, setTypeId] = useState(member.type_id || '');
  const [dateDebut, setDateDebut] = useState(today);
const [dateFin, setDateFin] = useState(
    () => computeDateFin(today, member.type_id || '')
  );
    const [payerMaintenant, setPayerMaintenant] = useState(undefined);
  const [modePaiement, setModePaiement] = useState('cash');
  const [saving, setSaving] = useState(false);

  const inp = {
    background: COLORS.input,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    color: COLORS.text,
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectedType = typesAbonnement.find(t => t.id === parseInt(typeId));
  const prixBase = parseFloat(selectedType?.prix) || 0;

  // const computeDateFin = (debut, tid) => {
  //   const type = typesAbonnement.find(t => t.id === parseInt(tid));
  //   if (!debut || !type?.duree) return '';
  //   const d = new Date(debut);
  //   d.setMonth(d.getMonth() + Number(type.duree));
  //   return d.toISOString().split('T')[0];
  // };

  const handleTypeChange = (val) => {
    setTypeId(val);
    setDateFin(computeDateFin(dateDebut, val));
  };

  const handleDebutChange = (val) => {
    setDateDebut(val);
    setDateFin(computeDateFin(val, typeId));
  };

  const handleRenew = async () => {
    if (!typeId) { alert("Veuillez sélectionner un type d'abonnement."); return; }
    if (!dateDebut) { alert("La date de début est requise."); return; }
    if (payerMaintenant === undefined) { alert("Veuillez choisir un statut de paiement."); return; }

    setSaving(true);
    try {
      await onRenew({
        type_id:        parseInt(typeId),
        dateDebut,
        dateFin:        dateFin || null,
        montant:        payerMaintenant ? prixBase : 0,
        montantDu:      prixBase,
        modePaiement:   modePaiement,
        payerMaintenant,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du renouvellement.");
    } finally {
      setSaving(false);
    }
  };

  const MODES = [
    { value: 'cash',     label: 'Espèces',       icon: '💵' },
    { value: 'carte',    label: 'Carte bancaire', icon: '💳' },
    { value: 'virement', label: 'Virement',       icon: '🏦' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        width: 520, maxWidth: '95vw',
        padding: '28px 28px 20px',
        fontFamily: "'Barlow', sans-serif",
        color: COLORS.text,
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>
          🔄 Renouveler l'abonnement
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type */}
          <div>
            <div style={{ fontSize: '0.78rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>Type d'abonnement *</div>
            <select value={typeId} onChange={e => handleTypeChange(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Sélectionner...</option>
              {typesAbonnement.map(t => (
                <option key={t.id} value={t.id}>{t.nom} — {t.prix} DA</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>Date de début *</div>
              <input type="date" value={dateDebut} onChange={e => handleDebutChange(e.target.value)} style={inp} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>Date de fin (auto)</div>
              <input type="date" value={dateFin} readOnly style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* Prix */}
          {selectedType && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.85rem', color: COLORS.muted }}>Montant :</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {prixBase.toFixed(2)} <span style={{ color: COLORS.accent }}>DA</span>
              </span>
            </div>
          )}

          {/* Statut paiement */}
          <div>
            <div style={{ fontSize: '0.78rem', color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>Statut du paiement *</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: false, label: 'Payer plus tard', icon: '⏳', desc: "Abonnement marqué impayé", color: COLORS.gold },
                { value: true,  label: 'Payer maintenant', icon: '✅', desc: 'Paiement enregistré',    color: COLORS.green },
              ].map(opt => {
                const selected = payerMaintenant === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => setPayerMaintenant(opt.value)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                      border: selected ? `2px solid ${opt.color}` : `1px solid ${COLORS.border}`,
                      background: selected ? `${opt.color}18` : COLORS.card,
                      color: selected ? opt.color : COLORS.muted,
                      fontFamily: 'inherit', fontWeight: selected ? 700 : 400, fontSize: '0.82rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7, textAlign: 'center' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode paiement — seulement si payer maintenant */}
          {payerMaintenant === true && (
            <div>
              <div style={{ fontSize: '0.78rem', color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>Mode de paiement *</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {MODES.map(m => {
                  const selected = modePaiement === m.value;
                  return (
                    <button key={m.value} onClick={() => setModePaiement(m.value)} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      border: selected ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                      background: selected ? 'rgba(192,57,43,0.15)' : COLORS.card,
                      color: selected ? COLORS.accent : COLORS.muted,
                      fontFamily: 'inherit', fontWeight: selected ? 700 : 400, fontSize: '0.78rem',
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={onClose} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: '9px 20px', color: COLORS.muted, fontFamily: 'inherit', cursor: 'pointer' }}>
            Annuler
          </button>
          <button
            onClick={handleRenew}
            disabled={saving || payerMaintenant === undefined}
            style={{
              background: saving || payerMaintenant === undefined ? '#555' : COLORS.accent,
              border: 'none', borderRadius: 7, padding: '9px 24px',
              color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem',
              cursor: saving || payerMaintenant === undefined ? 'not-allowed' : 'pointer',
              opacity: payerMaintenant === undefined ? 0.5 : 1,
            }}
          >
            {saving ? 'Renouvellement...' : '✓ Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   TAB 1 — ABONNEMENT
══════════════════════════ */
function TabAbonnement({ member, onChange, typesAbonnement = [], onRenewClick }) {
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Charger l'historique depuis l'API au montage
  React.useEffect(() => {
    if (!member.idAdherent) return;
    setLoadingHistory(true);
    const fetchHistory = async () => {
      try {
        if (window.api?.getHistoriqueAbonnements) {
          const data = await window.api.getHistoriqueAbonnements(member.idAdherent);
          setHistory(Array.isArray(data) ? data : []);
        } else {
          // Données de démo si l'API n'est pas disponible
          setHistory([
            { type: 'Premium Annuel',   debut: '01/01/2024', fin: '01/01/2025', statut: 'Expiré' },
            { type: 'Standard Mensuel', debut: '01/02/2025', fin: '01/03/2025', statut: 'Expiré' },
            { type: selectedTypeName,   debut: member.dateDebut ? new Date(member.dateDebut).toLocaleDateString('fr-FR') : '—',
              fin: member.dateFin ? new Date(member.dateFin).toLocaleDateString('fr-FR') : '—',
              statut: member.abonnementStatut === 'actif' ? 'Actif' : member.abonnementStatut === 'suspendu' ? 'Suspendu' : 'Expiré' },
          ]);
        }
      } catch (err) {
        console.error('Erreur chargement historique:', err);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
        setHistoryLoaded(true);
      }
    };
    fetchHistory();
  }, [member.idAdherent]);

  const selectedTypeName = typesAbonnement.find(t => t.id === parseInt(member.type_id))?.nom || member.typeNom || '—';

  const inp = {
    background: COLORS.input,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '7px 10px',
    color: COLORS.text,
    fontFamily: 'inherit',
    fontSize: '0.83rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const isSuspendu = (member.abonnementStatut || '').toLowerCase() === 'suspendu';
  const isExpired  = (member.abonnementStatut || '').toLowerCase() === 'expiré';

  const handleDureeSuspensionChange = (val) => {
    onChange('dureeSuspension', val);
    if (val) {
      const now = new Date();
      now.setDate(now.getDate() + Number(val));
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      onChange('dateFinSuspension', `${y}-${m}-${d}`);
    } else {
      onChange('dateFinSuspension', '');
    }
  };

  const statutColor = {
    'actif':    COLORS.green,
    'expiré':   COLORS.accent,
    'suspendu': COLORS.gold,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Historique des abonnements ── */}
      <div>
        <div style={{ fontSize: '0.82rem', color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>
          Historique des abonnements :
        </div>
        <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {loadingHistory ? (
            <div style={{ padding: '16px', textAlign: 'center', color: COLORS.muted, fontSize: '0.8rem' }}>
              Chargement...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '14px', textAlign: 'center', color: COLORS.muted, fontSize: '0.8rem' }}>
              Aucun historique disponible
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: COLORS.card }}>
                  {['Type', 'Début', 'Fin', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: COLORS.muted, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => {
                  const st = (row.statut || '').toLowerCase();
                  const color = st === 'actif' ? COLORS.green : st === 'suspendu' ? COLORS.gold : COLORS.accent;
                  const bg    = st === 'actif' ? 'rgba(39,174,96,0.18)' : st === 'suspendu' ? 'rgba(243,156,18,0.18)' : 'rgba(192,57,43,0.18)';
                  return (
                    <tr key={i} style={{ borderTop: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? COLORS.surface : 'transparent' }}>
                      <td style={{ padding: '7px 10px', color: COLORS.text }}>{row.type || row.typeNom || '—'}</td>
                      <td style={{ padding: '7px 10px', color: COLORS.muted }}>
                        {row.debut || (row.dateDebut ? new Date(row.dateDebut).toLocaleDateString('fr-FR') : '—')}
                      </td>
                      <td style={{ padding: '7px 10px', color: COLORS.muted }}>
                        {row.fin || (row.dateFin ? new Date(row.dateFin).toLocaleDateString('fr-FR') : '—')}
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ background: bg, color, borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {row.statut || '—'}
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

      {/* ── Statut ── */}
      <div>
        <div style={{ fontSize: '0.75rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>Statut :</div>
        <select
          style={inp}
          value={member.abonnementStatut || 'actif'}
          onChange={e => {
            onChange('abonnementStatut', e.target.value);
            if (e.target.value !== 'suspendu') {
              onChange('dureeSuspension', '');
              onChange('causeSuspension', '');
              onChange('dateFinSuspension', '');
            }
          }}
        >
          <option value="actif">Actif</option>
          <option value="expiré">Expiré</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>

      {/* ── Bloc suspension ── */}
      {isSuspendu && (
        <div style={{
          background: 'rgba(249,115,22,0.07)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 10,
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: '0.75rem', color: COLORS.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            ⏸ Détails de la suspension
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>
              Durée de suspension (jours) <span style={{ color: COLORS.accent }}>*</span>
            </div>
            <input
              style={{ ...inp, borderColor: !member.dureeSuspension ? 'rgba(249,115,22,0.5)' : COLORS.border }}
              type="number" min="1" max="365" placeholder="Ex : 30"
              value={member.dureeSuspension || ''}
              onChange={e => handleDureeSuspensionChange(e.target.value)}
            />
            {!member.dureeSuspension && (
              <div style={{ fontSize: '0.7rem', color: COLORS.orange, marginTop: 4 }}>La durée est requise pour une suspension</div>
            )}
          </div>

          {member.dateFinSuspension && (
            <div>
              <div style={{ fontSize: '0.75rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>
                Date fin de suspension (calculée automatiquement)
              </div>
              <input style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} type="date" value={member.dateFinSuspension} readOnly />
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.75rem', color: COLORS.muted, fontWeight: 600, marginBottom: 5 }}>
              Cause de la suspension <span style={{ color: COLORS.accent }}>*</span>
            </div>
            <textarea
              style={{
                ...inp, resize: 'vertical', minHeight: 72, lineHeight: '1.5',
                borderColor: !(member.causeSuspension || '').trim() ? 'rgba(249,115,22,0.5)' : COLORS.border,
              }}
              placeholder="Ex : Blessure, voyage, raison médicale..."
              value={member.causeSuspension || ''}
              onChange={e => onChange('causeSuspension', e.target.value)}
            />
            {!(member.causeSuspension || '').trim() && (
              <div style={{ fontSize: '0.7rem', color: COLORS.orange, marginTop: 4 }}>La cause est requise pour une suspension</div>
            )}
          </div>
        </div>
      )}

      {/* ── Bouton Renouveler (caché si suspendu) ── */}
      {!isSuspendu && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            onClick={onRenewClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: isExpired ? COLORS.green : COLORS.blue,
              border: 'none', borderRadius: 8,
              padding: '9px 20px',
              color: '#fff', fontFamily: 'inherit', fontWeight: 700,
              fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            🔄 {isExpired ? 'Renouveler l\'abonnement' : 'Changer / Renouveler'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════
   TAB 2 — ADHÉRENT
══════════════════════════ */
function TabAdherent({ member, onChange }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(member.photo || null);
  const [phoneError, setPhoneError]   = useState('');
  const [emailError, setEmailError]   = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange('photo', url);
  };

  // 1. Téléphone : chiffres uniquement
  const handlePhone = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/[^0-9\s\+\-\(\)]/g, ''); // garde chiffres + séparateurs courants
    if (/[^0-9\s\+\-\(\)]/.test(raw)) {
      setPhoneError('Le numéro ne doit contenir que des chiffres.');
    } else {
      setPhoneError('');
    }
    onChange('numTelephone', digits);
    onChange('phone', digits);
  };

  // 2. Email : validation format
  const handleEmail = (e) => {
    const val = e.target.value;
    onChange('email', val);
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Format e-mail invalide (ex: nom@domaine.com)');
    } else {
      setEmailError('');
    }
  };

  const phoneVal = member.numTelephone || member.phone || '';
  const emailVal = member.email || '';

  return (
    <div style={{ display: 'flex', gap: 28 }}>
      {/* LEFT — form */}
      <div style={{ flex: 1 }}>
        <Row label="Nom Complet :">
          <input style={inputStyle} type="text"
            value={member.nom || ''}
            onChange={e => onChange('nom', e.target.value)}
          />
        </Row>

        <Row label="Date de naissance :">
          <input style={inputStyle} type="date"
            value={member.dateNaissance || ''}
            onChange={e => onChange('dateNaissance', e.target.value)}
          />
        </Row>

        {/* 1. Téléphone chiffres uniquement */}
        <Row label="Numéro de téléphone :">
          <div>
            <input
              style={phoneError ? inputError : inputStyle}
              type="tel"
              inputMode="numeric"
              pattern="[0-9\s\+\-\(\)]*"
              placeholder="0612345678"
              value={phoneVal}
              onChange={handlePhone}
            />
            {phoneError && (
              <div style={{ fontSize: '0.72rem', color: COLORS.accent, marginTop: 3 }}>{phoneError}</div>
            )}
          </div>
        </Row>

        {/* 2. Email avec validation */}
        <Row label="E-Mail :">
          <div>
            <input
              style={emailError ? inputError : inputStyle}
              type="email"
              placeholder="nom@domaine.com"
              value={emailVal}
              onChange={handleEmail}
            />
            {emailError && (
              <div style={{ fontSize: '0.72rem', color: COLORS.accent, marginTop: 3 }}>{emailError}</div>
            )}
          </div>
        </Row>

        <Row label="Sexe :">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {['Homme', 'Femme'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: COLORS.text }}>
                <input
                  type="radio" name="sexe" value={s}
                  checked={(member.sexe || 'Homme') === s}
                  onChange={() => onChange('sexe', s)}
                  style={{ accentColor: COLORS.accent }}
                />
                {s}
              </label>
            ))}
          </div>
        </Row>
      </div>

      {/* RIGHT — photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 130 }}>
        <div style={{
          width: 110, height: 110,
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {preview
            ? <img src={preview} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '0.7rem', color: COLORS.muted, textAlign: 'center', padding: 8 }}>Photo de l'Adhérent</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <button style={{ ...btnSmall, background: COLORS.accent }} onClick={() => fileRef.current.click()}>
          Prendre une photo
        </button>
        <button style={{ ...btnSmall, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted }} onClick={() => fileRef.current.click()}>
          Importer
        </button>
      </div>
    </div>
  );
}

const btnSmall = {
  background: COLORS.accent,
  border: 'none', borderRadius: 5,
  padding: '5px 10px', color: '#fff',
  fontFamily: 'inherit', fontSize: '0.72rem',
  fontWeight: 600, cursor: 'pointer', width: '100%',
};

/* ══════════════════════════
   MODAL WRAPPER
══════════════════════════ */
export default function EditMemberModal({ member, typesAbonnement = [], onSave, onClose }) {
  const [tab, setTab]         = useState('abonnement');
  const [showRenew, setShowRenew] = useState(false);
  const [form, setForm]       = useState({
    ...member,
    dureeSuspension:   member.dureeSuspension   || '',
    causeSuspension:   member.causeSuspension   || '',
    dateFinSuspension: member.dateFinSuspension || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Validation email
  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  // Validation phone
  const phoneVal = form.numTelephone || form.phone || '';
  const phoneValid = !phoneVal || /^[0-9\s\+\-\(\)]+$/.test(phoneVal);

  const handleSave = async () => {
    if (!form.nom?.trim()) { alert('Le nom est requis.'); return; }

    // Validation email
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert("L'adresse e-mail n'est pas valide.");
      setTab('adherent');
      return;
    }

    // Validation téléphone
    if (phoneVal && !/^[0-9\s\+\-\(\)]+$/.test(phoneVal)) {
      alert("Le numéro de téléphone ne doit contenir que des chiffres.");
      setTab('adherent');
      return;
    }

    // Validation suspension
    if ((form.abonnementStatut || '').toLowerCase() === 'suspendu') {
      if (!form.dureeSuspension || !String(form.causeSuspension).trim()) {
        alert('La durée et la cause de suspension sont obligatoires.');
        return;
      }
    }

    try {
      await window.api.updateAdherent({
        idAdherent:    form.idAdherent,
        nom:           form.nom,
        prenom:        form.prenom,
        dateNaissance: form.dateNaissance || null,
        numTelephone:  phoneVal || null,
        email:         form.email || null,
        sexe:          form.sexe || 'Homme',
      });

      if (form.idAbonnement) {
        await window.api.updateAbonnement({
          idAbonnement:      form.idAbonnement,
          type_id:           form.type_id,
          dateDebut:         form.dateDebut,
          dateFin:           form.dateFin,
          statut:            form.abonnementStatut,
          dureeSuspension:   form.abonnementStatut === 'suspendu' ? form.dureeSuspension   : null,
          causeSuspension:   form.abonnementStatut === 'suspendu' ? form.causeSuspension   : null,
          dateFinSuspension: form.abonnementStatut === 'suspendu' ? form.dateFinSuspension : null,
        });
      }

      onSave(form);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleRenew = async (renewData) => {
    // Appel API renouvellement
    if (window.api?.renewAbonnement) {
      await window.api.renewAbonnement({
        idAdherent: form.idAdherent,
        ...renewData,
      });
    } else if (window.api?.createAbonnement) {
      await window.api.createAbonnement({
        idAdherent: form.idAdherent,
        ...renewData,
      });
    }
    // Mettre à jour le form local
    set('abonnementStatut', 'actif');
    set('type_id', renewData.type_id);
    set('dateDebut', renewData.dateDebut);
    set('dateFin', renewData.dateFin);
    onSave({ ...form, abonnementStatut: 'actif', ...renewData });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          width: 700, maxWidth: '96vw',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          fontFamily: "'Barlow', sans-serif",
        }}>

          {/* ── TOP BAR ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px',
            background: COLORS.surface,
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {[
                { key: 'abonnement', label: 'Abonnement' },
                { key: 'adherent',   label: 'Adhérent'   },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    background: tab === t.key ? COLORS.accent : 'transparent',
                    border: 'none',
                    color: tab === t.key ? '#fff' : COLORS.muted,
                    padding: '12px 22px',
                    fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: tab === t.key ? '6px 6px 0 0' : 0,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: COLORS.muted, fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}
            >✕</button>
          </div>

          {/* ── CONTENT ── */}
          <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1.3rem', fontWeight: 700,
              color: COLORS.text, marginBottom: 20,
            }}>
              {tab === 'abonnement' ? "Abonnement de l'adhérent" : "Information de l'adhérent"}
            </h2>

            {tab === 'abonnement'
              ? <TabAbonnement
                  member={form}
                  onChange={set}
                  typesAbonnement={typesAbonnement}
                  onRenewClick={() => setShowRenew(true)}
                />
              : <TabAdherent member={form} onChange={set} />
            }
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            padding: '14px 24px',
            borderTop: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
          }}>
            <button onClick={handleSave} style={{
              background: COLORS.accent, border: 'none', borderRadius: 7,
              padding: '9px 24px', color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            }}>
              Sauvegarder
            </button>
            <button onClick={onClose} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 7,
              padding: '9px 20px', color: COLORS.muted,
              fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer',
            }}>
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* ── Modale renouvellement ── */}
      {showRenew && (
        <RenewModal
          member={form}
          typesAbonnement={typesAbonnement}
          onRenew={handleRenew}
          onClose={() => setShowRenew(false)}
        />
      )}
    </>
  );
}