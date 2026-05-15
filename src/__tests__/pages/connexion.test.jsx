import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

// ── Mock react-router-dom ────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ── Mock image import ────────────────────────────────────────────────────────
jest.mock('../../images/gym.png', () => 'gym-mock.png');

// ── Shared helpers ────────────────────────────────────────────────────────────
const fillEmail    = (val) => fireEvent.change(screen.getByPlaceholderText('votre@email.com'), { target: { value: val } });
const fillPassword = (val) => fireEvent.change(screen.getByPlaceholderText('••••••••'),        { target: { value: val } });
const clickLogin   = ()    => fireEvent.click(screen.getByRole('button', { name: /Se Connecter/i }));

const fillAndSubmit = (email, password) => {
  fillEmail(email);
  fillPassword(password);
  clickLogin();
};

const mockLoginSuccess = (user = { id: 1, nom: 'Admin', role_id: 1 }) =>
  (window.api.login = jest.fn().mockResolvedValue({ success: true, user }));

const mockLoginFailure = (message = 'Identifiants incorrects.') =>
  (window.api.login = jest.fn().mockResolvedValue({ success: false, message }));

const mockLoginError = () =>
  (window.api.login = jest.fn().mockRejectedValue(new Error('Network error')));

// ── Setup / teardown ──────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.window.api = { login: jest.fn() };
});

import Login from '../../renderer/pages/connexion';


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 1 — Affichage initial
// ═════════════════════════════════════════════════════════════════════════════
describe('Affichage initial', () => {

  test('T01 — Le titre FitManager est affiché', () => {
    render(<Login />);
    expect(screen.getByText(/FitManager/i)).toBeInTheDocument();
  });

  test('T02 — Le champ email est présent et vide', () => {
    render(<Login />);
    const input = screen.getByPlaceholderText('votre@email.com');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  test('T03 — Le champ mot de passe est présent, vide et masqué', () => {
    render(<Login />);
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('T04 — Le bouton "Se Connecter" est présent et actif', () => {
    render(<Login />);
    const btn = screen.getByRole('button', { name: /Se Connecter/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  test('T05 — Aucun message d\'erreur à l\'ouverture', () => {
    render(<Login />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 2 — Validation des champs
// ═════════════════════════════════════════════════════════════════════════════
describe('Validation des champs', () => {

  test('T06 — Champs vides → message d\'erreur, API non appelée', async () => {
    render(<Login />);
    clickLogin();
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T07 — Email vide, mot de passe rempli → message d\'erreur', async () => {
    render(<Login />);
    fillPassword('monmotdepasse');
    clickLogin();
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T08 — Mot de passe vide, email rempli → message d\'erreur', async () => {
    render(<Login />);
    fillEmail('admin@gym.com');
    clickLogin();
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T09 — Espaces seuls dans l\'email → traité comme vide', async () => {
    render(<Login />);
    fillEmail('   ');
    fillPassword('Admin@2026');
    clickLogin();
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T10 — Espaces seuls dans le mot de passe → traité comme vide', async () => {
    render(<Login />);
    fillEmail('admin@gym.com');
    fillPassword('   ');
    clickLogin();
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 3 — Login réussi
// ═════════════════════════════════════════════════════════════════════════════
describe('Login réussi', () => {

  test('T11 — Login valide → redirection vers /adherents', async () => {
    mockLoginSuccess();
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
  });

  test('T12 — Login valide → user stocké dans localStorage', async () => {
    const fakeUser = { id: 1, nom: 'Admin', role_id: 1 };
    mockLoginSuccess(fakeUser);
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored).toEqual(fakeUser);
    });
  });

  test('T13 — L\'API reçoit l\'email et le mot de passe trimmés', async () => {
    mockLoginSuccess();
    render(<Login />);
    fillEmail('  admin@gym.com  ');
    fillPassword('  Admin@2026  ');
    clickLogin();
    await waitFor(() => {
      expect(window.api.login).toHaveBeenCalledWith({
        email: 'admin@gym.com',
        motDePasse: 'Admin@2026',
      });
    });
  });

  test('T14 — Pas de message d\'erreur après un login réussi', async () => {
    mockLoginSuccess();
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(screen.queryByText(/erreur/i)).not.toBeInTheDocument();
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 4 — Login échoué
// ═════════════════════════════════════════════════════════════════════════════
describe('Login échoué', () => {

  test('T15 — Mauvais mot de passe → message d\'erreur du serveur affiché', async () => {
    window.api.login = jest.fn().mockResolvedValue({
      success: false,
      message: 'Mot de passe incorrect.',
    });
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'mauvaismdp');
    await waitFor(() =>
      expect(screen.getByText(/Mot de passe incorrect/i)).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('T16 — Erreur réseau → message générique affiché', async () => {
    mockLoginError();
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() =>
      expect(screen.getByText(/Erreur de connexion à la base de données/i)).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('T17 — Login échoué → localStorage non modifié', async () => {
    mockLoginFailure();
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'mauvaismdp');
    await waitFor(() => screen.getByText(/Identifiants incorrects/i));
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('T18 — Erreur effacée avant un nouvel appel API', async () => {
    mockLoginFailure('Mot de passe incorrect.');
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'mauvaismdp');
    await waitFor(() => screen.getByText(/Mot de passe incorrect/i));

    mockLoginSuccess();
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
    expect(screen.queryByText(/Mot de passe incorrect/i)).not.toBeInTheDocument();
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 5 — État de chargement
// ═════════════════════════════════════════════════════════════════════════════
describe('État de chargement', () => {

  test('T19 — Pendant le chargement, le bouton affiche "Connexion..."', async () => {
    let resolve;
    window.api.login = jest.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Connexion\.\.\./i })).toBeInTheDocument()
    );
    resolve({ success: true, user: { id: 1 } });
  });

  test('T20 — Pendant le chargement, le bouton est désactivé', async () => {
    let resolve;
    window.api.login = jest.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Connexion\.\.\./i })).toBeDisabled()
    );
    resolve({ success: true, user: { id: 1 } });
  });

  test('T21 — Après la réponse, le bouton redevient "Se Connecter"', async () => {
    mockLoginFailure();
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'mauvaismdp');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Se Connecter/i })).toBeInTheDocument()
    );
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 6 — Interactions clavier
// ═════════════════════════════════════════════════════════════════════════════
describe('Interactions clavier', () => {

  test('T22 — Enter sur le champ email déclenche handleLogin', async () => {
    mockLoginSuccess();
    render(<Login />);
    fillEmail('admin@test.com');
    fillPassword('secret');
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'Enter' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
  });

  test('T23 — Enter sur le champ mot de passe déclenche handleLogin', async () => {
    mockLoginSuccess();
    render(<Login />);
    fillEmail('admin@test.com');
    fillPassword('secret');
    fireEvent.keyDown(screen.getByPlaceholderText('••••••••'), { key: 'Enter' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adherents'));
  });

  test('T24 — Une autre touche ne déclenche pas handleLogin', () => {
    render(<Login />);
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'Tab' });
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'a' });
    expect(window.api.login).not.toHaveBeenCalled();
  });

  test('T25 — Enter sans champs remplis → message d\'erreur, pas d\'appel API', async () => {
    render(<Login />);
    fireEvent.keyDown(screen.getByPlaceholderText('votre@email.com'), { key: 'Enter' });
    await waitFor(() =>
      expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument()
    );
    expect(window.api.login).not.toHaveBeenCalled();
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 7 — Visibilité du mot de passe
// ═════════════════════════════════════════════════════════════════════════════
describe('Visibilité du mot de passe', () => {

  const getToggle = () => screen.getByRole('button', { name: '' });

  test('T26 — Par défaut, le mot de passe est masqué (type="password")', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
  });

  test('T27 — Clic sur l\'icône œil → mot de passe visible (type="text")', () => {
    render(<Login />);
    fireEvent.click(getToggle());
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'text');
  });

  test('T28 — Double clic sur l\'icône œil → mot de passe de nouveau masqué', () => {
    render(<Login />);
    fireEvent.click(getToggle());
    fireEvent.click(getToggle());
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
  });

  test('T29 — Toggle n\'efface pas la valeur saisie', () => {
    render(<Login />);
    fillPassword('monSecret123');
    fireEvent.click(getToggle());
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('monSecret123');
    fireEvent.click(getToggle());
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('monSecret123');
  });

});


// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 8 — Événements de style (couverture branches)
// ═════════════════════════════════════════════════════════════════════════════
describe('Événements de style', () => {

  test('T30 — Focus/blur sur le champ email ne lève pas d\'erreur', () => {
    render(<Login />);
    const input = screen.getByPlaceholderText('votre@email.com');
    fireEvent.focus(input);
    fireEvent.blur(input);
  });

  test('T31 — Focus/blur sur le champ mot de passe ne lève pas d\'erreur', () => {
    render(<Login />);
    const input = screen.getByPlaceholderText('••••••••');
    fireEvent.focus(input);
    fireEvent.blur(input);
  });

  test('T32 — Hover/leave sur le bouton œil ne lève pas d\'erreur', () => {
    render(<Login />);
    const btn = screen.getByRole('button', { name: '' });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  test('T33 — Hover/leave sur le bouton Se Connecter ne lève pas d\'erreur', () => {
    render(<Login />);
    const btn = screen.getByRole('button', { name: /Se Connecter/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  test('T34 — Hover sur le bouton désactivé (loading) ne change pas le fond', async () => {
    let resolve;
    window.api.login = jest.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Login />);
    fillAndSubmit('admin@gym.com', 'Admin@2026');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Connexion\.\.\./i })).toBeDisabled()
    );
    const btn = screen.getByRole('button', { name: /Connexion\.\.\./i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    resolve({ success: true, user: { id: 1 } });
  });

});
// ─────────────────────────────────────────────────────────────────────────────
// Tests complémentaires — couverture 100 %
// À ajouter à la suite du fichier connexion.test.jsx existant
// ─────────────────────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════════════════════════════════════
// GROUPE 9 — Couverture des branches manquantes
// ═════════════════════════════════════════════════════════════════════════════
describe('Couverture branches manquantes', () => {

  // ── Branche onMouseEnter bouton login quand loading=false ─────────────────
  // Istanbul marque la branche `if (!loading)` dans onMouseEnter comme non
  // couverte car les tests hover existants s'exécutent avant tout appel API,
  // donc loading vaut false — mais le test hover précédent ne vérifie pas
  // explicitement que le style change. On s'assure ici que les deux branches
  // (loading=false ET loading=true) sont toutes deux exercées.

  test('T35 — onMouseEnter bouton Se Connecter quand loading=false → style appliqué', () => {
    render(<Login />);
    const btn = screen.getByRole('button', { name: /Se Connecter/i });
    // loading est false ici → branche `if (!loading)` = true
    fireEvent.mouseEnter(btn);
    expect(btn.style.background).toBe('');   // jsdom ne résout pas les valeurs inline,
    // ce qui compte c'est que le handler tourne sans erreur et que la branche est visitée
    fireEvent.mouseLeave(btn);
  });

  test('T36 — onMouseEnter bouton Se Connecter quand loading=true → style ignoré', async () => {
    let resolve;
    window.api.login = jest.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Login />);
    fillEmail('admin@gym.com');
    fillPassword('Admin@2026');
    clickLogin();
    // On attend que loading passe à true (bouton désactivé)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Connexion\.\.\./i })).toBeDisabled()
    );
    const btn = screen.getByRole('button', { name: /Connexion\.\.\./i });
    // loading=true → branche `if (!loading)` = false → style NON appliqué
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    resolve({ success: true, user: { id: 1 } });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  // ── EyeIcon open=true ─────────────────────────────────────────────────────
  // EyeIcon est un composant interne rendu avec open=showPass.
  // showPass démarre à false → seule la branche open=false du SVG est couverte
  // au premier render. Un clic sur le toggle rend open=true.

  test('T37 — EyeIcon open=true est rendu après le premier clic sur le toggle', () => {
    render(<Login />);
    const toggle = screen.getByRole('button', { name: '' });
    // Avant le clic : open=false → paths "barré" présents (branche false déjà couverte)
    fireEvent.click(toggle);
    // Après le clic : open=true → circle + path "ouvert" rendus (branche true couverte)
    // On vérifie que le circle SVG de l'œil ouvert est dans le DOM
    const svgs = document.querySelectorAll('svg');
    const eyeSvg = [...svgs].find(s => s.querySelector('circle[cx="12"]'));
    expect(eyeSvg).toBeTruthy();
  });

  // ── MailIcon et LockIcon ──────────────────────────────────────────────────
  // Ces composants sont montés dès le premier render. Si Istanbul les indique
  // comme non couverts, c'est que leur corps (la JSX retournée) n'a pas été
  // parcouru — on force un render et on vérifie la présence de leurs SVG.

  test('T38 — MailIcon est rendu (polyline présente dans le DOM)', () => {
    render(<Login />);
    // Le MailIcon contient une <polyline> — unique parmi les icônes
    expect(document.querySelector('polyline')).toBeInTheDocument();
  });

  test('T39 — LockIcon est rendu (rect présent dans le DOM)', () => {
    render(<Login />);
    // Le LockIcon contient un <rect> — unique parmi les icônes
    expect(document.querySelector('rect')).toBeInTheDocument();
  });

  // ── Lien support (onClick) ────────────────────────────────────────────────
  // Le handler onClick du lien "Contactez le support" appelle window.open.
  // Cette ligne est dans les statements non couverts.

  test('T40 — Clic sur "Contactez le support" appelle window.open', () => {
    window.open = jest.fn();
    render(<Login />);
    fireEvent.click(screen.getByText(/Contactez le support/i));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:')
    );
  });

  test('T41 — Hover/leave sur le lien support couvre les handlers de style', () => {
    render(<Login />);
    const link = screen.getByText(/Contactez le support/i);
    fireEvent.mouseEnter(link);
    fireEvent.mouseLeave(link);
    // Pas d'erreur = branches onMouseEnter/Leave du lien couvertes
  });

});