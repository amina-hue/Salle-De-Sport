import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NouveauProduitModal from '../../renderer/components/NouveauProduitModal';

describe('NouveauProduitModal', () => {

  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('affiche le titre Nouveau Produit', () => {
    render(<NouveauProduitModal onSave={mockOnSave} onClose={mockOnClose} />);
    expect(screen.getByText(/Nouveau Produit/i)).toBeInTheDocument();
  });

  test('affiche une alerte si champs vides', () => {
    global.alert = jest.fn();
    render(<NouveauProduitModal onSave={mockOnSave} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter le produit/i }));
    expect(global.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires.');
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('ferme la modal au clic sur Annuler', () => {
    render(<NouveauProduitModal onSave={mockOnSave} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

});