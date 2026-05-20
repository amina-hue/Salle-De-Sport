import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import gym from "../../images/gym.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await window.api.login({
        email: email.trim(),
        motDePasse: password.trim(),
      });
      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.user));
        navigate("/statistiques");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Erreur de connexion à la base de données.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      )}
    </svg>
  );

  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );

  const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );

  const inp = (extra = {}) => ({
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '11px 12px 11px 36px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'inherit',
    ...extra,
  });

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a0a0a',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: 'flex', width: '920px', height: '560px',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.75)',
      }}>

        {/* ── LEFT : formulaire ── */}
        <div style={{
          width: '46%', flexShrink: 0,
          background: 'linear-gradient(160deg, #2a0a0a 0%, #5a1515 100%)',
          padding: '44px 38px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          color: '#fff',
        }}>
          {/* Logo / titre */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 5px', letterSpacing: 0.5 }}>
              FitManager
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Connectez-vous pour gérer votre salle de sport
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: 'rgba(229,57,53,0.18)',
              border: '1px solid rgba(229,57,53,0.4)',
              borderRadius: 8, padding: '9px 13px',
              marginBottom: 16, fontSize: '0.8rem', color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 7, fontWeight: 600 }}>
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={inp()}
                onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.65)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 7, fontWeight: 600 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                <LockIcon />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={inp({ paddingRight: 42 })}
                onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.65)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', padding: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* Bouton connexion */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, border: 'none',
              background: loading ? '#7f1d1d' : '#c0392b',
              color: '#fff', fontSize: '0.93rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 18px rgba(192,57,43,0.5)',
              marginBottom: 18,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#a93226'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c0392b'; }}
          >
            {loading ? 'Connexion...' : 'Se Connecter'}
          </button>

          <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0 }}>
            Besoin d'aide ?{' '}
            <span
              style={{ color: '#e57373', cursor: 'pointer' }}
              onClick={() => window.open('mailto:amina.albane@se.univ-bejaia.dz?subject=Support FitManager&body=Bonjour,%0A%0AJ\'ai besoin d\'aide concernant :')}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Contactez le support.
            </span>
          </p>
        </div>

        {/* ── RIGHT : image ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={gym}
            alt="gym"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,20,20,0.52)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '38px 32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>
              Gérez votre salle de<br />sport efficacement
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', margin: '0 0 22px', lineHeight: 1.6 }}>
              Suivez vos adhérents, gérez les abonnements,<br />
              optimisez vos séances et boostez votre rentabilité.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { value: '500+', label: 'Adhérents actifs' },
                { value: '95%',  label: 'Taux de satisfaction' },
              ].map(({ value, label }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10, padding: '13px 18px', flex: 1,
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.68)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}