import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart2, Users, CreditCard, DollarSign,
  Calendar, Package, User, Settings, LogOut,
  ChevronRight, ChevronDown, TrendingUp
} from 'lucide-react';

const C = {
  sidebar: '#13151a', border: '#252833',
  accent: '#e53935', text: '#f0f0f0', muted: '#6b7280',
};

const MENU = [
  {
    name: 'Statistiques', icon: BarChart2, permKey: 'statistiques',
    children: [
      { name: 'Adhérents',   path: '/statistiques/adherents'   },
      { name: 'Abonnements', path: '/statistiques/abonnements' },
      { name: 'Revenue',     path: '/statistiques/revenue'     },
    ]
  },
  { name: 'Adhérents',   icon: Users,      path: '/adherents',    permKey: 'adherents'   },
  { name: 'Abonnements', icon: CreditCard, path: '/abonnements',  permKey: 'abonnements' },
  { name: 'Paiements',   icon: DollarSign, path: '/paiements',    permKey: 'paiements'   },
  { name: 'Planning',    icon: Calendar,   path: '/planning',     permKey: 'planning'    },
  { name: 'Recette',     icon: TrendingUp, path: '/recette',      permKey: 'recette'     },
  { name: 'Magasin',     icon: Package,    path: '/magasin',      permKey: 'magasin'     },
  { name: 'Utilisateur', icon: User,       path: '/utilisateurs', permKey: 'utilisateur' },
  { name: 'Paramètres',  icon: Settings,   path: '/parametres', permKey: 'parametres' },];

export default function Sidebar() {
  const [rolePerms, setRolePerms] = useState({});

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role_id = user.role_id;
  if (!role_id) return;

  window.electron.invoke("getPermissions", role_id)
    .then(perms => setRolePerms(perms))
    .catch(err => console.error("Erreur permissions sidebar", err));
}, []);

const user = JSON.parse(localStorage.getItem("user") || "{}");

const canAccess = (permKey) => {
  if (!permKey) return true;
  // Admin (role_id = 1) a toujours accès à tout
  if (user.role_id === 1) return true;
  return (rolePerms[permKey] || "autorise") !== "interdit";
};
  const navigate  = useNavigate();
  const location  = useLocation();
  const [statsOpen, setStatsOpen] = useState(location.pathname.startsWith('/statistiques'));


  const isActive    = (path) => location.pathname === path;
  const isStatActive = location.pathname.startsWith('/statistiques');

  const btnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: 'none', cursor: 'pointer', marginBottom: 2,
    background: active ? C.accent : 'transparent',
    color: active ? '#fff' : C.muted,
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.875rem', fontWeight: active ? 600 : 400,
    boxShadow: active ? '0 4px 14px rgba(229,57,53,0.3)' : 'none',
    transition: 'all 0.18s', textAlign: 'left',
  });

  return (
    <aside style={{
      width: 230, minWidth: 230, height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: C.sidebar, borderRight: `1px solid ${C.border}`,
      fontFamily: "'Barlow', sans-serif",
      position: 'sticky', top: 0, zIndex: 20,
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
        {MENU.map(({ name, icon: Icon, path, children, permKey }) => {

          /* ── Item avec sous-menu (Statistiques) ── */
          if (children) {
            // ✅ Cacher si interdit
            if (!canAccess(permKey)) return null;
            return (
              <div key={name}>
                <button
                  onClick={() => setStatsOpen(o => !o)}
                  style={{ ...btnStyle(isStatActive && !statsOpen), justifyContent: 'flex-start' }}
                  onMouseEnter={e => { if (!isStatActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; } }}
                  onMouseLeave={e => { if (!isStatActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{name}</span>
                  {statsOpen ? <ChevronDown size={14} style={{ opacity: 0.6 }} /> : <ChevronRight size={14} style={{ opacity: 0.6 }} />}
                </button>
                {statsOpen && (
                  <div style={{ marginLeft: 16, marginBottom: 4, borderLeft: `2px solid ${C.border}`, paddingLeft: 10 }}>
                    {children.map(({ name: cName, path: cPath }) => (
                      <button key={cName} onClick={() => navigate(cPath)}
                        style={{ ...btnStyle(isActive(cPath)), fontSize: '0.82rem', padding: '8px 10px' }}
                        onMouseEnter={e => { if (!isActive(cPath)) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; } }}
                        onMouseLeave={e => { if (!isActive(cPath)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive(cPath) ? '#fff' : C.muted, flexShrink: 0 }} />
                        {cName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* ── Item régulier ── */
          // ✅ Cacher si interdit
          if (!canAccess(permKey)) return null;

          const active = isActive(path);
          return (
            <button key={name} onClick={() => navigate(path)} style={btnStyle(active)}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{name}</span>
              {active && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => { localStorage.removeItem("user"); navigate('/connexion'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'transparent', color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', transition: 'all 0.18s' }}
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