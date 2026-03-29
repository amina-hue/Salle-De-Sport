import React, { useState, useEffect } from 'react';
import {
  Users, CreditCard, Calendar, DollarSign,
  Settings, LogOut, Package, User, BarChart2,
  Search, Plus, Filter, Mail, Phone, Edit2, Trash2, ChevronRight
} from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';

/* ── Font injection ── */
const injectFonts = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700;800&display=swap';
  document.head.appendChild(link);
  return link;
};

/* ── Colors ── */
const C = {
  bg: '#0e0f11', sidebar: '#13151a', card: '#1a1d24',
  cardHover: '#1f2330', border: '#252833', borderHover: '#e53935',
  accent: '#e53935', accentDim: 'rgba(229,57,53,0.12)',
  accentBorder: 'rgba(229,57,53,0.3)',
  text: '#f0f0f0', muted: '#6b7280', subtle: '#9ca3af',
  green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  gold: '#f59e0b', blue: '#3b82f6',
  overlay: 'rgba(14,15,17,0.88)',
};

/* ── GYM BG — same as other modals ── */
const GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=80';

/* ── Data ── */
const INITIAL_DATA = [
  { id:1,  nom:'Hamani Salima',       email:'hamani.salima@email.com',   phone:'06 12 34 56 78', plan:'Premium Annuel',    status:'Actif',  inscrit:'21 Jan 2025', photo:'https://randomuser.me/api/portraits/women/44.jpg', sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-01-21', dateFin:'2026-01-21' },
  { id:2,  nom:'Saadi Fares',         email:'Saadi.F@email.com',         phone:'06 23 45 67 89', plan:'Standard Mensuel',  status:'Expiré', inscrit:'04 Fév 2025', photo:'https://randomuser.me/api/portraits/men/32.jpg',    sexe:'Homme', dateNaissance:'', prix:'1200 DA', dateDebut:'2025-02-04', dateFin:'2025-03-04' },
  { id:3,  nom:'Zahra Dib',           email:'Zahra.dib@email.com',       phone:'06 34 95 78 00', plan:'Premium Annuel',    status:'Actif',  inscrit:'10 Jan 2025', photo:'https://randomuser.me/api/portraits/women/65.jpg',  sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-01-10', dateFin:'2026-01-10' },
  { id:4,  nom:'Mohand Kettou',       email:'Kettou.f@email.com',        phone:'06 87 07 80 01', plan:'Basic Trimestriel', status:'Expiré', inscrit:'10 Oct 2024', photo:'https://randomuser.me/api/portraits/men/45.jpg',    sexe:'Homme', dateNaissance:'', prix:'2000 DA', dateDebut:'2024-10-10', dateFin:'2025-01-10' },
  { id:5,  nom:'Amina Mokrane',       email:'Amina.mokrane@email.com',   phone:'06 12 78 90 12', plan:'Premium Annuel',    status:'Actif',  inscrit:'01 Avr 2025', photo:'https://randomuser.me/api/portraits/women/31.jpg',  sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-04-01', dateFin:'2026-04-01' },
  { id:6,  nom:'Omar Rahmoune',       email:'Omar.Off@email.com',        phone:'06 87 09 01 23', plan:'Standard Mensuel',  status:'Actif',  inscrit:'20 Jan 2025', photo:'https://randomuser.me/api/portraits/men/67.jpg',    sexe:'Homme', dateNaissance:'', prix:'1200 DA', dateDebut:'2025-01-20', dateFin:'2025-02-20' },
  { id:7,  nom:'Camilia Berkani',     email:'camilia.berkani@email.com', phone:'06 78 90 12 34', plan:'Premium Annuel',    status:'Actif',  inscrit:'01 Fév 2025', photo:'https://randomuser.me/api/portraits/women/72.jpg',  sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-02-01', dateFin:'2026-02-01' },
  { id:8,  nom:'Mohammed Ali',        email:'mohammed.ali@email.com',    phone:'06 89 21 29 45', plan:'Standard Mensuel',  status:'Expiré', inscrit:'13 Nov 2024', photo:'https://randomuser.me/api/portraits/men/22.jpg',    sexe:'Homme', dateNaissance:'', prix:'1200 DA', dateDebut:'2024-11-13', dateFin:'2024-12-13' },
  { id:9,  nom:'Karima Zerrouki',     email:'karima.zerrouki@email.com', phone:'06 12 34 56 78', plan:'Premium Annuel',    status:'Actif',  inscrit:'21 Jun 2025', photo:'https://randomuser.me/api/portraits/women/17.jpg',  sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-06-21', dateFin:'2026-06-21' },
  { id:10, nom:'Lehiou Oudjane',      email:'Lehiou.Dj@email.com',       phone:'06 23 45 67 89', plan:'Standard Mensuel',  status:'Actif',  inscrit:'03 Avr 2025', photo:'https://randomuser.me/api/portraits/men/88.jpg',    sexe:'Homme', dateNaissance:'', prix:'1200 DA', dateDebut:'2025-04-03', dateFin:'2025-05-03' },
  { id:11, nom:'Sonia Kernou',        email:'Sonia.kernou@email.com',    phone:'06 34 56 78 90', plan:'Premium Annuel',    status:'Actif',  inscrit:'12 Jun 2025', photo:'https://randomuser.me/api/portraits/women/55.jpg',  sexe:'Femme', dateNaissance:'', prix:'3500 DA', dateDebut:'2025-06-12', dateFin:'2026-06-12' },
  { id:12, nom:'Abd Alhalim Meziane', email:'abmeziane@email.com',       phone:'06 45 67 80 01', plan:'Basic Trimestriel', status:'Expiré', inscrit:'10 Oct 2024', photo:'https://randomuser.me/api/portraits/men/11.jpg',    sexe:'Homme', dateNaissance:'', prix:'2000 DA', dateDebut:'2024-10-10', dateFin:'2025-01-10' },
];

const MENU = [
  { name: 'Statistiques', icon: BarChart2 },
  { name: 'Adhérents',    icon: Users },
  { name: 'Abonnements',  icon: CreditCard },
  { name: 'Paiements',    icon: DollarSign },
  { name: 'Planning',     icon: Calendar },
  { name: 'Recette',      icon: DollarSign },
  { name: 'Magasin',      icon: Package },
  { name: 'Utilisateur',  icon: User },
  { name: 'Paramètres',   icon: Settings },
];

const FILTERS = ['Tous', 'Actif', 'Expiré'];

function planColor(plan) {
  if (plan.toLowerCase().includes('premium'))  return C.gold;
  if (plan.toLowerCase().includes('standard')) return C.blue;
  return C.muted;
}
function planBg(plan) {
  if (plan.toLowerCase().includes('premium'))  return 'rgba(245,158,11,0.1)';
  if (plan.toLowerCase().includes('standard')) return 'rgba(59,130,246,0.1)';
  return 'rgba(107,114,128,0.1)';
}

/* ════════════════════════════════
   SIDEBAR
════════════════════════════════ */
function Sidebar({ active, setActive }) {
  return (
    <aside style={{
      width: 230, minWidth: 230, height: '100vh', display: 'flex',
      flexDirection: 'column', background: C.sidebar,
      borderRight: `1px solid ${C.border}`, padding: '0',
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: C.accent, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(229,57,53,0.4)' }}>
            💪
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.1rem', letterSpacing: 0.5, color: C.text }}>FitManager</div>
            <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 1 }}>Pro Gym System</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {MENU.map(({ name, icon: Icon }) => {
          const isActive = active === name;
          return (
            <button key={name} onClick={() => setActive(name)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: isActive ? C.accent : 'transparent',
              color: isActive ? '#fff' : C.muted,
              fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
              marginBottom: 2, transition: 'all 0.18s',
              boxShadow: isActive ? '0 4px 14px rgba(229,57,53,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
            >
              <Icon size={16} />
              <span>{name}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.border}` }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
          background: 'transparent', color: C.muted,
          fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem',
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.08)'; e.currentTarget.style.color = C.accent; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

/* ════════════════════════════════
   MEMBER CARD
════════════════════════════════ */
function MemberCard({ member, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isActif = member.status === 'Actif';

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
        cursor: 'default',
      }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
        <img
          src={member.photo} alt={member.nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=1f2330&color=e53935&size=300`; }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(14,15,17,0.9))' }} />
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: '0.65rem', fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 20,
          background: isActif ? C.green : C.accent, color: '#fff',
          boxShadow: isActif ? '0 2px 8px rgba(34,197,94,0.4)' : '0 2px 8px rgba(229,57,53,0.4)',
        }}>
          {member.status}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Name */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {member.nom}
        </div>

        {/* Plan badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: planBg(member.plan), borderRadius: 6, padding: '3px 10px', marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: planColor(member.plan) }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: planColor(member.plan) }}>{member.plan}</span>
        </div>

        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={11} color={C.muted} />
            </div>
            <span style={{ fontSize: '0.75rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={11} color={C.muted} />
            </div>
            <span style={{ fontSize: '0.75rem', color: C.muted }}>{member.phone}</span>
          </div>
        </div>

        {/* Inscrit */}
        <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} />
          <span>Inscrit le <strong style={{ color: C.subtle, fontWeight: 500 }}>{member.inscrit}</strong></span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(member)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              color: C.accent, borderRadius: 8, padding: '8px 12px',
              fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; }}
          >
            <Edit2 size={13} /> Modifier
          </button>
          <button
            onClick={() => onDelete(member.id)}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
              color: C.muted, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = C.accentBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   EDIT MODAL (inline, unchanged style)
════════════════════════════════ */
function EditMemberModal({ member, onSave, onClose }) {
  const [tab, setTab] = useState('abonnement');
  const [form, setForm] = useState({ ...member });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { background: '#312829', border: '1px solid #3d3233', borderRadius: 6, padding: '7px 10px', color: C.text, fontFamily: 'inherit', fontSize: '0.83rem', outline: 'none', width: '100%' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1a1516', border: '1px solid #3d3233', borderRadius: 14, width: 700, maxWidth: '96vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', fontFamily: "'Barlow', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#231e1f', borderBottom: '1px solid #3d3233', padding: '0 16px' }}>
          <div style={{ display: 'flex' }}>
            {[{ key: 'abonnement', label: 'Abonnement' }, { key: 'adherent', label: 'Adhérent' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? C.accent : 'transparent', border: 'none', color: tab === t.key ? '#fff' : C.muted, padding: '11px 20px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', borderRadius: tab === t.key ? '6px 6px 0 0' : 0 }}>{t.label}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '1.1rem', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: C.text, marginBottom: 18 }}>
            {tab === 'abonnement' ? "Abonnement de l'adhérent" : "Information de l'adhérent"}
          </h2>
          {tab === 'abonnement' ? (
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: '0 0 210px' }}>
                {[
                  { label: "Type d'abonnement :", key: 'plan', type: 'select', opts: ['Premium Annuel', 'Standard Mensuel', 'Basic Trimestriel'] },
                  { label: 'Prix :', key: 'prix', type: 'text', ph: 'ex: 3500 DA' },
                  { label: 'Date Debut :', key: 'dateDebut', type: 'date' },
                  { label: 'Date Fin :', key: 'dateFin', type: 'date' },
                  { label: 'Statut :', key: 'status', type: 'select', opts: ['Actif', 'Expiré'] },
                ].map(({ label, key, type, ph, opts }) => (
                  <div key={key} style={{ marginBottom: 11 }}>
                    <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    {type === 'select'
                      ? <select style={inp} value={form[key] || ''} onChange={e => set(key, e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select>
                      : <input style={inp} type={type} placeholder={ph || ''} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
                    }
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                { label: 'Nom Complet :', key: 'nom', type: 'text' },
                { label: 'Date de naissance :', key: 'dateNaissance', type: 'date' },
                { label: 'Numéro de téléphone :', key: 'phone', type: 'text' },
                { label: 'E-Mail :', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.78rem', color: C.muted, minWidth: 165, fontWeight: 600 }}>{label}</span>
                  <input style={inp} type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 22px', borderTop: '1px solid #3d3233', background: '#231e1f' }}>
          <button onClick={() => { if (!form.nom?.trim()) { alert('Le nom est requis.'); return; } onSave(form); }} style={{ background: C.accent, border: 'none', borderRadius: 7, padding: '9px 24px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Sauvegarder</button>
          <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 20px', color: C.muted, fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ── */
function Toast({ message }) {
  return message ? (
    <div style={{ position: 'fixed', bottom: 28, right: 32, background: C.green, color: '#fff', borderRadius: 10, padding: '13px 22px', fontWeight: 600, fontSize: '0.875rem', zIndex: 1100, boxShadow: '0 6px 24px rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}>
      ✓ {message}
    </div>
  ) : null;
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function Adherent() {
  const [adherents, setAdherents] = useState(INITIAL_DATA);
  const [search, setSearch]       = useState('');
  const [filterIdx, setFilterIdx] = useState(0);
  const [modal, setModal]         = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast]         = useState('');
  const [sidebarActive, setSidebarActive] = useState('Adhérents');

  useEffect(() => {
    const link = injectFonts();
    return () => { try { document.head.removeChild(link); } catch(e) {} };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const filtered = adherents.filter(a => {
    const q = search.toLowerCase();
    return (a.nom.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      && (FILTERS[filterIdx] === 'Tous' || a.status === FILTERS[filterIdx]);
  });

  const handleClose    = () => { setModal(null); setEditTarget(null); };
  const handleEdit     = (m) => { setEditTarget(m); setModal('edit'); };
  const handleSaveEdit = (form) => { setAdherents(list => list.map(a => a.id === editTarget.id ? { ...a, ...form } : a)); showToast('Adhérent modifié avec succès'); handleClose(); };
  const handleSaveAdd  = (m) => { setAdherents(list => [...list, m]); showToast('Adhérent ajouté avec succès'); handleClose(); };
  const handleDelete   = (id) => { if (!window.confirm('Confirmer la suppression ?')) return; setAdherents(list => list.filter(a => a.id !== id)); showToast('Adhérent supprimé'); };

  const actif  = adherents.filter(a => a.status === 'Actif').length;
  const expire = adherents.filter(a => a.status === 'Expiré').length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Barlow', sans-serif", background: C.bg, color: C.text }}>

      {/* ── Sidebar ── */}
      <Sidebar active={sidebarActive} setActive={setSidebarActive} />

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Hero header with gym BG */}
        <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {/* Gym image */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${GYM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(14,15,17,0.92) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.08) 100%)' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

          <div style={{ position: 'relative', padding: '32px 36px 36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
                <ChevronRight size={12} color={C.muted} />
                <span style={{ fontSize: '0.72rem', color: C.accent, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Adhérents</span>
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: 'uppercase' }}>
                Gestion des adhérents
              </h1>

              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b7280' }} />
                  <span style={{ fontSize: '0.82rem', color: C.muted }}><strong style={{ color: C.text }}>{adherents.length}</strong> adhérents au total</span>
                </div>
                <div style={{ width: 1, height: 14, background: C.border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
                  <span style={{ fontSize: '0.82rem', color: C.muted }}><strong style={{ color: C.green }}>{actif}</strong> actifs</span>
                </div>
                <div style={{ width: 1, height: 14, background: C.border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent }} />
                  <span style={{ fontSize: '0.82rem', color: C.muted }}><strong style={{ color: C.accent }}>{expire}</strong> expirés</span>
                </div>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={() => setModal('add')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(229,57,53,0.4)', transition: 'all 0.2s', letterSpacing: 0.3 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(229,57,53,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(229,57,53,0.4)'; }}
            >
              <Plus size={17} />
              Ajouter un adhérent
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, padding: '16px 36px', background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
            <Search size={15} color={C.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px 10px 38px', color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = C.accentBorder}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden' }}>
            {FILTERS.map((f, i) => (
              <button key={f} onClick={() => setFilterIdx(i)} style={{
                padding: '9px 18px', border: 'none', cursor: 'pointer',
                background: filterIdx === i ? C.accent : 'transparent',
                color: filterIdx === i ? '#fff' : C.muted,
                fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', fontWeight: filterIdx === i ? 700 : 400,
                transition: 'all 0.15s',
                borderRight: i < FILTERS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', fontSize: '0.8rem', color: C.muted }}>
            <Filter size={13} style={{ marginRight: 6 }} />
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Cards grid — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 36px 40px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
              <Users size={40} color={C.border} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: '1rem' }}>Aucun adhérent trouvé.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
              {filtered.map(m => <MemberCard key={m.id} member={m} onEdit={handleEdit} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modal === 'edit' && editTarget && <EditMemberModal member={editTarget} onSave={handleSaveEdit} onClose={handleClose} />}
      {modal === 'add' && <AddMemberModal onSave={handleSaveAdd} onClose={handleClose} />}
      <Toast message={toast} />
    </div>
  );
}