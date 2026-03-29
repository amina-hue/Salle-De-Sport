import React, { useState } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
};

const IconX    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

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

export default function NouvelSeanceModal({ member, onSave, onClose }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.date || !form.heureDebut) return alert('La date et l\'heure de début sont requises.');
    onSave?.(form);
    onClose();
  };

  // member info fallback
  const nom   = member?.nom   || 'Jean Dupont';
  const email = member?.email || 'JeanDupont@gmail.com';
  const phone = member?.phone || '06 12 34 56 78';
  const photo = member?.photo || null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 20px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)', fontFamily: "'Barlow', sans-serif", color: C.text }}>

        {/* Header with gym bg image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '26px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>Nouvel séance</h2>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 5 }}>Ajoutez une nouvelle séance à un membre à votre salle</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#1a1516', padding: '24px 28px 28px' }}>

          {/* Member info card */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 600, marginBottom: 8 }}>{nom}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
              {/* Avatar */}
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(229,57,53,0.25)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {photo
                  ? <img src={photo} alt={nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: C.muted }}><IconUser /></span>
                }
              </div>
              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: '0.85rem', color: C.text }}>{email}</div>
                <div style={{ fontSize: '0.82rem', color: C.muted }}>{phone}</div>
              </div>
            </div>
          </div>

          {/* Séance details */}
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 14, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Detail de la séance
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
          </div>

          {/* Heure Début + Fin */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Heure Début</label>
              <input type="time" value={form.heureDebut} onChange={e => set('heureDebut', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Heure Fin</label>
              <input type="time" value={form.heureFin} onChange={e => set('heureFin', e.target.value)} style={inp} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleSave} style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '9px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
              Enregistrer la séance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}