import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NouvelAbonnementModal from '../../renderer/components/NouvelAbonnementModal';

// Mock de l'image background
jest.mock('../../images/backgroung.png', () => 'mocked-background.png');

// ─── Helpers ────────────────────────────────────────────────────────────────
const defaultProps = {
  member: { id: 1, nom: 'Dupont', prenom: 'Jean' },
  onSave: jest.fn(),
  onClose: jest.fn(),
};

const renderModal = (props = {}) =>
  render(<NouvelAbonnementModal {...defaultProps} {...props} />);

// ─── Réinitialiser les mocks entre chaque test ───────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL
// ════════════════════════════════════════════════════════════════════════════
describe('Rendu initial', () => {
  test('affiche le titre "Nouvel Abonnement"', () => {
    renderModal();
    expect(screen.getByText('Nouvel Abonnement')).toBeInTheDocument();
  });

  test('affiche la description du modal', () => {
    renderModal();
    expect(
      screen.getByText(/Créer un nouvel abonnement pour les membres de votre salle/i)
    ).toBeInTheDocument();
  });

  test('affiche les champs Type et Date de début', () => {
    renderModal();
    expect(screen.getByText(/Type d'abonnement/i)).toBeInTheDocument();
    expect(screen.getByText(/Date de début/i)).toBeInTheDocument();
  });

  test('affiche le champ Note', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/Ajouter une note/i)).toBeInTheDocument();
  });

  test('le select contient les 3 plans disponibles', () => {
    renderModal();
    expect(screen.getByText('Premium Annuel')).toBeInTheDocument();
    expect(screen.getByText('Standard Mensuel')).toBeInTheDocument();
    expect(screen.getByText('Basic Trimestriel')).toBeInTheDocument();
  });

  test('la date de début est initialisée à aujourd\'hui', () => {
    renderModal();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByDisplayValue(today);
    expect(dateInput).toBeInTheDocument();
  });

  test('les boutons Annuler et Créer sont présents', () => {
    renderModal();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText("Créer l'abonnement")).toBeInTheDocument();
  });

  test("le prix n'est pas affiché avant de sélectionner un plan", () => {
    renderModal();
    expect(screen.queryByText('DA')).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. SÉLECTION D'UN PLAN
// ════════════════════════════════════════════════════════════════════════════
describe('Sélection du plan', () => {
  test('affiche le prix quand "Premium Annuel" est sélectionné', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Premium Annuel');
    expect(screen.getByText('3 500')).toBeInTheDocument(); // prix formaté
    expect(screen.getByText('DA')).toBeInTheDocument();
  });

  test('affiche le prix quand "Standard Mensuel" est sélectionné', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Standard Mensuel');
    expect(screen.getByText('1 200')).toBeInTheDocument();
  });

  test('affiche le prix quand "Basic Trimestriel" est sélectionné', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Basic Trimestriel');
    expect(screen.getByText('2 000')).toBeInTheDocument();
  });

  test('calcule correctement la date de fin pour 1 mois (Standard Mensuel)', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Standard Mensuel');

    // La date de fin devrait être affichée
    const today = new Date();
    const fin = new Date(today);
    fin.setMonth(fin.getMonth() + 1);
    const finStr = fin.toLocaleDateString('fr-FR');
    expect(screen.getByText(`Fin : ${finStr}`)).toBeInTheDocument();
  });

  test('calcule correctement la date de fin pour 12 mois (Premium Annuel)', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Premium Annuel');

    const today = new Date();
    const fin = new Date(today);
    fin.setMonth(fin.getMonth() + 12);
    const finStr = fin.toLocaleDateString('fr-FR');
    expect(screen.getByText(`Fin : ${finStr}`)).toBeInTheDocument();
  });

  test('recalcule la date de fin si la date de début change', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Standard Mensuel');

    const dateInput = screen.getByDisplayValue(/.+/); // input date
    fireEvent.change(dateInput, { target: { value: '2025-03-01' } });

    const fin = new Date('2025-03-01');
    fin.setMonth(fin.getMonth() + 1);
    const finStr = fin.toLocaleDateString('fr-FR');
    expect(screen.getByText(`Fin : ${finStr}`)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. VALIDATION & SOUMISSION
// ════════════════════════════════════════════════════════════════════════════
describe('Validation et soumission', () => {
  test('affiche une alerte si aucun plan n\'est sélectionné', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal();
    await userEvent.click(screen.getByText("Créer l'abonnement"));
    expect(alertMock).toHaveBeenCalledWith("Veuillez sélectionner un type d'abonnement.");
    alertMock.mockRestore();
  });

  test('appelle onSave avec les bonnes données', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Standard Mensuel');

    const noteTA = screen.getByPlaceholderText(/Ajouter une note/i);
    await userEvent.type(noteTA, 'Paiement en espèces');

    await userEvent.click(screen.getByText("Créer l'abonnement"));

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'Standard Mensuel',
        prix: 1200,
        status: 'Actif',
        note: 'Paiement en espèces',
      })
    );
  });

  test('appelle onClose après une sauvegarde réussie', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Premium Annuel');
    await userEvent.click(screen.getByText("Créer l'abonnement"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('n\'appelle pas onSave si le plan est vide', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal();
    await userEvent.click(screen.getByText("Créer l'abonnement"));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
    window.alert.mockRestore();
  });

  test('le payload contient dateDebut et dateFin', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'Basic Trimestriel');
    await userEvent.click(screen.getByText("Créer l'abonnement"));

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        dateDebut: expect.any(String),
        dateFin: expect.any(String),
      })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. FERMETURE DU MODAL
// ════════════════════════════════════════════════════════════════════════════
describe('Fermeture du modal', () => {
  test('appelle onClose quand on clique sur "Annuler"', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose quand on clique sur le bouton ✕', async () => {
    renderModal();
    // Le bouton X contient un SVG, on le cible via son rôle ou son parent
    const closeBtn = screen.getAllByRole('button').find(
      btn => !btn.textContent.includes('Annuler') && !btn.textContent.includes('Créer')
    );
    await userEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose quand on clique sur l\'overlay (backdrop)', async () => {
    const { container } = renderModal();
    const overlay = container.firstChild; // le div fixed
    fireEvent.click(overlay, { target: overlay }); // simule click sur l'overlay lui-même
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('ne ferme PAS si on clique à l\'intérieur du modal', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Nouvel Abonnement'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. CHAMP NOTE
// ════════════════════════════════════════════════════════════════════════════
describe('Champ note', () => {
  test('permet de saisir une note', async () => {
    renderModal();
    const note = screen.getByPlaceholderText(/Ajouter une note/i);
    await userEvent.type(note, 'Client VIP');
    expect(note.value).toBe('Client VIP');
  });

  test('note vide par défaut', () => {
    renderModal();
    const note = screen.getByPlaceholderText(/Ajouter une note/i);
    expect(note.value).toBe('');
  });
});