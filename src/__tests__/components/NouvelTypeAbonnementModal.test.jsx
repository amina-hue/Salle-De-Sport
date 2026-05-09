import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ──────────────────────────────────────────────────────
beforeEach(() => {
  window.api = {
    addTypeAbonnement:    jest.fn().mockResolvedValue({ success: true }),
    updateTypeAbonnement: jest.fn().mockResolvedValue({ success: true }),
  };
});

afterEach(() => jest.clearAllMocks());

import NouvelTypeAbonnementModal from '../../renderer/components/NouvelTypeAbonnementModal';

// ── Tests ──────────────────────────────────────────────────────
describe('Modal NouvelTypeAbonnement', () => {

  // ── Rendu de base ──
  test('affiche le titre Nouveau Type d\'Abonnement', () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    expect(screen.getByText(/nouveau type d'abonnement/i)).toBeInTheDocument();
  });

  test('affiche le titre Modifier le Type quand type est fourni', () => {
    const type = { id: 1, nom: 'Premium', duree: 1, prix: 2000, features: [] };
    render(<NouvelTypeAbonnementModal type={type} onClose={jest.fn()} onSave={jest.fn()} />);
    expect(screen.getByText(/modifier le type/i)).toBeInTheDocument();
  });

  test('affiche les champs Nom, Durée et Prix', () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    expect(screen.getByPlaceholderText(/premium mensuel/i)).toBeInTheDocument();
    expect(screen.getByText(/durée/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/1290/i)).toBeInTheDocument();
  });

  test('affiche l\'aperçu en temps réel quand on saisit le nom', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/premium mensuel/i), {
      target: { value: 'Standard Mensuel' },
    });
    await waitFor(() => {
      expect(screen.getByText('Standard Mensuel')).toBeInTheDocument();
    });
  });

  test('détecte le tier Premium via le nom', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/premium mensuel/i), {
      target: { value: 'Premium Annuel' },
    });
    await waitFor(() => {
      expect(screen.getAllByText(/premium/i).length).toBeGreaterThan(1);
    });
  });

  // ── Validation ──
  test('affiche des erreurs si les champs obligatoires sont vides', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /créer le plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
    });
  });

  test('affiche une erreur si la durée est manquante', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/premium mensuel/i), { target: { value: 'Standard' } });
    fireEvent.change(screen.getByPlaceholderText(/1290/i), { target: { value: '1500' } });

    fireEvent.click(screen.getByRole('button', { name: /créer le plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/la durée est requise/i)).toBeInTheDocument();
    });
  });

  test('affiche une erreur si le prix est invalide', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/premium mensuel/i), { target: { value: 'Standard' } });
    fireEvent.change(screen.getByPlaceholderText(/1290/i), { target: { value: '-50' } });
    // Sélectionner la durée
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /créer le plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/prix invalide/i)).toBeInTheDocument();
    });
  });

  // ── Sélection des règles ──
  test('les règles suggérées Standard sont affichées', () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    expect(screen.getByText('Accès salle de sport')).toBeInTheDocument();
    expect(screen.getByText('Vestiaires & douches')).toBeInTheDocument();
  });

  test('cliquer sur une règle la sélectionne', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    const regle = screen.getByText('Accès salle de sport');
    fireEvent.click(regle);
    await waitFor(() => {
      // La règle apparaît dans l'aperçu (liste ul)
      const items = screen.getAllByText('Accès salle de sport');
      expect(items.length).toBeGreaterThan(1);
    });
  });

  test('on peut ajouter une règle personnalisée', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/accès piscine/i), {
      target: { value: 'Accès sauna' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^\+$/ }));
    await waitFor(() => {
      expect(screen.getAllByText('Accès sauna').length).toBeGreaterThan(0);
    });
  });

  test('Entrée sur le champ règle personnalisée ajoute la règle', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/accès piscine/i), {
      target: { value: 'Massage inclus' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText(/accès piscine/i), { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getAllByText('Massage inclus').length).toBeGreaterThan(0);
    });
  });

  // ── Sauvegarde ──
  test('appelle window.api.addTypeAbonnement avec les bonnes données', async () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/premium mensuel/i), { target: { value: 'Standard Mensuel' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/1290/i), { target: { value: '2000' } });

    fireEvent.click(screen.getByRole('button', { name: /créer le plan/i }));

    await waitFor(() => {
      expect(window.api.addTypeAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({ nom: 'Standard Mensuel', duree: 1, prix: 2000 })
      );
    });
  });

  test('appelle window.api.updateTypeAbonnement en mode édition', async () => {
    const type = { id: 5, nom: 'Premium', duree: 3, prix: 5000, features: [] };
    render(<NouvelTypeAbonnementModal type={type} onClose={jest.fn()} onSave={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /enregistrer les modifications/i }));

    await waitFor(() => {
      expect(window.api.updateTypeAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, nom: 'Premium', duree: 3, prix: 5000 })
      );
    });
  });

  // ── Fermeture ──
  test('appelle onClose au clic sur Annuler', () => {
    const mockClose = jest.fn();
    render(<NouvelTypeAbonnementModal onClose={mockClose} onSave={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose au clic sur le fond du modal', () => {
    const mockClose = jest.fn();
    const { container } = render(<NouvelTypeAbonnementModal onClose={mockClose} onSave={jest.fn()} />);
    fireEvent.click(container.firstChild);
    expect(mockClose).toHaveBeenCalled();
  });

  test('les durées disponibles sont 1, 3, 6, 12 mois', () => {
    render(<NouvelTypeAbonnementModal onClose={jest.fn()} onSave={jest.fn()} />);
    expect(screen.getByText('1 mois')).toBeInTheDocument();
    expect(screen.getByText('3 mois')).toBeInTheDocument();
    expect(screen.getByText('6 mois')).toBeInTheDocument();
    expect(screen.getByText('12 mois')).toBeInTheDocument();
  });
});