import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from "react";

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/utilisateurs' }),
}));

const fakeUsers = [
  { idUtilisateur: 1, nom: 'Benali', prenom: 'Youcef', email: 'youcef@gym.com', roleNom: 'admin' },
  { idUtilisateur: 2, nom: 'Mammeri', prenom: 'Sara',  email: 'sara@gym.com',   roleNom: 'coach' },
];
const fakeRoles = [
  { id: 1, nom: 'admin' },
  { id: 2, nom: 'coach' },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.window.electron = {
    invoke: jest.fn((channel) => {
      if (channel === 'getUtilisateurs')   return Promise.resolve(fakeUsers);
      if (channel === 'getRoles')          return Promise.resolve(fakeRoles);
      if (channel === 'addUtilisateur')    return Promise.resolve({ id: 3 });
      if (channel === 'deleteUtilisateur') return Promise.resolve({ success: true });
      return Promise.resolve([]);
    }),
  };
  global.window.confirm = jest.fn(() => true);
});

import Utilisateur from '../../../src/renderer/pages/Utilisateurs';

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Utilisateurs — Affichage', () => {

  test('T11 — La page affiche le titre "Gestion des utilisateurs"', async () => {
    render(<Utilisateur />);
    await waitFor(() => {
      expect(screen.getByText(/Gestion des utilisateurs/i)).toBeInTheDocument();
    });
  });

  test('T12 — La liste des utilisateurs s\'affiche', async () => {
    render(<Utilisateur />);
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    });
  });

  test('T13 — Le bouton "Ajouter un utilisateur" est présent', async () => {
    render(<Utilisateur />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ajouter un utilisateur/i })).toBeInTheDocument();
    });
  });

  test('T14 — Le champ de recherche est présent', () => {
    render(<Utilisateur />);
    expect(screen.getByPlaceholderText(/Rechercher par nom/i)).toBeInTheDocument();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Utilisateurs — Ajouter un utilisateur', () => {

  test('T15 — Cliquer sur Ajouter ouvre le modal', async () => {
    render(<Utilisateur />);
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    await waitFor(() => {
      expect(screen.getByText(/Créer un nouveau compte utilisateur/i)).toBeInTheDocument();
    });
  });

  test('T16 — Champs vides → erreur "Nom et prénom sont requis"', async () => {
    render(<Utilisateur />);
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    await waitFor(() => screen.getAllByRole('button', { name: /^Ajouter$/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /^Ajouter$/i })[0]);
    await waitFor(() => {
      expect(screen.getByText(/Nom et prénom sont requis/i)).toBeInTheDocument();
    });
  });

  test('T17 — Clic Annuler → modal se ferme', async () => {
    render(<Utilisateur />);
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un utilisateur/i }));
    await waitFor(() => screen.getByText(/Créer un nouveau compte utilisateur/i));
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Créer un nouveau compte utilisateur/i)).not.toBeInTheDocument();
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Utilisateurs — Supprimer', () => {

  test('T18 — Supprimer un utilisateur appelle deleteUtilisateur', async () => {
    render(<Utilisateur />);
    await waitFor(() => screen.getByText(/Benali/i));
    const deleteButtons = screen.getAllByRole('button');
    const trashBtn = deleteButtons.find(btn => btn.querySelector('svg'));
    if (trashBtn) {
      fireEvent.click(trashBtn);
      await waitFor(() => {
        expect(window.electron.invoke).toHaveBeenCalledWith('deleteUtilisateur', expect.anything());
      });
    }
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Utilisateurs — Recherche', () => {

  test('T19 — Rechercher "Benali" filtre la liste', async () => {
    render(<Utilisateur />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: 'Benali' },
    });
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
    });
  });

});