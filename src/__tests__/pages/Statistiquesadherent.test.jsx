import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatistiquesAdherent from '../../renderer/pages/StatistiquesAdherent';

// ── Mock window.api ──
global.window.api = {
  getStatsPageAdherent: jest.fn(() => Promise.resolve({
    total: 50,
    actifs: 35,
    nouveauxCeMois: 8,
  })),
  getFrequentationSemaine: jest.fn(() => Promise.resolve([
    { day: 'Lun', value: 12 },
    { day: 'Mar', value: 7  },
    { day: 'Mer', value: 9  },
    { day: 'Jeu', value: 5  },
    { day: 'Ven', value: 14 },
    { day: 'Sam', value: 20 },
    { day: 'Dim', value: 3  },
  ])),
  getAdherentsAvecAbonnement: jest.fn(() => Promise.resolve([
    {
      idAdherent: 1,
      nom: 'Benali',
      prenom: 'Youcef',
      dateCreation: new Date().toISOString(),
      abonnementStatut: 'actif',
    },
    {
      idAdherent: 2,
      nom: 'Mammeri',
      prenom: 'Sara',
      dateCreation: new Date().toISOString(),
      abonnementStatut: 'inactif',
    },
  ])),
};

jest.mock('../../renderer/components/QuickActions', () => () => null);

describe('PAGE StatistiquesAdherent', () => {

  beforeEach(() => jest.clearAllMocks());

  // T01 — Affiche le titre
  test('T01 — affiche le titre Statistiques Adhérent', async () => {
    render(<StatistiquesAdherent />);
    await waitFor(() => {
      expect(screen.getByText(/Statistiques Adhérent/i)).toBeInTheDocument();
    });
  });

  test('T02 — StatCard affiche le total des adhérents', async () => {
  render(<StatistiquesAdherent />);
  await waitFor(() => {
    // getAllByText car le chiffre apparaît 2 fois (header + StatCard)
    const elements = screen.getAllByText('50');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Total adhérents/i)).toBeInTheDocument();
  });
});

test('T03 — StatCard affiche le nombre d\'adhérents actifs', async () => {
  render(<StatistiquesAdherent />);
  await waitFor(() => {
    const elements = screen.getAllByText('35');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Adhérents actifs/i)).toBeInTheDocument();
  });
});

test('T04 — StatCard affiche les nouveaux adhérents ce mois', async () => {
  render(<StatistiquesAdherent />);
  await waitFor(() => {
    const elements = screen.getAllByText('8');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Nouveaux ce mois/i)).toBeInTheDocument();
  });
});

  // T05 — Graphique visible
  test('T05 — affiche le graphique des inscriptions par jour', async () => {
    render(<StatistiquesAdherent />);
    await waitFor(() => {
      expect(screen.getByText(/Inscriptions par jour/i)).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  // T06 — Liste nouveaux adhérents
  test('T06 — affiche la liste des nouveaux adhérents du mois', async () => {
    render(<StatistiquesAdherent />);
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    });
  });

  // T07 — Badge statut Actif
  test('T07 — affiche le badge Actif pour un adhérent actif', async () => {
    render(<StatistiquesAdherent />);
    await waitFor(() => {
      expect(screen.getByText('Actif')).toBeInTheDocument();
    });
  });

  // T08 — Message si aucun nouvel adhérent
  test('T08 — affiche un message si aucun nouvel adhérent ce mois', async () => {
    global.window.api.getAdherentsAvecAbonnement.mockResolvedValueOnce([]);
    render(<StatistiquesAdherent />);
    await waitFor(() => {
      expect(screen.getByText(/Aucun nouvel adhérent ce mois/i)).toBeInTheDocument();
    });
  });

});