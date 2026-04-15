import React, { useState, useRef, useEffect } from 'react';
import GYM_BG from '../../images/salle.png';

const C = {
  bg: '#111215', surface: '#1a1c21', card: '#1f2128',
  modalBg: '#1a1516', modalBorder: '#3d3233',
  accent: '#e53935', text: '#f0f0f0', muted: '#7a7f8e',
  green: '#43a047', gold: '#ffc107', blue: '#1e88e5',
};

const DISCIPLINES = ['Musculation', 'Cardio', 'CrossFit', 'Yoga', 'Boxe', 'Natation'];
const MODES_PAIEMENT = [
  { value: 'cash',   label: 'Espèces',        icon: '💵' },
  { value: 'carte',  label: 'Carte bancaire',  icon: '💳' },
  { value: 'virement', label: 'Virement',      icon: '🏦' },
];

const IconX      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const IconPhone  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .98h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const IconUpload = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>;
const IconCamera = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconCard   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconArrow  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconCheck  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMoney  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><circle cx="12" cy="15" r="2"/></svg>;

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(229,57,53,0.5)', borderRadius: 8,
  padding: '12px 14px 12px 40px', color: C.text,
  fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '0.8rem', color: C.muted, fontWeight: 600, marginBottom: 6, display: 'block' };

function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: C.accent }}> *</span>}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}><Icon /></span>}
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} style={inputStyle} />
      </div>
    </div>
  );
}

// ── STEP 1 — Infos personnelles ──────────────────────────────────────────────
function StepPersonnel({ form, set, onNext, onClose }) {
  const fileRef   = useRef();
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [preview,    setPreview]    = useState(form.photo || null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { alert("Impossible d'accéder à la caméra"); setShowCamera(false); }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg');
    setPreview(data); set('photo', data); stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); set('photo', reader.result); };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (!form.nom?.trim() || !form.prenom?.trim()) { alert('Nom et prénom sont requis.'); return; }
    if (!form.numTelephone?.trim()) { alert('Le téléphone est requis.'); return; }
    stopCamera(); onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Photo */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>Photo de profil</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: `2px solid ${showCamera ? C.accent : 'rgba(229,57,53,0.3)'}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {showCamera
              ? <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : preview
                ? <img src={preview} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: C.muted, opacity: 0.5 }}><IconUser /></span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {!showCamera
                ? <button onClick={startCamera} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 7, padding: '9px 16px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}><IconCamera /> Caméra</button>
                : <button onClick={takePhoto}   style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#22c55e', border: 'none', borderRadius: 7, padding: '9px 16px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Capturer</button>
              }
              <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '9px 16px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}><IconUpload /> Importer</button>
            </div>
            {showCamera && <button onClick={stopCamera} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>Annuler</button>}
            <div style={{ fontSize: '0.72rem', color: C.muted }}>Prenez une photo ou téléchargez un fichier</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Champs */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>Informations personnelles</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
          <InputField label="Prénom" icon={IconUser} placeholder="Jean" value={form.prenom || ''} onChange={e => set('prenom', e.target.value)} required />
          <InputField label="Nom" icon={IconUser} placeholder="Dupont" value={form.nom || ''} onChange={e => set('nom', e.target.value)} required />
          <InputField label="Date de naissance" type="date" value={form.dateNaissance || ''} onChange={e => set('dateNaissance', e.target.value)} />
          <InputField label="Téléphone" icon={IconPhone} placeholder="06 12 34 56 78" value={form.numTelephone || ''} onChange={e => set('numTelephone', e.target.value)} required />
          <div style={{ gridColumn: '1 / -1' }}>
            <InputField label="Email" icon={IconMail} type="email" placeholder="jean.dupont@email.com" value={form.email || ''} onChange={e => set('email', e.target.value)} />
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: 'solid 1px rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>Annuler</button>
        <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          Prochaine étape <IconArrow />
        </button>
      </div>
    </div>
  );
}

// ── STEP 2 — Abonnement ──────────────────────────────────────────────────────
function StepAbonnement({ form, set, typesAbonnement, onPrev, onNext, onClose }) {
  const inp = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(229,57,53,0.5)',
    borderRadius: 8, padding: '10px 14px', color: C.text,
    fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
  };
  const inpIcon = { ...inp, paddingLeft: 38 };

  const selectedType     = typesAbonnement.find(t => t.id === parseInt(form.type_id));
  const prixBase         = parseFloat(selectedType?.prix) || 0;
  const remise           = parseFloat(form.remise) || 0;
  const fraisInscription = form.fraisInscription ? (parseFloat(form.fraisInscriptionMontant) || 0) : 0;
  const total            = prixBase * (1 - remise / 100) + fraisInscription;

  const computeDateFin = (debut, typeId) => {
    const type = typesAbonnement.find(t => t.id === parseInt(typeId));
    if (!debut || !type?.duree) return '';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + Number(type.duree));
    return d.toISOString().split('T')[0];
  };

  const handleTypeChange = (val) => {
    set('type_id', val);
    set('dateFin', computeDateFin(form.dateDebut || new Date().toISOString().split('T')[0], val));
    // Pré-remplir le montant à payer dans l'étape 3
    const t = typesAbonnement.find(t => t.id === parseInt(val));
    if (t) {
      const p = parseFloat(t.prix) || 0;
      set('totalAPayer', p);
    }
  };

  const handleDebutChange = (val) => {
    set('dateDebut', val);
    set('dateFin', computeDateFin(val, form.type_id));
  };

  // Mise à jour du total à payer quand remise ou frais changent
  useEffect(() => {
    set('totalAPayer', total);
  }, [total]);

  const handleNext = () => {
    if (!form.type_id) { alert("Veuillez sélectionner un type d'abonnement."); return; }
    if (!form.dateDebut) { alert("La date de début est requise."); return; }
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>Abonnement de l'adhérent</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Type abonnement */}
        <div>
          <label style={labelStyle}>Type d'abonnement <span style={{ color: C.accent }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}><IconCard /></span>
            <select value={form.type_id || ''} onChange={e => handleTypeChange(e.target.value)} style={{ ...inpIcon, width: '100%', appearance: 'none', cursor: 'pointer' }}>
              <option value="">Sélectionner...</option>
              {typesAbonnement.map(t => (
                <option key={t.id} value={t.id}>{t.nom} — {t.prix} DA</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date début */}
        <div>
          <label style={labelStyle}>Date d'adhésion <span style={{ color: C.accent }}>*</span></label>
          <input type="date" value={form.dateDebut || new Date().toISOString().split('T')[0]} onChange={e => handleDebutChange(e.target.value)} style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Discipline */}
        <div>
          <label style={labelStyle}>Discipline</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', zIndex: 1 }}><IconCard /></span>
            <select value={form.discipline || ''} onChange={e => set('discipline', e.target.value)} style={{ ...inpIcon, width: '100%', appearance: 'none', cursor: 'pointer' }}>
              <option value="">Sélectionner...</option>
              {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Nombre de fois */}
        <div>
          <label style={labelStyle}>Nombre de fois / semaine</label>
          <input type="number" min="1" max="7" placeholder="ex: 3" value={form.nombreFois || ''} onChange={e => set('nombreFois', e.target.value)} style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      {/* Date début → fin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, marginBottom: 2 }}>Date début</div>
            <div style={{ fontSize: '0.85rem', color: C.text }}>{form.dateDebut ? new Date(form.dateDebut).toLocaleDateString('fr-FR') : '—'}</div>
          </div>
          <span style={{ color: C.accent }}><IconArrow /></span>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, marginBottom: 2 }}>Date fin</div>
            <div style={{ fontSize: '0.85rem', color: form.dateFin ? C.text : C.muted }}>
              {form.dateFin ? new Date(form.dateFin).toLocaleDateString('fr-FR') : '—'}
            </div>
          </div>
        </div>

        {/* Remise */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.82rem', color: C.muted }}>Remise</span>
          <input type="number" min="0" max="100" value={form.remise || ''} onChange={e => set('remise', e.target.value)} placeholder="0" style={{ ...inp, width: 70, textAlign: 'center', padding: '8px 10px' }} />
          <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>%</span>
        </div>
      </div>

      {/* Frais inscription + total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.fraisInscription} onChange={e => set('fraisInscription', e.target.checked)} style={{ accentColor: C.accent, width: 16, height: 16 }} />
            <span style={{ fontSize: '0.85rem', color: C.muted }}>Frais d'inscription</span>
          </label>
          {form.fraisInscription && (
            <input type="number" value={form.fraisInscriptionMontant || ''} onChange={e => set('fraisInscriptionMontant', e.target.value)} placeholder="0" style={{ ...inp, width: 90, padding: '8px 12px' }} />
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, marginBottom: 2 }}>Total à payer</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.text }}>
            {total.toFixed(2)} <span style={{ color: C.accent }}>DA</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onPrev} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.text, fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          Précédent
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
            Prochaine étape <IconArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3 — Paiement ────────────────────────────────────────────────────────
// ── STEP 3 — Confirmation (plus de champ verser) ─────────────────────────────
function StepPaiement({ form, set, typesAbonnement, onPrev, onSave, onClose, saving }) {
  const selectedType     = typesAbonnement.find(t => t.id === parseInt(form.type_id));
  const prixBase         = parseFloat(selectedType?.prix) || 0;
  const remise           = parseFloat(form.remise) || 0;
  const fraisInscription = form.fraisInscription ? (parseFloat(form.fraisInscriptionMontant) || 0) : 0;
  const total            = prixBase * (1 - remise / 100) + fraisInscription;

  const inp = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(229,57,53,0.5)',
    borderRadius: 8, padding: '10px 14px', color: C.text,
    fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        Récapitulatif & Paiement
      </div>

      {/* Récapitulatif */}
      <div style={{ background: 'rgba(229,57,53,0.07)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Récapitulatif</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Adhérent</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{form.prenom} {form.nom}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Abonnement</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{selectedType?.nom || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Période</div>
            <div style={{ fontSize: '0.85rem', color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              {form.dateDebut ? new Date(form.dateDebut).toLocaleDateString('fr-FR') : '—'}
              <span style={{ color: C.accent }}>→</span>
              {form.dateFin ? new Date(form.dateFin).toLocaleDateString('fr-FR') : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Remise</div>
            <div style={{ fontSize: '0.85rem', color: remise > 0 ? C.gold : C.muted }}>{remise > 0 ? `-${remise}%` : 'Aucune'}</div>
          </div>
          {fraisInscription > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: 3 }}>Frais d'inscription</div>
              <div style={{ fontSize: '0.85rem', color: C.text }}>+{fraisInscription.toFixed(2)} DA</div>
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid rgba(229,57,53,0.2)', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Total à payer</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.text }}>
            {total.toFixed(2)} <span style={{ color: C.accent }}>DA</span>
          </span>
        </div>
      </div>

      {/* Choix payer maintenant / plus tard */}
      <div>
        <label style={labelStyle}>Statut du paiement</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { value: false, label: 'Payer plus tard', icon: '⏳', desc: "L'abonnement sera marqué impayé" },
            { value: true,  label: 'Payer maintenant', icon: '✅', desc: 'Le paiement sera enregistré' },
          ].map(opt => {
            const selected = (form.payerMaintenant === true) === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => set('payerMaintenant', opt.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                  border: selected ? `2px solid ${opt.value ? C.green : C.gold}` : '1px solid rgba(255,255,255,0.12)',
                  background: selected ? (opt.value ? 'rgba(67,160,71,0.1)' : 'rgba(255,193,7,0.08)') : 'rgba(255,255,255,0.04)',
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

      {/* Mode de paiement — seulement si payer maintenant */}
      {form.payerMaintenant && (
        <div>
          <label style={labelStyle}>Mode de paiement <span style={{ color: C.accent }}>*</span></label>
          <div style={{ display: 'flex', gap: 10 }}>
            {MODES_PAIEMENT.map(m => {
              const selected = (form.modePaiement || 'cash') === m.value;
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
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onPrev} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.text, fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          Précédent
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>Annuler</button>
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
            {saving ? 'Création...' : <><IconCheck /> Créer l'adhérent</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL PRINCIPAL ──────────────────────────────────────────────────────────
export default function AddMemberModal({ typesAbonnement: typesAbonnementProp = [], onSave, onClose }) {

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [typesAbonnement, setTypesAbonnement] = useState(typesAbonnementProp);
  const [form,   setForm]   = useState({
    sexe:         'Homme',
    dateDebut:    new Date().toISOString().split('T')[0],
    modePaiement: 'cash',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (typesAbonnementProp.length === 0 && window.api?.getTypesAbonnement) {
      window.api.getTypesAbonnement().then(data => {
        if (data) setTypesAbonnement(data);
      }).catch(console.error);
    }
  }, []);

  const STEP_LABELS = ['Informations personnelles', 'Abonnement', 'Paiement'];

  const handleSave = async () => {
  if (!form.type_id)   { alert("Veuillez sélectionner un type d'abonnement."); return; }
  if (!form.dateDebut) { alert("La date de début est requise."); return; }
  if (form.payerMaintenant === undefined) { alert("Veuillez choisir un statut de paiement."); return; }

  const selectedType     = typesAbonnement.find(t => t.id === parseInt(form.type_id));
  const prixBase         = parseFloat(selectedType?.prix) || 0;
  const remise           = parseFloat(form.remise) || 0;
  const fraisInscription = form.fraisInscription ? (parseFloat(form.fraisInscriptionMontant) || 0) : 0;
  const total            = prixBase * (1 - remise / 100) + fraisInscription;

  setSaving(true);
  try {
    await window.api.createAdherentComplet({
      nom:           form.nom,
      prenom:        form.prenom,
      dateNaissance: form.dateNaissance || null,
      numTelephone:  form.numTelephone,
      email:         form.email || null,
      sexe:          form.sexe,
      photo:         form.photo || null,
      type_id:       parseInt(form.type_id),
      dateDebut:     form.dateDebut,
      dateFin:       form.dateFin || null,
      montantDu:     total,
      // Paiement seulement si payerMaintenant = true
      montant:       form.payerMaintenant ? total : 0,
      modePaiement:  form.modePaiement || 'cash',
    });
    onSave?.();
    onClose();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la création de l'adhérent.");
  } finally {
    setSaving(false);
  }
};

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 860, margin: '0 20px', fontFamily: "'Barlow', sans-serif", color: C.text, borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 32px' }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', fontWeight: 800, letterSpacing: 1, margin: 0, lineHeight: 1 }}>Nouvel adhérent</h1>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                Étape {step}/3 — {STEP_LABELS[step - 1]}
              </div>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                {[1, 2, 3].map(s => (
                  <React.Fragment key={s}>
                    <div style={{
                      width: s === step ? 28 : (s < step ? 22 : 8),
                      height: 8, borderRadius: 4,
                      background: s < step ? C.green : s === step ? C.accent : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s < step && <IconCheck />}
                    </div>
                    {s < 3 && <div style={{ width: 16, height: 1, background: s < step ? C.green : 'rgba(255,255,255,0.2)' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#1a1516', padding: '28px 32px' }}>
          {step === 1 && (
            <StepPersonnel form={form} set={set} onNext={() => setStep(2)} onClose={onClose} />
          )}
          {step === 2 && (
            <StepAbonnement form={form} set={set} typesAbonnement={typesAbonnement} onPrev={() => setStep(1)} onNext={() => setStep(3)} onClose={onClose} />
          )}
          {step === 3 && (
            <StepPaiement form={form} set={set} typesAbonnement={typesAbonnement} onPrev={() => setStep(2)} onSave={handleSave} onClose={onClose} saving={saving} />
          )}
        </div>
      </div>
    </div>
  );
}