import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HistoriqueTransactions from '../../renderer/pages/HistoriqueTransactions';

// Mock images
jest.mock('../../renderer/images/gym1.png', () => 'gym1.png');
jest.mock('../../renderer/images/gym.png',  () => 'gym.png');
jest.mock('../../renderer/images/gym2.png', () => 'gym2.png');

// Mock recharts pour éviter les erreurs canvas dans les tests
jest.mock('recharts', () => {
  const React = require('react');
  const MockChart = ({ children }) => <div data-testid="chart">{children}</div>;
  return {
    AreaChart: MockChart, Area: () => null, BarChart: MockChart, Bar: () => null,
    XAxis: () => null, YAxis: () => null, CartesianGrid: () => null,
    Tooltip: () => null, Legend: () => null,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: MockChart, Line: () => null,
  };
});

// Mock QuickActions
jest.mock('../../renderer/components/QuickActions', () => () => <div data-testid="quick-actions" />);

// Mock TransactionModal
jest.mock('../../renderer/components/TransactionModal', () => ({ onClose }) => (
  <div data-testid="transaction-modal">
    <button onClick={onClose}>Fermer</button>
  </div>
));

const mockAchats = [
  { id: 1, produit_id: 10, quantite: 5, prix_achat: 1000, date: '2025-01-10', utilisateur_id: 1 },
  { id: 2, produit_id: 11, quantite: 3, prix_achat: 500,  date: '2025-02-15', utilisateur_id: 1 },
];
const mockVentes = [
  { id: 1, produit_id: 10, quantite: 2, prix_vente: 1500, date: '2025-01-20', utilisateur_id: 1 },
  { id: 2, produit_id: 11, quantite: 1, prix_vente: 800,  date: '2025-03-05', utilisateur_id: 1 },
];
const mockProduits = [
  { idProduit: 10, nom: 'Protéines Whey', prix: 1500, stock: 10 },
  { idProduit: 11, nom: 'Gants de sport',  prix: 800,  stock: 5  },
];

beforeEach(() => {
  window.api = {
    getHistoriqueAchats: jest.fn(() => Promise.resolve(mockAchats)),
    getHistoriqueVentes: jest.fn(() => Promise.resolve(mockVentes)),
    getProduits:         jest.fn(() => Promise.resolve(mockProduits)),
  };
});
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const renderPage = async () => {
  let result;
  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={['/transactions']}>
        <Routes><Route path="/transactions" element={<HistoriqueTransactions />} /></Routes>
      </MemoryRouter>
    );
  });
  return result;
};

// Helper : attend que les données soient chargées (badge "4 entrées" visible)
const waitForData = () =>
  waitFor(() => {
    expect(screen.getByText(/4 entrées/i)).toBeInTheDocument();
  });

describe('PAGE : HistoriqueTransactions.jsx', () => {

  // ── Afficher l'historique complet ───────────────────────────────────
  describe("Afficher l'historique complet", () => {
    test('affiche le titre "Transactions"', async () => {
      await renderPage();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    test('charge les achats, ventes et produits au montage', async () => {
      await renderPage();
      await waitFor(() => {
        expect(window.api.getHistoriqueAchats).toHaveBeenCalledTimes(1);
        expect(window.api.getHistoriqueVentes).toHaveBeenCalledTimes(1);
        expect(window.api.getProduits).toHaveBeenCalledTimes(1);
      });
    });

    test('affiche les StatCards (Total Achats, Total Ventes, Coût, CA)', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Total Achats/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Ventes/i)).toBeInTheDocument();
        expect(screen.getByText(/Coût Achats/i)).toBeInTheDocument();
        expect(screen.getByText(/CA Ventes/i)).toBeInTheDocument();
      });
    });

    test('affiche les noms des produits dans le tableau', async () => {
      await renderPage();
      await waitFor(() => {
        // getAllByText car le produit apparaît aussi dans le <select> et le Top Produits
        expect(screen.getAllByText(/Protéines Whey/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Gants de sport/i).length).toBeGreaterThan(0);
      });
    });

    test('affiche les badges "Achat" et "Vente"', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText('Achat').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Vente').length).toBeGreaterThan(0);
      });
    });

    test('affiche le nombre total de transactions dans le badge', async () => {
      await renderPage();
      // 2 achats + 2 ventes = 4 entrées
      await waitForData();
    });

    test('affiche "Aucune transaction trouvée" si listes vides', async () => {
      window.api.getHistoriqueAchats = jest.fn(() => Promise.resolve([]));
      window.api.getHistoriqueVentes = jest.fn(() => Promise.resolve([]));
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Aucune transaction trouvée/i)).toBeInTheDocument();
      });
    });
  });

  // ── Filtrer les transactions ────────────────────────────────────────
  describe('Filtrer les transactions', () => {
    test('filtre par onglet "Achats"', async () => {
      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByText('Achats'));
      await waitFor(() => {
        expect(screen.getByText(/2 entrées/i)).toBeInTheDocument();
      });
    });

    test('filtre par onglet "Ventes"', async () => {
      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByText('Ventes'));
      await waitFor(() => {
        expect(screen.getByText(/2 entrées/i)).toBeInTheDocument();
      });
    });

    test('revient à "Tous" affiche les 4 transactions', async () => {
      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByText('Achats'));
      fireEvent.click(screen.getByText('Tous'));
      await waitFor(() => {
        expect(screen.getByText(/4 entrées/i)).toBeInTheDocument();
      });
    });

    test('filtre par date de début', async () => {
      await renderPage();
      await waitForData();
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
      await waitFor(() => {
        // Transactions >= 2025-02-01 : achat du 2025-02-15 + vente du 2025-03-05 = 2
        expect(screen.getByText(/2 entrées/i)).toBeInTheDocument();
      });
    });

    test('filtre par produit via le select', async () => {
      await renderPage();
      await waitForData();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '10' } });
      await waitFor(() => {
        // Produit 10 (Protéines Whey) : 1 achat + 1 vente = 2
        expect(screen.getByText(/2 entrées/i)).toBeInTheDocument();
      });
    });

    test('le bouton "Effacer filtres" réinitialise tous les filtres', async () => {
      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByText('Achats'));
      await waitFor(() => screen.getByText(/Effacer filtres/i));
      fireEvent.click(screen.getByText(/Effacer filtres/i));
      await waitFor(() => {
        expect(screen.getByText(/4 entrées/i)).toBeInTheDocument();
      });
    });
  });

  // ── Rechercher une transaction ──────────────────────────────────────
  describe('Rechercher une transaction', () => {
    test('le champ de recherche est présent', async () => {
      await renderPage();
      expect(screen.getByPlaceholderText(/Rechercher produit.../i)).toBeInTheDocument();
    });

    test('filtre les transactions par nom de produit', async () => {
      await renderPage();
      await waitForData();
      const searchInput = screen.getByPlaceholderText(/Rechercher produit.../i);
      fireEvent.change(searchInput, { target: { value: 'Gants' } });
      await waitFor(() => {
        // "Gants de sport" (produit_id=11) : 1 achat + 1 vente = 2 entrées
        expect(screen.getByText(/2 entrées/i)).toBeInTheDocument();
      });
    });

    test('affiche "Aucune transaction trouvée" si aucun résultat', async () => {
      await renderPage();
      await waitForData();
      fireEvent.change(
        screen.getByPlaceholderText(/Rechercher produit.../i),
        { target: { value: 'zzz' } }
      );
      await waitFor(() => {
        expect(screen.getByText(/Aucune transaction trouvée/i)).toBeInTheDocument();
      });
    });
  });

  // ── Bouton Actualiser ──────────────────────────────────────────────
  describe('Actualiser les données', () => {
    test('le bouton actualiser recharge les données', async () => {
      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByTitle('Actualiser'));
      await waitFor(() => {
        expect(window.api.getHistoriqueAchats).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ── Export ──────────────────────────────────────────────────────────
  describe('Export des données', () => {
    test('le bouton "Excel / CSV" est présent', async () => {
      await renderPage();
      expect(screen.getByText(/Excel \/ CSV/i)).toBeInTheDocument();
    });

    test('le bouton "PDF" est présent', async () => {
      await renderPage();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    test('le clic sur "Excel / CSV" déclenche le téléchargement', async () => {
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      global.URL.revokeObjectURL = jest.fn();

      const mockClick = jest.fn();
      const mockAnchor = { href: '', download: '', click: mockClick };

      // ✅ Sauvegarder la référence avant de mocker pour éviter la récursion infinie
      const realCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return realCreateElement(tag);
      });

      await renderPage();
      await waitForData();
      fireEvent.click(screen.getByText(/Excel \/ CSV/i));
      expect(mockClick).toHaveBeenCalled();
    });
  });

  // ── Top Produits ───────────────────────────────────────────────────
  describe('Top Produits', () => {
    test('la section Top Produits est affichée', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Top Produits/i)).toBeInTheDocument();
        expect(screen.getByText(/Les plus vendus/i)).toBeInTheDocument();
      });
    });
  });
});