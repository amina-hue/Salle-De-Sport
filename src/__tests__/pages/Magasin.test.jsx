import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ──────────────────────────────────────────────────────
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../renderer/components/QuickActions', () => () => (
  <div data-testid="quick-actions" />
));

const mockProduits = [
  { idProduit: 1, nom: 'Haltères 10kg',  reference: 'ALG001', categorie: 'Musculation', stock: 15, prix: 6000  },
  { idProduit: 2, nom: 'Vélo cardio',    reference: 'ALG002', categorie: 'Cardio',      stock: 3,  prix: 45000 },
  { idProduit: 3, nom: 'Corde à sauter', reference: 'ALG003', categorie: 'Accessoire',  stock: 20, prix: 500   },
];

beforeEach(() => {
  window.api = {
    getProduits:       jest.fn().mockResolvedValue(mockProduits),
    addProduit:        jest.fn().mockResolvedValue({ success: true }),
    updateProduit:     jest.fn().mockResolvedValue({ success: true }),
    deleteProduit:     jest.fn().mockResolvedValue({ success: true }),
    addTransaction:    jest.fn().mockResolvedValue({ success: true }),
    getAdherents:      jest.fn().mockResolvedValue([]),
    getAdherentNiveau: jest.fn().mockResolvedValue({ remise: 0 }),
  };
  window.confirm = jest.fn().mockReturnValue(true);
});

afterEach(() => jest.clearAllMocks());

import Magasin from '../../renderer/pages/Magasin';

// ── Tests ──────────────────────────────────────────────────────
describe('Page Magasin', () => {

  test('affiche le titre Magasin', async () => {
    render(<Magasin />);
    await waitFor(() => {
      expect(screen.getAllByText(/magasin/i).length).toBeGreaterThan(0);
    });
  });

  test('charge et affiche les produits depuis window.api', async () => {
    render(<Magasin />);
    await waitFor(() => {
      expect(window.api.getProduits).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Haltères 10kg')).toBeInTheDocument();
      expect(screen.getByText('Vélo cardio')).toBeInTheDocument();
      expect(screen.getByText('Corde à sauter')).toBeInTheDocument();
    });
  });

  test('affiche le badge stock faible quand stock ≤ 5', async () => {
    render(<Magasin />);
    await waitFor(() => {
      expect(screen.getAllByText(/faible/i).length).toBeGreaterThan(0);
    });
  });

  test('la barre de recherche filtre les produits', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/rechercher/i), {
      target: { value: 'vélo' },
    });

    await waitFor(() => {
      expect(screen.getByText('Vélo cardio')).toBeInTheDocument();
      expect(screen.queryByText('Haltères 10kg')).not.toBeInTheDocument();
    });
  });

  test('le filtre Cardio affiche seulement les produits Cardio', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^cardio$/i }));

    await waitFor(() => {
      expect(screen.getByText('Vélo cardio')).toBeInTheDocument();
      expect(screen.queryByText('Haltères 10kg')).not.toBeInTheDocument();
    });
  });

  test('le bouton Tous réaffiche tous les produits', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^cardio$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^tous$/i }));

    await waitFor(() => {
      expect(screen.getByText('Haltères 10kg')).toBeInTheDocument();
      expect(screen.getByText('Vélo cardio')).toBeInTheDocument();
    });
  });

  test('ouvre le modal Nouveau Produit au clic sur Ajouter', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /ajouter un produit/i }));

    await waitFor(() => {
      expect(screen.getByText(/nouveau produit/i)).toBeInTheDocument();
    });
  });

  test('ferme le modal Nouveau Produit au clic sur Annuler', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /ajouter un produit/i }));
    await waitFor(() => expect(screen.getByText(/nouveau produit/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

    await waitFor(() => {
      expect(screen.queryByText(/nouveau produit/i)).not.toBeInTheDocument();
    });
  });

  test('appelle window.api.deleteProduit après confirmation', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    const deleteButtons = screen.getAllByTitle(/supprimer/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(window.api.deleteProduit).toHaveBeenCalled();
    });
  });

  test('ne supprime pas si confirmation refusée', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getAllByTitle(/supprimer/i)[0]);

    expect(window.api.deleteProduit).not.toHaveBeenCalled();
  });

  test('ouvre le modal TransactionModal Vente au clic sur −', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getAllByTitle(/vendre/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/vente produit/i)).toBeInTheDocument();
    });
  });

  test('ouvre le modal TransactionModal Achat au clic sur +', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.click(screen.getAllByTitle(/achat/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/achat stock/i)).toBeInTheDocument();
    });
  });

  test('affiche le QuickActions', async () => {
    render(<Magasin />);
    await waitFor(() => {
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucun produit trouvé lors de la recherche', async () => {
    render(<Magasin />);
    await waitFor(() => expect(screen.getByText('Haltères 10kg')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/rechercher/i), {
      target: { value: 'produit inexistant xyz' },
    });

    await waitFor(() => {
      expect(screen.getByText(/aucun produit trouvé/i)).toBeInTheDocument();
    });
  });
});