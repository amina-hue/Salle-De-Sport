import React, { useState } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
};

const PLANS = [
  { label: 'Premium Annuel',    prix: 3500, duree: 12 },
  { label: 'Standard Mensuel',  prix: 1200, duree: 1  },
  { label: 'Basic Trimestriel', prix: 2000, duree: 3  },
];

const IconX    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCard = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;

const lbl = {
  fontSize: '0.78rem',
  color: C.muted,
  fontWeight: 600,
  marginBottom: 5,
  display: 'block',
};

const inp = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.45)',
  borderRadius: 7,
  padding: '11px 14px',
  color: C.text,
  fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const inpWithIcon = { ...inp, paddingLeft: 36 };

export default function NouvelAbonnementModal({ member, onSave, onClose }) {
  const computeDateFin = (debut, planLabel) => {
    if (!debut || !planLabel) return '';
    const p = PLANS.find(pl => pl.label === planLabel);
    if (!p) return '';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + p.duree);
    return d.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    plan: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    note: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePlanChange = (val) => {
    set('plan', val);
    setForm(f => ({ ...f, plan: val, dateFin: computeDateFin(f.dateDebut, val) }));
  };

  const handleDebutChange = (val) => {
    setForm(f => ({ ...f, dateDebut: val, dateFin: computeDateFin(val, f.plan) }));
  };

  const selectedPlan = PLANS.find(p => p.label === form.plan);

  const handleSave = () => {
    if (!form.plan) return alert("Veuillez sélectionner un type d'abonnement.");
    onSave?.({ ...form, prix: selectedPlan?.prix, status: 'Actif' });
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '0 20px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)', fontFamily: "'Barlow', sans-serif", color: C.text }}>

        {/* Header with gym bg image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '26px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>Nouvel Abonnement</h2>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 5 }}>Créer un nouvel abonnement pour les membres de votre salle</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#1a1516', padding: '24px 28px 28px' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 18, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Remplir les informations suivantes :
          </div>

          {/* Type + Date début */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Type d'abonnement <span style={{ color: C.accent }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}><IconCard /></span>
                <select value={form.plan} onChange={e => handlePlanChange(e.target.value)} style={{ ...inpWithIcon, appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Sélectionner...</option>
                  {PLANS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Date de début <span style={{ color: C.accent }}>*</span></label>
              <input type="date" value={form.dateDebut} onChange={e => handleDebutChange(e.target.value)} style={inp} />
            </div>
          </div>

          {/* Prix affiché si plan sélectionné */}
          {selectedPlan && (
            <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: C.muted }}>Prix</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: C.text }}>{selectedPlan.prix.toLocaleString()} <span style={{ color: C.accent }}>DA</span></span>
              {form.dateFin && (
                <span style={{ fontSize: '0.78rem', color: C.muted }}>Fin : {new Date(form.dateFin).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          )}

          {/* Note */}
          <div style={{ marginBottom: 6 }}>
            <label style={lbl}>Note</label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Ajouter une note..."
              rows={3}
              style={{ ...inp, resize: 'vertical', minHeight: 70 }}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleSave} style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '9px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
              Créer l'abonnement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}