import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/gym.png'; // Vérifie que le nom du fichier correspond
import { Search, ChevronDown, ChevronUp, User, CheckCircle2 } from 'lucide-react';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  bgCard: '#1a1516', bgInput: 'rgba(255,255,255,0.06)',
  border: '#333', green: '#22c55e'
};

const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const inp = {
  width: '100%', background: C.bgInput, border: '1px solid rgba(229,57,53,0.3)',
  borderRadius: 7, padding: '11px 14px', color: C.text, fontFamily: "'Barlow', sans-serif",
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const lbl = { fontSize: '0.75rem', color: C.muted, fontWeight: 700, marginBottom: 6, display: 'block', textTransform: 'uppercase' };

export default function NouveauPaiementModal({ onSave, onClose }) {
  const [allAbonnements, setAllAbonnements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedAbo, setSelectedAbo] = useState(null);

  const [form, setForm] = useState({
    abonnement_id: '',
    montant: '',
    mode: 'Espèces',
    date: new Date().toISOString().split('T')[0],
  });

  // Charger les données (Abonnements qui ont encore un reste à payer)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Utilisation de l'API harmonisée avec ta page principale
        const data = await window.api.getAbonnementsNonPaies();
        // On garde les actifs et ceux qui ont un reste à payer (calculé via SQL)
        setAllAbonnements(data || []);
      } catch (err) {
        console.error("Erreur chargement abonnements:", err);
      }
    };
    loadData();
  }, []);

  const filtered = allAbonnements.filter(a =>
    `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectMember = (a) => {
    setSelectedAbo(a);
    // CALCUL DU RESTE À PAYER : Prix Total - Somme déjà payée (venant du SQL)
    const reliquat = Number(a.typePrix) - Number(a.totalPaye);
    
    setForm(f => ({ 
        ...f, 
        abonnement_id: a.idAbonnement, 
        montant: reliquat // Remplit automatiquement avec le reste
    }));
    setIsListOpen(false);
  };

  // Calcul dynamique pour l'affichage visuel dans la modale
  const soldeFinal = selectedAbo 
    ? (Number(selectedAbo.typePrix) - Number(selectedAbo.totalPaye)) - (Number(form.montant) || 0) 
    : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
      <div style={{ width: '100%', maxWidth: 500, borderRadius: 20, background: '#1a1516', border: '1px solid #333', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header avec Background */}
        <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,21,22,0.4), #1a1516)' }} />
          <div style={{ position: 'relative', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: 0 }}>ENREGISTRER UN PAIEMENT</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><IconX /></button>
          </div>
        </div>

        <div style={{ padding: '0 25px 25px' }}>
          
          {/* SÉLECTION DE L'ADHÉRENT */}
          <div style={{ marginBottom: 20 }}>
            <button 
              onClick={() => setIsListOpen(!isListOpen)}
              style={{ width: '100%', padding: '14px', background: selectedAbo ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedAbo ? C.green : '#333'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedAbo ? <CheckCircle2 size={20} color={C.green} /> : <User size={20} color={C.muted} />}
                <span style={{ fontWeight: 600 }}>
                  {selectedAbo ? `${selectedAbo.nom.toUpperCase()} ${selectedAbo.prenom}` : "Choisir l'adhérent"}
                </span>
              </div>
              {isListOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isListOpen && (
              <div style={{ marginTop: 10, background: '#252021', borderRadius: 10, border: '1px solid #444', overflow: 'hidden', position: 'absolute', width: 'calc(100% - 52px)', zIndex: 10 }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 8, background: '#1a1516' }}>
                  <Search size={16} color={C.muted} />
                  <input 
                    autoFocus
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%' }}
                  />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', background: '#1a1516' }}>
                  {filtered.length > 0 ? filtered.map(a => (
                    <div 
                      key={a.idAbonnement} 
                      onClick={() => selectMember(a)}
                      style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{a.nom.toUpperCase()} {a.prenom}</div>
                        <div style={{ color: C.muted, fontSize: '0.7rem' }}>{a.typeNom}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: C.accent, fontWeight: 700, fontSize: '0.85rem' }}>Reste: {Number(a.typePrix - a.totalPaye).toLocaleString()} DA</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>Aucun impayé trouvé</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RÉSUMÉ FINANCIER SI SÉLECTIONNÉ */}
          {selectedAbo && (
            <div style={{ background: '#0e0f11', borderRadius: 12, padding: '15px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', border: '1px dashed #444' }}>
              <div>
                <label style={lbl}>Total Dû</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{Number(selectedAbo.typePrix - selectedAbo.totalPaye).toLocaleString()} DA</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={lbl}>Solde après versement</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: soldeFinal <= 0 ? C.green : C.accent }}>
                  {soldeFinal.toLocaleString()} DA
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            <div>
              <label style={lbl}>Montant à verser (DA)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.montant} 
                onChange={e => setForm({ ...form, montant: e.target.value })} 
                style={{ ...inp, fontSize: '1rem', fontWeight: 700, border: '1px solid rgba(34,197,94,0.4)' }} 
              />
            </div>
            <div>
              <label style={lbl}>Mode de paiement</label>
              <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} style={inp}>
                <option>Espèces</option>
                <option>Carte bancaire</option>
                <option>Virement</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Date du règlement</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #444', color: C.muted, padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>ANNULER</button>
            <button 
              disabled={!form.abonnement_id || !form.montant}
              onClick={() => onSave?.(form)} 
              style={{ 
                flex: 2, 
                background: (!form.abonnement_id || !form.montant) ? '#333' : C.accent, 
                border: 'none', 
                padding: '12px', 
                borderRadius: 10, 
                color: '#fff', 
                fontWeight: 800, 
                cursor: 'pointer', 
                letterSpacing: 1,
                opacity: (!form.abonnement_id || !form.montant) ? 0.5 : 1
              }}
            >
              CONFIRMER L'ENCAISSEMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}