import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NouveauPaiementModal from '../../renderer/components/NouveauPaiementModal';

// ─── Mock de l'image importée ───────────────────────────────────────────────
jest.mock('../../images/gym.png', () => 'gym.png');

// ─── Données de test ────────────────────────────────────────────────────────
const mockAbonnements = [
  { idAbonnement: 1, nom: 'Benali',  prenom: 'Youcef', typeNom: 'Mensuel',      montantDu: 3000, totalPaye: 0    },
  { idAbonnement: 2, nom: 'Mammeri', prenom: 'Sara',   typeNom: 'Trimestriel',  montantDu: 8000, totalPaye: 2000 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Ouvre le dropdown et attend que la liste soit visible */
async function openDropdown() {
  fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
  await waitFor(() => screen.getByPlaceholderText(/Rechercher.../i));
}

/** Sélectionne un adhérent par regex sur son nom affiché */
async function selectMember(nameRegex) {
  await openDropdown();
  fireEvent.click(screen.getByText(nameRegex));
}

/** Rendu par défaut avec mocks standards */
function setup(props = {}) {
  const onClose = jest.fn();
  const onSave  = jest.fn();
  render(<NouveauPaiementModal onClose={onClose} onSave={onSave} {...props} />);
  return { onClose, onSave };
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────
beforeEach(() => {
  window.api = {
    getAbonnementsNonPaies: jest.fn(() => Promise.resolve(mockAbonnements)),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
describe('NouveauPaiementModal', () => {

  // ── Rendu initial ──────────────────────────────────────────────────────────
  describe('Rendu initial', () => {
    test('affiche le titre ENREGISTRER UN PAIEMENT', () => {
      setup();
      expect(screen.getByText(/ENREGISTRER UN PAIEMENT/i)).toBeInTheDocument();
    });

    test('affiche le placeholder "Choisir l\'adhérent" par défaut', () => {
      setup();
      expect(screen.getByText(/Choisir l'adhérent/i)).toBeInTheDocument();
    });

    test('affiche les 3 modes de paiement dès le rendu', () => {
      setup();
      expect(screen.getByText('Espèces')).toBeInTheDocument();
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
      expect(screen.getByText('Virement')).toBeInTheDocument();
    });

    test('le mode "Espèces" est sélectionné par défaut (font-weight: 700)', () => {
      setup();
      const btn = screen.getByText('Espèces').closest('button');
      expect(btn).toHaveStyle('font-weight: 700');
    });

    test('le bouton Confirmer est désactivé sans adhérent sélectionné', () => {
      setup();
      expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).toBeDisabled();
    });

    test('appelle getAbonnementsNonPaies au montage', async () => {
      setup();
      await waitFor(() =>
        expect(window.api.getAbonnementsNonPaies).toHaveBeenCalledTimes(1)
      );
    });

    test('la date est initialisée à aujourd\'hui', () => {
      setup();
      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByDisplayValue(today)).toBeInTheDocument();
    });

    test('le bloc "Montant à régler" est masqué sans adhérent', () => {
      setup();
      expect(screen.queryByText(/Montant à régler/i)).not.toBeInTheDocument();
    });
  });

  // ── Dropdown ───────────────────────────────────────────────────────────────
  describe('Dropdown de sélection', () => {
    test('s\'ouvre au clic sur le bouton adhérent', async () => {
      setup();
      fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/Rechercher.../i)).toBeInTheDocument()
      );
    });

    test('affiche tous les abonnements chargés', async () => {
      setup();
      await openDropdown();
      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test('affiche le type d\'abonnement de chaque adhérent', async () => {
      setup();
      await openDropdown();
      expect(screen.getByText('Mensuel')).toBeInTheDocument();
      expect(screen.getByText('Trimestriel')).toBeInTheDocument();
    });

    test('affiche le montant restant de chaque adhérent dans la liste', async () => {
      setup();
      await openDropdown();
      // Benali : 3000 - 0 = 3 000 DA | Mammeri : 8000 - 2000 = 6 000 DA
      expect(screen.getByText('3 000 DA')).toBeInTheDocument();
      expect(screen.getByText('6 000 DA')).toBeInTheDocument();
    });

    test('affiche "Aucun impayé trouvé" si la liste est vide', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([]));
      setup();
      await openDropdown();
      expect(screen.getByText(/Aucun impayé trouvé/i)).toBeInTheDocument();
    });

    test('se ferme après sélection d\'un adhérent', async () => {
      setup();
      await selectMember(/BENALI Youcef/i);
      expect(screen.queryByPlaceholderText(/Rechercher.../i)).not.toBeInTheDocument();
    });

    test('toggle : se ferme si on reclique sur le bouton ouvert', async () => {
      setup();
      const btn = screen.getByText(/Choisir l'adhérent/i);
      fireEvent.click(btn); // ouvre
      await waitFor(() => screen.getByPlaceholderText(/Rechercher.../i));
      fireEvent.click(screen.getByText(/Choisir l'adhérent/i)); // ferme
      expect(screen.queryByPlaceholderText(/Rechercher.../i)).not.toBeInTheDocument();
    });
  });

  // ── Recherche ──────────────────────────────────────────────────────────────
  describe('Recherche / filtrage', () => {
    test('filtre par nom — masque les non-correspondants', async () => {
      setup();
      await openDropdown();
      fireEvent.change(screen.getByPlaceholderText(/Rechercher.../i), {
        target: { value: 'Mammeri' },
      });
      expect(screen.queryByText(/BENALI Youcef/i)).not.toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test('filtre par prénom', async () => {
      setup();
      await openDropdown();
      fireEvent.change(screen.getByPlaceholderText(/Rechercher.../i), {
        target: { value: 'Youcef' },
      });
      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      expect(screen.queryByText(/MAMMERI Sara/i)).not.toBeInTheDocument();
    });

    test('recherche insensible à la casse', async () => {
      setup();
      await openDropdown();
      fireEvent.change(screen.getByPlaceholderText(/Rechercher.../i), {
        target: { value: 'benali' },
      });
      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
    });

    test('affiche "Aucun impayé trouvé" si la recherche ne correspond à rien', async () => {
      setup();
      await openDropdown();
      fireEvent.change(screen.getByPlaceholderText(/Rechercher.../i), {
        target: { value: 'zzzzinconnu' },
      });
      expect(screen.getByText(/Aucun impayé trouvé/i)).toBeInTheDocument();
    });

    test('le terme de recherche est réinitialisé après sélection', async () => {
      setup();
      await openDropdown();
      fireEvent.change(screen.getByPlaceholderText(/Rechercher.../i), {
        target: { value: 'Ben' },
      });
      fireEvent.click(screen.getByText(/BENALI Youcef/i));
      // Rouvrir — tous les membres doivent réapparaître
      fireEvent.click(screen.getByText(/BENALI Youcef/i)); // bouton principal maintenant
      await waitFor(() =>
        expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument()
      );
    });
  });

  // ── Sélection d'un adhérent ────────────────────────────────────────────────
  describe('Sélection d\'un adhérent', () => {
    test('affiche le nom sélectionné dans le bouton', async () => {
      setup();
      await selectMember(/BENALI Youcef/i);
      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
    });

    test('affiche le bloc "Montant à régler" après sélection', async () => {
      setup();
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        expect(screen.getByText(/Montant à régler/i)).toBeInTheDocument()
      );
    });

    test('affiche le bon montant pour Benali (3000 - 0 = 3 000)', async () => {
      setup();
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        // Le composant affiche resteAPayer.toLocaleString() + " DA"
        expect(screen.getByText(/3 000/)).toBeInTheDocument()
      );
    });

    test('affiche le bon montant pour Mammeri (8000 - 2000 = 6 000)', async () => {
      setup();
      await selectMember(/MAMMERI Sara/i);
      await waitFor(() =>
        expect(screen.getByText(/6 000/)).toBeInTheDocument()
      );
    });

    test('le bouton Confirmer devient actif après sélection valide', async () => {
      setup();
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled()
      );
    });
  });

  // ── Cas limites montant ────────────────────────────────────────────────────
  describe('Cas limites — montant restant', () => {
    test('reste = 0 (montantDu === totalPaye) → bouton Confirmer désactivé', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([
        { idAbonnement: 3, nom: 'Test', prenom: 'Zero', typeNom: 'Mensuel', montantDu: 1000, totalPaye: 1000 },
      ]));
      setup();
      await selectMember(/TEST Zero/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).toBeDisabled()
      );
    });

    test('reste négatif (totalPaye > montantDu) → bouton Confirmer désactivé', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([
        { idAbonnement: 4, nom: 'Neg', prenom: 'Test', typeNom: 'Annuel', montantDu: 500, totalPaye: 1000 },
      ]));
      setup();
      await selectMember(/NEG Test/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).toBeDisabled()
      );
    });

    test('montantDu absent (undefined) → traité comme 0, bouton désactivé', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve([
        { idAbonnement: 5, nom: 'Undef', prenom: 'Mont', typeNom: 'Mensuel', montantDu: undefined, totalPaye: 0 },
      ]));
      setup();
      await selectMember(/UNDEF Mont/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).toBeDisabled()
      );
    });
  });

  // ── Mode de paiement ───────────────────────────────────────────────────────
  describe('Mode de paiement', () => {
    test('cliquer sur "Carte bancaire" le sélectionne (font-weight: 700)', () => {
      setup();
      fireEvent.click(screen.getByText('Carte bancaire'));
      expect(screen.getByText('Carte bancaire').closest('button')).toHaveStyle('font-weight: 700');
    });

    test('cliquer sur "Virement" le sélectionne', () => {
      setup();
      fireEvent.click(screen.getByText('Virement'));
      expect(screen.getByText('Virement').closest('button')).toHaveStyle('font-weight: 700');
    });

    test('changer de mode désélectionne le précédent', () => {
      setup();
      fireEvent.click(screen.getByText('Carte bancaire'));
      fireEvent.click(screen.getByText('Virement'));
      expect(screen.getByText('Carte bancaire').closest('button')).toHaveStyle('font-weight: 400');
      expect(screen.getByText('Virement').closest('button')).toHaveStyle('font-weight: 700');
    });
  });

  // ── Date ───────────────────────────────────────────────────────────────────
  describe('Date du règlement', () => {
    test('peut être modifiée', async () => {
      setup();
      const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
      expect(screen.getByDisplayValue('2025-01-15')).toBeInTheDocument();
    });
  });

  // ── Confirmation ───────────────────────────────────────────────────────────
  describe('Confirmation / onSave', () => {
    test('appelle onSave avec abonnement_id, montant (resteAPayer), mode et date corrects', async () => {
      const { onSave } = setup();
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled()
      );
      fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          abonnement_id: 1,
          montant:       3000,      // resteAPayer = montantDu - totalPaye
          mode:          'Espèces', // mode par défaut
        })
      );
    });

    test('passe le mode sélectionné dans onSave', async () => {
      const { onSave } = setup();
      fireEvent.click(screen.getByText('Virement'));
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled()
      );
      fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'Virement' })
      );
    });

    test('passe la date modifiée dans onSave', async () => {
      const { onSave } = setup();
      const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
      fireEvent.change(dateInput, { target: { value: '2025-06-01' } });
      await selectMember(/BENALI Youcef/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled()
      );
      fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2025-06-01' })
      );
    });

    test('passe le bon montant pour Mammeri (resteAPayer = 6000)', async () => {
      const { onSave } = setup();
      await selectMember(/MAMMERI Sara/i);
      await waitFor(() =>
        expect(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i)).not.toBeDisabled()
      );
      fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ abonnement_id: 2, montant: 6000 })
      );
    });

    test('n\'appelle pas onSave si le bouton est désactivé', () => {
      const { onSave } = setup();
      // Pas d'adhérent sélectionné — bouton disabled
      fireEvent.click(screen.getByText(/CONFIRMER L'ENCAISSEMENT/i));
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  // ── Fermeture ──────────────────────────────────────────────────────────────
  describe('Fermeture du modal', () => {
    test('appelle onClose au clic sur ANNULER', () => {
      const { onClose } = setup();
      fireEvent.click(screen.getByText('ANNULER'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('appelle onClose au clic sur le bouton ✕ (header)', () => {
      const { onClose } = setup();
      // Le bouton ✕ est le seul avec borderRadius: 50% dans le header
      const allButtons = screen.getAllByRole('button');
      const xBtn = allButtons.find(b => b.style?.borderRadius === '50%');
      expect(xBtn).toBeTruthy();
      fireEvent.click(xBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Gestion d'erreur API ───────────────────────────────────────────────────
  describe('Gestion d\'erreur API', () => {
    test('ne plante pas si getAbonnementsNonPaies rejette', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.reject(new Error('Network error')));
      // Ne doit pas lever d'erreur non catchée
      expect(() => setup()).not.toThrow();
      // Le dropdown reste vide
      fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
      await waitFor(() =>
        expect(screen.getByText(/Aucun impayé trouvé/i)).toBeInTheDocument()
      );
    });

    test('ne plante pas si getAbonnementsNonPaies retourne null', async () => {
      window.api.getAbonnementsNonPaies = jest.fn(() => Promise.resolve(null));
      expect(() => setup()).not.toThrow();
      fireEvent.click(screen.getByText(/Choisir l'adhérent/i));
      await waitFor(() =>
        expect(screen.getByText(/Aucun impayé trouvé/i)).toBeInTheDocument()
      );
    });
  });

});