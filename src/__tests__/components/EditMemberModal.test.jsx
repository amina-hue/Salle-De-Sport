// src/__tests__/components/EditMemberModal.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditMemberModal from '../../renderer/components/EditMemberModal';

// ─── Données de test ──────────────────────────────────────────────────────────
const TYPES_ABO = [
  { id: 1, nom: 'Mensuel',  duree: 1,  prix: 2000  },
  { id: 2, nom: 'Annuel',   duree: 12, prix: 18000 },
];

const MEMBRE_ACTIF = {
  idAdherent:       1,
  idAbonnement:     5,
  nom:              'Benali',
  prenom:           'Youcef',
  email:            'y@mail.com',
  numTelephone:     '0661111111',
  sexe:             'Homme',
  dateNaissance:    '1995-05-10',
  photo:            null,
  type_id:          1,
  typeNom:          'Mensuel',
  abonnementStatut: 'actif',
  dateDebut:        '2025-01-01',
  dateFin:          '2025-02-01',
  dureeSuspension:  '',
  causeSuspension:  '',
  dateFinSuspension:'',
};

const MEMBRE_EXPIRE = {
  ...MEMBRE_ACTIF,
  idAdherent:       2,
  nom:              'Mammeri',
  abonnementStatut: 'expiré',
};

const MEMBRE_SUSPENDU = {
  ...MEMBRE_ACTIF,
  idAdherent:        3,
  nom:               'Haddad',
  abonnementStatut:  'suspendu',
  dureeSuspension:   30,
  causeSuspension:   'Blessure',
  dateFinSuspension: '2025-06-20',
};

const onSave  = jest.fn();
const onClose = jest.fn();

function renderModal(member = MEMBRE_ACTIF, props = {}) {
  return render(
    <EditMemberModal
      member={member}
      typesAbonnement={TYPES_ABO}
      onSave={onSave}
      onClose={onClose}
      {...props}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.api = {
    updateAdherent:             jest.fn().mockResolvedValue({ ok: true }),
    updateAbonnement:           jest.fn().mockResolvedValue({ ok: true }),
    getHistoriqueAbonnements:   jest.fn().mockResolvedValue([]),
    renewAbonnement:            jest.fn().mockResolvedValue({ ok: true }),
  };
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore?.();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL
// ═══════════════════════════════════════════════════════════════════════════════
describe('Rendu initial', () => {

  test('EM01 — affiche les onglets Abonnement et Adhérent', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Abonnement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adhérent/i })).toBeInTheDocument();
  });

  test('EM02 — onglet Abonnement actif par défaut', () => {
    renderModal();
    expect(screen.getByText(/Abonnement de l'adhérent/i)).toBeInTheDocument();
  });

  test('EM03 — bouton Sauvegarder présent', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Sauvegarder/i })).toBeInTheDocument();
  });

  test('EM04 — bouton Annuler appelle onClose', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('EM05 — bouton ✕ appelle onClose', () => {
    renderModal();
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ONGLET ABONNEMENT — TabAbonnement
// ═══════════════════════════════════════════════════════════════════════════════
describe('Onglet Abonnement', () => {

  test('EM06 — appelle getHistoriqueAbonnements au montage', async () => {
    renderModal();
    await waitFor(() =>
      expect(window.api.getHistoriqueAbonnements).toHaveBeenCalledWith(1)
    );
  });

  test('EM07 — affiche "Aucun historique" si API retourne []', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText(/Aucun historique disponible/i)).toBeInTheDocument()
    );
  });

  test('EM08 — affiche les lignes d\'historique', async () => {
  window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
    { typeNom: 'Mensuel', dateDebut: '2025-01-01', dateFin: '2025-02-01', statut: 'Expiré' },
  ]);
  renderModal();
  await waitFor(() =>
    expect(screen.getAllByText('Mensuel').length).toBeGreaterThan(0)
  );
  // Cibler le badge statut dans le tableau
  expect(screen.getAllByText('Expiré').length).toBeGreaterThan(0);
});



  test('EM09 — select statut présent avec valeur "actif"', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    const select = screen.getByDisplayValue('Actif');
    expect(select).toBeInTheDocument();
  });

  test('EM10 — bouton Renouveler visible pour membre actif', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    expect(screen.getByText(/Changer \/ Renouveler/i)).toBeInTheDocument();
  });

  test('EM11 — bouton Renouveler affiche "Renouveler l\'abonnement" pour membre expiré', async () => {
    renderModal(MEMBRE_EXPIRE);
    await waitFor(() => screen.getByText(/Aucun historique/i));
    expect(screen.getByText(/Renouveler l'abonnement/i)).toBeInTheDocument();
  });

  test('EM12 — bouton Renouveler ABSENT pour membre suspendu', async () => {
    renderModal(MEMBRE_SUSPENDU);
    await waitFor(() => screen.getByText(/Aucun historique/i));
    expect(screen.queryByText(/Renouveler/i)).not.toBeInTheDocument();
  });

  test('EM13 — changer statut vers "suspendu" affiche le bloc suspension', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    const select = screen.getByDisplayValue('Actif');
    fireEvent.change(select, { target: { value: 'suspendu' } });
    await waitFor(() =>
      expect(screen.getByText(/Détails de la suspension/i)).toBeInTheDocument()
    );
  });

  test('EM14 — changer statut vers "expiré" cache le bloc suspension', async () => {
    renderModal(MEMBRE_SUSPENDU);
    await waitFor(() => screen.getByText(/Aucun historique/i));
    const select = screen.getByDisplayValue('Suspendu');
    fireEvent.change(select, { target: { value: 'expiré' } });
    await waitFor(() =>
      expect(screen.queryByText(/Détails de la suspension/i)).not.toBeInTheDocument()
    );
  });

  test('EM15 — membre suspendu affiche durée et cause', async () => {
    renderModal(MEMBRE_SUSPENDU);
    await waitFor(() => screen.getByText(/Détails de la suspension/i));
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Blessure')).toBeInTheDocument();
  });

  test('EM16 — champ durée suspension mis à jour calcule dateFinSuspension', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.change(screen.getByDisplayValue('Actif'), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByText(/Détails de la suspension/i));
    const dureeInput = screen.getByPlaceholderText(/Ex : 30/i);
    fireEvent.change(dureeInput, { target: { value: '15' } });
    await waitFor(() => {
      // La date fin suspension doit être calculée
      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      expect(dateInput).toBeInTheDocument();
    });
  });

  test('EM17 — clic Renouveler ouvre RenewModal', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByText(/Changer \/ Renouveler/i));
    await waitFor(() =>
      expect(screen.getByText(/Renouveler l'abonnement/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ONGLET ADHÉRENT — TabAdherent
// ═══════════════════════════════════════════════════════════════════════════════
describe('Onglet Adhérent', () => {

  async function goToTabAdherent(member = MEMBRE_ACTIF) {
    renderModal(member);
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /^Adhérent$/i }));
    await waitFor(() =>
      expect(screen.getByText(/Information de l'adhérent/i)).toBeInTheDocument()
    );
  }

  test('EM18 — clic onglet Adhérent affiche le formulaire', async () => {
    await goToTabAdherent();
    expect(screen.getByText(/Information de l'adhérent/i)).toBeInTheDocument();
  });

  test('EM19 — champ nom pré-rempli', async () => {
    await goToTabAdherent();
    expect(screen.getByDisplayValue('Benali')).toBeInTheDocument();
  });

  test('EM20 — champ téléphone pré-rempli', async () => {
    await goToTabAdherent();
    expect(screen.getByDisplayValue('0661111111')).toBeInTheDocument();
  });

  test('EM21 — champ email pré-rempli', async () => {
    await goToTabAdherent();
    expect(screen.getByDisplayValue('y@mail.com')).toBeInTheDocument();
  });

  test('EM22 — email invalide affiche erreur', async () => {
    await goToTabAdherent();
    fireEvent.change(screen.getByDisplayValue('y@mail.com'), {
      target: { value: 'invalide' },
    });
    await waitFor(() =>
      expect(screen.getByText(/Format e-mail invalide/i)).toBeInTheDocument()
    );
  });

  test('EM23 — email valide ne montre pas d\'erreur', async () => {
    await goToTabAdherent();
    fireEvent.change(screen.getByDisplayValue('y@mail.com'), {
      target: { value: 'nouveau@email.com' },
    });
    expect(screen.queryByText(/Format e-mail invalide/i)).not.toBeInTheDocument();
  });

  test('EM24 — téléphone avec lettres affiche erreur', async () => {
    await goToTabAdherent();
    fireEvent.change(screen.getByDisplayValue('0661111111'), {
      target: { value: 'abc123' },
    });
    await waitFor(() =>
      expect(screen.getByText(/ne doit contenir que des chiffres/i)).toBeInTheDocument()
    );
  });

  test('EM25 — radios Homme / Femme présents', async () => {
    await goToTabAdherent();
    expect(screen.getByDisplayValue('Homme')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Femme')).toBeInTheDocument();
  });

  test('EM26 — clic radio Femme change la sélection', async () => {
    await goToTabAdherent();
    fireEvent.click(screen.getByDisplayValue('Femme'));
    expect(screen.getByDisplayValue('Femme')).toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SAUVEGARDE — handleSave
// ═══════════════════════════════════════════════════════════════════════════════
describe('Sauvegarde', () => {

  test('EM27 — sauvegarder appelle updateAdherent', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(window.api.updateAdherent).toHaveBeenCalledTimes(1)
    );
  });

  test('EM28 — sauvegarder avec idAbonnement appelle updateAbonnement', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(window.api.updateAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('EM29 — succès appelle onSave avec le form', async () => {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledTimes(1)
    );
  });

  test('EM30 — nom vide bloque la sauvegarde (alert)', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal({ ...MEMBRE_ACTIF, nom: '' });
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    expect(alertMock).toHaveBeenCalledWith('Le nom est requis.');
    expect(window.api.updateAdherent).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  test('EM31 — email invalide bloque et bascule sur onglet Adhérent', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal({ ...MEMBRE_ACTIF, email: 'invalide' });
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/e-mail/i));
    await waitFor(() =>
      expect(screen.getByText(/Information de l'adhérent/i)).toBeInTheDocument()
    );
    alertMock.mockRestore();
  });

  test('EM32 — suspension sans durée bloque la sauvegarde', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal({ ...MEMBRE_SUSPENDU, dureeSuspension: '', causeSuspension: '' });
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/durée et la cause/i));
    alertMock.mockRestore();
  });

  test('EM33 — erreur API affiche une alerte', async () => {
    window.api.updateAdherent = jest.fn().mockRejectedValue(new Error('DB error'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/Erreur lors de la mise à jour/i))
    );
    alertMock.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. RenewModal
// ═══════════════════════════════════════════════════════════════════════════════
describe('RenewModal', () => {

  async function openRenew() {
    renderModal();
    await waitFor(() => screen.getByText(/Aucun historique/i));
    fireEvent.click(screen.getByText(/Changer \/ Renouveler/i));
    await waitFor(() =>
      expect(screen.getByText(/🔄 Renouveler l'abonnement/i)).toBeInTheDocument()
    );
  }

  test('EM34 — RenewModal s\'ouvre au clic Renouveler', async () => {
    await openRenew();
    expect(screen.getByText(/🔄 Renouveler l'abonnement/i)).toBeInTheDocument();
  });

  test('EM35 — RenewModal affiche les types d\'abonnement', async () => {
    await openRenew();
    expect(screen.getByText(/Mensuel — 2000 DA/i)).toBeInTheDocument();
    expect(screen.getByText(/Annuel — 18000 DA/i)).toBeInTheDocument();
  });

  // EM36 — deux boutons "Annuler" (modal principal + RenewModal)
test('EM36 — bouton Annuler ferme RenewModal', async () => {
  await openRenew();
  // Prendre le dernier "Annuler" = celui du RenewModal
  const annulerBtns = screen.getAllByRole('button', { name: /Annuler/i });
  fireEvent.click(annulerBtns[annulerBtns.length - 1]);
  await waitFor(() =>
    expect(screen.queryByText(/🔄 Renouveler l'abonnement/i)).not.toBeInTheDocument()
  );
});

  test('EM37 — bouton Confirmer désactivé sans statut paiement', async () => {
    await openRenew();
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).toBeDisabled();
  });

  test('EM38 — sans type sélectionné, alerte au clic Confirmer', async () => {
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
  await openRenew();

  // Remettre le select à vide (member.type_id=1 est présélectionné par défaut)
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[selects.length - 1], { target: { value: '' } });

  // Activer le bouton Confirmer
  fireEvent.click(screen.getByText(/Payer plus tard/i));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
  );

  fireEvent.click(screen.getByRole('button', { name: /✓ Confirmer/i }));
  await waitFor(() =>
    expect(alertMock).toHaveBeenCalledWith("Veuillez sélectionner un type d'abonnement.")
  );
  alertMock.mockRestore();
});

  test('EM39 — sélection type affiche le montant', async () => {
  await openRenew();
  const selects = screen.getAllByRole('combobox');
  const renewSelect = selects[selects.length - 1]; // dernier = celui du RenewModal
  fireEvent.change(renewSelect, { target: { value: '1' } });
  await waitFor(() =>
    expect(screen.getByText(/2000\.00/)).toBeInTheDocument()
  );
});

  test('EM40 — "Payer plus tard" active le bouton Confirmer', async () => {
    await openRenew();
    fireEvent.click(screen.getByText(/Payer plus tard/i));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
    );
  });

  test('EM41 — "Payer maintenant" affiche les modes de paiement', async () => {
    await openRenew();
    fireEvent.click(screen.getByText(/Payer maintenant/i));
    await waitFor(() => {
      expect(screen.getByText('Espèces')).toBeInTheDocument();
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
      expect(screen.getByText('Virement')).toBeInTheDocument();
    });
  });

  test('EM42 — renouvellement réussi appelle renewAbonnement et onSave', async () => {
  await openRenew();
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[selects.length - 1], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Payer plus tard/i));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
  );
  fireEvent.click(screen.getByRole('button', { name: /✓ Confirmer/i }));
  await waitFor(() => {
    expect(window.api.renewAbonnement).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

// EM43 — renouvellement avec "Payer maintenant" envoie montant=prix
test('EM43 — renouvellement avec "Payer maintenant" envoie montant=prix', async () => {
  await openRenew();
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[selects.length - 1], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Payer maintenant/i));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
  );
  fireEvent.click(screen.getByRole('button', { name: /✓ Confirmer/i }));
  await waitFor(() =>
    expect(window.api.renewAbonnement).toHaveBeenCalledWith(
      expect.objectContaining({ montant: 2000, payerMaintenant: true })
    )
  );
});

  test('EM44 — renouvellement avec "Payer plus tard" envoie montant=0', async () => {
  await openRenew();
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[selects.length - 1], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Payer plus tard/i));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
  );
  fireEvent.click(screen.getByRole('button', { name: /✓ Confirmer/i }));
  await waitFor(() =>
    expect(window.api.renewAbonnement).toHaveBeenCalledWith(
      expect.objectContaining({ montant: 0, payerMaintenant: false })
    )
  );
});

test('EM45 — erreur API dans RenewModal affiche alerte', async () => {
  window.api.renewAbonnement = jest.fn().mockRejectedValue(new Error('DB error'));
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
  await openRenew();
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[selects.length - 1], { target: { value: '1' } });
  fireEvent.click(screen.getByText(/Payer plus tard/i));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /✓ Confirmer/i })).not.toBeDisabled()
  );
  fireEvent.click(screen.getByRole('button', { name: /✓ Confirmer/i }));
  await waitFor(() =>
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/Erreur lors du renouvellement/i))
  );
  alertMock.mockRestore();
});

test('EM46 — changer date début recalcule date fin', async () => {
  await openRenew();

  // 1. Sélectionner le type "Mensuel" (duree: 1 mois)
  const selects = screen.getAllByRole('combobox');
  const renewSelect = selects[selects.length - 1];
  fireEvent.change(renewSelect, { target: { value: '1' } });

  // 2. Après sélection du type, dateFin est calculée automatiquement
  //    On attend qu'elle apparaisse avant de chercher les inputs
  await waitFor(() => {
    const dateInputs = screen.getAllByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInputs.length).toBeGreaterThanOrEqual(2); // dateDebut + dateFin
  });

  // 3. Récupérer uniquement l'input dateDebut (celui qui n'est pas readOnly)
  const dateInputs = screen.getAllByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);
  const dateDebut = dateInputs.find(i => !i.readOnly);
  expect(dateDebut).toBeDefined(); // garde-fou

  // 4. Changer la date de début
  fireEvent.change(dateDebut, { target: { value: '2025-06-01' } });

  // 5. Vérifier que dateFin = dateDebut + 1 mois
  await waitFor(() =>
    expect(screen.getByDisplayValue('2025-07-01')).toBeInTheDocument()
  );
});
});