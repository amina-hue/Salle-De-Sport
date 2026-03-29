import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import gym from "../../images/gym.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await window.electron.invoke("login", {
        email:      email.trim(),
        motDePasse: password.trim(),
      });

      if (result.success) {
        // Stocker l'utilisateur connecté
        localStorage.setItem("user", JSON.stringify(result.user));
        navigate("/adherents");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erreur de connexion à la base de données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a0a0a',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: 'flex', width: '780px', height: '480px',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      }}>

        {/* LEFT */}
        <div style={{
          width: '46%', flexShrink: 0,
          background: 'linear-gradient(160deg, #2a0a0a 0%, #5a1515 100%)',
          padding: '36px 32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          color: '#fff',
        }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: 0.5 }}>FitManager</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
            Connectez-vous pour gérer votre salle de sport
          </p>

          {error && (
            <div style={{
              background: 'rgba(229,57,53,0.18)',
              border: '1px solid rgba(229,57,53,0.4)',
              borderRadius: 7, padding: '8px 12px',
              marginBottom: 14, fontSize: '0.78rem', color: '#f87171'
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>✉</span>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '10px 12px 10px 32px',
                  color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '10px 12px 10px 32px',
                  color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(229,57,53,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: '0.74rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#e53935' }} /> Se souvenir de moi
            </label>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Mot de passe oublié ?</span>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: loading ? '#7f1d1d' : '#c0392b',
              color: '#fff', fontSize: '0.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(192,57,43,0.5)',
              marginBottom: 16,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#a93226'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c0392b'; }}
          >
            {loading ? 'Connexion...' : 'Se Connecter'}
          </button>

          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
            Besoin d'aide ? <span style={{ color: '#e57373', cursor: 'pointer' }}>Contactez le support.</span>
          </p>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img src={gym} alt="gym" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,20,20,0.55)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 28px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.25 }}>
              Gérez votre salle de<br />sport efficacement
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Suivez vos adhérents, gérez les abonnements,<br />optimisez vos séances et boostez votre rentabilité.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { value: '500+', label: 'Adhérents actifs',     icon: '💪' },
                { value: '95%',  label: 'Taux de satisfaction', icon: '📊' },
              ].map(({ value, label, icon }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10, padding: '12px 16px', flex: 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{value}</span>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}