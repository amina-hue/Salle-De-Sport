import React, { useState, useEffect } from 'react';
import GYM_BG from '../../images/gym.png';

const C = {
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  bgCard: '#1a1516', bgInput: 'rgba(255,255,255,0.06)',
  border: '#333', green: '#22c55e', gold: '#ffc107',
};

const MODES_PAIEMENT = [
  { value: 'Espèces',        icon: '💵' },
  { value: 'Carte bancaire', icon: '💳' },
  { value: 'Virement',       icon: '🏦' },
];

const IconX     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.5)', borderRadius: 8,
  padding: '11px 14px', color: '#f0f0f0',
  fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem',
  outline: 'none', boxSizing: 'border-box',
};
const lbl = {
  fontSize: '0.75rem', color: '#7a7f8e', fontWeight: 700,
  marginBottom: 6, display: 'block', textTransform: 'uppercase',
};

function statusConfig(statut) {
  switch ((statut || '').toLowerCase()) {
    case 'actif':    return { label: 'Actif',    bg: '#22c55e' };
    case 'expiré':   return { label: 'Expiré',   bg: '#e53935' };
    case 'suspendu': return { label: 'Suspendu', bg: '#f97316' };
    default:         return { label: 'Sans abo', bg: '#6b7280' };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── STEP 1 — Abonnement ──────────────────────────────────────────────────────
function StepAbonnement({ member, form, set, typesAbonnement, onNext, onClose }) {

  const computeDateFin = (debut, typeId) => {
    const type = typesAbonnement.find(t => t.id === parseInt(typeId));
    if (!debut || !type?.duree) return '';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + Number(type.duree));
    return d.toISOString().split('T')[0];
  };

  const handleTypeChange = (val) => {
    set('type_id', val);
    set('dateFin', computeDateFin(form.dateDebut, val));
    const t = typesAbonnement.find(t => t.id === parseInt(val));
    if (t) set('montantDu', parseFloat(t.prix) || 0);
  };

  const handleDebutChange = (val) => {
    set('dateDebut', val);
    set('dateFin', computeDateFin(val, form.type_id));
  };

  const sc = statusConfig(member.abonnementStatut);
  const photoSrc = member.photo
    || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.nom || '') + ' ' + (member.prenom || ''))}&background=1f2330&color=e53935&size=200`;

  const handleNext = () => {
    if (!form.type_id)   { alert("Veuillez sélectionner un type d'abonnement."); return; }
    if (!form.dateDebut) { alert("La date de début est requise."); return; }
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Carte adhérent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid #3d3233', borderRadius: 12, padding: '14px 18px' }}>
        <img
          src={photoSrc}
          alt={member.nom}
          style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '2px solid #e53935', flexShrink: 0 }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=1f2330&color=e53935&size=200`; }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {member.nom} {member.prenom}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: '#fff' }}>
              {sc.label}
            </span>
            {member.dateFin && (
              <span style={{ fontSize: '0.72rem', color: C.muted }}>
                expiré le <strong style={{ color: C.text }}>{formatDate(member.dateFin)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        Nouvel abonnement
      </div>

      {/* Type abonnement */}
      <div>
        <label style={lbl}>Type d'abonnement <span style={{ color: C.accent }}>*</span></label>
        <select
          value={form.type_id || ''}
          onChange={e => handleTypeChange(e.target.value)}
          style={{ ...inp, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Sélectionner...</option>
          {typesAbonnement.map(t => (
            <option key={t.id} value={t.id}>{t.nom} — {t.prix} DA</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={lbl}>Date de début <span style={{ color: C.accent }}>*</span></label>
          <input
            type="date"
            value={form.dateDebut || ''}
            onChange={e => handleDebutChange(e.target.value)}
            style={inp}
          />
        </div>
        <div>
          <label style={lbl}>Date de fin</label>
          <input
            type="date"
            value={form.dateFin || ''}
            readOnly
            style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }}
            title="Calculée automatiquement"
          />
        </div>
      </div>

      {/* Période visuelle */}
      {form.dateDebut && form.dateFin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(229,57,53,0.05)', border: '1px solid rgba(229,57,53,0.15)', borderRadius: 8 }}>
          <span style={{ fontSize: '0.8rem', color: C.text }}>{formatDate(form.dateDebut)}</span>
          <span style={{ color: C.accent }}><IconArrow /></span>
          <span style={{ fontSize: '0.8rem', color: C.text }}>{formatDate(form.dateFin)}</span>
        </div>
      )}

      {/* Remise */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ ...lbl, marginBottom: 0 }}>Remise</label>
        <input
          type="number" min="0" max="100"
          placeholder="0"
          value={form.remise || ''}
          onChange={e => set('remise', e.target.value)}
          style={{ ...inp, width: 80, padding: '8px 12px', textAlign: 'center' }}
        />
        <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>%</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>
          Annuler
        </button>
        <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          Prochaine étape <IconArrow />
        </button>
      </div>
    </div>
  );
}

// ── STEP 2 — Paiement ────────────────────────────────────────────────────────
function StepPaiement({ member, form, set, typesAbonnement, onPrev, onSave, onClose, saving }) {

  const selectedType = typesAbonnement.find(t => t.id === parseInt(form.type_id));
  const prixBase     = parseFloat(selectedType?.prix) || 0;
  const remise       = parseFloat(form.remise) || 0;
  const total        = prixBase * (1 - remise / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        Récapitulatif & Paiement
      </div>

      {/* Récap */}
      <div style={{ background: 'rgba(229,57,53,0.07)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Récapitulatif</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Adhérent</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{member.prenom} {member.nom}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Abonnement</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{selectedType?.nom || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Période</div>
            <div style={{ fontSize: '0.85rem', color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              {formatDate(form.dateDebut)}
              <span style={{ color: C.accent }}>→</span>
              {formatDate(form.dateFin)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Remise</div>
            <div style={{ fontSize: '0.85rem', color: remise > 0 ? C.gold : C.muted }}>{remise > 0 ? `-${remise}%` : 'Aucune'}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(229,57,53,0.2)', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Total à payer</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.text }}>
            {total.toFixed(2)} <span style={{ color: C.accent }}>DA</span>
          </span>
        </div>
      </div>

      {/* Payer maintenant / plus tard */}
      <div>
        <label style={lbl}>Statut du paiement</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { value: false, label: 'Payer plus tard', icon: '⏳', desc: "L'abonnement sera marqué impayé" },
            { value: true,  label: 'Payer maintenant', icon: '✅', desc: 'Le paiement sera enregistré' },
          ].map(opt => {
            const selected = form.payerMaintenant === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => set('payerMaintenant', opt.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                  border: selected ? `2px solid ${opt.value ? C.green : C.gold}` : '1px solid rgba(255,255,255,0.12)',
                  background: selected ? (opt.value ? 'rgba(34,197,94,0.1)' : 'rgba(255,193,7,0.08)') : 'rgba(255,255,255,0.04)',
                  color: selected ? (opt.value ? C.green : C.gold) : C.muted,
                  fontFamily: "'Barlow', sans-serif", fontWeight: selected ? 700 : 400,
                  fontSize: '0.85rem', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>{opt.icon}</span>
                <span>{opt.label}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.7, textAlign: 'center' }}>{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode de paiement */}
      {form.payerMaintenant && (
        <div>
          <label style={lbl}>Mode de paiement <span style={{ color: C.accent }}>*</span></label>
          <div style={{ display: 'flex', gap: 10 }}>
            {MODES_PAIEMENT.map(m => {
              const selected = (form.modePaiement || 'Espèces') === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => set('modePaiement', m.value)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                    border: selected ? `2px solid ${C.accent}` : '1px solid rgba(255,255,255,0.12)',
                    background: selected ? 'rgba(229,57,53,0.12)' : 'rgba(255,255,255,0.04)',
                    color: selected ? C.accent : C.muted,
                    fontFamily: "'Barlow', sans-serif", fontWeight: selected ? 700 : 400,
                    fontSize: '0.8rem', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                  {m.value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Date règlement */}
      {form.payerMaintenant && (
        <div>
          <label style={lbl}>Date du règlement</label>
          <input
            type="date"
            value={form.dateReglement || new Date().toISOString().split('T')[0]}
            onChange={e => set('dateReglement', e.target.value)}
            style={inp}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onPrev} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.text, fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          Précédent
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving || form.payerMaintenant === undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: saving || form.payerMaintenant === undefined ? '#555' : C.accent,
              border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff',
              fontFamily: "'Barlow', sans-serif", fontWeight: 700,
              cursor: saving || form.payerMaintenant === undefined ? 'not-allowed' : 'pointer',
              opacity: form.payerMaintenant === undefined ? 0.5 : 1,
            }}
          >
            {saving ? 'Renouvellement...' : <><IconCheck /> Confirmer le renouvellement</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL PRINCIPAL ──────────────────────────────────────────────────────────
export default function RenewModal({ member, typesAbonnement, onSave, onClose }) {
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState({
    type_id:       member.type_id || (typesAbonnement[0]?.id ?? ''),
    dateDebut:     new Date().toISOString().split('T')[0],
    dateFin:       '',
    remise:        '',
    modePaiement:  'Espèces',
    dateReglement: new Date().toISOString().split('T')[0],
    payerMaintenant: undefined,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const STEP_LABELS = ['Nouvel abonnement', 'Paiement'];

  const handleSave = async () => {
    if (form.payerMaintenant === undefined) { alert("Veuillez choisir un statut de paiement."); return; }

    const selectedType = typesAbonnement.find(t => t.id === parseInt(form.type_id));
    const prixBase     = parseFloat(selectedType?.prix) || 0;
    const remise       = parseFloat(form.remise) || 0;
    const total        = prixBase * (1 - remise / 100);

    setSaving(true);
    try {
      // 1. Mettre à jour ou créer l'abonnement avec statut 'actif'
      if (member.idAbonnement) {
        await window.api.updateAbonnement({
          idAbonnement: member.idAbonnement,
          type_id:      parseInt(form.type_id),
          dateDebut:    form.dateDebut,
          dateFin:      form.dateFin,
          statut:       'actif',
        });
      } else {
        await window.api.addAbonnement({
          adherent_id: member.idAdherent,
          type_id:     parseInt(form.type_id),
          dateDebut:   form.dateDebut,
          dateFin:     form.dateFin,
          statut:      'actif',
        });
      }

      // 2. Enregistrer le paiement si payerMaintenant
      if (form.payerMaintenant) {
        await window.api.addPaiement({
          abonnement_id: member.idAbonnement,
          adherent_id:   member.idAdherent,
          montant:       total,
          mode:          form.modePaiement,
          date:          form.dateReglement,
        });
      }

      onSave?.();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du renouvellement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '0 20px', fontFamily: "'Barlow', sans-serif", color: C.text, borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 28px' }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: 1, margin: 0, lineHeight: 1 }}>
                RENOUVELER L'ABONNEMENT
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                Étape {step}/2 — {STEP_LABELS[step - 1]}
              </div>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                {[1, 2].map(s => (
                  <React.Fragment key={s}>
                    <div style={{
                      width: s === step ? 28 : (s < step ? 22 : 8), height: 8, borderRadius: 4,
                      background: s < step ? C.green : s === step ? C.accent : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s',
                    }} />
                    {s < 2 && <div style={{ width: 16, height: 1, background: s < step ? C.green : 'rgba(255,255,255,0.2)' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#1a1516', padding: '24px 28px' }}>
          {step === 1 && (
            <StepAbonnement
              member={member}
              form={form} set={set}
              typesAbonnement={typesAbonnement}
              onNext={() => setStep(2)}
              onClose={onClose}
            />
          )}
          {step === 2 && (
            <StepPaiement
              member={member}
              form={form} set={set}
              typesAbonnement={typesAbonnement}
              onPrev={() => setStep(1)}
              onSave={handleSave}
              onClose={onClose}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}