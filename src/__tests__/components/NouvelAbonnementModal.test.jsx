import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NouvelTypeAbonnementModal from '../../renderer/components/NouvelTypeAbonnementModal';

// Mock de l'image background
jest.mock('../../images/background.png', () => 'mocked-background.png');

// ─── Mock window.api ─────────────────────────────────────────────────────────
const mockApi = {
  addTypeAbonnement: jest.fn().mockResolvedValue({ success: true }),
  updateTypeAbonnement: jest.fn().mockResolvedValue({ success: true }),
};

beforeAll(() => {
  Object.defineProperty(window, 'api', {
    value: mockApi,
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const defaultProps = {
  type: null,
  onSave: jest.fn(),
  onClose: jest.fn(),
};

const renderModal = (props = {}) =>
  render(<NouvelTypeAbonnementModal {...defaultProps} {...props} />);

const fillForm = async ({ nom = 'Standard Mensuel', duree = '1', prix = '1200' } = {}) => {
  if (nom) {
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.clear(nomInput);
    await userEvent.type(nomInput, nom);
  }
  if (duree) {
    const dureeSelect = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(dureeSelect, duree);
  }
  if (prix) {
    const prixInput = screen.getByPlaceholderText(/ex: 1290/i);
    await userEvent.clear(prixInput);
    await userEvent.type(prixInput, prix);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL (mode création)
// ════════════════════════════════════════════════════════════════════════════
describe('Rendu initial — mode création', () => {
  test('affiche le titre "Nouveau Type d\'Abonnement"', () => {
    renderModal();
    expect(screen.getByText(/Nouveau Type d'Abonnement/i)).toBeInTheDocument();
  });

  test('affiche la description en mode création', () => {
    renderModal();
    expect(
      screen.getByText(/Définissez un nouveau plan pour vos adhérents/i)
    ).toBeInTheDocument();
  });

  test('affiche les champs Nom, Durée et Prix', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/ex: Premium Mensuel/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ex: 1290/i)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument();
  });

  test('affiche les boutons Annuler et "Créer le plan"', () => {
    renderModal();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Créer le plan')).toBeInTheDocument();
  });

  test('affiche le panneau Aperçu à droite', () => {
    renderModal();
    expect(screen.getByText('Aperçu')).toBeInTheDocument();
  });

  test('affiche "Aucune règle sélectionnée" par défaut dans l\'aperçu', () => {
    renderModal();
    expect(screen.getByText('Aucune règle sélectionnée')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. RENDU EN MODE ÉDITION
// ════════════════════════════════════════════════════════════════════════════
describe('Mode édition', () => {
  const existingType = {
    id: 42,
    nom: 'Premium Trimestriel',
    duree: 3,
    prix: 4500,
    features: ['Accès salle de sport', 'Coaching personnalisé'],
  };

  test('affiche le titre "Modifier le Type"', () => {
    renderModal({ type: existingType });
    expect(screen.getByText('Modifier le Type')).toBeInTheDocument();
  });

  test('affiche le nom du type dans la description', () => {
    renderModal({ type: existingType });
    expect(screen.getByText(/Modification de : Premium Trimestriel/i)).toBeInTheDocument();
  });

  test('pré-remplit le nom', () => {
    renderModal({ type: existingType });
    expect(screen.getByDisplayValue('Premium Trimestriel')).toBeInTheDocument();
  });

  test('pré-remplit le prix', () => {
    renderModal({ type: existingType });
    expect(screen.getByDisplayValue('4500')).toBeInTheDocument();
  });

  test('affiche le bouton "Enregistrer les modifications"', () => {
    renderModal({ type: existingType });
    expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
  });

  test('pré-sélectionne les features existantes', () => {
    renderModal({ type: existingType });
    // Les features sélectionnées apparaissent dans l'aperçu
    expect(screen.getByText('Accès salle de sport')).toBeInTheDocument();
    expect(screen.getByText('Coaching personnalisé')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. TIER DETECTION (Standard vs Premium)
// ════════════════════════════════════════════════════════════════════════════
describe('Détection du tier', () => {
  test('règles suggérées Standard si le nom ne contient pas "premium"', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'Standard Mensuel');
    expect(screen.getByText('Accès salle de sport')).toBeInTheDocument();
    expect(screen.getByText('5 séances/semaine')).toBeInTheDocument();
  });

  test('règles suggérées Premium si le nom contient "premium" (insensible à la casse)', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'PREMIUM Annuel');
    expect(screen.getByText('Tout Standard +')).toBeInTheDocument();
    expect(screen.getByText('Coaching personnalisé')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. RÈGLES (toggle, personnalisées, suppression)
// ════════════════════════════════════════════════════════════════════════════
describe('Gestion des règles', () => {
  test('cliquer sur une règle suggérée l\'ajoute à l\'aperçu', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'Basic');

    // Cliquer sur la première règle Standard
    const rule = screen.getByText('Accès salle de sport');
    await userEvent.click(rule);

    // Elle doit apparaître dans l'aperçu (liste ul)
    const checkmarks = screen.getAllByText('Accès salle de sport');
    expect(checkmarks.length).toBeGreaterThan(1); // dans la liste ET dans l'aperçu
  });

  test('cliquer deux fois sur une règle la décoche', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'Basic');

    const rule = screen.getByText('Accès salle de sport');
    await userEvent.click(rule); // cocher
    await userEvent.click(rule); // décocher

    // L'aperçu revient à "Aucune règle"
    expect(screen.getByText('Aucune règle sélectionnée')).toBeInTheDocument();
  });

  test('ajouter une règle personnalisée via le bouton +', async () => {
    renderModal();
    const customInput = screen.getByPlaceholderText(/ex: Accès piscine/i);
    await userEvent.type(customInput, 'Accès sauna');
    await userEvent.click(screen.getByText('+'));

    expect(screen.getByText('Accès sauna')).toBeInTheDocument();
    expect(customInput.value).toBe(''); // champ vidé
  });

  test('ajouter une règle personnalisée via la touche Entrée', async () => {
    renderModal();
    const customInput = screen.getByPlaceholderText(/ex: Accès piscine/i);
    await userEvent.type(customInput, 'Parking inclus{Enter}');

    expect(screen.getByText('Parking inclus')).toBeInTheDocument();
  });

  test('une règle vide ne s\'ajoute pas', async () => {
    renderModal();
    await userEvent.click(screen.getByText('+'));
    // "Aucune règle sélectionnée" doit rester
    expect(screen.getByText('Aucune règle sélectionnée')).toBeInTheDocument();
  });

  test('la même règle ne peut pas être ajoutée deux fois', async () => {
    renderModal();
    const customInput = screen.getByPlaceholderText(/ex: Accès piscine/i);
    await userEvent.type(customInput, 'Doubloon');
    await userEvent.click(screen.getByText('+'));
    await userEvent.type(customInput, 'Doubloon');
    await userEvent.click(screen.getByText('+'));

    const doubloons = screen.getAllByText('Doubloon');
    // Apparaît dans l'aperçu une seule fois
    expect(doubloons.length).toBe(1);
  });

  test('supprimer une règle depuis l\'aperçu via le bouton ×', async () => {
    renderModal();
    const customInput = screen.getByPlaceholderText(/ex: Accès piscine/i);
    await userEvent.type(customInput, 'À supprimer');
    await userEvent.click(screen.getByText('+'));

    expect(screen.getByText('À supprimer')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: '×' });
    await userEvent.click(deleteBtn);

    expect(screen.queryByText('À supprimer')).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. VALIDATION
// ════════════════════════════════════════════════════════════════════════════
describe('Validation du formulaire', () => {
  test('affiche une erreur si le nom est vide', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
  });

  test('affiche une erreur si la durée est manquante', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'Basic');
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(screen.getByText('La durée est requise')).toBeInTheDocument();
  });

  test('affiche une erreur si le prix est invalide', async () => {
    renderModal();
    await fillForm({ nom: 'Basic', duree: '1', prix: '' });
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(screen.getByText('Prix invalide')).toBeInTheDocument();
  });

  test('affiche une erreur si le prix est à 0', async () => {
    renderModal();
    await fillForm({ nom: 'Basic', duree: '1', prix: '0' });
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(screen.getByText('Prix invalide')).toBeInTheDocument();
  });

  test('efface l\'erreur nom quand on commence à saisir', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument();

    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'x');
    expect(screen.queryByText('Le nom est requis')).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. APPELS API
// ════════════════════════════════════════════════════════════════════════════
describe('Appels API', () => {
  test('appelle addTypeAbonnement en mode création', async () => {
    renderModal();
    await fillForm({ nom: 'Standard Mensuel', duree: '1', prix: '1200' });
    await userEvent.click(screen.getByText('Créer le plan'));

    await waitFor(() => {
      expect(mockApi.addTypeAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: 'Standard Mensuel',
          duree: 1,
          prix: 1200,
        })
      );
    });
  });

  test('appelle updateTypeAbonnement en mode édition', async () => {
    const existingType = { id: 7, nom: 'Old Plan', duree: 3, prix: 2000, features: [] };
    renderModal({ type: existingType });

    const nomInput = screen.getByDisplayValue('Old Plan');
    await userEvent.clear(nomInput);
    await userEvent.type(nomInput, 'New Plan');

    await userEvent.click(screen.getByText('Enregistrer les modifications'));

    await waitFor(() => {
      expect(mockApi.updateTypeAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, nom: 'New Plan' })
      );
    });
  });

  test('appelle onSave après une sauvegarde réussie', async () => {
    renderModal();
    await fillForm({ nom: 'Standard', duree: '1', prix: '999' });
    await userEvent.click(screen.getByText('Créer le plan'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  test('le payload contient les features sélectionnées', async () => {
    renderModal();
    await fillForm({ nom: 'Basic', duree: '1', prix: '800' });

    // Sélectionner une règle suggérée
    await userEvent.click(screen.getByText('Accès salle de sport'));

    await userEvent.click(screen.getByText('Créer le plan'));

    await waitFor(() => {
      expect(mockApi.addTypeAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({
          features: expect.arrayContaining(['Accès salle de sport']),
        })
      );
    });
  });

  test('affiche une alerte en cas d\'erreur API', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockApi.addTypeAbonnement.mockRejectedValueOnce(new Error('Serveur indisponible'));

    renderModal();
    await fillForm({ nom: 'Plan Test', duree: '1', prix: '500' });
    await userEvent.click(screen.getByText('Créer le plan'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Erreur : Serveur indisponible');
    });
    alertMock.mockRestore();
  });

  test('n\'appelle pas l\'API si la validation échoue', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Créer le plan'));
    expect(mockApi.addTypeAbonnement).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. APERÇU EN TEMPS RÉEL
// ════════════════════════════════════════════════════════════════════════════
describe('Aperçu en temps réel', () => {
  test('affiche "— DA" quand le prix est vide', () => {
    renderModal();
    expect(screen.getByText('— DA')).toBeInTheDocument();
  });

  test('affiche le nom saisi dans l\'aperçu', async () => {
    renderModal();
    const nomInput = screen.getByPlaceholderText(/ex: Premium Mensuel/i);
    await userEvent.type(nomInput, 'Mon Super Plan');
    expect(screen.getByText('Mon Super Plan')).toBeInTheDocument();
  });

  test('affiche la durée sélectionnée dans l\'aperçu', async () => {
    renderModal();
    const dureeSelect = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(dureeSelect, '6');
    expect(screen.getAllByText('6 mois').length).toBeGreaterThan(0);
  });

  test('affiche le badge ACTIF dans l\'aperçu', () => {
    renderModal();
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. FERMETURE DU MODAL
// ════════════════════════════════════════════════════════════════════════════
describe('Fermeture du modal', () => {
  test('appelle onClose sur clic "Annuler"', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose sur clic du bouton ✕', async () => {
    renderModal();
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(
      btn => !['Annuler', 'Créer le plan', 'Enregistrer les modifications', '+'].includes(btn.textContent.trim())
    );
    await userEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('ne ferme pas si on clique dans le body du modal', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Informations du plan'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});