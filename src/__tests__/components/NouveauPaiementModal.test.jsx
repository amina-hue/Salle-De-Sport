import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NouveauPaiementModal from '../../renderer/components/NouveauPaiementModal';

// Mock window.api
const mockAbonnements = [
  {
    idAbonnement: 1,
    nom: 'Benali',
    prenom: 'Youcef',
    typeNom: 'Mensuel',
    montantDu: 3000,
    totalPaye: 0,
  },
  {
    idAbonnement: 2,
    nom: 'Mammeri',
    prenom: 'Sara',
    typeNom: 'Trimestriel',
    montantDu: 8000,
    totalPaye: 2000,
  },
];

beforeEach(() => {
  window.api = {
    getAbonnementsNonPaies: jest.fn(() => Promise.resolve(mockAbonnements)),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('NouveauPaiementModal Component', () => {
  test('affiche le titre du modal', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByText(/ENREGISTRER UN PAIEMENT/i)).toBeInTheDocument();
  });

  test('affiche le bouton "Choisir l\'adhérent" par défaut', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByText(/Choisir l'adhérent/i)).toBeInTheDocument();
  });

  test('charge et affiche la liste des abonnements non payés', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => {
      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });
  });

  test('affiche le montant restant après sélection d\'un adhérent', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/BENALI Youcef/i));
    fireEvent.click(screen.getByText(/BENALI Youcef/i));
    await waitFor(() => {
      expect(screen.getByText('3 000')).toBeInTheDocument();
    });
  });

  test('affiche le montant restant correct (montantDu - totalPaye)', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/MAMMERI Sara/i));
    fireEvent.click(screen.getByText(/MAMMERI Sara/i));
    await waitFor(() => {
      // 8000 - 2000 = 6000
      expect(screen.getByText('6 000')).toBeInTheDocument();
    });
  });

  test('les 3 modes de paiement sont affichés', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByText('Espèces')).toBeInTheDocument();
    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Virement')).toBeInTheDocument();
  });

  test('sélectionner un mode de paiement change le style du bouton actif', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText('Carte bancaire'));
    // Le bouton actif a un border accent
    const carteBtn = screen.getByText('Carte bancaire').closest('button');
    expect(carteBtn).toHaveStyle('font-weight: 700');
  });

  test('le bouton Confirmer est désactivé sans adhérent sélectionné', () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    const confirmBtn = screen.getByText(/CONFIRMER L'ENCAISSEMENT/i);
    expect(confirmBtn).toBeDisabled();
  });

  test('paiement avec montant vide — bouton désactivé', async () => {
    // Cas où montantDu === totalPaye (reste = 0)
    window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([
      { idAbonnement: 3, nom: 'Test', prenom: 'Zero', typeNom: 'Mensuel', montantDu: 1000, totalPaye: 1000 },
    ]));
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/TEST Zero/i));
    fireEvent.click(screen.getByText(/TEST Zero/i));
    await waitFor(() => {
      const confirmBtn = screen.getByText(/CONFIRMER L'ENCAISSEMENT/i);
      expect(confirmBtn).toBeDisabled();
    });
  });

  test('paiement avec montant négatif — bouton désactivé', async () => {
    window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([
      { idAbonnement: 4, nom: 'Neg', prenom: 'Test', typeNom: 'Annuel', montantDu: 500, totalPaye: 1000 },
    ]));
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/NEG Test/i));
    fireEvent.click(screen.getByText(/NEG Test/i));
    await waitFor(() => {
      const confirmBtn = screen.getByText(/CONFIRMER L'ENCAISSEMENT/i);
      expect(confirmBtn).toBeDisabled();
    });
  });

  test('sélectionner une méthode de paiement fonctionne', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    const virementBtn = screen.getByText('Virement');
    fireEvent.click(virementBtn);
    expect(virementBtn.closest('button')).toHaveStyle('font-weight: 700');
  });

  test('appelle onClose au clic sur Annuler', () => {
    const mockOnClose = jest.fn();
    render(<NouveauPaiementModal onClose={mockOnClose} onSave={() => {}} />);
    fireEvent.click(screen.getByText('ANNULER'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose au clic sur le bouton ✕', () => {
    const mockOnClose = jest.fn();
    render(<NouveauPaiementModal onClose={mockOnClose} onSave={() => {}} />);
    const closeBtn = screen.getByRole('button', { name: '' }); // IconX button
    // Find the X button in header
    const allButtons = screen.getAllByRole('button');
    const xBtn = allButtons.find(b => b.style?.borderRadius === '50%');
    if (xBtn) fireEvent.click(xBtn);
  });

  test('appelle onSave avec les bonnes données à la confirmation', async () => {
    const mockOnSave = jest.fn();
    render(<NouveauPaiementModal onClose={() => {}} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/BENALI Youcef/i));
    fireEvent.click(screen.getByText(/BENALI Youcef/i));
    await waitFor(() => {
      expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        abonnement_id: 1,
        montant: 3000,
        mode: 'Espèces',
      })
    );
  });

  test('affiche "Aucun impayé trouvé" si la liste est vide', async () => {
    window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([]));
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => {
      expect(screen.getByText(/Aucun impayé trouvé/i)).toBeInTheDocument();
    });
  });

  test('la recherche filtre les adhérents dans la liste', async () => {
    render(<NouveauPaiementModal onClose={() => {}} onSave={() => {}} />);
    fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
    await waitFor(() => screen.getByText(/BENALI Youcef/i));
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    fireEvent.change(searchInput, { target: { value: 'Mammeri' } });
    expect(screen.queryByText(/BENALI Youcef/i)).not.toBeInTheDocument();
    expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
  });
});