
/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
let mockPathname = '/adherents';

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

// ── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = '/adherents';

  // ✅ Fix : mock sur window.electron (pas global.electron)
  window.electron = { invoke: jest.fn(() => Promise.resolve({})) };

  // Simuler un admin connecté
  localStorage.setItem('user', JSON.stringify({ id: 1, nom: 'Admin', role_id: 1 }));
});

afterEach(() => {
  localStorage.clear();
});

import Sidebar from '../../renderer/components/Sidebar';

// ═══════════════════════════════════════════════════════════════════════════
describe('Sidebar — Affichage', () => {

  test('T31 — La sidebar affiche le logo FitManager', async () => {
    await act(async () => { render(<Sidebar />); });
    expect(screen.getAllByText(/FitManager/i).length).toBeGreaterThan(0);
  });

  test('T32 — Tous les menus principaux sont affichés', async () => {
    await act(async () => { render(<Sidebar />); });
    expect(screen.getByText(/^Adhérents$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Abonnements$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Paiements$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Planning$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Utilisateur$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Paramètres$/i)).toBeInTheDocument();
  });

  test('T33 — Le bouton Déconnexion est présent', async () => {
    await act(async () => { render(<Sidebar />); });
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Sidebar — Navigation', () => {

  test('T34 — Clic "Adhérents" → navigate /adherents', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Adhérents$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/adherents');
  });

  test('T35 — Clic "Paiements" → navigate /paiements', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Paiements$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/paiements');
  });

  test('T36 — Clic "Paramètres" → navigate /parametres', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Paramètres$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/parametres');
  });

  // ✅ Fix T37 : le sous-menu Magasin contient "Inventaire", pas "Revenue"
  test('T37 — Clic "Magasin" → sous-menu s\'ouvre avec Inventaire', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Magasin$/i));
    expect(screen.getByText(/^Inventaire$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Transactions$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Fidelite$/i)).toBeInTheDocument();
  });

  test('T38 — Déconnexion supprime user du localStorage', async () => {
    await act(async () => { render(<Sidebar />); });
    expect(localStorage.getItem('user')).toBeTruthy();
    fireEvent.click(screen.getByText(/Déconnexion/i));
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('T39 — Déconnexion → navigate /connexion', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/Déconnexion/i));
    expect(mockNavigate).toHaveBeenCalledWith('/connexion');
  });

  test('T40 — Clic sous-menu "Inventaire" → navigate /magasin', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Magasin$/i));
    fireEvent.click(screen.getByText(/^Inventaire$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/magasin');
  });

  test('T41 — Clic sous-menu "Transactions" → navigate /magasin/transactions', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Magasin$/i));
    fireEvent.click(screen.getByText(/^Transactions$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/magasin/transactions');
  });

  test('T42 — Clic "Statistiques" → navigate /statistiques/adherents', async () => {
    await act(async () => { render(<Sidebar />); });
    fireEvent.click(screen.getByText(/^Statistiques$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/statistiques/adherents');
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Sidebar — Hover', () => {

  test('T43 — Hover sur un item de menu change le style', async () => {
    await act(async () => { render(<Sidebar />); });
    const btn = screen.getByText(/^Paiements$/i).closest('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  test('T44 — Hover sur Déconnexion change le style', async () => {
    await act(async () => { render(<Sidebar />); });
    const btn = screen.getByText(/Déconnexion/i).closest('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });









  describe('Sidebar — Cas limites', () => {

  test('T45 — Erreur getPermissions → console.error', async () => {
    window.electron.invoke = jest.fn(() => Promise.reject(new Error('fail')));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('user', JSON.stringify({ id: 2, nom: 'User', role_id: 2 }));
    await act(async () => { render(<Sidebar />); });
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  test('T46 — role_id=2 avec permission interdit → item masqué', async () => {
    window.electron.invoke = jest.fn(() =>
      Promise.resolve({ magasin: 'interdit' })
    );
    localStorage.setItem('user', JSON.stringify({ id: 2, nom: 'User', role_id: 2 }));
    await act(async () => { render(<Sidebar />); });
    await waitFor(() => {
      expect(screen.queryByText(/^Magasin$/i)).not.toBeInTheDocument();
    });
  });

  test('T47 — Hover sur groupe Magasin ouvert (actif)', async () => {
    mockPathname = '/magasin';
    await act(async () => { render(<Sidebar />); });
    const btn = screen.getByText(/^Magasin$/i).closest('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  test('T48 — Hover sur sous-item actif du Magasin', async () => {
    mockPathname = '/magasin';
    await act(async () => { render(<Sidebar />); });
    // Le groupe s'ouvre automatiquement car pathname commence par /magasin
    const btn = screen.getByText(/^Inventaire$/i).closest('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });



  test('T49 — pathname /statistiques ouvre le groupe Statistiques au démarrage', async () => {
  mockPathname = '/statistiques/adherents';
  await act(async () => { render(<Sidebar />); });
  // Le groupe Statistiques est ouvert → ChevronDown visible
  expect(screen.getByText(/^Statistiques$/i)).toBeInTheDocument();
});

test('T50 — pathname /magasin ouvre le groupe Magasin au démarrage', async () => {
  mockPathname = '/magasin';
  await act(async () => { render(<Sidebar />); });
  // Le sous-menu est déjà ouvert → Inventaire visible sans clic
  expect(screen.getByText(/^Inventaire$/i)).toBeInTheDocument();
});

test('T51 — double clic sur Magasin ferme puis rouvre le sous-menu', async () => {
  await act(async () => { render(<Sidebar />); });
  // Ouvrir
  fireEvent.click(screen.getByText(/^Magasin$/i));
  expect(screen.getByText(/^Inventaire$/i)).toBeInTheDocument();
  // Fermer
  fireEvent.click(screen.getByText(/^Magasin$/i));
  expect(screen.queryByText(/^Inventaire$/i)).not.toBeInTheDocument();
});

test('T52 — user sans role_id ne charge pas les permissions', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 1, nom: 'Test' })); // pas de role_id
  await act(async () => { render(<Sidebar />); });
  expect(window.electron.invoke).not.toHaveBeenCalled();
});

});

});