import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatistiquesAbonnement from '../../renderer/pages/StatistiquesAbonnement';

// ── Mock window.api ──
global.window.api = {
  getStatsAbonnements: jest.fn(() => Promise.resolve({
    total: 40,
    actifs: 28,
    expires: 10,
    suspendus: 2,
  })),
  getAbonnementsParType: jest.fn(() => Promise.resolve([
    { type: 'Mensuel',     count: 20 },
    { type: 'Trimestriel', count: 12 },
    { type: 'Annuel',      count: 8  },
  ])),
  getAbonnementsExpirantBientot: jest.fn(() => Promise.resolve([
    { idAbonnement: 1, name: 'Benali Youcef', nom: 'Benali', prenom: 'Youcef', dateFin: '2025-05-01', joursRestants: 5 },
    { idAbonnement: 2, name: 'Cherif Lyes',nom: 'Cherif', prenom: 'Lyes',   dateFin: '2025-05-03', joursRestants: 7 },
  ])),
  getFrequentationHebdo: jest.fn(() => Promise.resolve([
    { day: 'Monday',    value: 4 },
    { day: 'Tuesday',   value: 6 },
    { day: 'Wednesday', value: 3 },
    { day: 'Thursday',  value: 8 },
    { day: 'Friday',    value: 5 },
    { day: 'Saturday',  value: 10 },
    { day: 'Sunday',    value: 2 },
  ])),
};

jest.mock('../../renderer/components/QuickActions', () => () => null);

describe('PAGE StatistiquesAbonnement', () => {

  beforeEach(() => jest.clearAllMocks());

  // T01 — Affiche le titre
  test('T01 — affiche le titre Statistiques Abonnement', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText(/Statistiques Abonnement/i)).toBeInTheDocument();
    });
  });

  // T02 — StatCard total abonnements
  test('T02 — StatCard affiche le total des abonnements', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText(/Total abonnements/i)).toBeInTheDocument();
    });
  });

  // T03 — StatCard abonnements actifs
  test('T03 — StatCard affiche les abonnements actifs', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText(/Abonnements actifs/i)).toBeInTheDocument();
    });
  });

  // T04 — StatCard abonnements expirés
  test('T04 — StatCard affiche les abonnements expirés', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/Abonnements expirés/i)).toBeInTheDocument();
    });
  });

  // T05 — Graphique fréquentation visible
  test('T05 — affiche le graphique des abonnements débutés cette semaine', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText(/Abonnements débutés cette semaine/i)).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  // T06 — Graphique répartition par type visible
  test('T06 — affiche le graphique de répartition des abonnements par type', async () => {
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText(/Répartition des abonnements/i)).toBeInTheDocument();
    });
  });

  // T07 — Message si pas de données cette semaine
  test('T07 — affiche un message si pas de données de fréquentation', async () => {
    global.window.api.getFrequentationHebdo.mockResolvedValueOnce([]);
    render(<StatistiquesAbonnement />);
    await waitFor(() => {
      expect(screen.getByText(/Pas de données cette semaine/i)).toBeInTheDocument();
    });
  });

});