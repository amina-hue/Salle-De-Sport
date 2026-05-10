// src/__tests__/pages/Adherent.openModal.test.jsx
// Test séparé pour le cas ?openModal=true dans l'URL
// Doit être dans un fichier à part car le mock de react-router-dom
// doit être défini AVANT tout import du composant.

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mocks définis AVANT l'import du composant ────────────────────────────────
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: '?openModal=true' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../renderer/components/AddMemberModal', () => ({ onSave, onClose }) => (
  <div data-testid="add-modal">
    <button onClick={onClose}>Fermer</button>
  </div>
));

jest.mock('../../renderer/components/RenewModal', () => () => null);

jest.mock('../../renderer/components/DeleteConfirm', () => {
  const DC = () => null;
  DC.useDeleteConfirm = () => ({
    confirmProps: { open: false },
    askConfirm: jest.fn().mockResolvedValue(false),
  });
  return DC;
});

jest.mock('../../renderer/components/QuickActions', () => () => null);
jest.mock('../../images/background.png', () => 'bg.png');

// ─── Import du composant APRÈS les mocks ──────────────────────────────────────
import Adherent from '../../renderer/pages/Adherent';

// ─── Setup window.api ─────────────────────────────────────────────────────────
beforeEach(() => {
  window.api = {
    getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([]),
    getTypesAbonnement:         jest.fn().mockResolvedValue([]),
    getHistoriqueAbonnements:   jest.fn().mockResolvedValue([]),
  };
  mockNavigate.mockClear();
});

// ─── Test ─────────────────────────────────────────────────────────────────────
describe('Paramètre URL openModal=true', () => {

  test('T40 — openModal=true dans l\'URL ouvre AddMemberModal automatiquement', async () => {
    render(<Adherent />);

    await waitFor(() =>
      expect(screen.getByTestId('add-modal')).toBeInTheDocument()
    );

    // navigate appelé pour nettoyer le param de l'URL
    expect(mockNavigate).toHaveBeenCalledWith('/adherents', { replace: true });
  });
});