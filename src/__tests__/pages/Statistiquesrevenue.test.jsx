import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatistiquesRevenue from '../../renderer/pages/StatistiquesRevenue';

// ── Mock window.api ──
global.window.api = {
  getPaiements: jest.fn(() => Promise.resolve([
    { id: 1, nom: 'Benali',  montant: 3000,  statut: 'Payé',       date: '2025-01-10', type: 'abonnement' },
    { id: 2, nom: 'Mammeri', montant: 8000,  statut: 'En attente', date: '2025-03-15', type: 'abonnement' },
    { id: 3, nom: 'Cherif',  montant: 5000,  statut: 'En retard',  date: '2025-06-20', type: 'vente'      },
    { id: 4, nom: 'Ouali',   montant: 3000,  statut: 'Payé',       date: '2025-02-05', type: 'abonnement' },
  ])),
  getProduits: jest.fn(() => Promise.resolve([
    { idProduit: 1, nom: 'Haltères', categorie: 'Musculation', stock: 10, prix: '6000'  },
    { idProduit: 2, nom: 'Tapis',    categorie: 'Cardio',      stock: 2,  prix: '45000' },
  ])),
};

jest.mock('../../renderer/components/QuickActions', () => () => null);

describe('PAGE StatistiquesRevenue', () => {

  beforeEach(() => jest.clearAllMocks());

  // T01 — Affiche le titre
  test('T01 — affiche le titre Statistiques Revenue', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Statistiques Revenue/i)).toBeInTheDocument();
    });
  });

  // T02 — StatCard revenus encaissés visible
  test('T02 — affiche la StatCard Revenus encaissés', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Revenus encaissés/i)).toBeInTheDocument();
    });
  });

  // T03 — StatCard En attente visible
 test('T03 — affiche la StatCard En attente', async () => {
  render(<StatistiquesRevenue />);
  await waitFor(() => {
    const elements = screen.getAllByText(/En attente/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});

  // T04 — StatCard En retard visible
test('T04 — affiche la StatCard En retard', async () => {
  render(<StatistiquesRevenue />);
  await waitFor(() => {
    const elements = screen.getAllByText(/En retard/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});


  // T05 — StatCard valeur stock visible
  test('T05 — affiche la StatCard Valeur stock', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Valeur stock/i)).toBeInTheDocument();
    });
  });

  // T06 — Calcul revenus : seuls les "Payé" sont comptés
  // Paiements Payés : 3000 + 3000 = 6000 DA
 test('T06 — calcule correctement les revenus encaissés', async () => {
  render(<StatistiquesRevenue />);
  await waitFor(() => {
    const elements = screen.getAllByText(/6 000/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});

  // T07 — Graphique revenus mensuels visible
  test('T07 — affiche le graphique des revenus mensuels', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Revenus mensuels/i)).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  // T08 — Section Résumé visible
  test('T08 — affiche la section Résumé avec les totaux', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Résumé/i)).toBeInTheDocument();
    });
  });

  // T09 — Section Aperçu produits visible
  test('T09 — affiche la section Aperçu produits', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Aperçu produits/i)).toBeInTheDocument();
      expect(screen.getByText(/Haltères/i)).toBeInTheDocument();
    });
  });

  // T10 — Calcul revenus par période : Revenu total dans le résumé
  test('T10 — affiche le revenu total dans la section Résumé', async () => {
    render(<StatistiquesRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Revenu total/i)).toBeInTheDocument();
    });
  });

});