import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from "react";

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/parametres' }),
}));

const fakeRoles = [
  { id: 1, nom: 'admin', name: 'admin', users: 2 },
  { id: 2, nom: 'coach', name: 'coach', users: 3 },
];
const fakeActivites = [
  { idActivite: 1, nom: 'Zumba',   couleur: '#22c55e' },
  { idActivite: 2, nom: 'Pilates', couleur: '#3b82f6' },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.window.electron = {
    invoke: jest.fn((channel) => {
      if (channel === 'getRolesAvecCount') return Promise.resolve(fakeRoles);
      if (channel === 'getActivites')      return Promise.resolve(fakeActivites);
      if (channel === 'getPermissions')    return Promise.resolve({ statistiques: 'autorise' });
      if (channel === 'addRole')           return Promise.resolve({ id: 3 });
      if (channel === 'addActivite')       return Promise.resolve({ id: 3 });
      if (channel === 'deleteActivite')    return Promise.resolve({ success: true });
      if (channel === 'savePermissions')   return Promise.resolve({ success: true });
      return Promise.resolve([]);
    }),
  };
  global.window.confirm = jest.fn(() => true);
  global.window.alert   = jest.fn();
});

import Parametres from '../../../src/renderer/pages/Parametres';

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Paramètres — Affichage', () => {

  test('T20 — La page affiche le titre "Paramètres"', async () => {
    render(<Parametres />);
    await waitFor(() => {
      expect(screen.getByText(/Paramètres/i)).toBeInTheDocument();
    });
  });

  test('T21 — La section "Gestion des rôles" est affichée', async () => {
    render(<Parametres />);
    await waitFor(() => {
      expect(screen.getByText(/Gestion des rôles/i)).toBeInTheDocument();
    });
  });

  test('T22 — La section "Gestion des activités" est affichée', async () => {
    render(<Parametres />);
    await waitFor(() => {
      expect(screen.getByText(/Gestion des activités/i)).toBeInTheDocument();
    });
  });

  test('T23 — Les activités Zumba et Pilates sont affichées', async () => {
    render(<Parametres />);
    await waitFor(() => {
      expect(screen.getByText(/Zumba/i)).toBeInTheDocument();
      expect(screen.getByText(/Pilates/i)).toBeInTheDocument();
    });
  });

  test('T24 — Les rôles admin et coach sont affichés', async () => {
    render(<Parametres />);
    await waitFor(() => {
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
      expect(screen.getByText(/coach/i)).toBeInTheDocument();
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Paramètres — Ajouter un rôle', () => {

  test('T25 — Clic "Ajouter un rôle" → modal s\'ouvre', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un rôle/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un rôle/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Nom du rôle/i)).toBeInTheDocument();
    });
  });

  test('T26 — Ajouter rôle valide → addRole appelé', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un rôle/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    fireEvent.change(screen.getByPlaceholderText(/Nom du rôle/i), {
      target: { value: 'receptionniste' },
    });
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[addBtns.length - 1]);
    await waitFor(() => {
      expect(window.electron.invoke).toHaveBeenCalledWith('addRole', { nom: 'receptionniste' });
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Paramètres — Gérer les activités', () => {

  test('T27 — Supprimer activité → deleteActivite appelé', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Zumba/i));
    const deleteButtons = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(window.electron.invoke).toHaveBeenCalledWith('deleteActivite', expect.anything());
    });
  });

  test('T28 — Ajouter activité nom vide → erreur "Le nom est requis"', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Gestion des activités/i));
    const addActBtn = screen.getByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addActBtn);
    await waitFor(() => screen.getByPlaceholderText(/Ex: Zumba/i));
    const confirmBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() => {
      expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument();
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Paramètres — Permissions', () => {

  test('T29 — "Modifier permissions" charge les permissions du rôle', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByText(/coach/i));
    const modifBtn = screen.getByRole('button', { name: /Modifier permissions/i });
    fireEvent.click(modifBtn);
    await waitFor(() => {
      expect(window.electron.invoke).toHaveBeenCalledWith('getPermissions', 2);
    });
  });

  test('T30 — "Enregistrer" sauvegarde les permissions', async () => {
    render(<Parametres />);
    await waitFor(() => screen.getByText(/coach/i));
    fireEvent.click(screen.getByRole('button', { name: /Modifier permissions/i }));
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() => {
      expect(window.electron.invoke).toHaveBeenCalledWith('savePermissions',
        expect.objectContaining({ role_id: 2 })
      );
    });
  });

});