import React, { useState, useRef } from 'react';

/* ══════════════════════════════════════════
   EDIT MEMBER MODAL
   Props:
     member   – object with member data
     onSave   – fn(updatedMember)
     onClose  – fn()
══════════════════════════════════════════ */

const COLORS = {
  bg:      '#1a1516',
  surface: '#231e1f',
  card:    '#2a2324',
  border:  '#3d3233',
  accent:  '#c0392b',
  accentHover: '#e53935',
  text:    '#f0eded',
  muted:   '#9e8e8e',
  input:   '#312829',
  green:   '#27ae60',
  gold:    '#f39c12',
};

/* ── shared input style ── */
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
};

const labelStyle = {
  fontSize: '0.8rem',
  color: COLORS.muted,
  whiteSpace: 'nowrap',
  minWidth: 130,
};

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════
   TAB 1 — ABONNEMENT
══════════════════════════ */
function TabAbonnement({ member }) {
  const [history] = useState([
    { type: 'Premium Annuel',   debut: '01/01/2024', fin: '01/01/2025', statut: 'Expiré' },
    { type: 'Standard Mensuel', debut: '01/02/2025', fin: '01/03/2025', statut: 'Expiré' },
    { type: 'Premium Annuel',   debut: '01/04/2025', fin: '01/04/2026', statut: 'Actif'  },
  ]);

  return (
    <div>
      <div style={{ fontSize: '0.82rem', color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>
        Historique de l'abonnement :
      </div>
      <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: COLORS.card }}>
              {['Type', 'Début', 'Fin', 'Statut'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: COLORS.muted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? COLORS.surface : 'transparent' }}>
                <td style={{ padding: '7px 10px', color: COLORS.text }}>{row.type}</td>
                <td style={{ padding: '7px 10px', color: COLORS.muted }}>{row.debut}</td>
                <td style={{ padding: '7px 10px', color: COLORS.muted }}>{row.fin}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{
                    background: row.statut === 'Actif' ? 'rgba(39,174,96,0.18)' : 'rgba(192,57,43,0.18)',
                    color: row.statut === 'Actif' ? COLORS.green : COLORS.accent,
                    borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
                  }}>{row.statut}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════
   TAB 2 — ADHÉRENT
══════════════════════════ */
function TabAdherent({ member, onChange }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(member.photo || null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange('photo', url);
  };

  return (
    <div style={{ display: 'flex', gap: 28 }}>
      {/* LEFT — form */}
      <div style={{ flex: 1 }}>
        <Row label="Nom Complet :">
          <input style={inputStyle} type="text" value={member.nom} onChange={e => onChange('nom', e.target.value)} />
        </Row>
        <Row label="Date de naissance :">
          <input style={inputStyle} type="date" value={member.dateNaissance || ''} onChange={e => onChange('dateNaissance', e.target.value)} />
        </Row>
        <Row label="Numéro de téléphone :">
          <input style={inputStyle} type="text" value={member.phone} onChange={e => onChange('phone', e.target.value)} />
        </Row>
        <Row label="E-Mail :">
          <input style={inputStyle} type="email" value={member.email} onChange={e => onChange('email', e.target.value)} />
        </Row>
        <Row label="Sexe :">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {['Homme', 'Femme'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: COLORS.text }}>
                <input
                  type="radio"
                  name="sexe"
                  value={s}
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
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {preview
            ? <img src={preview} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '0.7rem', color: COLORS.muted, textAlign: 'center', padding: 8 }}>Photo de l'Adhérent</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <button
          style={{ ...btnSmall, background: COLORS.accent }}
          onClick={() => fileRef.current.click()}
        >
          Prendre une photo
        </button>
        <button
          style={{ ...btnSmall, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted }}
          onClick={() => fileRef.current.click()}
        >
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
export default function EditMemberModal({ member, onSave, onClose }) {
  const [tab, setTab]     = useState('abonnement'); // 'abonnement' | 'adherent'
  const [form, setForm]   = useState({ ...member });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
  if (!form.nom?.trim()) { alert('Le nom est requis.'); return; }

  try {
    await window.api.updateAdherent({
      idAdherent:    form.idAdherent,
      nom:           form.nom,
      prenom:        form.prenom,
      dateNaissance: form.dateNaissance || null,
      numTelephone:  form.numTelephone  || form.phone || null,
      email:         form.email         || null,
      sexe:          form.sexe          || 'Homme',
    });
    onSave(form);
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la mise à jour.");
  }
};

  return (
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
          {/* Tabs */}
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
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: COLORS.muted, fontSize: '1.2rem',
              cursor: 'pointer', lineHeight: 1, padding: 4,
            }}
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
            ? <TabAbonnement member={form} onChange={set} />
            : <TabAdherent   member={form} onChange={set} />
          }
        </div>

        {/* ── FOOTER ── */}
        {tab === 'adherent' && (
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
        )}
      </div>
    </div>
  );
}