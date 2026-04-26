/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react';
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

  // Mock window.electron via global
  global.window = global.window || {};
  global.electron = { invoke: jest.fn(() => Promise.resolve({})) };

  // Simuler un admin connecté
  global.localStorage.setItem(
    'user',
    JSON.stringify({ id: 1, nom: 'Admin', role_id: 1 })
  );
});

afterEach(() => {
  global.localStorage.clear();
});

import Sidebar from '../../../src/renderer/components/Sidebar';

// ═══════════════════════════════════════════════════════════════════════════
describe('Sidebar — Affichage', () => {

  test('T31 — La sidebar affiche le logo FitManager', () => {
    render(<Sidebar />);
    expect(screen.getAllByText(/FitManager/i).length).toBeGreaterThan(0);
  });

  test('T32 — Tous les menus principaux sont affichés', () => {
    render(<Sidebar />);
    expect(screen.getByText(/^Adhérents$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Abonnements$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Paiements$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Planning$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Utilisateur$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Paramètres$/i)).toBeInTheDocument();
  });

  test('T33 — Le bouton Déconnexion est présent', () => {
    render(<Sidebar />);
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Sidebar — Navigation', () => {

  test('T34 — Clic "Adhérents" → navigate /adherents', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/^Adhérents$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/adherents');
  });

  test('T35 — Clic "Paiements" → navigate /paiements', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/^Paiements$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/paiements');
  });

  test('T36 — Clic "Paramètres" → navigate /parametres', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/^Paramètres$/i));
    expect(mockNavigate).toHaveBeenCalledWith('/parametres');
  });

  test('T37 — Clic "Statistiques" → sous-menu s\'ouvre', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/^Statistiques$/i));
    expect(screen.getByText(/Revenue/i)).toBeInTheDocument();
  });

  test('T38 — Déconnexion supprime user du localStorage', () => {
    render(<Sidebar />);
    expect(global.localStorage.getItem('user')).toBeTruthy();
    fireEvent.click(screen.getByText(/Déconnexion/i));
    expect(global.localStorage.getItem('user')).toBeNull();
  });

  test('T39 — Déconnexion → navigate /connexion', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/Déconnexion/i));
    expect(mockNavigate).toHaveBeenCalledWith('/connexion');
  });

});