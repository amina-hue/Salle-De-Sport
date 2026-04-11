import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  bgCard: '#1a1516', bgInput: 'rgba(255,255,255,0.06)'
};

const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const inp = {
  width: '100%',
  background: C.bgInput,
  border: '1px solid rgba(229,57,53,0.45)',
  borderRadius: 7,
  padding: '11px 14px',
  color: C.text,
  fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const lbl = { fontSize: '0.78rem', color: C.muted, fontWeight: 600, marginBottom: 5, display: 'block' };

export default function NouveauPaiementModal({ onSave, onClose }) {
  const [allAdherents, setAllAdherents] = useState([]); // Tous les membres de la BDD
  const [searchTerm, setSearchTerm] = useState(''); // Ce que l'utilisateur tape
  const [showResults, setShowResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // Le membre choisi

  const [form, setForm] = useState({
    abonnement_id: '',
    montant: '',
    mode: 'Espèces',
    statut: 'Payé',
    date: new Date().toISOString().split('T')[0],
  });

  // Charger la liste au départ
  useEffect(() => {
    if (window.api?.getAdherentsWithAbonnement) {
      window.api.getAdherentsWithAbonnement().then(res => setAllAdherents(res || []));
    }
  }, []);

  // Filtrer la liste selon la recherche
  const filtered = allAdherents.filter(a => 
    `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectAdherent = (a) => {
    setSelectedMember(a);
    setSearchTerm(`${a.nom.toUpperCase()} ${a.prenom}`);
    setForm(f => ({ ...f, abonnement_id: a.idAbonnement }));
    setShowResults(false);
  };

  const handleSave = () => {
    if (!form.abonnement_id) return alert('Veuillez rechercher et sélectionner un membre.');
    if (!form.montant) return alert('Le montant est requis.');
    onSave?.(form);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.7)' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 580, borderRadius: 16, overflow: 'hidden', background: C.bgCard, boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
        
        {/* Header */}
        <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(26,21,22,1))' }} />
          <div style={{ position: 'relative', padding: '26px 28px', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#fff' }}>NOUVEAU PAIEMENT</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer' }}><IconX /></button>
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          
          {/* RECHERCHE DE MEMBRE */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <label style={lbl}>RECHERCHER UN MEMBRE (NOM OU PRÉNOM) <span style={{ color: C.accent }}>*</span></label>
            <input
              type="text"
              placeholder="Tapez le nom de l'adhérent..."
              style={{ ...inp, border: selectedMember ? '1px solid #43a047' : inp.border }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
                if(selectedMember) setSelectedMember(null); // Reset si on recommence à taper
              }}
              onFocus={() => setShowResults(true)}
            />
            
            {/* Liste des résultats de recherche */}
            {showResults && searchTerm.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#252021', zIndex: 10, borderRadius: '0 0 8px 8px', border: '1px solid #444', maxHeight: 150, overflowY: 'auto' }}>
                {filtered.length > 0 ? filtered.map(a => (
                  <div 
                    key={a.idAbonnement} 
                    onClick={() => selectAdherent(a)}
                    style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #333', color: '#fff', fontSize: '0.9rem' }}
                    onMouseEnter={e => e.target.style.background = C.accent}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {a.nom.toUpperCase()} {a.prenom} <span style={{ fontSize: '0.7rem', color: C.muted }}>(Abonnement #{a.idAbonnement})</span>
                  </div>
                )) : (
                  <div style={{ padding: '10px', color: C.muted, fontSize: '0.8rem' }}>Aucun membre trouvé avec ce nom...</div>
                )}
              </div>
            )}
            {selectedMember && <div style={{ fontSize: '0.75rem', color: '#43a047', marginTop: 5 }}>✓ Membre sélectionné avec succès</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* MONTANT */}
            <div>
              <label style={lbl}>MONTANT (DA) <span style={{ color: C.accent }}>*</span></label>
              <input type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} style={inp} placeholder="0.00" />
            </div>

            {/* MODE */}
            <div>
              <label style={lbl}>MODE DE PAIEMENT</label>
              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} style={{ ...inp, appearance: 'none' }}>
                <option>Espèces</option>
                <option>Carte bancaire</option>
                <option>Virement</option>
              </select>
            </div>

            {/* DATE */}
            <div>
              <label style={lbl}>DATE</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inp} />
            </div>

            {/* STATUT */}
            <div>
              <label style={lbl}>STATUT</label>
              <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})} style={{ ...inp, appearance: 'none' }}>
                <option>Payé</option>
                <option>En attente</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 30 }}>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontWeight: 600 }}>ANNULER</button>
            <button 
              onClick={handleSave} 
              style={{ background: C.accent, border: 'none', padding: '12px 25px', borderRadius: 8, color: '#fff', fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}
            >
              VALIDER LE PAIEMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}