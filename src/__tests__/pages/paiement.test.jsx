import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Paiement from '../../renderer/pages/paiment';

// Mock images
jest.mock('../../renderer/images/gym.png',  () => 'gym.png');
jest.mock('../../renderer/images/gym2.png', () => 'gym2.png');

// Mock NouveauPaiementModal
jest.mock('../../renderer/components/NouveauPaiementModal', () => ({ onClose, onSave }) => (
  <div data-testid="paiement-modal">
    <button onClick={onClose}>Fermer Modal</button>
    <button onClick={() => onSave({ abonnement_id: 1, montant: 3000, mode: 'Espèces', date: '2025-01-15' })}>
      Confirmer
    </button>
  </div>
));

const mockPaiements = [
  { id: 1, nom: 'BENALI Youcef',  montant: 3000, date: '2025-01-15', mode: 'Espèces',       statut: 'Payé'       },
  { id: 2, nom: 'MAMMERI Sara',   montant: 5000, date: '2025-02-01', mode: 'Carte bancaire', statut: 'En attente' },
  { id: 3, nom: 'AMRANI Karim',   montant: 2000, date: '2025-01-20', mode: 'Virement',       statut: 'En retard'  },
];

beforeEach(() => {
  window.api = {
    getPaiements: jest.fn(() => Promise.resolve(mockPaiements)),
    addPaiement:  jest.fn(() => Promise.resolve({ success: true })),
  };
});

afterEach(() => jest.clearAllMocks());

const renderPage = async (search = '') => {
  let result;
  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={[`/paiements${search}`]}>
        <Routes>
          <Route path="/paiements" element={<Paiement />} />
        </Routes>
      </MemoryRouter>
    );
  });
  return result;
};

describe('PAGE : Paiement.jsx', () => {

  // ── Afficher la page paiements ──────────────────────────────────────
  describe('Afficher la page paiements', () => {
    test('affiche le titre "Gestion financière"', async () => {
      await renderPage();
      expect(screen.getByText(/Gestion financière/i)).toBeInTheDocument();
    });

    test('affiche les 3 StatCards (Encaissés / En attente / En retard)', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Revenus encaissés/i)).toBeInTheDocument();
        // "En attente" et "En retard" apparaissent plusieurs fois (badge + StatCard)
        expect(screen.getAllByText(/En attente/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/En retard/i).length).toBeGreaterThan(0);
      });
    });

    test('affiche la liste des paiements chargés depuis l\'API', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
        expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
        expect(screen.getByText(/AMRANI Karim/i)).toBeInTheDocument();
      });
    });

    test('calcule correctement le total encaissé', async () => {
      await renderPage();
      await waitFor(() => {
        // Le montant peut être éclaté dans plusieurs balises
        expect(document.body.textContent).toMatch(/3[\s.]?000\s*DA/);
      });
    });

    test('affiche le champ de recherche', async () => {
      await renderPage();
      expect(screen.getByPlaceholderText(/Rechercher un adhérent/i)).toBeInTheDocument();
    });

    test('affiche le bouton "Nouveau Paiement"', async () => {
      await renderPage();
      expect(screen.getByText(/Nouveau Paiement/i)).toBeInTheDocument();
    });

    test('appelle getPaiements au montage', async () => {
      await renderPage();
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(1);
      });
    });

    test('affiche "Aucun paiement trouvé" si la liste est vide', async () => {
      window.api.getPaiements = jest.fn(() => Promise.resolve([]));
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
      });
    });
  });

  // ── Enregistrer un nouveau paiement ────────────────────────────────
  describe('Enregistrer un nouveau paiement', () => {
    test('ouvre le modal au clic sur "Nouveau Paiement"', async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      expect(screen.getByTestId('paiement-modal')).toBeInTheDocument();
    });

    test('ouvre le modal si ?openModal=true dans l\'URL', async () => {
      await renderPage('?openModal=true');
      await waitFor(() => {
        expect(screen.getByTestId('paiement-modal')).toBeInTheDocument();
      });
    });

    test('ferme le modal après confirmation réussie', async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText('Confirmer'));
      await waitFor(() => {
        expect(screen.queryByTestId('paiement-modal')).not.toBeInTheDocument();
      });
    });

    test('appelle addPaiement avec les bonnes données', async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText('Confirmer'));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalledWith(
          expect.objectContaining({ abonnement_id: 1, montant: 3000 })
        );
      });
    });

    test('ferme le modal sans sauvegarder au clic sur "Fermer Modal"', async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText('Fermer Modal'));
      expect(screen.queryByTestId('paiement-modal')).not.toBeInTheDocument();
      expect(window.api.addPaiement).not.toHaveBeenCalled();
    });

    test('actualise la liste après ajout d\'un paiement', async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText('Confirmer'));
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(2);
      });
    });

    test('affiche une alerte si addPaiement retourne une erreur', async () => {
      window.api.addPaiement = jest.fn(() => Promise.resolve({ success: false, error: 'Erreur BDD' }));
      window.alert = jest.fn();
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText('Confirmer'));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Erreur BDD'));
      });
    });
  });

  // ── Statuts et méthodes ─────────────────────────────────────────────
  describe('Statuts et méthodes de paiement', () => {
    test('affiche les badges de statut correctement', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText('Payé')).toBeInTheDocument();
        expect(screen.getAllByText('En attente').length).toBeGreaterThan(0);
        expect(screen.getAllByText('En retard').length).toBeGreaterThan(0);
      });
    });

    test('affiche les méthodes de paiement', async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText('Espèces')).toBeInTheDocument();
        expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
        expect(screen.getByText('Virement')).toBeInTheDocument();
      });
    });
  });

  // ── Recherche ───────────────────────────────────────────────────────
  describe('Recherche', () => {
    test('filtre les paiements par nom', async () => {
      await renderPage();
      await waitFor(() => screen.getByText(/BENALI Youcef/i));
      const searchInput = screen.getByPlaceholderText(/Rechercher un adhérent/i);
      fireEvent.change(searchInput, { target: { value: 'Mammeri' } });
      expect(screen.queryByText(/BENALI Youcef/i)).not.toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test('filtre par ID de paiement', async () => {
      await renderPage();
      await waitFor(() => screen.getByText(/BENALI Youcef/i));
      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), { target: { value: '2' } });
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test('affiche "Aucun paiement trouvé" si la recherche ne correspond à rien', async () => {
      await renderPage();
      await waitFor(() => screen.getByText(/BENALI Youcef/i));
      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), { target: { value: 'zzz' } });
      expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
    });
  });
});
