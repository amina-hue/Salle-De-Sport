import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/background.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  bgCard: '#1a1516', bgInput: 'rgba(255,255,255,0.06)',
  border: '#333'
};

const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const inp = {
  width: '100%', background: C.bgInput, border: '1px solid rgba(229,57,53,0.45)',
  borderRadius: 7, padding: '11px 14px', color: C.text, fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const lbl = { fontSize: '0.78rem', color: C.muted, fontWeight: 600, marginBottom: 5, display: 'block' };

export default function NouveauPaiementModal({ onSave, onClose }) {
  const [allAdherents, setAllAdherents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [form, setForm] = useState({
    abonnement_id: '',
    montant: '',
    mode: 'Espèces',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (window.api?.getAdherentsWithAbonnement) {
      window.api.getAdherentsWithAbonnement().then(res => setAllAdherents(res || []));
    }
  }, []);

  const filtered = allAdherents.filter(a => 
    `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectAdherent = (a) => {
    console.log("Adhérent sélectionné :", a);
    setSelectedMember(a);
    setSearchTerm(`${a.nom.toUpperCase()} ${a.prenom}`);
    // ATTENTION : vérifie que ta requête SQL renvoie bien 'idAbonnement'
    setForm(f => ({ ...f, abonnement_id: a.idAbonnement }));
    setShowResults(false);
  };

  const handleSave = () => {
    if (!form.abonnement_id) return alert('Erreur : Aucun abonnement lié à ce membre.');
    if (!form.montant || form.montant <= 0) return alert('Veuillez saisir un montant valide.');
    
    // On envoie un objet propre au parent (Paiement.js)
    onSave?.({
      abonnement_id: form.abonnement_id,
      montant: form.montant,
      mode: form.mode,
      date: form.date
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 520, borderRadius: 16, overflow: 'hidden', background: C.bgCard, boxShadow: '0 24px 60px rgba(0,0,0,0.8)', border: '1px solid #333' }}>
        
        <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), #1a1516)' }} />
          <div style={{ position: 'relative', padding: '25px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.7rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: 1 }}>NOUVEAU PAIEMENT</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><IconX /></button>
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <label style={lbl}>RECHERCHER UN MEMBRE <span style={{ color: C.accent }}>*</span></label>
            <input
              type="text"
              placeholder="Commencez à taper le nom..."
              style={{ ...inp, borderColor: selectedMember ? '#43a047' : 'rgba(229,57,53,0.45)' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); if(selectedMember) setSelectedMember(null); }}
              onFocus={() => setShowResults(true)}
            />
            
            {showResults && searchTerm.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#252021', zIndex: 10, borderRadius: '0 0 8px 8px', border: '1px solid #444', maxHeight: 180, overflowY: 'auto' }}>
                {filtered.length > 0 ? filtered.map(a => (
                  <div key={a.idAbonnement} onClick={() => selectAdherent(a)} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #333', color: '#fff' }} onMouseEnter={e => e.target.style.background = C.accent} onMouseLeave={e => e.target.style.background = 'transparent'}>
                    <div style={{ fontWeight: 700 }}>{a.nom.toUpperCase()} {a.prenom}</div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa' }}>Abonnement Actif #{a.idAbonnement}</div>
                  </div>
                )) : <div style={{ padding: '10px', color: C.muted }}>Aucun résultat...</div>}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={lbl}>MONTANT (DA)</label>
              <input type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} style={inp} placeholder="ex: 4500" />
            </div>
            <div>
              <label style={lbl}>MODE DE PAIEMENT</label>
              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} style={inp}>
                <option>Espèces</option>
                <option>Carte bancaire</option>
                <option>Virement</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>DATE DU PAIEMENT</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid #444`, color: C.muted, padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>ANNULER</button>
            <button onClick={handleSave} style={{ flex: 2, background: C.accent, border: 'none', padding: '12px', borderRadius: 8, color: '#fff', fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>VALIDER LE PAIEMENT</button>
          </div>
        </div>
      </div>
    </div>
  );
}