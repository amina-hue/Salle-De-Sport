import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Recette from '../../renderer/pages/Recette';

// Mock images
jest.mock('../../renderer/images/gym1.png', () => 'gym1.png');
jest.mock('../../renderer/images/gym2.png', () => 'gym2.png');

// Mock QuickActions
jest.mock('../../renderer/components/QuickActions', () => () => <div data-testid="quick-actions" />);

const mockPaiements = [
  { idPaiement: 1, adherentNom: 'Benali Youcef', montant: 3000, datePaiement: '2025-01-15' },
  { idPaiement: 2, adherentNom: 'Mammeri Sara',  montant: 5000, datePaiement: '2025-02-20' },
];
const mockProduits = [
  { idProduit: 1, nom: 'Protéines Whey', prix: 1500, stock: 10 },
  { idProduit: 2, nom: 'Gants de sport',  prix: 800,  stock: 5  },
];

beforeEach(() => {
  window.electron = {
    invoke: jest.fn((channel) => {
      if (channel === 'getPaiements') return Promise.resolve(mockPaiements);
      if (channel === 'getProduits')  return Promise.resolve(mockProduits);
      return Promise.resolve([]);
    }),
  };
});
afterEach(() => jest.clearAllMocks());

const renderPage = async () => {
  let result;
  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={['/recettes']}>
        <Routes><Route path="/recettes" element={<Recette />} /></Routes>
      </MemoryRouter>
    );
  });
  return result;
};

describe('PAGE : Recette.jsx', () => {

  // ── Afficher la page recettes ───────────────────────────────────────
  describe('Afficher la page recettes', () => {
    test('affiche le titre "Recettes"', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Recettes/i).length).toBeGreaterThan(0);
      });
    });

    test('affiche "Recette de la salle" et "Recette du magasin"', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Recette de la salle/i)).toBeInTheDocument();
        expect(screen.getByText(/Recette du magasin/i)).toBeInTheDocument();
      });
    });

    test('affiche le tableau des détails des recettes', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Détails des recettes/i)).toBeInTheDocument();
      });
    });

    test('affiche les lignes des paiements dans le tableau', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Benali Youcef/i)).toBeInTheDocument();
        expect(screen.getByText(/Mammeri Sara/i)).toBeInTheDocument();
      });
    });

    test('charge les données au montage', async () => {
      await renderPage();
      await waitFor(() => {
        expect(window.electron.invoke).toHaveBeenCalledWith('getPaiements');
        expect(window.electron.invoke).toHaveBeenCalledWith('getProduits');
      });
    });

    test('affiche le message d\'erreur si le chargement échoue', async () => {
      window.electron.invoke = jest.fn(() => Promise.reject(new Error('Erreur réseau')));
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Impossible de charger les recettes/i)).toBeInTheDocument();
      });
    });

    test('affiche le bouton Réessayer après erreur', async () => {
      window.electron.invoke = jest.fn(() => Promise.reject(new Error('Erreur réseau')));
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Réessayer/i)).toBeInTheDocument();
      });
    });
  });

  // ── Calcul total des recettes ───────────────────────────────────────
  describe('Calcul total des recettes', () => {
    test('calcule correctement le total des abonnements (3000 + 5000 = 8000)', async () => {
      await renderPage();
      await waitFor(() => {
        // "8 000" apparaît plusieurs fois dans le DOM
        expect(screen.getAllByText(/8 000/).length).toBeGreaterThan(0);
      });
    });

    test('affiche le total des recettes en bas de page', async () => {
      await renderPage();
      await waitFor(() => {
        // "Total des recettes" apparaît plusieurs fois dans le DOM
        expect(screen.getAllByText(/Total des recettes/i).length).toBeGreaterThan(0);
      });
    });

    test('affiche les badges "Abonnement" dans la colonne Catégorie', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText('Abonnement').length).toBeGreaterThan(0);
      });
    });

    test('affiche les badges "Vente" pour les produits du magasin', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText('Vente').length).toBeGreaterThan(0);
      });
    });
  });

  // ── Filtre par date ─────────────────────────────────────────────────
  describe('Filtre par date', () => {
    test('les champs "Date début" et "Date fin" sont présents', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Date début/i)).toBeInTheDocument();
        expect(screen.getByText(/Date fin/i)).toBeInTheDocument();
      });
    });

    test('le bouton "Filtrer" est présent', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText('Filtrer')).toBeInTheDocument();
      });
    });

    test('filtrer par date réduit les résultats affichés', async () => {
      await renderPage();
      await waitFor(() => screen.getByText(/Benali Youcef/i));
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
      fireEvent.click(screen.getByText('Filtrer'));
      await waitFor(() => {
        expect(screen.queryByText(/Benali Youcef/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Mammeri Sara/i)).toBeInTheDocument();
      });
    });

    test('le bouton "Réinitialiser" remet tous les résultats', async () => {
      await renderPage();
      await waitFor(() => screen.getByText(/Benali Youcef/i));
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
      fireEvent.click(screen.getByText('Filtrer'));
      await waitFor(() => screen.getByText(/Réinitialiser/i));
      fireEvent.click(screen.getByText(/Réinitialiser/i));
      await waitFor(() => {
        expect(screen.getByText(/Benali Youcef/i)).toBeInTheDocument();
      });
    });

    test('affiche "Aucune recette pour cette période" si filtre vide', async () => {
      await renderPage();
      await waitFor(() => screen.getByText('Filtrer'));
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2030-01-01' } });
      fireEvent.click(screen.getByText('Filtrer'));
      await waitFor(() => {
        expect(screen.getByText(/Aucune recette pour cette période/i)).toBeInTheDocument();
      });
    });
  });

  // ── Pagination ──────────────────────────────────────────────────────
  describe('Pagination', () => {
    test('les boutons Précédente / Suivante sont présents', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Précédente/i)).toBeInTheDocument();
        expect(screen.getByText(/Suivante/i)).toBeInTheDocument();
      });
    });

    test('le bouton Précédente est désactivé sur la page 1', async () => {
      await renderPage();
      await waitFor(() => {
        const prevBtn = screen.getByText(/Précédente/i);
        expect(prevBtn).toBeDisabled();
      });
    });
  });
});