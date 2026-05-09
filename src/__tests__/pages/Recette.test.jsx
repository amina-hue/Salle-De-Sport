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

const mockPaiements = [
  { id: 1, nom: 'Benali Sara',  montant: 3000, statut: 'Payé',     datePaiementRaw: '2024-01-15' },
  { id: 2, nom: 'Meziane Ali', montant: 1500, statut: 'En attente', datePaiementRaw: '2024-01-20' },
];
const mockVentes = [
  { id: 1, produit_nom: 'Haltères 10kg', prix_vente: 6000, date: '2024-01-10' },
];
const mockSeances = [
  { id: 1, note: 'Séance libre matin', montant: 500, date: '2024-01-12' },
];

beforeEach(() => {
  window.electron = {
    invoke: jest.fn((channel) => {
      if (channel === 'getPaiements')        return Promise.resolve(mockPaiements);
      if (channel === 'getHistoriqueVentes') return Promise.resolve(mockVentes);
      return Promise.resolve([]);
    }),
  };
  window.api = {
    getSeancesLibres: jest.fn().mockResolvedValue(mockSeances),
  };
});

afterEach(() => jest.clearAllMocks());

import Recette from '../../renderer/pages/Recette';

// ── Tests ──────────────────────────────────────────────────────
describe('Page Recette', () => {

  test('affiche le titre Recettes', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getAllByText(/recettes/i).length).toBeGreaterThan(0);
    });
  });

  test('affiche le message de chargement initialement', () => {
    render(<Recette />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  test('charge les données depuis les APIs', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(window.electron.invoke).toHaveBeenCalledWith('getPaiements');
      expect(window.electron.invoke).toHaveBeenCalledWith('getHistoriqueVentes');
      expect(window.api.getSeancesLibres).toHaveBeenCalled();
    });
  });

  test('affiche les totaux des recettes après chargement', async () => {
    render(<Recette />);
    await waitFor(() => {
      // Total = abonnements(3000) + ventes(6000) + séances(500) = 9500
      expect(screen.getAllByText(/9\s?500|9\.500/i).length).toBeGreaterThan(0);
    });
  });

  test('affiche la section Recette de la salle (abonnements payés)', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByText(/recette de la salle/i)).toBeInTheDocument();
    });
  });

  test('affiche la section Recette du magasin (ventes)', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByText(/recette du magasin/i)).toBeInTheDocument();
    });
  });

  test('affiche la section Séances libres', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByText(/séances libres/i)).toBeInTheDocument();
    });
  });

  test('le bouton Filtrer est présent', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /filtrer/i })).toBeInTheDocument();
    });
  });

  test('affiche une erreur si les dates sont invalides', async () => {
    render(<Recette />);
    await waitFor(() => expect(screen.getByRole('button', { name: /filtrer/i })).toBeInTheDocument());

    // Renseigner une date de début après la date de fin
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-12-01' } });
    fireEvent.change(inputs[1], { target: { value: '2024-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /filtrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/date de début doit être antérieure/i)).toBeInTheDocument();
    });
  });

  test('affiche le bouton Réinitialiser après saisie de dates', async () => {
    render(<Recette />);
    await waitFor(() => expect(screen.getByRole('button', { name: /filtrer/i })).toBeInTheDocument());

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-01-01' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
    });
  });

  test('le bouton Réinitialiser efface les dates', async () => {
    render(<Recette />);
    await waitFor(() => expect(screen.getByRole('button', { name: /filtrer/i })).toBeInTheDocument());

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-01-01' } });

    await waitFor(() => expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /réinitialiser/i })).not.toBeInTheDocument();
    });
  });

  test('affiche le footer avec les totaux ventilés', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByText(/abonnements/i)).toBeInTheDocument();
      expect(screen.getByText(/magasin/i)).toBeInTheDocument();
    });
  });

  test('affiche le QuickActions', async () => {
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });
  });

  test('affiche un message d\'erreur si l\'API échoue', async () => {
    window.electron.invoke = jest.fn().mockRejectedValue(new Error('Erreur réseau'));
    render(<Recette />);
    await waitFor(() => {
      expect(screen.getByText(/impossible de charger/i)).toBeInTheDocument();
    });
  });

  test('le bouton Réessayer recharge les données', async () => {
    window.electron.invoke = jest.fn().mockRejectedValue(new Error('fail'));
    render(<Recette />);
    await waitFor(() => expect(screen.getByText(/impossible de charger/i)).toBeInTheDocument());

    // Rétablir l'API
    window.electron.invoke = jest.fn((channel) => {
      if (channel === 'getPaiements')        return Promise.resolve(mockPaiements);
      if (channel === 'getHistoriqueVentes') return Promise.resolve(mockVentes);
      return Promise.resolve([]);
    });

    fireEvent.click(screen.getByRole('button', { name: /réessayer/i }));
    await waitFor(() => {
      expect(screen.getByText(/recette de la salle/i)).toBeInTheDocument();
    });
  });
});