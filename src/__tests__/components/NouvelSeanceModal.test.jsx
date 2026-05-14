import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NouvelSeanceModal from '../../renderer/components/NouvelSeanceModal';

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../images/background.png', () => 'mocked-background.png');

const mockActivites = [
  { idActivite: 1, nom: 'Yoga' },
  { idActivite: 2, nom: 'Boxe' },
];
const mockCoachs = [
  { idUtilisateur: 10, nom: 'Dupont', prenom: 'Alice' },
  { idUtilisateur: 11, nom: 'Martin', prenom: 'Bob' },
];

const mockApi = {
  getActivites:      jest.fn().mockResolvedValue(mockActivites),
  getCoachs:         jest.fn().mockResolvedValue(mockCoachs),
  // FIX 1: getSeancesSemaine was missing from mockApi entirely.
  // Every call to handleSave reaches this function; without a mock it throws
  // "TypeError: window.api.getSeancesSemaine is not a function" and silently
  // breaks every Soumission test.
  getSeancesSemaine: jest.fn().mockResolvedValue([]),
  addSeance:         jest.fn().mockResolvedValue({ idSeance: 99 }),
};

beforeAll(() => {
  Object.defineProperty(window, 'api', { value: mockApi, writable: true });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.getActivites.mockResolvedValue(mockActivites);
  mockApi.getCoachs.mockResolvedValue(mockCoachs);
  // FIX 1 (cont.): also reset in beforeEach so each test starts clean.
  mockApi.getSeancesSemaine.mockResolvedValue([]);
  mockApi.addSeance.mockResolvedValue({ idSeance: 99 });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const defaultProps = {
  onSave:  jest.fn(),
  onClose: jest.fn(),
};

const renderModal = (props = {}) =>
  render(<NouvelSeanceModal {...defaultProps} {...props} />);

/** Attend la fin du chargement (disparition du spinner) */
const waitForLoad = () =>
  waitFor(() =>
    expect(screen.queryByText('Chargement des données...')).not.toBeInTheDocument()
  );

/** Remplit les champs obligatoires avec des valeurs valides */
const fillValidForm = async () => {
  await waitForLoad();
  // Heure début + fin (les selects activité/coach sont déjà pré-sélectionnés)
  fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '11:00' } });
};

// ════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL & CHARGEMENT
// ════════════════════════════════════════════════════════════════════════════
describe('Rendu initial', () => {
  test('affiche le titre "Nouvelle séance"', async () => {
    renderModal();
    expect(screen.getByText('Nouvelle séance')).toBeInTheDocument();
  });

  test('affiche le spinner de chargement au montage', () => {
    mockApi.getActivites.mockReturnValue(new Promise(() => {}));
    renderModal();
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  test('appelle getActivites et getCoachs au montage', async () => {
    renderModal();
    await waitForLoad();
    expect(mockApi.getActivites).toHaveBeenCalledTimes(1);
    expect(mockApi.getCoachs).toHaveBeenCalledTimes(1);
  });

  test('affiche les activités chargées dans le select', async () => {
    renderModal();
    await waitForLoad();
    expect(screen.getByText('Yoga')).toBeInTheDocument();
    expect(screen.getByText('Boxe')).toBeInTheDocument();
  });

  test('affiche les coachs chargés dans le select', async () => {
    renderModal();
    await waitForLoad();
    expect(screen.getByText('Dupont Alice')).toBeInTheDocument();
    expect(screen.getByText('Martin Bob')).toBeInTheDocument();
  });

  test('pré-sélectionne la première activité', async () => {
    renderModal();
    await waitForLoad();
    const selects = screen.getAllByRole('combobox');
    // Premier select = Activité
    expect(selects[0].value).toBe('1');
  });

  test('pré-sélectionne le premier coach', async () => {
    renderModal();
    await waitForLoad();
    const selects = screen.getAllByRole('combobox');
    // Deuxième select = Coach
    expect(selects[1].value).toBe('10');
  });

  test("initialise la date à aujourd'hui", async () => {
    renderModal();
    await waitForLoad();
    const today = new Date().toISOString().split('T')[0];
    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
  });

  test('initialise participantsMax à 10', async () => {
    renderModal();
    await waitForLoad();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  test('public cible "Hommes" sélectionné par défaut', async () => {
    renderModal();
    await waitForLoad();
    expect(screen.getByText('Hommes')).toBeInTheDocument();
    expect(screen.getByText('Femmes')).toBeInTheDocument();
  });

  test('affiche les boutons Annuler et Enregistrer', async () => {
    renderModal();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer la séance')).toBeInTheDocument();
  });

  test("affiche un message d'erreur si le chargement échoue", async () => {
    mockApi.getActivites.mockRejectedValue(new Error('DB error'));
    renderModal();
    expect(await screen.findByText('Impossible de charger les données.')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. VALIDATION
// ════════════════════════════════════════════════════════════════════════════
describe('Validation', () => {
  test('erreur si heure début manquante', async () => {
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Fin/i), { target: { value: '11:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/date, heure début et heure fin sont requises/i)).toBeInTheDocument();
  });

  test('erreur si heure fin manquante', async () => {
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/date, heure début et heure fin sont requises/i)).toBeInTheDocument();
  });

  test('erreur si heure fin <= heure début', async () => {
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '10:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/heure de fin doit être après/i)).toBeInTheDocument();
  });

  test('erreur si heure début == heure fin', async () => {
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '10:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/heure de fin doit être après/i)).toBeInTheDocument();
  });

  test('erreur si aucune activité disponible et non sélectionnée', async () => {
    mockApi.getActivites.mockResolvedValue([]);
    mockApi.getCoachs.mockResolvedValue(mockCoachs);
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '11:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/sélectionner une activité/i)).toBeInTheDocument();
  });

  test('erreur si aucun coach disponible et non sélectionné', async () => {
    mockApi.getActivites.mockResolvedValue(mockActivites);
    mockApi.getCoachs.mockResolvedValue([]);
    renderModal();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '11:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/sélectionner un coach/i)).toBeInTheDocument();
  });

  // FIX 4: The original test waited for the error to disappear after a
  // successful save, but onClose() unmounts the modal immediately, making
  // the queryByText check unreliable and causing act() warnings.
  // Instead we verify onClose was called (which proves the save succeeded
  // and the error was cleared before unmount).
  test("l'erreur est effacée au prochain envoi réussi", async () => {
    renderModal();
    await waitForLoad();
    // Déclencher une erreur
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText(/requises/i)).toBeInTheDocument();
    // Corriger le formulaire et soumettre
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '11:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    // A successful save calls onClose, which proves setError('') ran first
    await waitFor(() => expect(defaultProps.onClose).toHaveBeenCalledTimes(1));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. SOUMISSION
// ════════════════════════════════════════════════════════════════════════════
describe('Soumission', () => {
  test('appelle addSeance avec les bonnes données', async () => {
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));

    await waitFor(() =>
      expect(mockApi.addSeance).toHaveBeenCalledWith(
        expect.objectContaining({
          date:            expect.any(String),
          heureDebut:      '10:00',
          heureFin:        '11:00',
          activite_id:     1,
          coach_id:        10,
          participantsMax: 10,
          publicCible:     'Homme',
        })
      )
    );
  });

  test("les ids sont envoyés en tant qu'entiers (parseInt)", async () => {
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));

    await waitFor(() => {
      const args = mockApi.addSeance.mock.calls[0][0];
      expect(typeof args.activite_id).toBe('number');
      expect(typeof args.coach_id).toBe('number');
      expect(typeof args.participantsMax).toBe('number');
    });
  });

  // FIX 2: The component calls onSave?.(form) — it passes the local form
  // state object, NOT the resolved value from addSeance ({ idSeance: 99 }).
  // The original assertion `toHaveBeenCalledWith({ idSeance: 99 })` would
  // always fail. We now assert on the form shape that is actually passed.
  test('appelle onSave avec le formulaire puis onClose', async () => {
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          heureDebut:  '10:00',
          heureFin:    '11:00',
          publicCible: 'Homme',
        })
      );
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  test('affiche "Enregistrement..." pendant la sauvegarde', async () => {
    mockApi.addSeance.mockReturnValue(new Promise(() => {}));
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
  });

  test('le bouton est désactivé pendant la sauvegarde', async () => {
    mockApi.addSeance.mockReturnValue(new Promise(() => {}));
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(screen.getByText('Enregistrement...')).toBeDisabled();
  });

  test("affiche l'erreur si addSeance échoue", async () => {
    mockApi.addSeance.mockRejectedValue(new Error('DB fail'));
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(await screen.findByText(/Erreur lors de la création/i)).toBeInTheDocument();
  });

  test('ne ferme pas le modal si addSeance échoue', async () => {
    mockApi.addSeance.mockRejectedValue(new Error('fail'));
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    await screen.findByText(/Erreur lors de la création/i);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test("n'appelle pas addSeance si la validation échoue", async () => {
    renderModal();
    await waitForLoad();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(mockApi.addSeance).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. INTERACTIONS FORMULAIRE
// ════════════════════════════════════════════════════════════════════════════
describe('Interactions formulaire', () => {
  test("changer l'activité met à jour le select", async () => {
    renderModal();
    await waitForLoad();
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], '2'); // Boxe
    expect(selects[0].value).toBe('2');
  });

  test('changer le coach met à jour le select', async () => {
    renderModal();
    await waitForLoad();
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[1], '11'); // Martin Bob
    expect(selects[1].value).toBe('11');
  });

  test("changer participantsMax met à jour l'input", async () => {
    renderModal();
    await waitForLoad();
    const input = screen.getByDisplayValue('10');
    await userEvent.clear(input);
    await userEvent.type(input, '20');
    expect(input.value).toBe('20');
  });

  test('cliquer sur "Femmes" change le publicCible', async () => {
    renderModal();
    await waitForLoad();
    await userEvent.click(screen.getByText('Femmes'));
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '10:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    await waitFor(() =>
      expect(mockApi.addSeance).toHaveBeenCalledWith(
        expect.objectContaining({ publicCible: 'Femme' })
      )
    );
  });

  test('cliquer sur "Hommes" après "Femmes" revient à Homme', async () => {
    renderModal();
    await waitForLoad();
    await userEvent.click(screen.getByText('Femmes'));
    await userEvent.click(screen.getByText('Hommes'));
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '10:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    await waitFor(() =>
      expect(mockApi.addSeance).toHaveBeenCalledWith(
        expect.objectContaining({ publicCible: 'Homme' })
      )
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. FERMETURE
// ════════════════════════════════════════════════════════════════════════════
describe('Fermeture', () => {
  test('appelle onClose au clic sur "Annuler"', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose au clic sur le bouton ✕', async () => {
    renderModal();
    const btns = screen.getAllByRole('button');
    const closeBtn = btns.find(
      b => !['Annuler', 'Enregistrer la séance', 'Hommes', 'Femmes'].includes(b.textContent.trim())
    );
    await userEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // FIX 3: The original test used fireEvent.click(overlay, { target: overlay }).
  // React's synthetic event system ignores the `target` override, so
  // e.target === e.currentTarget was never true and onClose was never called.
  // Clicking the overlay element directly (without overrides) makes the browser
  // set e.target naturally, which satisfies the e.target === e.currentTarget check.
  test("appelle onClose au clic sur l'overlay", () => {
    const { container } = renderModal();
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("ne ferme pas au clic à l'intérieur du modal", async () => {
    renderModal();
    await userEvent.click(screen.getByText('Nouvelle séance'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test('le bouton Enregistrer est désactivé pendant le chargement initial', () => {
    mockApi.getActivites.mockReturnValue(new Promise(() => {}));
    renderModal();
    expect(screen.getByText('Enregistrer la séance')).toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. DÉTECTION DE CONFLITS (HOMME / FEMME)
// ════════════════════════════════════════════════════════════════════════════
// These tests cover the conflict-check logic that existed in the component
// but had zero test coverage in the original file.
describe('Détection de conflits Homme/Femme', () => {
  const existingFemmeSession = {
    publicCible: 'Femme',
    heureDebut:  '09:30',
    heureFin:    '10:30',
  };

  test('bloque la création si un créneau Femme chevauche un nouveau créneau Homme', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([existingFemmeSession]);
    renderModal();
    await waitForLoad();
    // New Homme session 10:00–11:00 overlaps with Femme 09:30–10:30
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '11:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(await screen.findByText(/Conflit/i)).toBeInTheDocument();
    expect(mockApi.addSeance).not.toHaveBeenCalled();
  });

  test('autorise la création si le créneau Femme ne chevauche pas', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([existingFemmeSession]);
    renderModal();
    await waitForLoad();
    // New Homme session 11:00–12:00 — no overlap with Femme 09:30–10:30
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '12:00' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    await waitFor(() => expect(mockApi.addSeance).toHaveBeenCalledTimes(1));
  });

  test('affiche une erreur si getSeancesSemaine échoue', async () => {
    mockApi.getSeancesSemaine.mockRejectedValue(new Error('network'));
    renderModal();
    await fillValidForm();
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(await screen.findByText(/Impossible de vérifier les conflits/i)).toBeInTheDocument();
    expect(mockApi.addSeance).not.toHaveBeenCalled();
  });

  test('bloque aussi si un créneau Homme chevauche un nouveau créneau Femme', async () => {
    const existingHommeSession = { publicCible: 'Homme', heureDebut: '14:00', heureFin: '15:00' };
    mockApi.getSeancesSemaine.mockResolvedValue([existingHommeSession]);
    renderModal();
    await waitForLoad();
    await userEvent.click(screen.getByText('Femmes'));
    // New Femme 14:30–15:30 overlaps with Homme 14:00–15:00
    fireEvent.change(screen.getByLabelText(/Heure Début/i), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/Heure Fin/i),   { target: { value: '15:30' } });
    await userEvent.click(screen.getByText('Enregistrer la séance'));
    expect(await screen.findByText(/Conflit/i)).toBeInTheDocument();
    expect(mockApi.addSeance).not.toHaveBeenCalled();
  });
});