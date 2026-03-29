import React, { useState, useRef } from 'react';
import GYM_BG from '../../images/salle.png';
const C = {
  bg: '#111215', surface: '#1a1c21', card: '#1f2128',
  modalBg: '#1a1516', modalSurface: '#231e1f', modalCard: '#2a2324',
  border: '#2a2d36', modalBorder: '#3d3233',
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  input: '#111215', modalInput: '#312829',
  green: '#43a047', gold: '#ffc107', blue: '#1e88e5',
};

//const GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80';

const PLANS = [
  { label: 'Premium Annuel',    prix: 3500, duree: 12 },
  { label: 'Standard Mensuel',  prix: 1200, duree: 1  },
  { label: 'Basic Trimestriel', prix: 2000, duree: 3  },
];

const DISCIPLINES = ['Musculation', 'Cardio', 'CrossFit', 'Yoga', 'Boxe', 'Natation'];

/* ── Icons ── */
const IconX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const IconPhone   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .98h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const IconUpload  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>;
const IconCard    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

/* ── Shared input style ── */
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.5)',
  borderRadius: 8,
  padding: '12px 14px 12px 40px',
  color: C.text,
  fontFamily: "'Barlow', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '0.8rem',
  color: C.muted,
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
};

function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: C.accent }}> *</span>}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}>
            <Icon />
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function SelectField({ label, icon: Icon, options, value, onChange, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: C.accent }}> *</span>}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}>
            <Icon />
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Sélectionner...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ════════════════════════════
   STEP 1 — Personal info
════════════════════════════ */
function StepPersonnel({ form, set, onNext, onClose }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(form.photo || null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    set('photo', url);
  };

  const handleNext = () => {
    if (!form.prenom?.trim() || !form.nom?.trim()) return alert('Prénom et Nom sont requis.');
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Photo */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Photo de profil
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(229,57,53,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {preview
              ? <img src={preview} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: C.muted, opacity: 0.5 }}><IconUser /></span>
            }
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,57,53,0.12)', border: '1px solid rgba(229,57,53,0.4)', borderRadius: 7, padding: '9px 16px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }}>
              <IconUpload /> Télécharger une photo
            </button>
            <div style={{ fontSize: '0.72rem', color: C.muted }}>JPG, PNG ou GIF (max. 5MB)</div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Informations personnelles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
          <InputField label="Prénom" icon={IconUser} placeholder="Jean" value={form.prenom || ''} onChange={e => set('prenom', e.target.value)} required />
          <InputField label="Nom" icon={IconUser} placeholder="Dupont" value={form.nom || ''} onChange={e => set('nom', e.target.value)} required />
          <InputField label="Date de naissance" type="date" value={form.dateNaissance || ''} onChange={e => set('dateNaissance', e.target.value)} required />
          <InputField label="Téléphone" icon={IconPhone} placeholder="06 12 34 56 78" value={form.phone || ''} onChange={e => set('phone', e.target.value)} required />
          <div style={{ gridColumn: '1 / -1' }}>
            <InputField label="Email" icon={IconMail} type="email" placeholder="jean.dupont@email.com" value={form.email || ''} onChange={e => set('email', e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Sexe <span style={{ color: C.accent }}>*</span></label>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Homme', 'Femme'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', color: C.text }}>
                  <input type="radio" name="sexe" value={s} checked={(form.sexe || 'Homme') === s} onChange={() => set('sexe', s)} style={{ accentColor: C.accent, width: 16, height: 16 }} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.07)` }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>
          Annuler
        </button>
        <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
          Prochaine étape <IconArrow />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════
   STEP 2 — Subscription
════════════════════════════ */
function StepAbonnement({ form, set, onPrev, onSave, onClose }) {
  // Compute date fin from dateDebut + plan duration
  const selectedPlan = PLANS.find(p => p.label === form.plan);
  const prixBase = selectedPlan?.prix || 0;
  const remise = parseFloat(form.remise) || 0;
  const fraisInscription = form.fraisInscription ? (parseFloat(form.fraisInscriptionMontant) || 0) : 0;
  const total = prixBase * (1 - remise / 100) + fraisInscription;
  const verser = parseFloat(form.verser) || 0;
  const manque = Math.max(0, total - verser);

  // Auto compute date fin
  const computeDateFin = (debut, plan) => {
    if (!debut || !plan) return '';
    const p = PLANS.find(pl => pl.label === plan);
    if (!p) return '';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + p.duree);
    return d.toISOString().split('T')[0];
  };

  const handlePlanChange = (val) => {
    set('plan', val);
    set('dateFin', computeDateFin(form.dateDebut || new Date().toISOString().split('T')[0], val));
  };

  const handleDebutChange = (val) => {
    set('dateDebut', val);
    set('dateFin', computeDateFin(val, form.plan));
  };

  const nbrSeances = form.nombreFois ? parseInt(form.nombreFois) * (selectedPlan?.duree || 1) * 4 : 0;

  const inp = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(229,57,53,0.5)',
    borderRadius: 8,
    padding: '10px 14px',
    color: C.text,
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const inpWithIcon = { ...inp, paddingLeft: 38 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
        Abonnement de l'adhérent
      </div>

      {/* Row 1: Type + Date adhesion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Type d'abonnement <span style={{ color: C.accent }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}><IconCard /></span>
            <select value={form.plan || ''} onChange={e => handlePlanChange(e.target.value)} style={{ ...inpWithIcon, width: '100%', appearance: 'none', cursor: 'pointer' }}>
              <option value="">Sélectionner...</option>
              {PLANS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Date d'adhésion <span style={{ color: C.accent }}>*</span></label>
          <input type="date" value={form.dateDebut || new Date().toISOString().split('T')[0]} onChange={e => handleDebutChange(e.target.value)} style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      {/* Row 2: Discipline + Nombre de fois */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Discipline <span style={{ color: C.accent }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}><IconCard /></span>
            <select value={form.discipline || ''} onChange={e => set('discipline', e.target.value)} style={{ ...inpWithIcon, width: '100%', appearance: 'none', cursor: 'pointer' }}>
              <option value="">Sélectionner...</option>
              {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Nombre de fois <span style={{ color: C.accent }}>*</span></label>
          <input type="number" min="1" max="7" placeholder="ex: 3" value={form.nombreFois || ''} onChange={e => set('nombreFois', e.target.value)} style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      {/* Row 3: Date debut → fin, Nombre séance, Remise */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, marginBottom: 2 }}>Date début</div>
            <div style={{ fontSize: '0.85rem', color: C.text }}>{form.dateDebut || new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          <span style={{ color: C.accent }}><IconArrow /></span>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, marginBottom: 2 }}>Date fin</div>
            <div style={{ fontSize: '0.85rem', color: form.dateFin ? C.text : C.muted }}>{form.dateFin ? new Date(form.dateFin).toLocaleDateString('fr-FR') : '—'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.82rem', color: C.muted }}>Nombre de séance:</span>
          <span style={{ fontSize: '0.9rem', color: C.text, fontWeight: 700 }}>{nbrSeances || 0}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: C.muted }}>Remise</span>
          <input type="number" min="0" max="100" value={form.remise || ''} onChange={e => set('remise', e.target.value)} placeholder="0" style={{ ...inp, width: 70, textAlign: 'center', padding: '8px 10px' }} />
          <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>%</span>
        </div>
      </div>

      {/* Row 4: Prix, Verser, Manque */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: C.muted }}>Prix de cet abonnement:</span>
          <span style={{ fontSize: '0.95rem', color: C.text, fontWeight: 700 }}>{prixBase.toFixed(2)} <span style={{ color: C.accent }}>DA</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.8rem', color: C.muted }}>verser:</span>
          <input type="number" value={form.verser || ''} onChange={e => set('verser', e.target.value)} placeholder="0.00" style={{ ...inp, width: 100, padding: '8px 12px' }} />
          <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>DA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: C.muted }}>Manque:</span>
          <span style={{ fontSize: '0.95rem', color: manque > 0 ? C.accent : C.green, fontWeight: 700 }}>{manque.toFixed(2)} <span style={{ color: C.muted }}>DA</span></span>
        </div>
      </div>

      {/* Row 5: Frais inscription + Total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.fraisInscription}
              onChange={e => set('fraisInscription', e.target.checked)}
              style={{ accentColor: C.accent, width: 16, height: 16 }}
            />
            <span style={{ fontSize: '0.85rem', color: C.muted }}>Frais d'inscription</span>
          </label>
          {form.fraisInscription && (
            <>
              <input
                type="number"
                value={form.fraisInscriptionMontant || ''}
                onChange={e => set('fraisInscriptionMontant', e.target.value)}
                placeholder="0"
                style={{ ...inp, width: 90, padding: '8px 12px' }}
              />
              <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>DA</span>
            </>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, marginBottom: 2 }}>Total a payer</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.text }}>
            {total.toFixed(2)} <span style={{ color: C.accent }}>DA</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.07)` }}>
        <button onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
          précedent
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={onSave} style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
            Créer l'adhérent
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════
   MAIN MODAL
════════════════════════════ */
export default function AddMemberModal({ onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    sexe: 'Homme',
    dateDebut: new Date().toISOString().split('T')[0],
    status: 'Actif',
  });
  const [nextId] = useState(Math.floor(Math.random() * 1000) + 100);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.plan) return alert("Veuillez sélectionner un type d'abonnement.");
    const fullNom = `${form.prenom || ''} ${form.nom || ''}`.trim();
    const inscritDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const selectedPlan = PLANS.find(p => p.label === form.plan);
    onSave({
      id: nextId,
      nom: fullNom,
      email: form.email || '',
      phone: form.phone || '',
      plan: form.plan,
      status: form.status || 'Actif',
      inscrit: inscritDate,
      photo: form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullNom)}&background=2a2d36&color=e53935&size=200`,
      sexe: form.sexe,
      dateNaissance: form.dateNaissance || '',
      prix: selectedPlan ? `${selectedPlan.prix} DA` : '',
      dateDebut: form.dateDebut || '',
      dateFin: form.dateFin || '',
    });
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 860, margin: '0 20px', fontFamily: "'Barlow', sans-serif", color: C.text, borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>

        {/* Header strip — gym image only here, not full screen */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 32px' }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', fontWeight: 800, letterSpacing: 1, margin: 0, lineHeight: 1 }}>Nouvel adhérent</h1>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>Ajoutez un nouveau membre à votre salle</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Card body — dark, no image */}
        <div style={{ background: '#1a1516', padding: '28px 32px' }}>
          {step === 1
            ? <StepPersonnel form={form} set={set} onNext={() => setStep(2)} onClose={onClose} />
            : <StepAbonnement form={form} set={set} onPrev={() => setStep(1)} onSave={handleSave} onClose={onClose} />
          }
        </div>
      </div>
    </div>
  );
}