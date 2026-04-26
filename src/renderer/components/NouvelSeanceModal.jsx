import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  border: 'rgba(229,57,53,0.45)',
};

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const inp = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.45)',
  borderRadius: 7,
  padding: '11px 14px',
  color: '#f0f0f0',
  fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const lbl = {
  fontSize: '0.78rem',
  color: '#7a7f8e',
  fontWeight: 600,
  marginBottom: 5,
  display: 'block',
};

export default function NouvelSeanceModal({ onSave, onClose }) {
  const [activites, setActivites] = useState([]);
  const [coachs,    setCoachs]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const [form, setForm] = useState({
    date:           new Date().toISOString().split('T')[0],
    heureDebut:     '',
    heureFin:       '',
    activite_id:    '',
    coach_id:       '',
    participantsMax: 10,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Charger activités + coachs depuis MySQL ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [acts, utils] = await Promise.all([
  window.api.getActivites(),
  window.api.getCoachs(),
]);
        setActivites(acts);
        setCoachs(utils);
        // Pré-sélectionner le premier de chaque liste
        if (acts.length > 0)  setForm(f => ({ ...f, activite_id: acts[0].idActivite }));
        if (utils.length > 0) setForm(f => ({ ...f, coach_id: utils[0].idUtilisateur }));
      } catch (err) {
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    // Validation
    if (!form.date || !form.heureDebut || !form.heureFin) {
      setError('La date, heure début et heure fin sont requises.');
      return;
    }
    if (!form.activite_id) { setError('Veuillez sélectionner une activité.'); return; }
    if (!form.coach_id)    { setError('Veuillez sélectionner un coach.');    return; }
    if (form.heureDebut >= form.heureFin) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setSaving(true);
    setError('');
    try {
     const result = await window.api.addSeance({
  date:            form.date,
  heureDebut:      form.heureDebut,
  heureFin:        form.heureFin,
  participantsMax: parseInt(form.participantsMax),
  coach_id:        parseInt(form.coach_id),
  activite_id:     parseInt(form.activite_id),
});
      onSave?.(result);
      onClose();
    } catch (err) {
      setError('Erreur lors de la création de la séance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 20px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)', fontFamily: "'Barlow', sans-serif", color: C.text }}>

        {/* ── Header ── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '26px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                Nouvelle séance
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 5 }}>
                Ajoutez une nouvelle séance au planning
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ background: '#1a1516', padding: '24px 28px 28px' }}>

          {/* Erreur */}
          {error && (
            <div style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#f87171' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: C.muted, padding: '30px 0', fontSize: '0.875rem' }}>
              Chargement des données...
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Détails de la séance
              </div>

              {/* Activité */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Activité *</label>
                <select
                  value={form.activite_id}
                  onChange={e => set('activite_id', e.target.value)}
                  style={{ ...inp, cursor: 'pointer' }}
                >
                  <option value="">-- Sélectionner une activité --</option>
                  {activites.map(a => (
                    <option key={a.idActivite} value={a.idActivite}>
                      {a.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Coach *</label>
                <select
                  value={form.coach_id}
                  onChange={e => set('coach_id', e.target.value)}
                  style={{ ...inp, cursor: 'pointer' }}
                >
                  <option value="">-- Sélectionner un coach --</option>
                  {coachs.map(c => (
                    <option key={c.idUtilisateur} value={c.idUtilisateur}>
                      {c.nom} {c.prenom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  style={inp}
                />
              </div>

              {/* Heure Début + Fin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Heure Début *</label>
                  <input
                    type="time"
                    value={form.heureDebut}
                    onChange={e => set('heureDebut', e.target.value)}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Heure Fin *</label>
                  <input
                    type="time"
                    value={form.heureFin}
                    onChange={e => set('heureFin', e.target.value)}
                    style={inp}
                  />
                </div>
              </div>

              {/* Participants max */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Participants maximum *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.participantsMax}
                  onChange={e => set('participantsMax', e.target.value)}
                  style={inp}
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 20px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              style={{ background: saving ? '#7f1d1d' : C.accent, border: 'none', borderRadius: 8, padding: '9px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer la séance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}