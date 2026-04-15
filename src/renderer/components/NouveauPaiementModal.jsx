import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/gym.png';
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

const lbl = {
  fontSize: '0.75rem', color: C.muted, fontWeight: 700,
  marginBottom: 6, display: 'block', textTransform: 'uppercase'
};

export default function NouveauPaiementModal({ onSave, onClose }) {
  const [allAbonnements, setAllAbonnements] = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [isListOpen, setIsListOpen]         = useState(false);
  const [selectedAbo, setSelectedAbo]       = useState(null);
  const [mode, setMode]                     = useState('Espèces');
  const [date, setDate]                     = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    window.api.getAbonnementsNonPaies()
      .then(data => setAllAbonnements(data || []))
      .catch(console.error);
  }, []);

  const filtered = allAbonnements.filter(a =>
    `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectMember = (a) => {
    setSelectedAbo(a);
    setIsListOpen(false);
    setSearchTerm('');
  };

  // Le montant dû est fixe — pas de saisie libre
  const montantDu  = parseFloat(selectedAbo?.montantDu)  || 0;
  const totalPaye  = parseFloat(selectedAbo?.totalPaye)  || 0;
  const resteAPayer = montantDu - totalPaye;

  const handleConfirm = () => {
    if (!selectedAbo || resteAPayer <= 0) return;
    onSave?.({
      abonnement_id: selectedAbo.idAbonnement,
      montant:       resteAPayer,
      mode,
      date,
    });
  };

  const MODES = [
    { value: 'Espèces',        icon: '💵' },
    { value: 'Carte bancaire', icon: '💳' },
    { value: 'Virement',       icon: '🏦' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 20, background: '#1a1516',
        border: '1px solid #333', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>

        {/* Header */}
        <div style={{ position: 'relative', height: 90, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,21,22,0.4), #1a1516)' }} />
          <div style={{ position: 'relative', padding: '22px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              ENREGISTRER UN PAIEMENT
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <IconX />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 25px 25px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Sélection adhérent */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsListOpen(!isListOpen)}
              style={{
                width: '100%', padding: '13px 16px',
                background: selectedAbo ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedAbo ? C.green : '#444'}`,
                borderRadius: 10, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', cursor: 'pointer', color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedAbo
                  ? <CheckCircle2 size={18} color={C.green} />
                  : <User size={18} color={C.muted} />
                }
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedAbo
                    ? `${selectedAbo.nom.toUpperCase()} ${selectedAbo.prenom}`
                    : "Choisir l'adhérent"
                  }
                </span>
              </div>
              {isListOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isListOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                background: '#1e1a1b', borderRadius: 10, border: '1px solid #444',
                overflow: 'hidden', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={14} color={C.muted} />
                  <input
                    autoFocus
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%' }}
                  />
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {filtered.length > 0 ? filtered.map(a => {
                    const reste = (parseFloat(a.montantDu) || 0) - (parseFloat(a.totalPaye) || 0);
                    return (
                      <div
                        key={a.idAbonnement}
                        onClick={() => selectMember(a)}
                        style={{ padding: '11px 15px', cursor: 'pointer', borderBottom: '1px solid #2a2525', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                            {a.nom.toUpperCase()} {a.prenom}
                          </div>
                          <div style={{ color: C.muted, fontSize: '0.7rem', marginTop: 2 }}>{a.typeNom}</div>
                        </div>
                        <div style={{ color: C.accent, fontWeight: 700, fontSize: '0.85rem' }}>
                          {reste.toLocaleString()} DA
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>
                      Aucun impayé trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Montant dû — affiché, non modifiable */}
          {selectedAbo && (
            <div style={{
              background: 'rgba(229,57,53,0.07)', border: '1px solid rgba(229,57,53,0.2)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  Montant à régler
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.text }}>
                  {resteAPayer.toLocaleString()} <span style={{ color: C.accent, fontSize: '1.2rem' }}>DA</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(229,57,53,0.12)', borderRadius: 8,
                padding: '8px 14px', fontSize: '0.8rem', color: C.accent, fontWeight: 700
              }}>
                Paiement total
              </div>
            </div>
          )}

          {/* Mode de paiement */}
          <div>
            <label style={lbl}>Mode de paiement</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {MODES.map(m => {
                const selected = mode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
                      border: selected ? `2px solid ${C.accent}` : '1px solid #444',
                      background: selected ? 'rgba(229,57,53,0.1)' : 'rgba(255,255,255,0.03)',
                      color: selected ? C.accent : C.muted,
                      fontFamily: "'Barlow', sans-serif", fontWeight: selected ? 700 : 400,
                      fontSize: '0.78rem', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                    {m.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={lbl}>Date du règlement</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={inp}
            />
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, background: 'transparent', border: '1px solid #444', color: C.muted, padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              ANNULER
            </button>
            <button
              disabled={!selectedAbo || resteAPayer <= 0}
              onClick={handleConfirm}
              style={{
                flex: 2, background: (!selectedAbo || resteAPayer <= 0) ? '#333' : C.accent,
                border: 'none', padding: '12px', borderRadius: 10, color: '#fff',
                fontWeight: 800, cursor: (!selectedAbo || resteAPayer <= 0) ? 'not-allowed' : 'pointer',
                letterSpacing: 1, fontSize: '0.85rem',
                opacity: (!selectedAbo || resteAPayer <= 0) ? 0.4 : 1,
                transition: 'all 0.15s',
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