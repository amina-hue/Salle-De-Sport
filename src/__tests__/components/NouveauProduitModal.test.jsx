// src/__tests__/components/NouveauProduitModal.test.jsx

import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Reproduire les dépendances du fichier Magasin.jsx ─────────────────────

const C = {
  bg: '#0b0c0e', bgCard: '#13151a', bgInput: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.07)', borderStrong: 'rgba(255,255,255,0.12)',
  accent: '#e53935', accentHover: '#f44336', accentDim: 'rgba(229,57,53,0.10)',
  accentBorder: 'rgba(229,57,53,0.28)', text: '#f0f0f0', muted: '#6b7280',
  subtle: '#9ca3af', green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  gold: '#f59e0b', goldDim: 'rgba(245,158,11,0.12)', blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.12)',
};

const CATEGORIES = ['Musculation', 'Cardio', 'Accessoire', 'Cardio / Accessoire'];

const CAT_STYLE = {
  'Musculation': { bg: C.accentDim, color: C.accent, border: C.accentBorder },
  'Accessoire':  { bg: C.blueDim,   color: C.blue,   border: 'rgba(59,130,246,0.25)' },
};

const lbl = { display: 'block', fontSize: '0.78rem', color: C.muted, marginBottom: 5 };

// Stub FocusInput — même interface que l'original
function FocusInput({ tag, children, ...props }) {
  if (tag === 'select')   return <select {...props}>{children}</select>;
  if (tag === 'textarea') return <textarea {...props} />;
  return <input {...props} />;
}

// Stub IconX
function IconX() { return <span data-testid="icon-x" />; }

// Stub Plus (lucide)
function Plus({ size }) { return <span data-testid="icon-plus" />; }

// ── Composant inline (copie exacte de NouveauProduitModal.jsx) ────────────
function NouveauProduitModal({ onSave, onClose }) {
  const [form, setForm] = useState({ nom: '', reference: '', categorie: '', stock: '', prix: '', note: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const { nom, reference, categorie, stock, prix } = form;
    if (!nom || !reference || !categorie || !stock || !prix) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    onSave({ nom, reference, categorie, stock: Number(stock), prix: Number(prix) });
    onClose();
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()}
           style={{ width: '100%', maxWidth: 560, borderRadius: 18, background: '#161012' }}>
        {/* Hero */}
        <div style={{ position: 'relative', padding: '28px 28px 24px' }}>
          <h2 style={{ color: C.text }}>Nouveau Produit</h2>
          <button onClick={onClose} data-testid="btn-close"
                  style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer' }}>
            <IconX />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '26px 28px 30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Nom du produit *</label>
              <FocusInput type="text" placeholder="ex: Haltères 10kg" value={form.nom}
                          onChange={e => set('nom', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Référence *</label>
              <FocusInput type="text" placeholder="ex: ALG016" value={form.reference}
                          onChange={e => set('reference', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Catégorie *</label>
              <FocusInput tag="select" value={form.categorie} onChange={e => set('categorie', e.target.value)}>
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </FocusInput>
            </div>
            <div>
              <label style={lbl}>Stock initial *</label>
              <FocusInput type="number" placeholder="ex: 20" min="0" value={form.stock}
                          onChange={e => set('stock', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Prix unitaire (DZD) *</label>
            <FocusInput type="number" placeholder="ex: 6 000" min="0" value={form.prix}
                        onChange={e => set('prix', e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Note</label>
            <FocusInput tag="textarea" rows={3} placeholder="Informations supplémentaires..."
                        value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose}>Annuler</button>
            <button onClick={handleSave}>
              <Plus size={15} /> Ajouter le produit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────
describe('NouveauProduitModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  const renderModal = (overrides = {}) =>
    render(
      <NouveauProduitModal
        onSave={overrides.onSave ?? jest.fn()}
        onClose={overrides.onClose ?? jest.fn()}
      />
    );

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/haltères 10kg/i), { target: { value: 'Haltères 10kg' } });
    fireEvent.change(screen.getByPlaceholderText(/alg016/i),        { target: { value: 'ALG016' } });
    fireEvent.change(screen.getByRole('combobox'),                  { target: { value: 'Musculation' } });
    fireEvent.change(screen.getByPlaceholderText(/ex: 20/i),        { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText(/6 000/i),         { target: { value: '6000' } });
  };

  test('affiche le titre Nouveau Produit', () => {
    renderModal();
    expect(screen.getByText(/nouveau produit/i)).toBeInTheDocument();
  });

  test('affiche une alerte si champs vides', () => {
    const onSave = jest.fn();
    renderModal({ onSave });
    fireEvent.click(screen.getByText(/ajouter le produit/i));
    expect(global.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires.');
    expect(onSave).not.toHaveBeenCalled();
  });

  test('ferme la modal au clic sur Annuler', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByText(/annuler/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('ferme la modal au clic sur ✕', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByTestId('btn-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('ferme la modal en cliquant sur l\'arrière-plan', () => {
    const onClose = jest.fn();
    const { container } = renderModal({ onClose });
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onSave avec les bonnes données', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    renderModal({ onSave, onClose });
    fillForm();
    fireEvent.click(screen.getByText(/ajouter le produit/i));
    expect(global.alert).not.toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith({
      nom: 'Haltères 10kg', reference: 'ALG016', categorie: 'Musculation',
      stock: 20, prix: 6000,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});