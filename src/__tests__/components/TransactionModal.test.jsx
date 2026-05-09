import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionModal from '../../renderer/components/TransactionModal';

const mockProduit = {
  idProduit: 1,
  nom: 'Protéines Whey',
  stock: 20,
  prix: 2500,
};

describe('TransactionModal Component', () => {

  // ── Type Vente ──────────────────────────────────────────────────────
  describe('Type Vente', () => {
    test('affiche "Vente produit" comme titre', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Vente produit/i)).toBeInTheDocument();
    });

    test('affiche le nom du produit', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText('Protéines Whey')).toBeInTheDocument();
    });

    test('n\'affiche pas le champ "Prix d\'achat" pour une vente', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.queryByText(/Prix d'achat/i)).not.toBeInTheDocument();
    });

    test('affiche le stock actuel', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Stock actuel/i)).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    test('affiche le stock après saisie d\'une quantité', () => {
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      const qtyInput = screen.getByPlaceholderText(/ex: 5/i);
      fireEvent.change(qtyInput, { target: { value: '3' } });
      expect(screen.getByText('17')).toBeInTheDocument(); // 20 - 3
    });

    test('alerte si quantité invalide (0)', () => {
      window.alert = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.click(screen.getByText('Vendre'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Quantité invalide'));
    });

    test('alerte si quantité dépasse le stock', () => {
      window.alert = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '99' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(window.alert).toHaveBeenCalledWith('Stock insuffisant !');
    });

    test('appelle onConfirm avec les bonnes données', () => {
      const mockConfirm = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={() => {}} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(mockConfirm).toHaveBeenCalledWith({
        produit_id: mockProduit.idProduit,
        quantite: 5,
        prix: null,
        type: 'vente',
      });
    });

    test('appelle onClose après confirmation réussie', () => {
      const mockClose = jest.fn();
      const mockConfirm = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '2' } });
      fireEvent.click(screen.getByText('Vendre'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Type Achat ──────────────────────────────────────────────────────
  describe('Type Achat', () => {
    test('affiche "Achat produit" comme titre', () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Achat produit/i)).toBeInTheDocument();
    });

    test('affiche le champ "Prix d\'achat" pour un achat', () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      expect(screen.getByText(/Prix d'achat/i)).toBeInTheDocument();
    });

    test('affiche le stock après ajout d\'une quantité', () => {
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '10' } });
      expect(screen.getByText('30')).toBeInTheDocument(); // 20 + 10
    });

    test('alerte si prix d\'achat invalide', () => {
      window.alert = jest.fn();
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Acheter'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Prix d\'achat invalide'));
    });

    test('appelle onConfirm avec prix d\'achat', () => {
      const mockConfirm = jest.fn();
      render(<TransactionModal type="achat" produit={mockProduit} onClose={() => {}} onConfirm={mockConfirm} />);
      fireEvent.change(screen.getByPlaceholderText(/ex: 5/i),    { target: { value: '5' } });
      fireEvent.change(screen.getByPlaceholderText(/ex: 3000/i), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Acheter'));
      expect(mockConfirm).toHaveBeenCalledWith({
        produit_id: mockProduit.idProduit,
        quantite: 5,
        prix: 2000,
        type: 'achat',
      });
    });
  });

  // ── Fermeture du modal ──────────────────────────────────────────────
  describe('Fermeture du modal', () => {
    test('appelle onClose au clic sur Annuler', () => {
      const mockClose = jest.fn();
      render(<TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={() => {}} />);
      fireEvent.click(screen.getByText('Annuler'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test('appelle onClose au clic sur l\'overlay', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <TransactionModal type="vente" produit={mockProduit} onClose={mockClose} onConfirm={() => {}} />
      );
      const overlay = container.firstChild;
      fireEvent.click(overlay);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });
});