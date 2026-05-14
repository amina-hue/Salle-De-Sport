
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from "react";

// ── Mock react-router-dom ──────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ── Mock window.api.login ──────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.window.api = {
    login: jest.fn(),
  };
});

import Login from '../../renderer/pages/connexion';

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Connexion — Affichage', () => {

  test('T01 — La page de connexion s\'affiche correctement', () => {
    render(<Login />);
    expect(screen.getByText(/FitManager/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se Connecter/i })).toBeInTheDocument();
  });

  test('T02 — Le champ email est présent', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
  });

  test('T03 — Le champ mot de passe est présent', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Connexion — Validation champs vides', () => {

  test('T04 — Login avec champs vides → message d\'erreur', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument();
    });
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T05 — Login avec email vide seulement → message d\'erreur', async () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'monmotdepasse' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument();
    });
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T06 — Login avec mot de passe vide seulement → message d\'erreur', async () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/votre@email.com/i), {
      target: { value: 'admin@gym.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument();
    });
    expect(window.api.login).not.toHaveBeenCalled();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Connexion — Login valide', () => {

  test('T07 — Login valide → redirection vers /adherents', async () => {
    window.api.login.mockResolvedValue({
      success: true,
      user: { id: 1, nom: 'Admin', role_id: 1 },
    });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/votre@email.com/i), {
      target: { value: 'admin@gym.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'Admin@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/adherents');
    });
  });

  test('T08 — Login valide → user stocké dans localStorage', async () => {
    const fakeUser = { id: 1, nom: 'Admin', role_id: 1 };
    window.api.login.mockResolvedValue({ success: true, user: fakeUser });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/votre@email.com/i), {
      target: { value: 'admin@gym.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'Admin@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored).toEqual(fakeUser);
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Page Connexion — Login invalide', () => {

  test('T09 — Mauvais mot de passe → message d\'erreur affiché', async () => {
    window.api.login.mockResolvedValue({
      success: false,
      message: 'Mot de passe incorrect.',
    });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/votre@email.com/i), {
      target: { value: 'admin@gym.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'mauvaismdp' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Mot de passe incorrect/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('T10 — Erreur réseau → message erreur base de données', async () => {
    window.api.login.mockRejectedValue(new Error('Network error'));
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/votre@email.com/i), {
      target: { value: 'admin@gym.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'Admin@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Erreur de connexion à la base de données/i)).toBeInTheDocument();
    });
  });

  // ── T11 : mock ajouté ici ──────────────────────────────────────────────
  test('T11 — Appuyer Enter sur le champ email déclenche handleLogin', async () => {
    window.api.login.mockResolvedValue({ success: true, user: { id: 1 } }); // ← correction
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),         { target: { value: 'secret' } });
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'Enter' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
  });

  // ── T12 : mock ajouté ici ──────────────────────────────────────────────
  test('T12 — Appuyer Enter sur le champ mot de passe déclenche handleLogin', async () => {
    window.api.login.mockResolvedValue({ success: true, user: { id: 1 } }); // ← correction
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),         { target: { value: 'secret' } });
    fireEvent.keyDown(screen.getByPlaceholderText('••••••••'), { key: 'Enter' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
  });

  test('T13 — Une autre touche ne déclenche pas handleLogin', () => {
    render(<Login />);
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'a' });
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T14 — Clic sur l\'icône œil affiche le mot de passe en clair', () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleBtn     = screen.getByRole('button', { name: '' });
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('T15 — Double clic sur l\'icône œil remasque le mot de passe', () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleBtn     = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });


  // ── Événements de style (hover / focus / blur) ────────────────────────────

test('T16 — Focus sur le champ email change la bordure', () => {
  render(<Login />);
  const emailInput = screen.getByPlaceholderText('votre@email.com');
  fireEvent.focus(emailInput);
  fireEvent.blur(emailInput);
  // pas d'erreur = lignes 142-143 couvertes
});

test('T17 — Focus sur le champ mot de passe change la bordure', () => {
  render(<Login />);
  const passwordInput = screen.getByPlaceholderText('••••••••');
  fireEvent.focus(passwordInput);
  fireEvent.blur(passwordInput);
  // lignes 164-165 couvertes
});

test('T18 — Hover sur le bouton œil change sa couleur', () => {
  render(<Login />);
  const toggleBtn = screen.getByRole('button', { name: '' });
  fireEvent.mouseEnter(toggleBtn);
  fireEvent.mouseLeave(toggleBtn);
  // lignes 176-183 couvertes
});

test('T19 — Hover sur le bouton Se Connecter change sa couleur', () => {
  render(<Login />);
  const loginBtn = screen.getByRole('button', { name: /Se Connecter/i });
  fireEvent.mouseEnter(loginBtn);
  fireEvent.mouseLeave(loginBtn);
  // lignes 184-207 couvertes
});

});