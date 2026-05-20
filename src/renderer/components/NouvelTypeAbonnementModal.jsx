import React, { useState } from 'react';
import GYM_BG from '../../images/background.png';

const C = { accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e' };

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const lbl = {
  fontSize: '0.78rem', color: C.muted, fontWeight: 600,
  marginBottom: 5, display: 'block',
};
const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.45)', borderRadius: 7,
  padding: '11px 14px', color: C.text, fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const DUREES = [
  { label: '1 mois',  value: 1  },
  { label: '3 mois',  value: 3  },
  { label: '6 mois',  value: 6  },
  { label: '12 mois', value: 12 },
];

const RULES_STANDARD = [
  "Accès salle de sport",
  "Vestiaires & douches",
  "5 séances/semaine",
  "Séances illimitées",
  "10% de réduction",
  "20% de réduction",
];

const RULES_PREMIUM = [
  "Tout Standard +",
  "Coaching personnalisé",
  "Cours collectifs",
  "Espace wellness",
  "15% de réduction",
  "25% de réduction",
];

export default function NouvelTypeAbonnementModal({ type, onSave, onClose }) {
  const isEdit = !!type;

  const [form, setForm] = useState({
    nom:   type?.nom   ?? '',
    duree: type?.duree ?? '',
    prix:  type?.prix  ?? '',
  });

  const [selectedRules, setSelectedRules] = useState(() => {
    if (!type?.features) return [];
    return Array.isArray(type.features) ? type.features : [];
  });

  const [errors, setErrors] = useState({});
  const [newRule, setNewRule] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const isPremium  = form.nom.toLowerCase().includes('premium');
  const accent     = isPremium ? '#e63946' : '#3a7bd5';
  const tier       = isPremium ? 'Premium' : 'Standard';
  const dureeLabel = DUREES.find(d => d.value === Number(form.duree))?.label || '— mois';
  const suggestedRules = isPremium ? RULES_PREMIUM : RULES_STANDARD;

  // ✅ Toggle une règle prédéfinie (ajoute ou retire)
  const toggleRule = (rule) => {
    setSelectedRules(prev =>
      prev.includes(rule)
        ? prev.filter(r => r !== rule)
        : [...prev, rule]
    );
  };

  // ✅ Ajouter une règle personnalisée
  const addCustomRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    if (!selectedRules.includes(trimmed)) {
      setSelectedRules(prev => [...prev, trimmed]);
    }
    setNewRule('');
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom   = 'Le nom est requis';
    if (!form.duree)       e.duree = 'La durée est requise';
    if (!form.prix || isNaN(form.prix) || Number(form.prix) <= 0) e.prix = 'Prix invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSave = async () => {
  if (!validate()) return;
  const payload = {
    nom:      form.nom.trim(),
    duree:    Number(form.duree),
    prix:     Number(form.prix),
    features: selectedRules,
  };
  
  try {
    console.log('Payload envoyé:', payload);
    
    if (isEdit) {
      const res = await window.api.updateTypeAbonnement({ ...payload, id: type.id });
      console.log('Résultat update:', res);
    } else {
      const res = await window.api.addTypeAbonnement(payload);
      console.log('Résultat add:', res);
    }
    
    onSave?.();
  } catch (err) {
    console.error('Erreur handleSave:', err);
    alert('Erreur : ' + err.message);
  }
};

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.6)', padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: 650, borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
        fontFamily: "'Barlow', sans-serif", color: C.text,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '26px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                {isEdit ? 'Modifier le Type' : "Nouveau Type d'Abonnement"}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 5 }}>
                {isEdit ? `Modification de : ${type.nom}` : 'Définissez un nouveau plan pour vos adhérents'}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer', flexShrink: 0 }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* ── Body scrollable ── */}
        <div style={{ background: '#1a1516', padding: '24px 28px', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* ── Colonne gauche ── */}
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 18, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Informations du plan
              </div>

              {/* Nom */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Nom du plan <span style={{ color: C.accent }}>*</span></label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                  placeholder="ex: Premium Mensuel"
                  style={{ ...inp, border: errors.nom ? '1px solid #e53935' : inp.border }}
                />
                {errors.nom && <span style={{ fontSize: '0.72rem', color: C.accent, marginTop: 4, display: 'block' }}>{errors.nom}</span>}
              </div>

              {/* Durée */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Durée <span style={{ color: C.accent }}>*</span></label>
                <select
                  value={form.duree}
                  onChange={e => set('duree', e.target.value)}
                  style={{ ...inp, appearance: 'none', cursor: 'pointer',  background: '#1a1516',border: errors.duree ? '1px solid #e53935' : inp.border }}
                >
                  <option value="" style={{ background: '#1a1516', color: '#7a7f8e' }}>Sélectionner...</option>
                  {DUREES.map(d => (
                    <option key={d.value} value={d.value} style={{ background: '#1a1516', color: '#f0f0f0' }}>{d.label}</option>
                  ))}
                </select>
                {errors.duree && <span style={{ fontSize: '0.72rem', color: C.accent, marginTop: 4, display: 'block' }}>{errors.duree}</span>}
              </div>

              {/* Prix */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Prix (DA) <span style={{ color: C.accent }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    value={form.prix}
                    onChange={e => set('prix', e.target.value)}
                    placeholder="ex: 1290"
                    style={{ ...inp, paddingRight: 48, border: errors.prix ? '1px solid #e53935' : inp.border }}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.accent, fontSize: '0.8rem', fontWeight: 700 }}>DA</span>
                </div>
                {errors.prix && <span style={{ fontSize: '0.72rem', color: C.accent, marginTop: 4, display: 'block' }}>{errors.prix}</span>}
              </div>

              {/* ── Règles prédéfinies ── */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Règles suggérées</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {suggestedRules.map(rule => {
                    const isSelected = selectedRules.includes(rule);
                    return (
                      <div
                        key={rule}
                        onClick={() => toggleRule(rule)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
                          background: isSelected ? `${accent}18` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? accent + '55' : 'rgba(255,255,255,0.08)'}`,
                          fontSize: '0.8rem', color: isSelected ? C.text : C.muted,
                          transition: 'all 0.15s', userSelect: 'none',
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `1.5px solid ${isSelected ? accent : '#444'}`,
                          background: isSelected ? accent : 'transparent',
                          display: 'grid', placeItems: 'center',
                          fontSize: 10, color: '#fff', flexShrink: 0,
                          transition: 'all 0.15s',
                        }}>
                          {isSelected ? '✓' : ''}
                        </span>
                        {rule}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Règle personnalisée ── */}
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Règle personnalisée</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newRule}
                    onChange={e => setNewRule(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCustomRule(); }}
                    placeholder="ex: Accès piscine..."
                    style={{ ...inp, flex: 1 }}
                  />
                  <button
                    onClick={addCustomRule}
                    style={{
                      background: accent, color: '#fff', border: 'none',
                      borderRadius: 6, padding: '8px 14px', cursor: 'pointer',
                      fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ── Colonne droite — aperçu ── */}
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 18, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Aperçu
              </div>

              <div style={{ position: 'sticky', top: 0 }}>
                {/* Carte preview */}
                <div style={{ background: 'rgba(21,20,20,0.75)', borderRadius: 14, padding: '20px', border: '1px solid rgb(20,19,19)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, background: isPremium ? 'linear-gradient(135deg,#e63946,#c1121f)' : 'linear-gradient(135deg,#3a7bd5,#1a56b0)', fontSize: 9, color: '#fff', padding: '3px 10px', borderBottomLeftRadius: 8, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                    {tier}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#999', fontSize: 10, background: '#ffffff0d', padding: '2px 8px', borderRadius: 20 }}>{dureeLabel}</span>
                  </div>
                  <h3 style={{ color: form.nom ? '#f1f1f1' : '#333', fontSize: 14, fontWeight: 700, margin: '6px 0 2px' }}>
                    {form.nom || 'Nom du plan'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 4px' }}>
                    <span style={{ color: form.prix ? accent : '#333', fontSize: 24, fontWeight: 800 }}>
                      {form.prix ? Number(form.prix).toLocaleString() + ' DA' : '— DA'}
                    </span>
                  </div>
                  <p style={{ color: '#555', fontSize: 11, margin: '0 0 14px' }}>par {dureeLabel}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', minHeight: 40 }}>
                    {selectedRules.length === 0 ? (
                      <li style={{ fontSize: 12, color: '#333', fontStyle: 'italic' }}>Aucune règle sélectionnée</li>
                    ) : (
                      selectedRules.map((r, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{ color: accent, fontSize: 14 }}>✓</span>
                          <span style={{ flexGrow: 1 }}>{r}</span>
                          <button
                            onClick={() => setSelectedRules(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'transparent', border: 'none', color: '#e63946', cursor: 'pointer', fontWeight: 700, fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                          >
                            ×
                          </button>
                        </li>
                      ))
                    )}
                  </ul>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ffffff08', paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: '#666' }}><span style={{ color: '#f1f1f1', fontWeight: 600 }}>0</span> adhérents</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#22c55e20', color: '#22c55e' }}>ACTIF</span>
                  </div>
                </div>

                {/* Info tier */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem', color: C.muted, lineHeight: 1.7, marginTop: 12 }}>
                  💡 Tier détecté via le nom :<br />
                  <span style={{ color: '#3a7bd5' }}>● Standard</span> — sans "Premium"<br />
                  <span style={{ color: '#e63946' }}>● Premium</span> — avec "Premium"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          background: '#1a1516', borderTop: '1px solid #ffffff08',
          padding: '16px 28px', display: 'flex', justifyContent: 'flex-end',
          gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '9px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#c62828'}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
          >
            {isEdit ? 'Enregistrer les modifications' : 'Créer le plan'}
          </button>
        </div>
      </div>
    </div>
  );
}