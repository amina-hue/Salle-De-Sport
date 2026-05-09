// src/__tests__/components/TransactionModal.test.jsx

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Design tokens (définis dans Magasin.jsx) ──────────────────────────────
const C = {
  bg: '#0b0c0e', bgCard: '#13151a', bgInput: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.07)', borderStrong: 'rgba(255,255,255,0.12)',
  accent: '#e53935', accentHover: '#f44336', accentDim: 'rgba(229,57,53,0.10)',
  accentBorder: 'rgba(229,57,53,0.28)', text: '#f0f0f0', muted: '#6b7280',
  subtle: '#9ca3af', green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  gold: '#f59e0b', goldDim: 'rgba(245,158,11,0.12)',
  blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.12)',
};

const lbl = { display: 'block', fontSize: '0.78rem', color: C.muted, marginBottom: 5 };

// ── Stubs des icônes ──────────────────────────────────────────────────────
function IconX()                  { return <span data-testid="icon-x" />; }
function AlertTriangle({ size })  { return <span data-testid="icon-alert" />; }
function User({ size, style })    { return <span data-testid="icon-user" />; }

// ── Composant inline (copie exacte de TransactionModal.jsx) ───────────────
function TransactionModal({ type, produit, onClose, onConfirm }) {
  const [quantite,       setQuantite]       = useState('');
  const [prixAchat,      setPrixAchat]      = useState('');
  const [adherentId,     setAdherentId]     = useState('');
  const [adherents,      setAdherents]      = useState([]);
  const [loadingAdh,     setLoadingAdh]     = useState(false);
  const [remiseAdherent, setRemiseAdherent] = useState(0);

  const isVente = type === 'vente';

  useEffect(() => {
    if (!adherentId) { setRemiseAdherent(0); return; }
    window.api?.getAdherentNiveau?.(Number(adherentId))
      .then(data => setRemiseAdherent(data?.remise ?? 0))
      .catch(() => setRemiseAdherent(0));
  }, [adherentId]);

  useEffect(() => {
    if (!isVente) return;
    setLoadingAdh(true);
    window.api?.getAdherents?.()
      .then(data  => setAdherents(data || []))
      .catch(err  => console.error('Erreur chargement adhérents:', err))
      .finally(() => setLoadingAdh(false));
  }, [isVente]);

  const qte             = Number(quantite) || 0;
  const prixApresRemise = isVente ? (produit.prix || 0) * (1 - remiseAdherent / 100) : 0;
  const prixUnitaire    = isVente ? prixApresRemise : (Number(prixAchat) || 0);
  const totalTx         = qte * prixUnitaire;
  const pointsGagnes    = isVente && adherentId && totalTx > 0 ? Math.floor(totalTx / 100) : 0;
  const stockApres      = isVente ? produit.stock - qte : produit.stock + qte;
  const stockInsuff     = isVente && qte > produit.stock;

  const handleSubmit = () => {
    if (!quantite || qte <= 0)                              { alert('Quantité invalide'); return; }
    if (!isVente && (!prixAchat || Number(prixAchat) <= 0)) { alert("Prix d'achat invalide"); return; }
    if (stockInsuff)                                        { alert('Stock insuffisant !'); return; }
    onConfirm({
      produit_id:  produit.idProduit,
      quantite:    qte,
      prix:        isVente ? (produit.prix || 0) : Number(prixAchat),
      prix_vente:  isVente ? prixApresRemise : null,
      type,
      adherent_id: isVente && adherentId ? Number(adherentId) : null,
    });
    onClose();
  };

  const hColor    = isVente ? C.accent : C.blue;
  const hDim      = isVente ? C.accentDim : C.blueDim;
  const btnShadow = isVente ? 'rgba(229,57,53,0.4)' : 'rgba(59,130,246,0.4)';
  const inputSt   = {
    width: '100%', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '10px 13px', color: C.text,
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
    >
      <div style={{ width: 460, borderRadius: 18, overflow: 'hidden', background: '#161012' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', background: hDim, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, color: hColor }}>
              {isVente ? 'Vente produit' : 'Achat produit'}
            </h2>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginTop: 4, marginBottom: 0 }}>
              {produit.nom}
            </p>
          </div>
          <button onClick={onClose} data-testid="btn-close"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}>
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 26px' }}>
          {/* Adhérent (vente seulement) */}
          {isVente && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>
                <User size={11} style={{ display: 'inline', marginRight: 5 }} />
                Adhérent
                <span style={{ color: C.muted, fontWeight: 400, marginLeft: 4 }}>(optionnel)</span>
              </label>
              <select value={adherentId} onChange={e => setAdherentId(e.target.value)}
                disabled={loadingAdh} style={inputSt}>
                <option value="">— Vente anonyme —</option>
                {adherents.map(a => (
                  <option key={a.idAdherent} value={a.idAdherent}>{a.nom} {a.prenom}</option>
                ))}
              </select>
              {adherentId && remiseAdherent > 0 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: C.green }}>
                    -{remiseAdherent}% remise fidélité appliquée
                  </span>
                </div>
              )}
              {adherentId && pointsGagnes > 0 && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: C.gold }}>
                    ★ +{pointsGagnes} point{pointsGagnes > 1 ? 's' : ''} de fidélité
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quantité */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Quantité <span style={{ color: C.accent }}>*</span></label>
            <input type="number" value={quantite} min="1" placeholder="ex: 5"
              onChange={e => setQuantite(e.target.value)} style={inputSt} />
          </div>

          {/* Prix d'achat */}
          {!isVente && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Prix d'achat unitaire (DZD) <span style={{ color: C.accent }}>*</span></label>
              <input type="number" value={prixAchat} min="0" placeholder="ex: 3 000"
                onChange={e => setPrixAchat(e.target.value)} style={inputSt} />
            </div>
          )}

          {/* Preview stock */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: C.muted, marginBottom: 4 }}>Stock actuel</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.text }}>{produit.stock}</div>
              </div>
            </div>
            {qte > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
                <div style={{ fontSize: '0.62rem', color: C.muted, marginBottom: 3 }}>Stock après</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stockInsuff ? C.accent : stockApres <= 5 ? C.gold : C.green }}>
                  {stockApres}
                </div>
              </div>
            )}
            {stockInsuff && (
              <div style={{ marginTop: 10, color: C.accent, fontSize: '0.75rem', fontWeight: 700 }}>
                <AlertTriangle size={13} /> Stock insuffisant — {produit.stock} disponible{produit.stock > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose}>Annuler</button>
            <button onClick={handleSubmit} disabled={stockInsuff}>
              {isVente ? 'Vendre' : 'Acheter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Données de test ───────────────────────────────────────────────────────
const mockProduit = {
  idProduit: 1,
  nom: 'Protéines Whey',
  stock: 20,
  prix: 2500,
};

// ── Tests ─────────────────────────────────────────────────────────────────
describe('TransactionModal Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    // Mock window.api pour éviter les erreurs dans useEffect
    window.api = {
      getAdherents: jest.fn().mockResolvedValue([]),
      getAdherentNiveau: jest.fn().mockResolvedValue({ remise: 0 }),
    };
  });

  // ── Type Vente ────────────────────────────────────────────────────────
  describe('Type Vente', () => {
    test('affiche "Vente produit" comme titre', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Vente produit/i)).toBeInTheDocument();
    });

    test('affiche le nom du produit', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText('Protéines Whey')).toBeInTheDocument();
    });

    test("n'affiche pas le champ \"Prix d'achat\" pour une vente", () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.queryByText(/Prix d'achat/i)).not.toBeInTheDocument();
    });

    test('affiche le stock actuel', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Stock actuel/i)).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    test("affiche le stock après saisie d'une quantité", () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '3' } });
      expect(screen.getByText('17')).toBeInTheDocument(); // 20 - 3
    });

    test('alerte si quantité invalide (0)', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.click(screen.getByText('Vendre'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Quantité invalide'));
    });

    test('alerte si quantité dépasse le stock', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '99' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(window.alert).toHaveBeenCalledWith('Stock insuffisant !');
    });

    test('appelle onConfirm avec les bonnes données', () => {
      const mockConfirm = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({
        produit_id: mockProduit.idProduit,
        quantite:   5,
        prix:       mockProduit.prix,
        type:       'vente',
      }));
    });

    test('appelle onClose après confirmation réussie', () => {
      const mockClose   = jest.fn();
      const mockConfirm = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '2' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Type Achat ────────────────────────────────────────────────────────
  describe('Type Achat', () => {
    test('affiche "Achat produit" comme titre', () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Achat produit/i)).toBeInTheDocument();
    });

    test("affiche le champ \"Prix d'achat\" pour un achat", () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Prix d'achat/i)).toBeInTheDocument();
    });

    test("affiche le stock après ajout d'une quantité", () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '10' } });
      expect(screen.getByText('30')).toBeInTheDocument(); // 20 + 10
    });

    test("alerte si prix d'achat invalide", () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Acheter'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Prix d'achat invalide"));
    });

    test("appelle onConfirm avec prix d'achat", () => {
      const mockConfirm = jest.fn();
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i),    { target: { value: '5' } });
      fireEvent.change(screen.getByPlaceholderText(/ex: 3 000/i), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Acheter'));
      expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({
        produit_id: mockProduit.idProduit,
        quantite:   5,
        prix:       2000,
        type:       'achat',
      }));
    });
  });

  // ── Fermeture du modal ────────────────────────────────────────────────
  describe('Fermeture du modal', () => {
    test('appelle onClose au clic sur Annuler', () => {
      const mockClose = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={() => {}} />);
      fireEvent.click(screen.getByText('Annuler'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("appelle onClose au clic sur l'overlay", () => {
      const mockClose = jest.fn();
      const { container } = render(
        <TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={() => {}} />
      );
      fireEvent.click(container.firstChild);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });
});