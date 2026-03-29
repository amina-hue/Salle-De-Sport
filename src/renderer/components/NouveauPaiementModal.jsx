import React, { useState } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  green: '#43a047',
};

const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

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

const lbl = {
  fontSize: '0.78rem',
  color: C.muted,
  fontWeight: 600,
  marginBottom: 5,
  display: 'block',
};

export default function NouveauPaiementModal({ member, onSave, onClose }) {
  const today = new Date().toLocaleDateString('fr-FR');
  const [form, setForm] = useState({
    montant: '',
    mode: 'Carte bancaire',
    statut: 'Payé',
    date: new Date().toISOString().split('T')[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.montant) return alert('Le montant est requis.');
    onSave?.(form);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 580, margin: '0 20px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)', fontFamily: "'Barlow', sans-serif", color: C.text }}>

        {/* Header with gym bg image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '26px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>Nouveau Paiement</h2>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 5 }}>Ajoutez un nouveau paiement</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#1a1516', padding: '24px 28px 28px' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 18, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Ajouter un paiement
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
            {/* Montant */}
            <div>
              <label style={lbl}>Montant <span style={{ color: C.accent }}>*</span></label>
              <input
                type="number"
                placeholder="ex: 1500"
                value={form.montant}
                onChange={e => set('montant', e.target.value)}
                style={inp}
              />
            </div>

            {/* Mode de paiement */}
            <div>
              <label style={lbl}>Mode de paiement <span style={{ color: C.accent }}>*</span></label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                <option>Carte bancaire</option>
                <option>Espèces</option>
                <option>Virement</option>
                <option>Chèque</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label style={lbl}>Statut <span style={{ color: C.accent }}>*</span></label>
              <select value={form.statut} onChange={e => set('statut', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                <option>Payé</option>
                <option>En attente</option>
                <option>Annulé</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={lbl}>Date paiement</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleSave} style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '9px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
              Ajouter paiement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}