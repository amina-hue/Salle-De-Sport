import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../images/gym.png', () => 'gym.png');

const mockApi = {
  updateAbonnement: jest.fn(),
  addAbonnement:    jest.fn(),
  addPaiement:      jest.fn(),
};

beforeEach(() => {
  window.api = mockApi;
  window.alert = jest.fn();
  jest.clearAllMocks();
});

import RenewModal from '../../renderer/components/RenewModal';

// ─── Données de test ──────────────────────────────────────────────────────────
const TYPES = [
  { id: 1, nom: 'Mensuel',    prix: 3000, duree: 1 },
  { id: 2, nom: 'Trimestriel', prix: 8000, duree: 3 },
];

const MEMBER_AVEC_ABO = {
  idAdherent:       10,
  idAbonnement:     5,
  nom:              'Dupont',
  prenom:           'Alice',
  abonnementStatut: 'expiré',
  dateFin:          '2026-01-01',
  type_id:          1,
  photo:            null,
};

const MEMBER_SANS_ABO = {
  idAdherent:       11,
  idAbonnement:     null,
  nom:              'Martin',
  prenom:           'Bob',
  abonnementStatut: 'Sans abo',
  dateFin:          null,
  type_id:          null,
  photo:            null,
};

const onSave  = jest.fn();
const onClose = jest.fn();

function renderModal(member = MEMBER_AVEC_ABO) {
  return render(
    <RenewModal
      member={member}
      typesAbonnement={TYPES}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

// ─── 1. Rendu initial ─────────────────────────────────────────────────────────
describe('1. Rendu initial', () => {
  test('TC-R01 — affiche le titre RENOUVELER L\'ABONNEMENT', () => {
    renderModal();
    expect(screen.getByText(/renouveler l'abonnement/i)).toBeInTheDocument();
  });

  test('TC-R02 — affiche le nom du membre', () => {
    renderModal();
    expect(screen.getByText(/Dupont/)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  test('TC-R03 — affiche le badge statut expiré', () => {
    renderModal();
    expect(screen.getByText(/expiré/i)).toBeInTheDocument();
  });

  test('TC-R04 — affiche le select des types d\'abonnement', () => {
    renderModal();
    expect(screen.getByText(/mensuel/i)).toBeInTheDocument();
    expect(screen.getByText(/trimestriel/i)).toBeInTheDocument();
  });

  test('TC-R05 — étape 1/2 affiché', () => {
    renderModal();
    expect(screen.getByText(/étape 1\/2/i)).toBeInTheDocument();
  });

  test('TC-R06 — bouton Annuler présent', () => {
    renderModal();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  test('TC-R07 — bouton Prochaine étape présent', () => {
    renderModal();
    expect(screen.getByText(/prochaine étape/i)).toBeInTheDocument();
  });
});

// ─── 2. Navigation entre étapes ──────────────────────────────────────────────
describe('2. Navigation entre étapes', () => {
  test('TC-N01 — clic Prochaine étape sans type affiche alert', async () => {
    render(
      <RenewModal
        member={{ ...MEMBER_AVEC_ABO, type_id: null }}
        typesAbonnement={TYPES}
        onSave={onSave}
        onClose={onClose}
      />
    );
    // Vider le select
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    expect(window.alert).toHaveBeenCalledWith("Veuillez sélectionner un type d'abonnement.");
  });

  test('TC-N02 — clic Prochaine étape sans date affiche alert', async () => {
    renderModal();
    const inputs = screen.getAllByRole('combobox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    // Supprimer la date de début
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInput, { target: { value: '' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    expect(window.alert).toHaveBeenCalledWith('La date de début est requise.');
  });

  test('TC-N03 — passage à l\'étape 2 avec données valides', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => {
      expect(screen.getByText(/récapitulatif & paiement/i)).toBeInTheDocument();
    });
  });

  test('TC-N04 — étape 2 affiche "2/2"', async () => {
    renderModal();
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => {
      expect(screen.getByText(/étape 2\/2/i)).toBeInTheDocument();
    });
  });

  test('TC-N05 — bouton Précédent revient à l\'étape 1', async () => {
    renderModal();
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => screen.getByText(/récapitulatif/i));
    fireEvent.click(screen.getByText(/précédent/i));
    await waitFor(() => {
      expect(screen.getByText(/nouvel abonnement/i)).toBeInTheDocument();
    });
  });
});

// ─── 3. Calcul automatique de la date de fin ─────────────────────────────────
describe('3. Calcul de la date de fin', () => {
  test('TC-D01 — sélectionner type Mensuel calcule +1 mois', () => {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    const today    = new Date();
    const expected = new Date(today);
    expected.setMonth(expected.getMonth() + 1);
    const expectedStr = expected.toISOString().split('T')[0];
    expect(screen.getByDisplayValue(expectedStr)).toBeInTheDocument();
  });

  test('TC-D02 — sélectionner type Trimestriel calcule +3 mois', () => {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    const today    = new Date();
    const expected = new Date(today);
    expected.setMonth(expected.getMonth() + 3);
    const expectedStr = expected.toISOString().split('T')[0];
    expect(screen.getByDisplayValue(expectedStr)).toBeInTheDocument();
  });
});

// ─── 4. Récapitulatif étape 2 ────────────────────────────────────────────────
describe('4. Récapitulatif étape 2', () => {
  async function goToStep2() {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => screen.getByText(/récapitulatif/i));
  }

  test('TC-REC01 — affiche le nom de l\'adhérent dans le récap', async () => {
    await goToStep2();
    expect(screen.getAllByText(/dupont/i).length).toBeGreaterThan(0);
  });

  test('TC-REC02 — affiche le nom du type d\'abonnement', async () => {
    await goToStep2();
    expect(screen.getAllByText(/mensuel/i).length).toBeGreaterThan(0);
  });

  test('TC-REC03 — affiche le total à payer en DA', async () => {
    await goToStep2();
    expect(screen.getByText(/3000/)).toBeInTheDocument();
    expect(screen.getAllByText(/DA/i).length).toBeGreaterThan(0);
  });

  test('TC-REC04 — boutons Payer maintenant et Payer plus tard présents', async () => {
    await goToStep2();
    expect(screen.getByText(/payer maintenant/i)).toBeInTheDocument();
    expect(screen.getByText(/payer plus tard/i)).toBeInTheDocument();
  });
});

// ─── 5. Paiement ─────────────────────────────────────────────────────────────
describe('5. Paiement', () => {
  async function goToStep2() {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => screen.getByText(/récapitulatif/i));
  }

  test('TC-P01 — sélectionner Payer maintenant affiche les modes de paiement', async () => {
    await goToStep2();
    fireEvent.click(screen.getByText(/payer maintenant/i));
    await waitFor(() => {
      expect(screen.getByText(/espèces/i)).toBeInTheDocument();
      expect(screen.getByText(/carte bancaire/i)).toBeInTheDocument();
      expect(screen.getByText(/virement/i)).toBeInTheDocument();
    });
  });

  test('TC-P02 — confirmer sans statut paiement affiche alert', async () => {
    await goToStep2();
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    expect(window.alert).toHaveBeenCalledWith('Veuillez choisir un statut de paiement.');
  });

  test('TC-P03 — payer plus tard appelle updateAbonnement sans addPaiement', async () => {
    mockApi.updateAbonnement.mockResolvedValue({});
    await goToStep2();
    fireEvent.click(screen.getByText(/payer plus tard/i));
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    await waitFor(() => {
      expect(mockApi.updateAbonnement).toHaveBeenCalled();
      expect(mockApi.addPaiement).not.toHaveBeenCalled();
    });
  });

  test('TC-P04 — payer maintenant appelle updateAbonnement ET addPaiement', async () => {
    mockApi.updateAbonnement.mockResolvedValue({});
    mockApi.addPaiement.mockResolvedValue({});
    await goToStep2();
    fireEvent.click(screen.getByText(/payer maintenant/i));
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    await waitFor(() => {
      expect(mockApi.updateAbonnement).toHaveBeenCalled();
      expect(mockApi.addPaiement).toHaveBeenCalled();
    });
  });

  test('TC-P05 — membre sans abonnement appelle addAbonnement', async () => {
    mockApi.addAbonnement.mockResolvedValue({ insertId: 99 });
    render(
      <RenewModal
        member={MEMBER_SANS_ABO}
        typesAbonnement={TYPES}
        onSave={onSave}
        onClose={onClose}
      />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => screen.getByText(/récapitulatif/i));
    fireEvent.click(screen.getByText(/payer plus tard/i));
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    await waitFor(() => {
      expect(mockApi.addAbonnement).toHaveBeenCalled();
    });
  });

  test('TC-P06 — erreur API affiche alert erreur', async () => {
    mockApi.updateAbonnement.mockRejectedValue(new Error('DB error'));
    await goToStep2();
    fireEvent.click(screen.getByText(/payer plus tard/i));
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erreur lors du renouvellement.');
    });
  });

  test('TC-P07 — succès appelle onSave', async () => {
    mockApi.updateAbonnement.mockResolvedValue({});
    await goToStep2();
    fireEvent.click(screen.getByText(/payer plus tard/i));
    fireEvent.click(screen.getByText(/confirmer le renouvellement/i));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });
});

// ─── 6. Fermeture du modal ────────────────────────────────────────────────────
describe('6. Fermeture', () => {
  test('TC-F01 — clic Annuler appelle onClose', () => {
    renderModal();
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });

  test('TC-F02 — clic sur le bouton X appelle onClose', () => {
    renderModal();
    const closeBtn = screen.getByRole('button', { name: '' });
    // Chercher le bouton avec le SVG X (premier bouton sans texte)
    const allButtons = screen.getAllByRole('button');
    const xBtn = allButtons.find(b => b.style.borderRadius === '50%');
    if (xBtn) fireEvent.click(xBtn);
    // onClose peut être appelé via le bouton X ou l'overlay
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── 7. Remise ────────────────────────────────────────────────────────────────
describe('7. Remise', () => {
  test('TC-REM01 — saisir une remise de 10% réduit le total', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } }); // prix 3000
    const remiseInput = screen.getByPlaceholderText('0');
    fireEvent.change(remiseInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => {
      expect(screen.getByText(/2700/)).toBeInTheDocument();
    });
  });

  test('TC-REM02 — remise 0% affiche le prix de base', async () => {
    renderModal();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/prochaine étape/i));
    await waitFor(() => {
      expect(screen.getByText(/3000/)).toBeInTheDocument();
    });
  });
});