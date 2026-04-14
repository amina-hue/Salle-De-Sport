// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   ChevronRight, Search, Plus, Filter, Mail, Phone,
//   Edit2, Trash2, Users, Calendar, Loader2, AlertCircle, RefreshCw
// } from 'lucide-react';
// import AddMemberModal from '../components/AddMemberModal';
// import GYM_BG from '../../images/background.png';

// // ─── Palette ───────────────────────────────────────────────────────────────
// const C = {
//   bg: '#0e0f11', card: '#1a1d24', cardHover: '#1f2330',
//   border: '#252833', borderHover: '#e53935',
//   accent: '#e53935', accentDim: 'rgba(229,57,53,0.12)',
//   accentBorder: 'rgba(229,57,53,0.3)',
//   text: '#f0f0f0', muted: '#6b7280', subtle: '#9ca3af',
//   green: '#22c55e', gold: '#f59e0b', blue: '#3b82f6',
// };

// // ─── Helpers ────────────────────────────────────────────────────────────────
// const FILTERS = ['Tous', 'actif', 'expiré'];
// const FILTER_LABELS = ['Tous', 'Actif', 'Expiré'];

// function planColor(typeNom) {
//   const n = (typeNom || '').toLowerCase();

//   if (n.includes('premium') || n.includes('annuel')) return C.gold;
//   if (n.includes('standard') || n.includes('mensuel')) return C.blue;
//   return C.muted;
// }
// function planBg(typeNom) {
//   const n = (typeNom || '').toLowerCase();

//   if (n.includes('premium') || n.includes('annuel')) return 'rgba(245,158,11,0.1)';
//   if (n.includes('standard') || n.includes('mensuel')) return 'rgba(59,130,246,0.1)';
//   return 'rgba(107,114,128,0.1)';
// }

// function formatDate(dateStr) {
//   if (!dateStr) return '—';
//   const d = new Date(dateStr);
//   if (isNaN(d)) return dateStr;
//   return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
// }

// function toInputDate(dateStr) {
//   if (!dateStr) return '';
//   const d = new Date(dateStr);
//   if (isNaN(d)) return '';
//   return d.toISOString().split('T')[0];
// }

// // ─── Composant : MemberCard ──────────────────────────────────────────────────
// function MemberCard({ member, onEdit, onDelete }) {
//   const [hovered, setHovered] = useState(false);
//   const isActif = member.abonnementStatut === 'actif';
//   const statusLabel = isActif ? 'Actif' : member.abonnementStatut ? 'Expiré' : 'Sans abo';
//   const photoSrc = member.photo
//     || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.nom || '') + ' ' + (member.prenom || ''))}&background=1f2330&color=e53935&size=300`;

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         background: hovered ? C.cardHover : C.card,
//         border: `1px solid ${hovered ? C.borderHover : C.border}`,
//         borderRadius: 14, overflow: 'hidden', position: 'relative',
//         transition: 'all 0.22s ease',
//         transform: hovered ? 'translateY(-4px)' : 'none',
//         boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.2)',
//       }}
//     >
//       {/* Photo */}
//       <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
//         <img
//           src={photoSrc}
//           alt={member.nom}
//           style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
//           onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=1f2330&color=e53935&size=300`; }}
//         />
//         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(14,15,17,0.9))' }} />
//         <span style={{
//           position: 'absolute', top: 10, right: 10,
//           fontSize: '0.65rem', fontWeight: 700,
//           fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
//           padding: '4px 10px', borderRadius: 20,
//           background: isActif ? C.green : C.accent,
//           color: '#fff',
//           boxShadow: isActif ? '0 2px 8px rgba(34,197,94,0.4)' : '0 2px 8px rgba(229,57,53,0.4)',
//         }}>
//           {statusLabel}
//         </span>
//       </div>

//       {/* Content */}
//       <div style={{ padding: '14px 16px 16px' }}>
//         <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//           {member.nom} {member.prenom}
//         </div>

//         {/* Badge abonnement */}
//         <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: planBg(member.typeNom), borderRadius: 6, padding: '3px 10px', marginBottom: 12 }}>
//           <div style={{ width: 6, height: 6, borderRadius: '50%', background: planColor(member.typeNom) }} />
//           <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: planColor(member.typeNom) }}>
//             {member.typeNom || 'Aucun abonnement'}
//           </span>
//         </div>

//         {/* Email / Téléphone */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
//           {[{ Icon: Mail, text: member.email }, { Icon: Phone, text: member.numTelephone }].map(({ Icon, text }) => (
//             <div key={Icon.displayName} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                 <Icon size={11} color={C.muted} />
//               </div>
//               <span style={{ fontSize: '0.75rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 {text || '—'}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
//           <Calendar size={11} />
//           <span>Inscrit le <strong style={{ color: C.subtle, fontWeight: 500 }}>{formatDate(member.dateCreation)}</strong></span>
//         </div>

//         <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

//         <div style={{ display: 'flex', gap: 8 }}>
//           <button
//             onClick={() => onEdit(member)}
//             style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, borderRadius: 8, padding: '8px 12px', fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
//           >
//             <Edit2 size={13} /> Modifier
//           </button>
//           <button
//             onClick={() => onDelete(member.idAdherent)}
//             style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
//             onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; e.currentTarget.style.color = C.accent; }}
//             onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.muted; }}
//           >
//             <Trash2 size={13} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Composant : EditMemberModal ─────────────────────────────────────────────
// function EditMemberModal({ member, typesAbonnement, onSave, onClose }) {
//   const [tab, setTab] = useState('adherent');
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({
//     idAdherent: member.idAdherent,
//     nom: member.nom || '',
//     prenom: member.prenom || '',
//     dateNaissance: toInputDate(member.dateNaissance),
//     numTelephone: member.numTelephone || '',
//     email: member.email || '',
//     sexe: member.sexe || 'Homme',
//     photo: member.photo || '',
//     // abonnement
//     idAbonnement: member.idAbonnement || null,
//     type_id: member.type_id || (typesAbonnement[0]?.id ?? ''),
//     dateDebut: toInputDate(member.dateDebut),
//     dateFin: toInputDate(member.dateFin),
//     abonnementStatut: member.abonnementStatut || 'actif',
//   });

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const [showCamera, setShowCamera] = useState(false);
//   const videoRef = useRef(null);

//   const startCamera = async () => {
//     setShowCamera(true);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch {
//       alert("Impossible d'accéder à la caméra");
//       setShowCamera(false);
//     }
//   };

//   const takePhoto = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
//     videoRef.current.srcObject.getTracks().forEach(t => t.stop());
//     set('photo', canvas.toDataURL('image/png'));
//     setShowCamera(false);
//   };

//   const handleSave = async () => {
//     if (!form.nom.trim()) return alert('Le nom est requis.');
//     setSaving(true);
//     try {
//       await onSave(form);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const inp = {
//     background: '#312829', border: '1px solid #3d3233', borderRadius: 6,
//     padding: '7px 10px', color: C.text, fontFamily: 'inherit',
//     fontSize: '0.83rem', outline: 'none', width: '100%',
//   };

//   return (
//     <div
//       style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
//       onClick={e => e.target === e.currentTarget && onClose()}
//     >
//       <div style={{ background: '#1a1516', border: '1px solid #3d3233', borderRadius: 14, width: 700, maxWidth: '96vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', fontFamily: "'Barlow', sans-serif" }}>

//         {/* Tabs header */}
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#231e1f', borderBottom: '1px solid #3d3233', padding: '0 16px' }}>
//           <div style={{ display: 'flex' }}>
//             {[{ key: 'adherent', label: 'Adhérent' }, { key: 'abonnement', label: 'Abonnement' }].map(t => (
//               <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? C.accent : 'transparent', border: 'none', color: tab === t.key ? '#fff' : C.muted, padding: '11px 20px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
//                 {t.label}
//               </button>
//             ))}
//           </div>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '1.1rem', cursor: 'pointer', padding: 4 }}>✕</button>
//         </div>

//         {/* Body */}
//         <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>

//           {tab === 'adherent' ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

//               {/* Photo */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8, padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid #3d3233' }}>
//                 <img
//                   src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom + ' ' + form.prenom)}&background=1f2330&color=e53935&size=200`}
//                   style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: `2px solid ${C.accent}`, flexShrink: 0 }}
//                   onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom)}&background=1f2330&color=e53935&size=200`; }}
//                 />
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginBottom: 8 }}>Photo de l'adhérent</div>
//                   <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//                     <input type="file" id="fileEdit" hidden accept="image/*" onChange={e => {
//                       const reader = new FileReader();
//                       reader.onload = ev => set('photo', ev.target.result);
//                       reader.readAsDataURL(e.target.files[0]);
//                     }} />
//                     <button onClick={() => document.getElementById('fileEdit').click()} style={{ background: '#3d3233', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Importer</button>
//                     <button onClick={startCamera} style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, padding: '7px 14px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Prendre une photo</button>
//                   </div>
//                 </div>
//               </div>

//               {/* Caméra */}
//               {showCamera && (
//                 <div style={{ position: 'relative', background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
//                   <video ref={videoRef} autoPlay style={{ width: '100%', display: 'block' }} />
//                   <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
//                     <button onClick={takePhoto} style={{ background: C.green, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Capturer</button>
//                     <button onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t => t.stop()); setShowCamera(false); }} style={{ background: '#555', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
//                   </div>
//                 </div>
//               )}

//               {/* Champs adhérent */}
//               {[
//                 { label: 'Nom :', key: 'nom', type: 'text' },
//                 { label: 'Prénom :', key: 'prenom', type: 'text' },
//                 { label: 'Sexe :', key: 'sexe', type: 'select', opts: ['Homme', 'Femme'] },
//                 { label: 'Date de naissance :', key: 'dateNaissance', type: 'date' },
//                 { label: 'Téléphone :', key: 'numTelephone', type: 'text' },
//                 { label: 'E-Mail :', key: 'email', type: 'email' },
//               ].map(({ label, key, type, opts }) => (
//                 <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                   <span style={{ fontSize: '0.78rem', color: C.muted, minWidth: 160, fontWeight: 600 }}>{label}</span>
//                   {type === 'select'
//                     ? <select style={inp} value={form[key]} onChange={e => set(key, e.target.value)}>
//                         {opts.map(o => <option key={o} value={o}>{o}</option>)}
//                       </select>
//                     : <input style={inp} type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
//                   }
//                 </div>
//               ))}
//             </div>

//           ) : (
//             /* Tab Abonnement */
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

//               {!form.idAbonnement && (
//                 <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: C.gold }}>
//                   Cet adhérent n'a pas encore d'abonnement actif. Remplissez les champs ci-dessous pour en créer un.
//                 </div>
//               )}

//               {[
//                 {
//                   label: "Type d'abonnement :", key: 'type_id', type: 'select',
//                   opts: typesAbonnement.map(t => ({ value: t.id, label: `${t.nom} — ${t.prix} DA` }))
//                 },
//                 { label: 'Date début :', key: 'dateDebut', type: 'date' },
//                 { label: 'Date fin :', key: 'dateFin', type: 'date' },
//                 {
//                   label: 'Statut :', key: 'abonnementStatut', type: 'select',
//                   opts: [{ value: 'actif', label: 'Actif' }, { value: 'expiré', label: 'Expiré' }, { value: 'suspendu', label: 'Suspendu' }]
//                 },
//               ].map(({ label, key, type, opts }) => (
//                 <div key={key}>
//                   <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>{label}</div>
//                   {type === 'select'
//                     ? <select style={inp} value={form[key]} onChange={e => set(key, e.target.value)}>
//                         {opts.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
//                       </select>
//                     : <input style={inp} type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
//                   }
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 22px', borderTop: '1px solid #3d3233', background: '#231e1f' }}>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             style={{ display: 'flex', alignItems: 'center', gap: 7, background: saving ? '#7a2020' : C.accent, border: 'none', borderRadius: 7, padding: '9px 24px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer' }}
//           >
//             {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
//             Enregistrer
//           </button>
//           <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 20px', color: C.muted, fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>
//             Annuler
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Composant : Toast ───────────────────────────────────────────────────────
// function Toast({ message, error }) {
//   if (!message) return null;
//   return (
//     <div style={{ position: 'fixed', bottom: 28, right: 32, background: error ? C.accent : C.green, color: '#fff', borderRadius: 10, padding: '13px 22px', fontWeight: 600, fontSize: '0.875rem', zIndex: 1100, boxShadow: `0 6px 24px ${error ? 'rgba(229,57,53,0.35)' : 'rgba(34,197,94,0.35)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
//       {error ? <AlertCircle size={15} /> : '✓'} {message}
//     </div>
//   );
// }

// // ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
// export default function Adherent() {
//   const [adherents, setAdherents]       = useState([]);
//   const [typesAbo, setTypesAbo]         = useState([]);
//   const [loading, setLoading]           = useState(true);
//   const [search, setSearch]             = useState('');
//   const [filterIdx, setFilterIdx]       = useState(0);
//   const [modal, setModal]               = useState(null); // null | 'add' | 'edit'
//   const [editTarget, setEditTarget]     = useState(null);
//   const [toast, setToast]               = useState({ msg: '', error: false });

//   // ── Utils ──────────────────────────────────────────────────────────────────
//   const showToast = (msg, error = false) => {
//     setToast({ msg, error });
//     setTimeout(() => setToast({ msg: '', error: false }), 2800);
//   };

//   // ── Chargement initial ────────────────────────────────────────────────────
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [data, types] = await Promise.all([
//         window.api.getAdherentsAvecAbonnement(),
//         window.api.getTypesAbonnement(),
//       ]);
//       setAdherents(data);
//       setTypesAbo(types);
//     } catch (err) {
//       showToast('Erreur lors du chargement des données', true);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadData(); }, [loadData]);

//   // ── Handlers ──────────────────────────────────────────────────────────────

//   const handleClose = () => { setModal(null); setEditTarget(null); };

//   const handleEdit = (m) => { setEditTarget(m); setModal('edit'); };

//   const handleSaveEdit = async (form) => {
//     try {
//       // 1. Mettre à jour les infos adhérent
//       await window.api.updateAdherent({
//         idAdherent:    form.idAdherent,
//         nom:           form.nom,
//         prenom:        form.prenom,
//         dateNaissance: form.dateNaissance,
//         numTelephone:  form.numTelephone,
//         email:         form.email,
//         sexe:          form.sexe,
//       });

//       // 2. Mettre à jour la photo si modifiée
//       if (form.photo !== editTarget.photo) {
//         await window.api.updateAdherentPhoto({
//           idAdherent: form.idAdherent,
//           photo: form.photo,
//         });
//       }

//       // 3. Abonnement : update si existant, create si nouveau
//       if (form.dateDebut && form.dateFin && form.type_id) {
//         if (form.idAbonnement) {
//           // Mise à jour abonnement existant via updateAbonnement (à ajouter dans main.js si besoin)
//           await window.api.updateAbonnement({
//             idAbonnement: form.idAbonnement,
//             type_id:      form.type_id,
//             dateDebut:    form.dateDebut,
//             dateFin:      form.dateFin,
//             statut:       form.abonnementStatut,
//           });
//         } else {
//           // Création d'un nouvel abonnement
//           await window.api.addAbonnement({
//             adherent_id: form.idAdherent,
//             type_id:     form.type_id,
//             dateDebut:   form.dateDebut,
//             dateFin:     form.dateFin,
//             statut:      form.abonnementStatut,
//           });
//         }
//       }

//       showToast('Adhérent modifié avec succès');
//       handleClose();
//       await loadData();
//     } catch (err) {
//       console.error(err);
//       showToast('Erreur lors de la modification', true);
//       throw err;
//     }
//   };

//   const handleSaveAdd = async (data) => {
//     try {
//       // 1. Créer l'adhérent
//       const result = await window.api.addAdherent({
//         nom:           data.nom,
//         prenom:        data.prenom,
//         dateNaissance: data.dateNaissance,
//         numTelephone:  data.numTelephone,
//         email:         data.email,
//         sexe:          data.sexe,
//       });

//       const newId = result.insertId;

//       // 2. Upload photo si fournie
//       if (data.photo && newId) {
//         await window.api.updateAdherentPhoto({ idAdherent: newId, photo: data.photo });
//       }

//       // 3. Créer l'abonnement si renseigné
//       if (data.type_id && data.dateDebut && data.dateFin && newId) {
//         await window.api.addAbonnement({
//           adherent_id: newId,
//           type_id:     data.type_id,
//           dateDebut:   data.dateDebut,
//           dateFin:     data.dateFin,
//           statut:      'actif',
//         });
//       }

//       showToast('Adhérent ajouté avec succès');
//       handleClose();
//       await loadData();
//     } catch (err) {
//       console.error(err);
//       showToast("Erreur lors de l'ajout", true);
//       throw err;
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Supprimer cet adhérent et toutes ses données liées ?')) return;
//     try {
//       await window.api.deleteAdherentComplet(id);
//       showToast('Adhérent supprimé');
//       setAdherents(l => l.filter(a => a.idAdherent !== id));
//     } catch (err) {
//       console.error(err);
//       showToast('Erreur lors de la suppression', true);
//     }
//   };

//   // ── Filtrage ──────────────────────────────────────────────────────────────
//   const filtered = adherents.filter(a => {
//     const q = search.toLowerCase();
//     const matchSearch =
//       (a.nom || '').toLowerCase().includes(q) ||
//       (a.prenom || '').toLowerCase().includes(q) ||
//       (a.email || '').toLowerCase().includes(q) ||
//       (a.numTelephone || '').includes(q);
//     const matchFilter =
//       filterIdx === 0 ||
//       (a.abonnementStatut || '').toLowerCase() === FILTERS[filterIdx];
//     return matchSearch && matchFilter;
//   });

//   const actif  = adherents.filter(a => a.abonnementStatut === 'actif').length;
//   const expire = adherents.filter(a => a.abonnementStatut === 'expiré').length;

//   // ── Rendu ─────────────────────────────────────────────────────────────────
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg }}>

//       {/* ── Hero Header ── */}
//       <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
//         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)' }} />
//         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

//         <div style={{ position: 'relative', padding: '32px 36px 36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
//               <span style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
//               <ChevronRight size={12} color={C.muted} />
//               <span style={{ fontSize: '0.72rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Adhérents</span>
//             </div>
//             <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: 'uppercase', color: C.text }}>
//               Gestion des adhérents
//             </h1>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
//               {[
//                 { count: adherents.length, label: 'au total',  color: C.muted  },
//                 { count: actif,            label: 'actifs',    color: C.green  },
//                 { count: expire,           label: 'expirés',   color: C.accent },
//               ].map(({ count, label, color }, i) => (
//                 <React.Fragment key={label}>
//                   {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
//                     <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
//                     <span style={{ fontSize: '0.82rem', color: C.muted }}>
//                       <strong style={{ color }}>{count}</strong> {label}
//                     </span>
//                   </div>
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>

//           <div style={{ display: 'flex', gap: 10 }}>
//             <button
//               onClick={loadData}
//               title="Rafraîchir"
//               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', color: C.muted }}
//               onMouseEnter={e => e.currentTarget.style.color = C.text}
//               onMouseLeave={e => e.currentTarget.style.color = C.muted}
//             >
//               <RefreshCw size={16} />
//             </button>
//             <button
//               onClick={() => setModal('add')}
//               style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(229,57,53,0.4)', transition: 'all 0.2s' }}
//               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(229,57,53,0.5)'; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(229,57,53,0.4)'; }}
//             >
//               <Plus size={17} /> Ajouter un adhérent
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Toolbar ── */}
//       <div style={{ display: 'flex', gap: 12, padding: '14px 36px', background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: 'center' }}>
//         <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
//           <Search size={15} color={C.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
//           <input
//             type="text"
//             placeholder="Rechercher par nom, email, téléphone..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px 10px 38px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
//             onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.4)'}
//             onBlur={e => e.target.style.borderColor = C.border}
//           />
//         </div>

//         <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden' }}>
//           {FILTER_LABELS.map((f, i) => (
//             <button
//               key={f}
//               onClick={() => setFilterIdx(i)}
//               style={{ padding: '9px 18px', border: 'none', borderRight: i < FILTER_LABELS.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', background: filterIdx === i ? C.accent : 'transparent', color: filterIdx === i ? '#fff' : C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', fontWeight: filterIdx === i ? 700 : 400 }}
//             >
//               {f}
//             </button>
//           ))}
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', fontSize: '0.8rem', color: C.muted, gap: 6 }}>
//           <Filter size={13} /> {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
//         </div>
//       </div>

//       {/* ── Contenu principal ── */}
//       <div style={{ flex: 1, overflowY: 'auto', padding: '24px 36px 40px' }}>

//         {loading ? (
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16, color: C.muted }}>
//             <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: C.accent }} />
//             <span>Chargement des adhérents...</span>
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
//             <Users size={40} color={C.border} style={{ marginBottom: 12 }} />
//             <div>{search ? `Aucun résultat pour "${search}"` : 'Aucun adhérent trouvé.'}</div>
//           </div>
//         ) : (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
//             {filtered.map(m => (
//               <MemberCard key={m.idAdherent} member={m} onEdit={handleEdit} onDelete={handleDelete} />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── Modals ── */}
//       {modal === 'edit' && editTarget && (
//         <EditMemberModal
//           member={editTarget}
//           typesAbonnement={typesAbo}
//           onSave={handleSaveEdit}
//           onClose={handleClose}
//         />
//       )}
//       {modal === 'add' && (
//         <AddMemberModal
//           typesAbonnement={typesAbo}
//           onSave={handleSaveAdd}
//           onClose={handleClose}
//         />
//       )}

//       <Toast message={toast.msg} error={toast.error} />

//       {/* Spinner animation */}
//       <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, Search, Plus, Filter, Mail, Phone,
  Edit2, Trash2, Users, Calendar, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';
import GYM_BG from '../../images/background.png';
import { useLocation, useNavigate } from "react-router-dom";
import QuickActions from "../components/QuickActions";


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

// ─── Helpers ────────────────────────────────────────────────────────────────

// ✅ CORRIGÉ : Filtres incluant suspendu
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
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

// ✅ NOUVEAU : couleur et label selon le statut
function statusConfig(statut) {
  switch ((statut || '').toLowerCase()) {
    case 'actif':    return { label: 'Actif',    bg: '#22c55e', shadow: 'rgba(34,197,94,0.4)'  };
    case 'expiré':   return { label: 'Expiré',   bg: '#e53935', shadow: 'rgba(229,57,53,0.4)'  };
    case 'suspendu': return { label: 'Suspendu', bg: '#f97316', shadow: 'rgba(249,115,22,0.4)' };
    default:         return { label: 'Sans abo', bg: '#6b7280', shadow: 'rgba(107,114,128,0.4)' };
  }
}

// ─── Composant : MemberCard ──────────────────────────────────────────────────
function MemberCard({ member, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  // ✅ CORRIGÉ : utilise statusConfig pour afficher le bon statut et la bonne couleur
  const sc = statusConfig(member.abonnementStatut);

  const photoSrc = member.photo
    || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.nom || '') + ' ' + (member.prenom || ''))}&background=1f2330&color=e53935&size=300`;

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
      {/* Photo */}
      <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
        <img
          src={photoSrc}
          alt={member.nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=1f2330&color=e53935&size=300`; }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(14,15,17,0.9))' }} />
        {/* ✅ CORRIGÉ : badge dynamique selon le statut réel */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: '0.65rem', fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 20,
          background: sc.bg,
          color: '#fff',
          boxShadow: `0 2px 8px ${sc.shadow}`,
        }}>
          {sc.label}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {member.nom} {member.prenom}
        </div>

        {/* Badge abonnement */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: planBg(member.typeNom), borderRadius: 6, padding: '3px 10px', marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: planColor(member.typeNom) }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: planColor(member.typeNom) }}>
            {member.typeNom || 'Aucun abonnement'}
          </span>
        </div>

        {/* Email / Téléphone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
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

        <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} />
          <span>Inscrit le <strong style={{ color: C.subtle, fontWeight: 500 }}>{formatDate(member.dateCreation)}</strong></span>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(member)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, borderRadius: 8, padding: '8px 12px', fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Edit2 size={13} /> Modifier
          </button>
          <button
            onClick={() => onDelete(member.idAdherent)}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; e.currentTarget.style.color = C.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.muted; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant : EditMemberModal ─────────────────────────────────────────────
function EditMemberModal({ member, typesAbonnement, onSave, onClose }) {
  const [tab, setTab] = useState('adherent');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    idAdherent: member.idAdherent,
    nom: member.nom || '',
    prenom: member.prenom || '',
    dateNaissance: toInputDate(member.dateNaissance),
    numTelephone: member.numTelephone || '',
    email: member.email || '',
    sexe: member.sexe || 'Homme',
    photo: member.photo || '',
    idAbonnement: member.idAbonnement || null,
    type_id: member.type_id || (typesAbonnement[0]?.id ?? ''),
    dateDebut: toInputDate(member.dateDebut),
    dateFin: toInputDate(member.dateFin),
    abonnementStatut: member.abonnementStatut || 'actif',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Calcul automatique de la date de fin ──────────────────────────────────
  // Appelé quand type_id ou dateDebut change
  const computeAndSetDateFin = (dateDebut, typeId) => {
    if (!dateDebut || !typeId) return;
    const found = typesAbonnement.find(t => String(t.id) === String(typeId));
    if (!found?.duree) return;
    const d = new Date(dateDebut);
    if (isNaN(d)) return;
    d.setMonth(d.getMonth() + Number(found.duree));
    const iso = d.toISOString().split('T')[0];
    set('dateFin', iso);
  };

  const handleTypeChange = (newTypeId) => {
    set('type_id', newTypeId);
    computeAndSetDateFin(form.dateDebut, newTypeId);
  };

  const handleDateDebutChange = (newDate) => {
    set('dateDebut', newDate);
    computeAndSetDateFin(newDate, form.type_id);
  };
  // ─────────────────────────────────────────────────────────────────────────

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
    fontSize: '0.83rem', outline: 'none', width: '100%',
  };

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

              {/* Caméra */}
              {showCamera && (
                <div style={{ position: 'relative', background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                  <video ref={videoRef} autoPlay style={{ width: '100%', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <button onClick={takePhoto} style={{ background: C.green, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Capturer</button>
                    <button onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t => t.stop()); setShowCamera(false); }} style={{ background: '#555', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
                  </div>
                </div>
              )}

              {/* Champs adhérent */}
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

              {/* Type d'abonnement */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Type d'abonnement :</div>
                <select
                  style={inp}
                  value={form.type_id}
                  onChange={e => handleTypeChange(e.target.value)}
                >
                  {typesAbonnement.map(t => (
                    <option key={t.id} value={t.id}>{t.nom} — {t.prix} DA</option>
                  ))}
                </select>
              </div>

              {/* Date début */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Date début :</div>
                <input
                  style={inp}
                  type="date"
                  value={form.dateDebut}
                  onChange={e => handleDateDebutChange(e.target.value)}
                />
              </div>

              {/* Date fin — calculée automatiquement */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>Date fin :</span>
                  
                </div>
                <input
                  style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }}
                  type="date"
                  value={form.dateFin}
                  readOnly
                  title="Calculée automatiquement selon le type d'abonnement et la date de début"
                />
              </div>

              {/* Statut */}
              <div>
                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 5 }}>Statut :</div>
                <select
                  style={inp}
                  value={form.abonnementStatut}
                  onChange={e => set('abonnementStatut', e.target.value)}
                >
                  <option value="actif">Actif</option>
                  <option value="expiré">Expiré</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>

              {/* Aperçu statut actuel */}
              {form.idAbonnement && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid #3d3233' }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>Statut actuel :</span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
                    padding: '3px 10px', borderRadius: 20,
                    background: statusConfig(form.abonnementStatut).bg,
                    color: '#fff',
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
   const location = useLocation();
  const navigate = useNavigate();
  const [adherents, setAdherents]       = useState([]);
  const [typesAbo, setTypesAbo]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterIdx, setFilterIdx]       = useState(0);
  const [modal, setModal]               = useState(null);
  const [editTarget, setEditTarget]     = useState(null);
  const [toast, setToast]               = useState({ msg: '', error: false });

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: '', error: false }), 2800);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, types] = await Promise.all([
        window.api.getAdherentsAvecAbonnement(), // ✅ auto-expire + récupère tous les statuts
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
      // Nettoie l'URL sans recharger la page
      navigate("/adherents", { replace: true });
    }
  }, [location.search]);

  const handleClose = () => { setModal(null); setEditTarget(null); };
  const handleEdit  = (m) => { setEditTarget(m); setModal('edit'); };

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

      // ✅ CORRIGÉ : mise à jour abonnement même si on change juste le statut
      if (form.idAbonnement) {
        // Abonnement existant → on met toujours à jour (statut, type, dates)
        await window.api.updateAbonnement({
          idAbonnement: form.idAbonnement,
          type_id:      parseInt(form.type_id),
          dateDebut:    form.dateDebut,
          dateFin:      form.dateFin,
          statut:       form.abonnementStatut,
        });
      } else if (form.dateDebut && form.dateFin && form.type_id) {
        // Pas d'abonnement existant → on en crée un seulement si les dates sont remplies
        await window.api.addAbonnement({
          adherent_id: form.idAdherent,
          type_id:     parseInt(form.type_id),
          dateDebut:   form.dateDebut,
          dateFin:     form.dateFin,
          statut:      form.abonnementStatut,
        });
      }

      showToast('Adhérent modifié avec succès');
      handleClose();
      setFilterIdx(0); // ✅ revenir sur "Tous" pour voir l'adhérent avec son nouveau statut
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la modification', true);
      throw err;
    }
  };

  // ── Ajouter un adhérent ───────────────────────────────────────────────────
  const handleSaveAdd = async (data) => {
    try {
      const result = await window.api.addAdherent({
        nom:           data.nom,
        prenom:        data.prenom,
        dateNaissance: data.dateNaissance || null,
        numTelephone:  data.numTelephone,
        email:         data.email || null,
        sexe:          data.sexe,
      });

      const newId = result.insertId;

      if (data.photo && newId) {
        await window.api.updateAdherentPhoto({ idAdherent: newId, photo: data.photo });
      }

      let aboId = null;
      if (data.type_id && data.dateDebut && newId) {
        const aboResult = await window.api.addAbonnement({
          adherent_id: newId,
          type_id:     parseInt(data.type_id),
          dateDebut:   data.dateDebut,
          dateFin:     data.dateFin || null,
          statut:      'actif',
        });
        aboId = aboResult?.insertId ?? null;
      }

      if (aboId && data.montant && data.montant > 0) {
        await window.api.addPaiement({
          abonnement_id: aboId,
          montant:       data.montant,
          datePaiement:  data.dateDebut,
          modePaiement:  data.modePaiement || 'cash',
        });
      }

      showToast('Adhérent ajouté avec succès');
      handleClose();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'ajout", true);
      throw err;
    }
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

    // ✅ CORRIGÉ : comparaison insensible à la casse + gère NULL (Sans abo)
    const statut = (a.abonnementStatut || '').toLowerCase();
    const matchFilter =
      filterIdx === 0 ||
      statut === FILTERS[filterIdx];

    return matchSearch && matchFilter;
  });

  // ✅ CORRIGÉ : compteurs basés sur le vrai statut
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

            {/* ✅ CORRIGÉ : 4 compteurs avec les bons statuts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
              {[
                { count: adherents.length, label: 'au total',   color: C.muted   },
                { count: actif,            label: 'actifs',     color: C.green   },
                { count: expire,           label: 'expirés',    color: C.accent  },
                { count: suspendu,         label: 'suspendus',  color: C.orange  },
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

        {/* ✅ CORRIGÉ : 4 boutons de filtre */}
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
              <MemberCard key={m.idAdherent} member={m} onEdit={handleEdit} onDelete={handleDelete} />
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

      <Toast message={toast.msg} error={toast.error} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}