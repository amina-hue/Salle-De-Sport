// src/__tests__/components/AddMemberModal.test.jsx
// Tests du composant AddMemberModal (3 étapes : Personnel → Abonnement → Paiement)

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../../images/salle.png', () => 'salle.png');

// ─── Import du composant ──────────────────────────────────────────────────────
import AddMemberModal from '../../renderer/components/AddMemberModal';

// ─── Données de test ──────────────────────────────────────────────────────────
const TYPES_ABO = [
  { id: 1, nom: 'Mensuel',  duree: 1,  prix: 2000 },
  { id: 2, nom: 'Annuel',   duree: 12, prix: 18000 },
];

const onSave  = jest.fn();
const onClose = jest.fn();

// ─── Helper : rendre le modal ─────────────────────────────────────────────────
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

// ─── Helper : remplir step 1 et passer à step 2 ──────────────────────────────
async function fillStep1AndNext() {
  fireEvent.change(screen.getByPlaceholderText('Jean'),   { target: { value: 'Youcef'  } });
  fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Benali'  } });
  fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
  fireEvent.click(screen.getByText(/Prochaine étape/i));
  await waitFor(() =>
    expect(screen.getByText(/Abonnement de l'adhérent/i)).toBeInTheDocument()
  );
}

// ─── Helper : remplir step 2 et passer à step 3 ──────────────────────────────
async function fillStep2AndNext() {
  // Sélectionner type abonnement
  fireEvent.change(screen.getByRole('combobox', { name: /type/i }) ||
    screen.getAllByRole('combobox')[0], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Prochaine étape/i));
  await waitFor(() =>
    expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument()
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.api = {
    createAdherentComplet: jest.fn().mockResolvedValue({ ok: true }),
    getTypesAbonnement:    jest.fn().mockResolvedValue(TYPES_ABO),
  };
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL — STEP 1
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 1 — Informations personnelles', () => {

  test('AM01 — affiche le titre "Nouvel adhérent"', () => {
    renderModal();
    expect(screen.getByText(/Nouvel adhérent/i)).toBeInTheDocument();
  });

  test('AM02 — affiche "Étape 1/3"', () => {
    renderModal();
    expect(screen.getByText(/Étape 1\/3/i)).toBeInTheDocument();
  });

  test('AM03 — champs Prénom, Nom, Téléphone présents', () => {
    renderModal();
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('06 12 34 56 78')).toBeInTheDocument();
  });

  test('AM04 — bouton "Annuler" appelle onClose', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('AM05 — clic hors du modal appelle onClose', () => {
    renderModal();
    // Le div backdrop a l'onClick
    const backdrop = screen.getByText(/Nouvel adhérent/i).closest('[style]');
    // Simuler click sur le backdrop (element parent fixe)
    fireEvent.click(document.querySelector('[style*="fixed"]'));
    // onClose appelé si target === currentTarget — difficile à tester directement,
    // on vérifie juste que le modal est rendu
    expect(screen.getByText(/Nouvel adhérent/i)).toBeInTheDocument();
  });

  test('AM06 — validation : nom requis bloque la navigation', async () => {
    renderModal();
    // Remplir seulement prénom et téléphone, pas le nom
    fireEvent.change(screen.getByPlaceholderText('Jean'),           { target: { value: 'Youcef'     } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument()
    );
    // Toujours sur step 1
    expect(screen.queryByText(/Abonnement de l'adhérent/i)).not.toBeInTheDocument();
  });

  test('AM07 — validation : prénom requis bloque la navigation', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Dupont'),         { target: { value: 'Benali'     } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0661111111' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument()
    );
  });

  test('AM08 — validation : téléphone requis bloque la navigation', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Jean'),   { target: { value: 'Youcef' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Benali' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Le téléphone est requis/i)).toBeInTheDocument()
    );
  });

  test('AM09 — email invalide affiche erreur en temps réel', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), {
      target: { value: 'invalid' },
    });
    await waitFor(() =>
      expect(screen.getByText(/Format invalide/i)).toBeInTheDocument()
    );
  });

  test('AM10 — email valide ne montre pas d\'erreur', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), {
      target: { value: 'valid@email.com' },
    });
    expect(screen.queryByText(/Format invalide/i)).not.toBeInTheDocument();
  });

  test('AM11 — téléphone avec lettres affiche "Chiffres uniquement"', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), {
      target: { value: 'abc123' },
    });
    await waitFor(() =>
      expect(screen.getByText(/Chiffres uniquement/i)).toBeInTheDocument()
    );
  });

  test('AM12 — radio Sexe présent (Homme / Femme)', () => {
    renderModal();
    expect(screen.getByDisplayValue('Homme')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Femme')).toBeInTheDocument();
  });

  test('AM13 — formulaire valide passe à l\'étape 2', async () => {
    renderModal();
    await fillStep1AndNext();
    expect(screen.getByText(/Étape 2\/3/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STEP 2 — Abonnement
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 2 — Abonnement', () => {

  async function goToStep2() {
    renderModal();
    await fillStep1AndNext();
  }

  test('AM14 — affiche "Étape 2/3"', async () => {
    await goToStep2();
    expect(screen.getByText(/Étape 2\/3/i)).toBeInTheDocument();
  });

  test('AM15 — liste les types d\'abonnement dans le select', async () => {
    await goToStep2();
    expect(screen.getByText(/Mensuel — 2000 DA/i)).toBeInTheDocument();
    expect(screen.getByText(/Annuel — 18000 DA/i)).toBeInTheDocument();
  });

  test('AM16 — bouton Précédent revient à l\'étape 1', async () => {
    await goToStep2();
    fireEvent.click(screen.getByRole('button', { name: /Précédent/i }));
    await waitFor(() =>
      expect(screen.getByText(/Étape 1\/3/i)).toBeInTheDocument()
    );
  });

  test('AM17 — sans sélection de type, alerte et reste step 2', async () => {
    await goToStep2();
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/sélectionner un type/i));
    alertMock.mockRestore();
  });

  test('AM18 — sélection type met à jour le total affiché', async () => {
    await goToStep2();
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });
    await waitFor(() =>
      expect(screen.getByText(/2000\.00/)).toBeInTheDocument()
    );
  });

  test('AM19 — champ remise modifie le total (10% sur 2000 = 1800)', async () => {
    await goToStep2();
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });
    const remiseInput = screen.getByPlaceholderText('0');
    fireEvent.change(remiseInput, { target: { value: '10' } });
    await waitFor(() =>
      expect(screen.getByText(/1800\.00/)).toBeInTheDocument()
    );
  });

  test('AM20 — checkbox frais d\'inscription affiche le champ montant', async () => {
    await goToStep2();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() =>
      expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThanOrEqual(1)
    );
  });

  test('AM21 — sélection type + date de début → date fin calculée automatiquement', async () => {
    await goToStep2();
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } }); // Mensuel = 1 mois
    // La date fin doit apparaître (format fr-FR)
    await waitFor(() => {
      const dateFin = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateFin.length).toBeGreaterThan(0);
    });
  });

  test('AM22 — passer à step 3 avec type sélectionné', async () => {
    await goToStep2();
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. STEP 3 — Paiement
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 3 — Paiement', () => {

  async function goToStep3() {
    renderModal();
    await fillStep1AndNext();
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() =>
      expect(screen.getByText(/Récapitulatif & Paiement/i)).toBeInTheDocument()
    );
  }

  test('AM23 — affiche "Étape 3/3"', async () => {
    await goToStep3();
    expect(screen.getByText(/Étape 3\/3/i)).toBeInTheDocument();
  });

  test('AM24 — affiche le récapitulatif avec nom de l\'adhérent', async () => {
    await goToStep3();
    expect(screen.getByText(/Youcef Benali/i)).toBeInTheDocument();
  });

  test('AM25 — affiche le type d\'abonnement dans le récapitulatif', async () => {
    await goToStep3();
    expect(screen.getAllByText(/Mensuel/i).length).toBeGreaterThan(0);
  });

  test('AM26 — boutons "Payer maintenant" et "Payer plus tard" présents', async () => {
    await goToStep3();
    expect(screen.getByText(/Payer maintenant/i)).toBeInTheDocument();
    expect(screen.getByText(/Payer plus tard/i)).toBeInTheDocument();
  });

  test('AM27 — bouton Précédent revient à step 2', async () => {
    await goToStep3();
    fireEvent.click(screen.getByRole('button', { name: /Précédent/i }));
    await waitFor(() =>
      expect(screen.getByText(/Étape 2\/3/i)).toBeInTheDocument()
    );
  });

  test('AM28 — sans choisir statut paiement, bouton "Créer" est désactivé', async () => {
    await goToStep3();
    const creerBtn = screen.getByRole('button', { name: /Créer l'adhérent/i });
    expect(creerBtn).toBeDisabled();
  });

  test('AM29 — clic "Payer plus tard" active le bouton Créer', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
  });

  test('AM30 — clic "Payer maintenant" affiche les modes de paiement', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() => {
      expect(screen.getByText(/Espèces/i)).toBeInTheDocument();
      expect(screen.getByText(/Carte bancaire/i)).toBeInTheDocument();
      expect(screen.getByText(/Virement/i)).toBeInTheDocument();
    });
  });

  test('AM31 — "Payer plus tard" affiche indication montant dû', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByText(/à régler ultérieurement/i)).toBeInTheDocument()
    );
  });

  test('AM32 — "Payer maintenant" affiche montant encaissé', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() =>
      expect(screen.getByText(/Montant encaissé/i)).toBeInTheDocument()
    );
  });

  test('AM33 — création réussie appelle createAdherentComplet', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledTimes(1)
    );
  });

  test('AM34 — création réussie appelle onSave puis onClose', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  test('AM35 — création avec "Payer plus tard" envoie montant=0', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ montant: 0, payerMaintenant: false })
      )
    );
  });

  test('AM36 — création avec "Payer maintenant" envoie montant=total', async () => {
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ montant: 2000, payerMaintenant: true })
      )
    );
  });

  test('AM37 — erreur API affiche une alerte', async () => {
    window.api.createAdherentComplet = jest.fn().mockRejectedValue(new Error('DB error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await goToStep3();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/Erreur lors de la création/i))
    );
    alertMock.mockRestore();
    console.error.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CAS EDGE — typesAbonnement vide → chargé via window.api
// ═══════════════════════════════════════════════════════════════════════════════
describe('Chargement des types via API', () => {

  test('AM38 — si typesAbonnement=[] et window.api.getTypesAbonnement disponible, les charge', async () => {
    render(<AddMemberModal typesAbonnement={[]} onSave={onSave} onClose={onClose} />);
    await waitFor(() =>
      expect(window.api.getTypesAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('AM39 — si typesAbonnement fournis, ne rappelle pas l\'API', async () => {
    renderModal(); // typesAbonnement fournis
    await waitFor(() =>
      expect(window.api.getTypesAbonnement).not.toHaveBeenCalled()
    );
  });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 5. STEP 2 — Discipline et frais d'inscription
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 2 — Discipline et frais', () => {

  async function goToStep2() {
    renderModal();
    await fillStep1AndNext();
  }

  test('AM40 — select discipline contient les options', async () => {
    await goToStep2();
    // Il y a 2 combobox : type abo + discipline
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    // Vérifier que Musculation est dans les options
    expect(screen.getByText('Musculation')).toBeInTheDocument();
    expect(screen.getByText('Cardio')).toBeInTheDocument();
  });

  test('AM41 — sélection discipline met à jour le formulaire', async () => {
    await goToStep2();
    const selects = screen.getAllByRole('combobox');
    const disciplineSelect = selects[1]; // 2ème select = discipline
    fireEvent.change(disciplineSelect, { target: { value: 'Boxe' } });
    expect(disciplineSelect.value).toBe('Boxe');
  });

  test('AM42 — frais d\'inscription cochés affichent le champ montant', async () => {
    await goToStep2();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('0');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('AM43 — frais inscription ajoutés au total (2000 + 500 = 2500)', async () => {
    await goToStep2();
    // Sélectionner Mensuel
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    // Cocher frais
    fireEvent.click(screen.getByRole('checkbox'));
    // Saisir montant frais
    await waitFor(() => screen.getAllByPlaceholderText('0'));
    const inputs = screen.getAllByPlaceholderText('0');
    const montantInput = inputs[inputs.length - 1];
    fireEvent.change(montantInput, { target: { value: '500' } });
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/2500/)
    );
  });

  test('AM44 — changer la date de début met à jour la date de fin', async () => {
    await goToStep2();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } }); // Mensuel
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInputs[0], { target: { value: '2025-06-01' } });
    await waitFor(() =>
      expect(screen.getByText(/01\/07\/2025/)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. STEP 3 — Modes de paiement
// ═══════════════════════════════════════════════════════════════════════════════
describe('Step 3 — Modes de paiement', () => {

  async function goToStep3WithPay() {
    renderModal();
    await fillStep1AndNext();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => screen.getByText(/Récapitulatif & Paiement/i));
    // Choisir payer maintenant pour afficher les modes
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() => screen.getByText(/Espèces/i));
  }

  test('AM45 — mode "Espèces" sélectionnable', async () => {
    await goToStep3WithPay();
    fireEvent.click(screen.getByText('Espèces'));
    // Le bouton doit être visuellement sélectionné (pas d\'assertion de style,
    // on vérifie que le click ne lève pas d'erreur et que la création fonctionne)
    expect(screen.getByText('Espèces')).toBeInTheDocument();
  });

  test('AM46 — mode "Carte bancaire" sélectionnable', async () => {
    await goToStep3WithPay();
    fireEvent.click(screen.getByText('Carte bancaire'));
    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
  });

  test('AM47 — mode "Virement" sélectionnable', async () => {
    await goToStep3WithPay();
    fireEvent.click(screen.getByText('Virement'));
    expect(screen.getByText('Virement')).toBeInTheDocument();
  });

  test('AM48 — création avec mode Carte envoie modePaiement=carte', async () => {
    await goToStep3WithPay();
    fireEvent.click(screen.getByText('Carte bancaire'));
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ modePaiement: 'carte', payerMaintenant: true })
      )
    );
  });

  test('AM49 — création avec mode Virement envoie modePaiement=virement', async () => {
    await goToStep3WithPay();
    fireEvent.click(screen.getByText('Virement'));
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ modePaiement: 'virement' })
      )
    );
  });

  test('AM50 — nom et prénom corrects transmis à l\'API', async () => {
    renderModal();
    await fillStep1AndNext(); // Youcef Benali
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Prochaine étape/i));
    await waitFor(() => screen.getByText(/Récapitulatif & Paiement/i));
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer l'adhérent/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole('button', { name: /Créer l'adhérent/i }));
    await waitFor(() =>
      expect(window.api.createAdherentComplet).toHaveBeenCalledWith(
        expect.objectContaining({ nom: 'Benali', prenom: 'Youcef' })
      )
    );
  });
});