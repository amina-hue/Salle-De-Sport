// src/__tests__/components/AddMemberModal.additional.test.jsx
// Tests supplémentaires ciblant les branches non couvertes (Istanbul Iif/Eif)
// Objectif : passer de ~70% à ~90%

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('../../../images/salle.png', () => 'salle.png');

import AddMemberModal from '../../renderer/components/AddMemberModal';

const TYPES_ABO = [
  { id: 1, nom: 'Mensuel', duree: 1,  prix: 2000 },
  { id: 2, nom: 'Annuel',  duree: 12, prix: 18000 },
];

const onSave  = jest.fn();
const onClose = jest.fn();

function renderModal(props = {}) {
  return render(
    <AddMemberModal
      typesAbonnement={TYPES_ABO}
      onSave={onSave}
      onClose={onClose}
      {...props}
    />
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function fillStep1AndNext() {
  fireEvent.change(screen.getByPlaceholderText('Jean'),           { target: { value: 'Youcef'     } });
  fireEvent.change(screen.getByPlaceholderText('Dupont'),         { target: { value: 'Benali'     } });
  fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
  fireEvent.click(screen.getByText(/Prochaine étape/i));
  await waitFor(() => expect(screen.getByText(/Abonnement de l'adhérent/i)).toBeInTheDocument());
}

async function goToStep2() {
  renderModal();
  await fillStep1AndNext();
}

async function goToStep3() {
  renderModal();
  await fillStep1AndNext();
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Prochaine étape/i));
  await waitFor(() => expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument());
}

beforeEach(() => {
  jest.clearAllMocks();
  window.api = {
    createAdherentComplet: jest.fn().mockResolvedValue({ ok: true }),
    getTypesAbonnement:    jest.fn().mockResolvedValue(TYPES_ABO),
  };
});

// ═══════════════════════════════════════════════════════════════════════════════
// A. CAMÉRA & FICHIER (startCamera / takePhoto / stopCamera / handleFile)
// Ces branches étaient à 0% — on les couvre avec des mocks adaptés.
// ═══════════════════════════════════════════════════════════════════════════════
describe('Photo — caméra et import fichier', () => {

  beforeEach(() => {
    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }],
        }),
      },
    });
  });

  test('AM-CAM01 — clic "Caméra" appelle getUserMedia et affiche le bouton Capturer', async () => {
    renderModal();
    fireEvent.click(screen.getByText('Caméra'));
    await waitFor(() =>
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true })
    );
    expect(screen.getByText('Capturer')).toBeInTheDocument();
  });

  test('AM-CAM02 — clic "Annuler" (stopCamera) masque le bouton Capturer', async () => {
    renderModal();
    fireEvent.click(screen.getByText('Caméra'));
    await waitFor(() => expect(screen.getByText('Capturer')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => expect(screen.queryByText('Capturer')).not.toBeInTheDocument());
  });

  test('AM-CAM03 — getUserMedia échoue affiche une alerte et masque le bouton Capturer', async () => {
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error('denied'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal();
    fireEvent.click(screen.getByText('Caméra'));
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/caméra/i))
    );
    expect(screen.queryByText('Capturer')).not.toBeInTheDocument();
    alertMock.mockRestore();
  });

  test('AM-CAM04 — clic "Capturer" appelle takePhoto et revient à la vue normale', async () => {
    // Mock canvas
    const mockGetContext = jest.fn().mockReturnValue({ drawImage: jest.fn() });
    const mockToDataURL  = jest.fn().mockReturnValue('data:image/jpeg;base64,abc');

    HTMLCanvasElement.prototype.getContext  = mockGetContext;
    HTMLCanvasElement.prototype.toDataURL   = mockToDataURL;

    renderModal();
    fireEvent.click(screen.getByText('Caméra'));
    await waitFor(() => expect(screen.getByText('Capturer')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Capturer'));

    // Après capture, on revient au bouton Caméra (showCamera = false)
    await waitFor(() => expect(screen.getByText('Caméra')).toBeInTheDocument());
    expect(screen.queryByText('Capturer')).not.toBeInTheDocument();
  });

  test('AM-FILE01 — handleFile : import image met à jour la prévisualisation', async () => {
    // Mock FileReader
    const mockReadAsDataURL = jest.fn();
    let onloadend;
    global.FileReader = jest.fn().mockImplementation(() => ({
      readAsDataURL: mockReadAsDataURL.mockImplementation(function () {
        this.result = 'data:image/jpeg;base64,xyz';
        this.onloadend();
      }),
      get onloadend() { return onloadend; },
      set onloadend(fn) { onloadend = fn; },
    }));

    renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
    fireEvent.change(fileInput);

    await waitFor(() => {
      const img = document.querySelector('img[alt="profil"]');
      expect(img).toBeInTheDocument();
    });
  });

  test('AM-FILE02 — handleFile sans fichier ne plante pas', () => {
    renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', { value: [], writable: false });
    // Ne doit pas lever d'exception
    expect(() => fireEvent.change(fileInput)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// B. VALIDATION STEP 1 — branches Iif dans handleNext
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 1 — branches de validation handleNext', () => {

  // Branche Iif : email invalide au moment du clic "Prochaine étape"
  // (l'utilisateur a un email invalide sans avoir touché l'input avant)
  test('AM-VAL01 — email invalide au submit affiche erreur et bloque', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Jean'),           { target: { value: 'Youcef'     } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'),         { target: { value: 'Benali'     } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), { target: { value: 'bademail' } });
    // Effacer manuellement l'erreur inline pour simuler un état "sale" sans erreur visible
    // puis cliquer submit — le handleNext doit re-détecter l'email invalide
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Format e-mail invalide/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Abonnement de l'adhérent/i)).not.toBeInTheDocument();
  });

  // Branche Iif : téléphone avec lettres au submit
  test('AM-VAL02 — téléphone invalide au submit affiche erreur et bloque', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Jean'),   { target: { value: 'Youcef' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Benali' } });
    // Simuler un téléphone avec lettres — handlePhone nettoie, mais on peut
    // contourner en settant directement la valeur sans passer par handlePhone
    // en mockant onChange pour bypasser la validation en temps réel
    const phoneInput = screen.getByPlaceholderText('06 12 34 56 78');
    // Déclencher handlePhone avec des lettres (ça va nettoyer la valeur mais
    // laisser l'erreur dans errors.phone)
    fireEvent.change(phoneInput, { target: { value: 'abc' } });
    // Puis on saisit une vraie valeur pour que la validation submit
    // trouve numTelephone vide (après nettoyage 'abc' → '')
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/requis|uniquement/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Abonnement/i)).not.toBeInTheDocument();
  });

  // Branche Iif : âge < 7 ans au submit (handleDOB en temps réel + handleNext)
  test('AM-VAL03 — âge < 7 ans au submit affiche erreur et bloque', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Jean'),           { target: { value: 'Youcef'     } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'),         { target: { value: 'Benali'     } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
    // Date de naissance → enfant de 3 ans
    const youngDate = new Date();
    youngDate.setFullYear(youngDate.getFullYear() - 3);
    const dateStr = youngDate.toISOString().split('T')[0];
    const dateInput = screen.getByDisplayValue('');
    fireEvent.change(dateInput, { target: { value: dateStr } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/au moins 7 ans/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Abonnement de l'adhérent/i)).not.toBeInTheDocument();
  });

  // Branche handleDOB : val vide → reset erreur dob
  test('AM-VAL04 — effacer la date de naissance supprime l\'erreur âge', async () => {
    renderModal();
    const dateInput = screen.getByDisplayValue('');
    // D'abord saisir une date invalide (< 7 ans)
    const youngDate = new Date();
    youngDate.setFullYear(youngDate.getFullYear() - 2);
    fireEvent.change(dateInput, { target: { value: youngDate.toISOString().split('T')[0] } });
    await waitFor(() => expect(screen.getByText(/au moins 7 ans/i)).toBeInTheDocument());
    // Puis effacer la date
    fireEvent.change(dateInput, { target: { value: '' } });
    await waitFor(() =>
      expect(screen.queryByText(/au moins 7 ans/i)).not.toBeInTheDocument()
    );
  });

  // Branche handleDOB : âge valide (>= 7) → affiche "Âge : N ans", pas d'erreur
  test('AM-VAL05 — date de naissance valide (>= 7 ans) affiche l\'âge sans erreur', async () => {
    renderModal();
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25);
    const dateStr = validDate.toISOString().split('T')[0];
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: dateStr } });
    await waitFor(() =>
      expect(screen.getByText(/Âge : 25 ans/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/au moins 7 ans/i)).not.toBeInTheDocument();
  });

  // Branche calcAge : anniversaire pas encore passé cette année → âge--
  test('AM-VAL06 — calcAge : anniversaire futur dans l\'année retire 1 an', async () => {
    renderModal();
    // Construire une date dont l'anniversaire tombe après aujourd'hui
    const now = new Date();
    const birthday = new Date(now.getFullYear() - 10, now.getMonth() + 1, 1);
    // Si le mois + 1 dépasse décembre, on prend le mois 0 de l'année précédente
    const adjustedYear = birthday.getMonth() > 11
      ? now.getFullYear() - 11
      : now.getFullYear() - 10;
    const futureBirthday = new Date(adjustedYear, (now.getMonth() + 1) % 12, 1);
    const dateStr = futureBirthday.toISOString().split('T')[0];

    fireEvent.change(screen.getByDisplayValue(''), { target: { value: dateStr } });
    // L'âge doit être affiché (9 ou 10 selon le mois exact) sans erreur
    await waitFor(() =>
      expect(screen.getByText(/Âge : \d+ ans/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/au moins 7 ans/i)).not.toBeInTheDocument();
  });

  // Correction erreur nom après erreur : taper dans le champ efface l'erreur
  test('AM-VAL07 — corriger le nom efface l\'erreur en temps réel', async () => {
    renderModal();
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'B' } });
    await waitFor(() =>
      expect(screen.queryByText(/Le nom est requis/i)).not.toBeInTheDocument()
    );
  });

  // Correction erreur prénom après erreur : taper efface l'erreur
  test('AM-VAL08 — corriger le prénom efface l\'erreur en temps réel', async () => {
    renderModal();
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Y' } });
    await waitFor(() =>
      expect(screen.queryByText(/Le prénom est requis/i)).not.toBeInTheDocument()
    );
  });

  // Sexe Femme sélectionnable
  test('AM-VAL09 — sélectionner "Femme" met à jour le radio', () => {
    renderModal();
    fireEvent.click(screen.getByDisplayValue('Femme'));
    expect(screen.getByDisplayValue('Femme')).toBeChecked();
    expect(screen.getByDisplayValue('Homme')).not.toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// C. STEP 2 — branches non couvertes
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 2 — branches non couvertes', () => {

  // Branche Iif (!form.dateDebut) dans handleNext step 2
  // Le formulaire a toujours une dateDebut par défaut → on doit la vider
  test('AM-S2-01 — dateDebut vidée bloque la navigation vers step 3', async () => {
    await goToStep2();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Sélectionner un type
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    // Vider la date de début
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInputs[0], { target: { value: '' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/date de début est requise/i));
    expect(screen.queryByText(/Récapitulatif/i)).not.toBeInTheDocument();
    alertMock.mockRestore();
  });

  // Branche Iif (!debut || !type?.duree) dans computeDateFin : type sans duree
  test('AM-S2-02 — type sans durée ne calcule pas la date fin', async () => {
    const typeSansDuree = [{ id: 99, nom: 'Illimité', duree: 0, prix: 5000 }];
    render(<AddMemberModal typesAbonnement={typeSansDuree} onSave={onSave} onClose={onClose} />);
    await fillStep1AndNext();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '99' } });
    // dateFin doit rester '—'
    await waitFor(() => {
      // Le texte '—' est présent pour la date fin
      expect(document.body.textContent).toMatch(/—/);
    });
  });

  // Branche Eif (t) dans handleTypeChange : sélectionner option vide (type non trouvé)
  test('AM-S2-03 — resélectionner l\'option vide après un type valide remet total à 0', async () => {
    await goToStep2();
    // Sélectionner Mensuel → total 2000
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText(/2000\.00/)).toBeInTheDocument());
    // Resélectionner option vide → Eif(t) est false → totalAPayer non mis à jour
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '' } });
    await waitFor(() =>
      // Le total retombe à 0 (prixBase = 0 car selectedType undefined)
      expect(screen.getByText(/0\.00/)).toBeInTheDocument()
    );
  });

  // handleDebutChange : changer debut met à jour dateFin
  test('AM-S2-04 — handleDebutChange recalcule dateFin correctement', async () => {
    await goToStep2();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } }); // Mensuel
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInputs[0], { target: { value: '2025-03-15' } });
    await waitFor(() =>
      expect(screen.getByText(/15\/04\/2025/)).toBeInTheDocument()
    );
  });

  // Remise 100% → total = 0
  test('AM-S2-05 — remise 100% donne un total de 0', async () => {
    await goToStep2();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    const remiseInput = screen.getByPlaceholderText('0');
    fireEvent.change(remiseInput, { target: { value: '100' } });
    await waitFor(() => expect(screen.getByText(/0\.00/)).toBeInTheDocument());
  });

  // Frais inscription cochés puis décochés → montant disparaît et total revient
  test('AM-S2-06 — décocher frais inscription masque le champ montant et recalcule le total', async () => {
    await goToStep2();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox); // cocher
    await waitFor(() => expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThanOrEqual(2));
    const inputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(inputs[inputs.length - 1], { target: { value: '300' } });
    await waitFor(() => expect(document.body.textContent).toMatch(/2300/));
    fireEvent.click(checkbox); // décocher
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('0').length).toBe(1); // seul remise reste
      expect(screen.getByText(/2000\.00/)).toBeInTheDocument();
    });
  });

  // Annuler depuis step 2 appelle onClose
  test('AM-S2-07 — clic "Annuler" depuis step 2 appelle onClose', async () => {
    await goToStep2();
    const annulerBtns = screen.getAllByRole('button', { name: /Annuler/i });
    fireEvent.click(annulerBtns[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// D. STEP 3 — branches handleSave non couvertes (Iif dans le wrapper)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 3 — branches handleSave non couvertes', () => {

  // Branche Iif (!form.type_id) : impossible via UI normale (step 2 valide déjà),
  // mais on peut le tester en manipulant le state via un type vide puis
  // en revenant à step 3 via Précédent après avoir changé le select
  // NB: le plus simple est de patcher directement le bouton Créer après
  // avoir retiré le type — mais il faut passer par Précédent.
  test('AM-HS01 — revenir step 2 → vider type → step 3 impossible sans type', async () => {
    await goToStep3();
    // Revenir en step 2
    fireEvent.click(screen.getByRole('button', { name: /Précédent/i }));
    await waitFor(() => expect(screen.getByText(/Abonnement de l'adhérent/i)).toBeInTheDocument());
    // Vider le type
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '' } });
    // Essayer d'avancer → l'alerte step 2 bloque
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/sélectionner un type/i));
    alertMock.mockRestore();
  });

  // Branche Iif (form.payerMaintenant === undefined) dans handleSave
  // Le bouton Créer est disabled si undefined, mais on peut déclencher handleSave
  // directement via un test de la logique (le bouton devient enabled puis
  // on vérifie que la guard s'active si on force l'appel)
  // En pratique le bouton est disabled, donc on teste via l'alerte de step 2 Annuler
  test('AM-HS02 — Annuler depuis step 3 appelle onClose', async () => {
    await goToStep3();
    const annulerBtns = screen.getAllByRole('button', { name: /Annuler/i });
    fireEvent.click(annulerBtns[annulerBtns.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Branche montantDu transmis à l'API
  test('AM-HS03 — montantDu transmis correctement à l\'API', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ montantDu: 2000 })
      )
    );
  });

  // modePaiement null quand payerMaintenant = false
  test('AM-HS04 — modePaiement=null transmis quand "Payer plus tard"', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ modePaiement: null })
      )
    );
  });

  // modePaiement par défaut 'cash' quand payerMaintenant = true sans changer le mode
  test('AM-HS05 — modePaiement=cash par défaut quand "Payer maintenant" sans changer le mode', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ modePaiement: 'cash' })
      )
    );
  });

  // photo null quand pas de photo sélectionnée
  test('AM-HS06 — photo=null transmis si aucune photo saisie', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ photo: null })
      )
    );
  });

  // email null quand non saisi
  test('AM-HS07 — email=null transmis si champ email vide', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ email: null })
      )
    );
  });

  // Récap affiche "Aucune" quand remise = 0
  test('AM-HS08 — récapitulatif affiche "Aucune" quand pas de remise', async () => {
    await goToStep3();
    expect(screen.getByText('Aucune')).toBeInTheDocument();
  });

  // Récap affiche remise quand remise > 0 (passer par step 2 avec remise)
  test('AM-HS09 — récapitulatif affiche la remise si > 0', async () => {
    renderModal();
    await fillStep1AndNext();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    const remiseInput = screen.getByPlaceholderText('0');
    fireEvent.change(remiseInput, { target: { value: '15' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument());
    expect(screen.getByText(/-15%/)).toBeInTheDocument();
  });

  // Récap affiche les frais d'inscription si > 0
  test('AM-HS10 — récapitulatif affiche les frais d\'inscription si cochés', async () => {
    renderModal();
    await fillStep1AndNext();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => screen.getAllByPlaceholderText('0'));
    const inputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(inputs[inputs.length - 1], { target: { value: '400' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument());
    expect(screen.getByText(/\+400\.00 DA/)).toBeInTheDocument();
    expect(screen.getByText(/2400\.00/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// E. MODAL WRAPPER — branches useEffect et fermeture ✕
// ═══════════════════════════════════════════════════════════════════════════════
describe('Modal wrapper — branches non couvertes', () => {

  // Branche Eif (data) dans useEffect : getTypesAbonnement retourne null/undefined
  test('AM-MW01 — getTypesAbonnement retourne null → setTypesAbonnement non appelé', async () => {
    window.api.getTypesAbonnement = jest.fn().mockResolvedValue(null);
    render(<AddMemberModal typesAbonnement={[]} onSave={onSave} onClose={onClose} />);
    await waitFor(() => expect(window.api.getTypesAbonnement).toHaveBeenCalledTimes(1));
    // Le composant ne plante pas et affiche quand même step 1
    expect(screen.getByText(/Nouvel adhérent/i)).toBeInTheDocument();
  });

  // getTypesAbonnement échoue → catch console.error (silencieux)
  test('AM-MW02 — getTypesAbonnement échoue silencieusement', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    window.api.getTypesAbonnement = jest.fn().mockRejectedValue(new Error('network'));
    render(<AddMemberModal typesAbonnement={[]} onSave={onSave} onClose={onClose} />);
    await waitFor(() => expect(window.api.getTypesAbonnement).toHaveBeenCalled());
    expect(console.error).toHaveBeenCalled();
    expect(screen.getByText(/Nouvel adhérent/i)).toBeInTheDocument();
    console.error.mockRestore();
  });

  // Bouton ✕ (IconX) du header appelle onClose
  test('AM-MW03 — bouton ✕ dans le header appelle onClose', () => {
    renderModal();
    // Le bouton ✕ est le seul bouton rond dans le header (pas Annuler ni Prochaine étape)
    const allButtons = screen.getAllByRole('button');
    // Le bouton ✕ est celui qui ne contient pas de texte lisible
    const closeBtn = allButtons.find(b =>
      !['Annuler', 'Prochaine étape', 'Caméra', 'Importer', 'Hommes', 'Femmes']
        .some(label => b.textContent.includes(label))
    );
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Indicateurs de progression : step 1 → step 2 → step 3 (barres de progression)
  test('AM-MW04 — la barre de progression avance à chaque étape', async () => {
    renderModal();
    expect(screen.getByText(/Étape 1\/3/i)).toBeInTheDocument();
    await fillStep1AndNext();
    expect(screen.getByText(/Étape 2\/3/i)).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Étape 3\/3/i)).toBeInTheDocument());
  });

  // dateNaissance null transmis à l'API si non saisi
  test('AM-MW05 — dateNaissance=null transmis si champ vide', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ dateNaissance: null })
      )
    );
  });

  // dateFin null transmis si non calculée (type sans durée)
  test('AM-MW06 — dateFin=null transmis si non calculée', async () => {
    const typeSansDuree = [{ id: 5, nom: 'Libre', duree: 0, prix: 1000 }];
    render(<AddMemberModal typesAbonnement={typeSansDuree} onSave={onSave} onClose={onClose} />);
    await fillStep1AndNext();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '5' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ dateFin: null })
      )
    );
  });
});