import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart2, Users, CreditCard, DollarSign,
  Calendar, Package, User, Settings, LogOut,
  ChevronRight, ChevronDown, TrendingUp, History
} from 'lucide-react';

const C = {
  sidebar: '#13151a', border: '#252833',
  accent: '#e53935', text: '#f0f0f0', muted: '#6b7280',
};

const MENU = [
{ name: 'Statistiques', icon: BarChart2, path: '/statistiques/adherents', permKey: 'statistiques', matchPrefix: '/statistiques' },  { name: 'Adhérents',   icon: Users,      path: '/adherents',   permKey: 'adherents'   },
  { name: 'Abonnements', icon: CreditCard, path: '/abonnements', permKey: 'abonnements' },
  { name: 'Paiements',   icon: DollarSign, path: '/paiements',   permKey: 'paiements'   },
  { name: 'Planning',    icon: Calendar,   path: '/planning',    permKey: 'planning'    },
  { name: 'Recette',     icon: TrendingUp, path: '/recette',     permKey: 'recette'     },
  {
    name: 'Magasin', icon: Package, permKey: 'magasin',
    children: [
      { name: 'Inventaire',    path: '/magasin'               },
      { name: 'Transactions',  path: '/magasin/transactions'  },
            { name: 'Fidelite',  path: '/magasin/fideliteadherents'  },
      

    ]
  },
  { name: 'Utilisateur', icon: User,     path: '/utilisateurs', permKey: 'utilisateur' },
  { name: 'Paramètres',  icon: Settings, path: '/parametres',   permKey: 'parametres'  },
];

export default function Sidebar() {
  const [rolePerms, setRolePerms] = useState({});
  const navigate  = useNavigate();
  const location  = useLocation();

  // Chaque groupe avec sous-menu a son propre état open
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    if (location.pathname.startsWith('/statistiques')) initial['Statistiques'] = true;
    if (location.pathname.startsWith('/magasin'))      initial['Magasin']      = true;
    return initial;
  });

  const toggleGroup = (name) =>
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role_id = user.role_id;
    if (!role_id) return;
    window.electron.invoke('getPermissions', role_id)
      .then(perms => setRolePerms(perms))
      .catch(err => console.error('Erreur permissions sidebar', err));
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const canAccess = (permKey) => {
    if (!permKey) return true;
    if (user.role_id === 1) return true;
    return (rolePerms[permKey] || 'autorise') !== 'interdit';
  };

  const isActive = (path) => location.pathname === path;

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

  const hoverOn  = (e, active) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; } };
  const hoverOff = (e, active) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } };

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
{MENU.map(({ name, icon: Icon, path, children, permKey, matchPrefix }) => {
          if (!canAccess(permKey)) return null;

          /* ── Item avec sous-menu ── */
          if (children) {
            const groupOpen   = !!openGroups[name];
            const groupActive = children.some(c => location.pathname === c.path);

            return (
              <div key={name}>
                <button
                  onClick={() => toggleGroup(name)}
                  style={{ ...btnStyle(groupActive && !groupOpen), justifyContent: 'flex-start' }}
                  onMouseEnter={e => hoverOn(e,  groupActive && !groupOpen)}
                  onMouseLeave={e => hoverOff(e, groupActive && !groupOpen)}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{name}</span>
                  {groupOpen
                    ? <ChevronDown  size={14} style={{ opacity: 0.6 }} />
                    : <ChevronRight size={14} style={{ opacity: 0.6 }} />}
                </button>

                {groupOpen && (
                  <div style={{ marginLeft: 16, marginBottom: 4, borderLeft: `2px solid ${C.border}`, paddingLeft: 10 }}>
                    {children.map(({ name: cName, path: cPath }) => {
                      const childActive = isActive(cPath);
                      return (
                        <button
                          key={cName}
                          onClick={() => navigate(cPath)}
                          style={{ ...btnStyle(childActive), fontSize: '0.82rem', padding: '8px 10px' }}
                          onMouseEnter={e => hoverOn(e,  childActive)}
                          onMouseLeave={e => hoverOff(e, childActive)}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: childActive ? '#fff' : C.muted, flexShrink: 0 }} />
                          {cName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          /* ── Item régulier ── */
const active = matchPrefix 
  ? location.pathname.startsWith(matchPrefix) 
  : isActive(path);          return (
            <button key={name} onClick={() => navigate(path)} style={btnStyle(active)}
              onMouseEnter={e => hoverOn(e,  active)}
              onMouseLeave={e => hoverOff(e, active)}
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
          onClick={() => { localStorage.removeItem('user'); navigate('/connexion'); }}
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