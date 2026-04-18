
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, Search, Plus, Filter, Mail, Phone,
  Edit2, Trash2, Users, Calendar, Loader2, AlertCircle, RefreshCw, PauseCircle
} from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';
import GYM_BG from '../../images/background.png';
import { useLocation, useNavigate } from "react-router-dom";
import QuickActions from "../components/QuickActions";
import RenewModal from '../components/RenewModal';

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg: '#0e0f11', card: '#1a1d24', cardHover: '#1f2330',
  border: '#252833', borderHover: '#e53935',
  accent: '#e53935', accentDim: 'rgba(229,57,53,0.12)',
  accentBorder: 'rgba(229,57,53,0.3)',
  text: '#f0f0f0', muted: '#6b7280', subtle: '#9ca3af',
  green: '#22c55e', gold: '#f59e0b', blue: '#3b82f6',
  orange: '#f97316',
};

const styleModifier = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
  color: '#3b82f6', borderRadius: 8, padding: '8px 12px',
  fontSize: '0.8rem', cursor: 'pointer',
};

const styleSupprimer = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)',
  color: '#e53935', borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const FILTERS       = ['Tous', 'actif', 'expiré', 'suspendu'];
const FILTER_LABELS = ['Tous', 'Actif', 'Expiré', 'Suspendu'];

function planColor(typeNom) {
  const n = (typeNom || '').toLowerCase();
  if (n.includes('premium') || n.includes('annuel')) return C.gold;
  if (n.includes('standard') || n.includes('mensuel')) return C.blue;
  return C.muted;
}
function planBg(typeNom) {
  const n = (typeNom || '').toLowerCase();
  if (n.includes('premium') || n.includes('annuel')) return 'rgba(245,158,11,0.1)';
  if (n.includes('standard') || n.includes('mensuel')) return 'rgba(59,130,246,0.1)';
  return 'rgba(107,114,128,0.1)';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toInputDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr instanceof Date) {
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, '0');
    const d = String(dateStr.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof dateStr !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const iso = dateStr.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function statusConfig(statut) {
  switch ((statut || '').toLowerCase()) {
    case 'actif':    return { label: 'Actif',    bg: '#22c55e', shadow: 'rgba(34,197,94,0.4)'  };
    case 'expiré':   return { label: 'Expiré',   bg: '#e53935', shadow: 'rgba(229,57,53,0.4)'  };
    case 'suspendu': return { label: 'Suspendu', bg: '#f97316', shadow: 'rgba(249,115,22,0.4)' };
    default:         return { label: 'Sans abo', bg: '#6b7280', shadow: 'rgba(107,114,128,0.4)' };
  }
}

// ─── Composant : MemberCard ──────────────────────────────────────────────────
function MemberCard({ member, onEdit, onDelete, onRenew }) {
  const [hovered, setHovered] = useState(false);
  const sc = statusConfig(member.abonnementStatut);
  const photoSrc = member.photo
    || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.nom || '') + ' ' + (member.prenom || ''))}&background=1f2330&color=e53935&size=300`;

  const isSuspendu = (member.abonnementStatut || '').toLowerCase() === 'suspendu';

  // ── Date de fin effective à afficher ──
  // Si suspendu : on affiche la dateFin décalée (= dateFin actuelle en BDD après décalage)
  // La date dans dateFin est déjà la date décalée une fois enregistrée
  const datefinAffichee = member.dateFin
    ? formatDate(member.dateFin)
    : '—';

  // Date de fin de suspension pour affichage "Suspendu jusqu'au..."
  const dateFinSuspensionAffichee = member.dateFinSuspension
    ? formatDate(member.dateFinSuspension)
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderRadius: 14, overflow: 'hidden', position: 'relative',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
        <img
          src={photoSrc}
          alt={member.nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=1f2330&color=e53935&size=300`; }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(14,15,17,0.9))' }} />
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: '0.65rem', fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 20,
          background: sc.bg, color: '#fff',
          boxShadow: `0 2px 8px ${sc.shadow}`,
        }}>
          {sc.label}
        </span>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {member.nom} {member.prenom}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: planBg(member.typeNom), borderRadius: 6, padding: '3px 10px', marginBottom: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: planColor(member.typeNom) }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: planColor(member.typeNom) }}>
            {member.typeNom || 'Aucun abonnement'}
          </span>
        </div>

        {/* ── Bloc suspension : affiché seulement si statut = suspendu ── */}
        {isSuspendu && dateFinSuspensionAffichee && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 7, padding: '5px 9px', marginBottom: 8,
          }}>
            <PauseCircle size={12} color={C.orange} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.67rem', color: C.orange, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Suspendu {member.dureeSuspension ? `(${member.dureeSuspension}j)` : ''}
              </span>
              <span style={{ fontSize: '0.68rem', color: C.subtle }}>
                Reprise le <strong style={{ color: C.orange }}>{dateFinSuspensionAffichee}</strong>
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {[{ Icon: Mail, text: member.email }, { Icon: Phone, text: member.numTelephone }].map(({ Icon, text }) => (
            <div key={Icon.displayName} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={11} color={C.muted} />
              </div>
              <span style={{ fontSize: '0.75rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {text || '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Date fin abonnement */}
        {member.dateFin && (
          <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={11} />
            <span>
              {isSuspendu ? 'Fin (après reprise) :' : 'Expire le :'}{' '}
              <strong style={{ color: isSuspendu ? C.orange : C.subtle, fontWeight: 500 }}>
                {datefinAffichee}
              </strong>
            </span>
          </div>
        )}

        <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} />
          <span>Inscrit le <strong style={{ color: C.subtle, fontWeight: 500 }}>{formatDate(member.dateCreation)}</strong></span>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onEdit(member)} style={{ flex: 1, ...styleModifier }}>
            <Edit2 size={13} /> Modifier
          </button>

          {(['expiré', 'suspendu'].includes((member.abonnementStatut || '').toLowerCase())) && (
            <button
              onClick={() => onRenew(member)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e', borderRadius: 8, padding: '8px 12px',
                fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              🔄 Renouveler
            </button>
          )}

          <button onClick={() => onDelete(member.idAdherent)} style={{ ...styleSupprimer }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant : EditMemberModal ─────────────────────────────────────────────
function EditMemberModal({ member, typesAbonnement, onSave, onClose }) {
  const [tab, setTab]     = useState('adherent');
  const [saving, setSaving] = useState(false);
  const [form, setForm]   = useState({
    idAdherent:        member.idAdherent,
    nom:               member.nom || '',
    prenom:            member.prenom || '',
    dateNaissance:     toInputDate(member.dateNaissance),
    numTelephone:      member.numTelephone || '',
    email:             member.email || '',
    sexe:              member.sexe || 'Homme',
    photo:             member.photo || '',
    idAbonnement:      member.idAbonnement || null,
    type_id:           member.type_id || (typesAbonnement[0]?.id ?? ''),
    dateDebut:         toInputDate(member.dateDebut),
    dateFin:           toInputDate(member.dateFin),
    abonnementStatut:  member.abonnementStatut || 'actif',
    dureeSuspension:   member.dureeSuspension   || '',
    causeSuspension:   member.causeSuspension   || '',
    dateFinSuspension: toInputDate(member.dateFinSuspension),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const computeAndSetDateFin = (dateDebut, typeId) => {
    if (!dateDebut || !typeId) return;
    const found = typesAbonnement.find(t => String(t.id) === String(typeId));
    if (!found?.duree) return;
    const [y, m, d] = dateDebut.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setMonth(date.getMonth() + Number(found.duree));
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    set('dateFin', `${yy}-${mm}-${dd}`);
  };

  const handleTypeChange = (newTypeId) => {
    set('type_id', newTypeId);
    computeAndSetDateFin(form.dateDebut, newTypeId);
  };

  const handleDateDebutChange = (newDate) => {
    set('dateDebut', newDate);
    computeAndSetDateFin(newDate, form.type_id);
  };

  const handleDureeSuspensionChange = (val) => {
    set('dureeSuspension', val);
    if (val) {
      const now = new Date();
      now.setDate(now.getDate() + Number(val));
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      set('dateFinSuspension', `${y}-${m}-${d}`);
    } else {
      set('dateFinSuspension', '');
    }
  };

  const handleStatutChange = (newStatut) => {
    set('abonnementStatut', newStatut);
    if (newStatut !== 'suspendu') {
      set('dureeSuspension', '');
      set('causeSuspension', '');
      set('dateFinSuspension', '');
    }
  };

  // ── Caméra ────────────────────────────────────────────────────────────────
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);

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
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    set('photo', canvas.toDataURL('image/png'));
    setShowCamera(false);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) return alert('Le nom est requis.');
    if (form.abonnementStatut === 'suspendu') {
      if (!form.dureeSuspension || !String(form.causeSuspension).trim()) {
        alert('La durée et la cause de suspension sont obligatoires.');
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    background: '#312829', border: '1px solid #3d3233', borderRadius: 6,
    padding: '7px 10px', color: C.text, fontFamily: 'inherit',
    fontSize: '0.83rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const isSuspendu = form.abonnementStatut === 'suspendu';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#1a1516', border: '1px solid #3d3233', borderRadius: 14, width: 700, maxWidth: '96vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', fontFamily: "'Barlow', sans-serif" }}>

        {/* Tabs header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#231e1f', borderBottom: '1px solid #3d3233', padding: '0 16px' }}>
          <div style={{ display: 'flex' }}>
            {[{ key: 'adherent', label: 'Adhérent' }, { key: 'abonnement', label: 'Abonnement' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? C.accent : 'transparent', border: 'none', color: tab === t.key ? '#fff' : C.muted, padding: '11px 20px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '1.1rem', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>

          {tab === 'adherent' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

              {/* Photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8, padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid #3d3233' }}>
                <img
                  src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom + ' ' + form.prenom)}&background=1f2330&color=e53935&size=200`}
                  style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: `2px solid ${C.accent}`, flexShrink: 0 }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom)}&background=1f2330&color=e53935&size=200`; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginBottom: 8 }}>Photo de l'adhérent</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input type="file" id="fileEdit" hidden accept="image/*" onChange={e => {
                      const reader = new FileReader();
                      reader.onload = ev => set('photo', ev.target.result);
                      reader.readAsDataURL(e.target.files[0]);
                    }} />
                    <button onClick={() => document.getElementById('fileEdit').click()} style={{ background: '#3d3233', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Importer</button>
                    <button onClick={startCamera} style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, padding: '7px 14px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Prendre une photo</button>
                  </div>
                </div>
              </div>

              {showCamera && (
                <div style={{ position: 'relative', background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                  <video ref={videoRef} autoPlay style={{ width: '100%', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <button onClick={takePhoto} style={{ background: C.green, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Capturer</button>
                    <button onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t => t.stop()); setShowCamera(false); }} style={{ background: '#555', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
                  </div>
                </div>
              )}

              {[
                { label: 'Nom :', key: 'nom', type: 'text' },
                { label: 'Prénom :', key: 'prenom', type: 'text' },
                { label: 'Sexe :', key: 'sexe', type: 'select', opts: ['Homme', 'Femme'] },
                { label: 'Date de naissance :', key: 'dateNaissance', type: 'date' },
                { label: 'Téléphone :', key: 'numTelephone', type: 'text' },
                { label: 'E-Mail :', key: 'email', type: 'email' },
              ].map(({ label, key, type, opts }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.78rem', color: C.muted, minWidth: 160, fontWeight: 600 }}>{label}</span>
                  {type === 'select'
                    ? <select style={inp} value={form[key]} onChange={e => set(key, e.target.value)}>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    : <input style={inp} type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
                  }
                </div>
              ))}
            </div>

          ) : (
            /* ── Tab Abonnement ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

              {!form.idAbonnement && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: C.gold }}>
                  Cet adhérent n'a pas encore d'abonnement. Remplissez les champs ci-dessous pour en créer un.
                </div>
              )}

              {/* Type d'abonnement (non modifiable) */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Type d'abonnement :</div>
                <div style={{ ...inp, opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                  {typesAbonnement.find(t => String(t.id) === String(form.type_id))?.nom || 'Aucun'}
                </div>
              </div>

              {/* Date début */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Date début :</div>
                <input style={inp} type="date" value={form.dateDebut} onChange={e => handleDateDebutChange(e.target.value)} />
              </div>

              {/* Date fin — si suspendu, on montre aussi la date décalée */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>
                  Date fin {isSuspendu ? '(après reprise, décalée automatiquement) :' : '(calculée) :'}
                </div>
                <input
                  style={{ ...inp, opacity: 0.6, cursor: 'not-allowed', color: isSuspendu ? C.orange : C.text }}
                  type="date"
                  value={form.dateFin}
                  readOnly
                  title={isSuspendu ? "La date de fin sera décalée automatiquement selon la durée de suspension" : "Calculée automatiquement selon le type d'abonnement et la date de début"}
                />
              </div>

              {/* Statut */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Statut :</div>
                <select style={inp} value={form.abonnementStatut} onChange={e => handleStatutChange(e.target.value)}>
                  <option value="actif">Actif</option>
                  <option value="expiré">Expiré</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>

              {/* ── Bloc suspension ── */}
              {isSuspendu && (
                <div style={{
                  background: 'rgba(249,115,22,0.07)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{ fontSize: '0.75rem', color: C.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⏸ Détails de la suspension
                  </div>

                  {/* Explication */}
                  <div style={{ fontSize: '0.72rem', color: C.subtle, background: 'rgba(249,115,22,0.06)', borderRadius: 6, padding: '7px 10px', lineHeight: 1.6 }}>
                    La date de fin actuelle (<strong style={{ color: C.orange }}>{formatDate(form.dateFin)}</strong>) sera automatiquement décalée de la durée de suspension lors de la reprise.
                  </div>

                  {/* Durée */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>
                      Durée de suspension (jours) <span style={{ color: C.accent }}>*</span>
                    </div>
                    <input
                      style={{ ...inp, borderColor: !form.dureeSuspension ? 'rgba(249,115,22,0.55)' : '#3d3233' }}
                      type="number" min="1" max="365" placeholder="Ex : 30"
                      value={form.dureeSuspension}
                      onChange={e => handleDureeSuspensionChange(e.target.value)}
                    />
                    {!form.dureeSuspension && (
                      <div style={{ fontSize: '0.7rem', color: C.orange, marginTop: 4 }}>La durée est requise pour une suspension</div>
                    )}
                  </div>

                  {/* Date fin suspension calculée */}
                  {form.dateFinSuspension && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>
                        Reprise prévue le <span style={{ color: C.orange }}>(calculée automatiquement)</span>
                      </div>
                      <input
                        style={{ ...inp, opacity: 0.6, cursor: 'not-allowed', color: C.orange }}
                        type="date" value={form.dateFinSuspension} readOnly
                        title="Date d'aujourd'hui + durée de suspension en jours"
                      />
                    </div>
                  )}

                  {/* Cause */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>
                      Cause de la suspension <span style={{ color: C.accent }}>*</span>
                    </div>
                    <textarea
                      style={{
                        ...inp, resize: 'vertical', minHeight: 72, lineHeight: '1.5',
                        borderColor: !String(form.causeSuspension).trim() ? 'rgba(249,115,22,0.55)' : '#3d3233',
                      }}
                      placeholder="Ex : Blessure, voyage, raison médicale..."
                      value={form.causeSuspension}
                      onChange={e => set('causeSuspension', e.target.value)}
                    />
                    {!String(form.causeSuspension).trim() && (
                      <div style={{ fontSize: '0.7rem', color: C.orange, marginTop: 4 }}>La cause est requise pour une suspension</div>
                    )}
                  </div>
                </div>
              )}

              {/* Aperçu statut actuel */}
              {form.idAbonnement && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid #3d3233' }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>Statut actuel :</span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
                    padding: '3px 10px', borderRadius: 20,
                    background: statusConfig(form.abonnementStatut).bg, color: '#fff',
                  }}>
                    {statusConfig(form.abonnementStatut).label}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 22px', borderTop: '1px solid #3d3233', background: '#231e1f' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: saving ? '#7a2020' : C.accent, border: 'none', borderRadius: 7, padding: '9px 24px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Enregistrer
          </button>
          <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 20px', color: C.muted, fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant : Toast ───────────────────────────────────────────────────────
function Toast({ message, error }) {
  if (!message) return null;
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 32, background: error ? C.accent : C.green, color: '#fff', borderRadius: 10, padding: '13px 22px', fontWeight: 600, fontSize: '0.875rem', zIndex: 1100, boxShadow: `0 6px 24px ${error ? 'rgba(229,57,53,0.35)' : 'rgba(34,197,94,0.35)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
      {error ? <AlertCircle size={15} /> : '✓'} {message}
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
export default function Adherent() {
  const [renewTarget, setRenewTarget] = useState(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const [adherents, setAdherents]   = useState([]);
  const [typesAbo, setTypesAbo]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterIdx, setFilterIdx]   = useState(0);
  const [modal, setModal]           = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast]           = useState({ msg: '', error: false });

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: '', error: false }), 2800);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, types] = await Promise.all([
        window.api.getAdherentsAvecAbonnement(),
        window.api.getTypesAbonnement(),
      ]);
      setAdherents(data);
      setTypesAbo(types);
    } catch (err) {
      showToast('Erreur lors du chargement des données', true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openModal") === "true") {
      setModal("add");
      navigate("/adherents", { replace: true });
    }
  }, [location.search]);

  const handleClose = () => { setModal(null); setEditTarget(null); };
  const handleEdit  = (m) => { setEditTarget(m); setModal('edit'); };

  // ── Renouveler ────────────────────────────────────────────────────────────
  const handleRenew = async (data) => {
    try {
      if (data.idAbonnement) {
        await window.api.updateAbonnement({
          idAbonnement: data.idAbonnement,
          type_id:      data.type_id,
          dateDebut:    data.dateDebut,
          dateFin:      data.dateFin,
          statut:       'actif',
          montantDu:    data.montantDu,
          // Reset total suspension lors d'un renouvellement
          dureeSuspension:   null,
          causeSuspension:   null,
          dateFinSuspension: null,
        });
      } else {
        await window.api.addAbonnement({
          adherent_id:  renewTarget.idAdherent,
          type_id:      data.type_id,
          dateDebut:    data.dateDebut,
          dateFin:      data.dateFin,
          statut:       'actif',
          montantDu:    data.montantDu,
        });
      }
      showToast('Abonnement renouvelé avec succès');
      setModal(null);
      setRenewTarget(null);
      setFilterIdx(0);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du renouvellement', true);
    }
  };

  // ── Modifier un adhérent ──────────────────────────────────────────────────
  const handleSaveEdit = async (form) => {
    try {
      await window.api.updateAdherent({
        idAdherent:    form.idAdherent,
        nom:           form.nom,
        prenom:        form.prenom,
        dateNaissance: form.dateNaissance,
        numTelephone:  form.numTelephone,
        email:         form.email,
        sexe:          form.sexe,
      });

      if (form.photo !== editTarget.photo) {
        await window.api.updateAdherentPhoto({
          idAdherent: form.idAdherent,
          photo: form.photo,
        });
      }

      const isSuspendu = form.abonnementStatut === 'suspendu';

      if (form.idAbonnement) {
        await window.api.updateAbonnement({
          idAbonnement:      form.idAbonnement,
          type_id:           parseInt(form.type_id),
          dateDebut:         form.dateDebut,
          dateFin:           form.dateFin,
          statut:            form.abonnementStatut,
          // Champs suspension — null si statut ≠ suspendu
          dureeSuspension:   isSuspendu ? form.dureeSuspension   : null,
          causeSuspension:   isSuspendu ? form.causeSuspension   : null,
          dateFinSuspension: isSuspendu ? form.dateFinSuspension : null,
        });
      } else if (form.dateDebut && form.dateFin && form.type_id) {
        await window.api.addAbonnement({
          adherent_id:       form.idAdherent,
          type_id:           parseInt(form.type_id),
          dateDebut:         form.dateDebut,
          dateFin:           form.dateFin,
          statut:            form.abonnementStatut,
          dureeSuspension:   isSuspendu ? form.dureeSuspension   : null,
          causeSuspension:   isSuspendu ? form.causeSuspension   : null,
          dateFinSuspension: isSuspendu ? form.dateFinSuspension : null,
        });
      }

      showToast('Adhérent modifié avec succès');
      handleClose();
      setFilterIdx(0);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la modification', true);
      throw err;
    }
  };

  // ── Ajouter un adhérent ───────────────────────────────────────────────────
  const handleSaveAdd = async () => {
    showToast('Adhérent ajouté avec succès');
    handleClose();
    await loadData();
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet adhérent et toutes ses données liées ?')) return;
    try {
      await window.api.deleteAdherentComplet(id);
      showToast('Adhérent supprimé');
      setAdherents(l => l.filter(a => a.idAdherent !== id));
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', true);
    }
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = adherents.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.nom || '').toLowerCase().includes(q) ||
      (a.prenom || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.numTelephone || '').includes(q);

    const statut = (a.abonnementStatut || '').toLowerCase();
    const matchFilter = filterIdx === 0 || statut === FILTERS[filterIdx];

    return matchSearch && matchFilter;
  });

  const actif    = adherents.filter(a => (a.abonnementStatut || '').toLowerCase() === 'actif').length;
  const expire   = adherents.filter(a => (a.abonnementStatut || '').toLowerCase() === 'expiré').length;
  const suspendu = adherents.filter(a => (a.abonnementStatut || '').toLowerCase() === 'suspendu').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg }}>

      {/* ── Hero Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: 'relative', padding: '32px 36px 36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: '0.72rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Adhérents</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>
              Gestion des adhérents
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
              {[
                { count: adherents.length, label: 'au total',  color: C.muted  },
                { count: actif,            label: 'actifs',    color: C.green  },
                { count: expire,           label: 'expirés',   color: C.accent },
                { count: suspendu,         label: 'suspendus', color: C.orange },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.82rem', color: C.muted }}>
                      <strong style={{ color }}>{count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={loadData}
              title="Rafraîchir"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', color: C.muted }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setModal('add')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(229,57,53,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(229,57,53,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(229,57,53,0.4)'; }}
            >
              <Plus size={17} /> Ajouter un adhérent
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 36px', background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
          <Search size={15} color={C.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px 10px 38px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.4)'}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden' }}>
          {FILTER_LABELS.map((f, i) => (
            <button
              key={f}
              onClick={() => setFilterIdx(i)}
              style={{ padding: '9px 18px', border: 'none', borderRight: i < FILTER_LABELS.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', background: filterIdx === i ? C.accent : 'transparent', color: filterIdx === i ? '#fff' : C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', fontWeight: filterIdx === i ? 700 : 400 }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', fontSize: '0.8rem', color: C.muted, gap: 6 }}>
          <Filter size={13} /> {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 36px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16, color: C.muted }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: C.accent }} />
            <span>Chargement des adhérents...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
            <Users size={40} color={C.border} style={{ marginBottom: 12 }} />
            <div>{search ? `Aucun résultat pour "${search}"` : 'Aucun adhérent trouvé.'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
            {filtered.map(m => (
              <MemberCard
                key={m.idAdherent}
                member={m}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRenew={(m) => { setRenewTarget(m); setModal('renew'); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'edit' && editTarget && (
        <EditMemberModal
          member={editTarget}
          typesAbonnement={typesAbo}
          onSave={handleSaveEdit}
          onClose={handleClose}
        />
      )}
      {modal === 'add' && (
        <AddMemberModal
          typesAbonnement={typesAbo}
          onSave={handleSaveAdd}
          onClose={handleClose}
        />
      )}
      {modal === 'renew' && renewTarget && (
        <RenewModal
          member={renewTarget}
          typesAbonnement={typesAbo}
          onSave={handleRenew}
          onClose={handleClose}
        />
      )}

      <Toast message={toast.msg} error={toast.error} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}