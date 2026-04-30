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
  { value: 'cash',     label: 'Espèces',       icon: '💵' },
  { value: 'carte',    label: 'Carte bancaire', icon: '💳' },
  { value: 'virement', label: 'Virement',       icon: '🏦' },
];

const IconX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const IconPhone   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .98h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const IconUpload  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>;
const IconCamera  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconCard    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconCheck   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

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
};

const inputStyleNoIcon = {
  ...inputStyle,
  paddingLeft: 14,
};

const inputStyleError = {
  ...inputStyle,
  borderColor: 'rgba(229,57,53,0.9)',
  boxShadow: '0 0 0 2px rgba(229,57,53,0.15)',
};

const labelStyle = {
  fontSize: '0.8rem',
  color: C.muted,
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
};

/* ── Calcule l'âge à partir d'une date ISO ── */
function calcAge(dateStr) {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  const now   = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/* ── Date max pour avoir au moins 7 ans ── */
function maxBirthDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 7);
  return d.toISOString().split('T')[0];
}

function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, required, error, noIconPad }) {
  const base = noIconPad ? { ...inputStyleNoIcon } : inputStyle;
  const style = error ? { ...base, borderColor: 'rgba(229,57,53,0.9)', boxShadow: '0 0 0 2px rgba(229,57,53,0.15)', paddingLeft: noIconPad ? 14 : 40 } : base;

  return (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: C.accent }}> *</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && !noIconPad && (
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
          style={style}
          max={type === 'date' && label.toLowerCase().includes('naissance') ? maxBirthDate() : undefined}
        />
      </div>
      {error && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{error}</div>}
    </div>
  );
}

/* ══════════════════
   STEP 1 — Personnel
══════════════════ */
function StepPersonnel({ form, set, onNext, onClose }) {
  const fileRef  = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview]       = useState(form.photo || null);
  const [errors, setErrors]         = useState({});

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Impossible d'accéder à la caméra");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg');
    setPreview(data);
    set('photo', data);
    stopCamera();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); set('photo', reader.result); };
    reader.readAsDataURL(file);
  };

  /* 1. Téléphone : chiffres + séparateurs seulement */
  const handlePhone = (e) => {
    const raw    = e.target.value;
    const clean  = raw.replace(/[^0-9\s\+\-\(\)]/g, '');
    set('numTelephone', clean);
    if (/[^0-9\s\+\-\(\)]/.test(raw)) {
      setErrors(prev => ({ ...prev, phone: 'Chiffres uniquement.' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  /* 2. Email : validation format */
  const handleEmail = (e) => {
    const val = e.target.value;
    set('email', val);
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrors(prev => ({ ...prev, email: 'Format invalide (ex: nom@domaine.com)' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  /* 4. Age > 7 ans */
  const handleDOB = (e) => {
    const val = e.target.value;
    set('dateNaissance', val);
    if (val) {
      const age = calcAge(val);
      if (age < 7) {
        setErrors(prev => ({ ...prev, dob: `L'adhérent doit avoir au moins 7 ans (âge actuel : ${age} an${age > 1 ? 's' : ''}).` }));
      } else {
        setErrors(prev => ({ ...prev, dob: '' }));
      }
    } else {
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  const handleNext = () => {
    const newErrors = {};

    if (!form.nom?.trim())    newErrors.nom    = 'Le nom est requis.';
    if (!form.prenom?.trim()) newErrors.prenom = 'Le prénom est requis.';
    if (!form.numTelephone?.trim()) newErrors.phone = 'Le téléphone est requis.';

    // Validation email
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Format e-mail invalide.';
    }

    // Validation téléphone chiffres
    if (form.numTelephone && /[^0-9\s\+\-\(\)]/.test(form.numTelephone)) {
      newErrors.phone = 'Chiffres uniquement.';
    }

    // Validation âge >= 7 ans
    if (form.dateNaissance) {
      const age = calcAge(form.dateNaissance);
      if (age < 7) newErrors.dob = `L'adhérent doit avoir au moins 7 ans (âge : ${age} an${age > 1 ? 's' : ''}).`;
    }

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    stopCamera();
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Photo */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
          Photo de profil
        </div>
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
              {!showCamera ? (
                <button onClick={startCamera} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 7, padding: '9px 16px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <IconCamera /> Caméra
                </button>
              ) : (
                <button onClick={takePhoto} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#22c55e', border: 'none', borderRadius: 7, padding: '9px 16px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Capturer
                </button>
              )}
              <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '9px 16px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <IconUpload /> Importer
              </button>
            </div>
            {showCamera && (
              <button onClick={stopCamera} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
                Annuler
              </button>
            )}
            <div style={{ fontSize: '0.72rem', color: C.muted }}>Prenez une photo ou téléchargez un fichier</div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Infos personnelles */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
          Informations personnelles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>

          {/* Prénom */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Prénom <span style={{ color: C.accent }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}><IconUser /></span>
              <input
                type="text" placeholder="Jean"
                value={form.prenom || ''}
                onChange={e => { set('prenom', e.target.value); setErrors(p => ({ ...p, prenom: '' })); }}
                style={errors.prenom ? { ...inputStyle, borderColor: 'rgba(229,57,53,0.9)' } : inputStyle}
              />
            </div>
            {errors.prenom && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{errors.prenom}</div>}
          </div>

          {/* Nom */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Nom <span style={{ color: C.accent }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}><IconUser /></span>
              <input
                type="text" placeholder="Dupont"
                value={form.nom || ''}
                onChange={e => { set('nom', e.target.value); setErrors(p => ({ ...p, nom: '' })); }}
                style={errors.nom ? { ...inputStyle, borderColor: 'rgba(229,57,53,0.9)' } : inputStyle}
              />
            </div>
            {errors.nom && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{errors.nom}</div>}
          </div>

          {/* Date naissance — 4. âge > 7 ans */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Date de naissance</label>
            <input
              type="date"
              max={maxBirthDate()}
              value={form.dateNaissance || ''}
              onChange={handleDOB}
              style={errors.dob ? { ...inputStyleNoIcon, borderColor: 'rgba(229,57,53,0.9)' } : inputStyleNoIcon}
            />
            {errors.dob && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{errors.dob}</div>}
            {form.dateNaissance && !errors.dob && (
              <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 3 }}>
                Âge : {calcAge(form.dateNaissance)} ans
              </div>
            )}
          </div>

          {/* Téléphone — 1. chiffres uniquement */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Téléphone <span style={{ color: C.accent }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}><IconPhone /></span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="06 12 34 56 78"
                value={form.numTelephone || ''}
                onChange={handlePhone}
                style={errors.phone ? { ...inputStyle, borderColor: 'rgba(229,57,53,0.9)' } : inputStyle}
              />
            </div>
            {errors.phone && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{errors.phone}</div>}
          </div>

          {/* Email — 2. validation format */}
          <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
            <label style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex' }}><IconMail /></span>
              <input
                type="email"
                placeholder="jean.dupont@email.com"
                value={form.email || ''}
                onChange={handleEmail}
                style={errors.email ? { ...inputStyle, borderColor: 'rgba(229,57,53,0.9)' } : inputStyle}
              />
            </div>
            {errors.email && <div style={{ fontSize: '0.72rem', color: C.accent, marginTop: 3 }}>{errors.email}</div>}
          </div>

          {/* Sexe */}
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

/* ══════════════════
   STEP 2 — Abonnement
   5. Suppression du champ "nombre de séances"
══════════════════ */
function StepAbonnement({ form, set, typesAbonnement, onPrev, onNext, onClose }) {
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
    const t = typesAbonnement.find(t => t.id === parseInt(val));
    if (t) set('totalAPayer', parseFloat(t.prix) || 0);
  };

  const handleDebutChange = (val) => {
    set('dateDebut', val);
    set('dateFin', computeDateFin(val, form.type_id));
  };

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
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        Abonnement de l'adhérent
      </div>

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

        {/* Date d'adhésion */}
        <div>
          <label style={labelStyle}>Date d'adhésion <span style={{ color: C.accent }}>*</span></label>
          <input type="date" value={form.dateDebut || new Date().toISOString().split('T')[0]} onChange={e => handleDebutChange(e.target.value)} style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      {/* Discipline uniquement (nombre de séances supprimé — point 5) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
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
      </div>

      {/* Période + remise */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.82rem', color: C.muted }}>Remise</span>
          <input type="number" min="0" max="100" value={form.remise || ''} onChange={e => set('remise', e.target.value)} placeholder="0" style={{ ...inp, width: 70, textAlign: 'center', padding: '8px 10px' }} />
          <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700 }}>%</span>
        </div>
      </div>

      {/* Frais d'inscription + total */}
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
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
            Prochaine étape <IconArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════
   STEP 3 — Paiement
   3b. payer plus tard bien transmis
══════════════════ */
function StepPaiement({ form, set, typesAbonnement, onPrev, onSave, onClose, saving }) {
  const selectedType     = typesAbonnement.find(t => t.id === parseInt(form.type_id));
  const prixBase         = parseFloat(selectedType?.prix) || 0;
  const remise           = parseFloat(form.remise) || 0;
  const fraisInscription = form.fraisInscription ? (parseFloat(form.fraisInscriptionMontant) || 0) : 0;
  const total            = prixBase * (1 - remise / 100) + fraisInscription;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        Récapitulatif & Paiement
      </div>

      {/* Récapitulatif */}
      <div style={{ background: 'rgba(229,57,53,0.07)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Récapitulatif
        </div>
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
            <div style={{ fontSize: '0.85rem', color: remise > 0 ? C.gold : C.muted }}>
              {remise > 0 ? `-${remise}%` : 'Aucune'}
            </div>
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

      {/* Statut paiement — 3b. payer plus tard bien transmis */}
      <div>
        <label style={labelStyle}>Statut du paiement</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { value: false, label: 'Payer plus tard', icon: '⏳', desc: "L'abonnement sera marqué impayé", color: C.gold },
            { value: true,  label: 'Payer maintenant', icon: '✅', desc: 'Le paiement sera enregistré',   color: C.green },
          ].map(opt => {
            const selected = form.payerMaintenant === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => {
                  set('payerMaintenant', opt.value);
                  // 3b. S'assurer que montant = 0 si payer plus tard
                  set('montant', opt.value ? total : 0);
                  set('montantDu', total);
                }}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                  border: selected ? `2px solid ${opt.color}` : '1px solid rgba(255,255,255,0.12)',
                  background: selected ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                  color: selected ? opt.color : C.muted,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: selected ? 700 : 400, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>{opt.icon}</span>
                <span>{opt.label}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.7, textAlign: 'center' }}>{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Indication montant */}
        {form.payerMaintenant !== undefined && (
          <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 8, background: form.payerMaintenant ? 'rgba(67,160,71,0.1)' : 'rgba(255,193,7,0.1)', border: `1px solid ${form.payerMaintenant ? 'rgba(67,160,71,0.3)' : 'rgba(255,193,7,0.3)'}`, fontSize: '0.8rem', color: form.payerMaintenant ? C.green : C.gold }}>
            {form.payerMaintenant
              ? `✅ Montant encaissé : ${total.toFixed(2)} DA`
              : `⏳ Montant dû : ${total.toFixed(2)} DA — à régler ultérieurement`
            }
          </div>
        )}
      </div>

      {/* Mode paiement — visible seulement si payer maintenant */}
      {form.payerMaintenant === true && (
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
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: selected ? 700 : 400, fontSize: '0.8rem',
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
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 22px', color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: 'pointer' }}>
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving || form.payerMaintenant === undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: saving || form.payerMaintenant === undefined ? '#555' : C.accent,
              border: 'none', borderRadius: 8, padding: '10px 24px',
              color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700,
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

/* ══════════════════
   MODAL WRAPPER
══════════════════ */
export default function AddMemberModal({ typesAbonnement: typesAbonnementProp = [], onSave, onClose }) {
  const [step, setStep]                   = useState(1);
  const [saving, setSaving]               = useState(false);
  const [typesAbonnement, setTypesAbonnement] = useState(typesAbonnementProp);
  const [form, setForm]                   = useState({
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
    if (!form.type_id)    { alert("Veuillez sélectionner un type d'abonnement."); return; }
    if (!form.dateDebut)  { alert("La date de début est requise."); return; }
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
        // 3b. montant = 0 si payer plus tard, total si payer maintenant
        montant:       form.payerMaintenant ? total : 0,
        modePaiement:  form.payerMaintenant ? (form.modePaiement || 'cash') : null,
        payerMaintenant: form.payerMaintenant,
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
      <div style={{
        position: 'relative', width: '100%', maxWidth: 860, maxHeight: '90vh',
        overflowY: 'auto', margin: '0 20px',
        fontFamily: "'Barlow', sans-serif", color: C.text,
        borderRadius: 16, overflowX: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 32px' }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', fontWeight: 800, letterSpacing: 1, margin: 0, lineHeight: 1 }}>
                Nouvel adhérent
              </h1>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                Étape {step}/3 — {STEP_LABELS[step - 1]}
              </div>
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
        <div style={{ background: C.modalBg, padding: '28px 32px' }}>
          {step === 1 && <StepPersonnel form={form} set={set} onNext={() => setStep(2)} onClose={onClose} />}
          {step === 2 && <StepAbonnement form={form} set={set} typesAbonnement={typesAbonnement} onPrev={() => setStep(1)} onNext={() => setStep(3)} onClose={onClose} />}
          {step === 3 && <StepPaiement form={form} set={set} typesAbonnement={typesAbonnement} onPrev={() => setStep(2)} onSave={handleSave} onClose={onClose} saving={saving} />}
        </div>
      </div>
    </div>
  );
}