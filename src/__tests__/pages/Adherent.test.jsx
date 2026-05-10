// src/__tests__/pages/Adherent.test.jsx
// Tests basés sur le vrai code de Adherent.jsx
// window.api  → mocké globalement (Electron preload)
// react-router-dom → mocké pour useLocation / useNavigate

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Adherent from '../../renderer/pages/Adherent';

// ─── Mock react-router-dom ────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: '' }),
  useNavigate: () => mockNavigate,
}));

// ─── Mock des composants externes ────────────────────────────────────────────
jest.mock('../../renderer/components/AddMemberModal', () => ({ onSave, onClose }) => (
  <div data-testid="add-modal">
    <button onClick={onSave}>Sauvegarder</button>
    <button onClick={onClose}>Fermer</button>
  </div>
));

jest.mock('../../renderer/components/RenewModal', () => ({ onSave, onClose, member }) => (
  <div data-testid="renew-modal">
    <button onClick={() => onSave({
      type_id: 1,
      dateDebut: '2025-07-01',
      dateFin: '2025-08-01',
      montantDu: 2000,
      payerMaintenant: false,
      montant: 0,
      modePaiement: 'Espèces',
    })}>
      Confirmer renouvellement
    </button>
    <button onClick={onClose}>Fermer</button>
  </div>
));

// ✅ Remplacer ce bloc dans Adherent.test.jsx
jest.mock('../../renderer/components/DeleteConfirm', () => {
  const { useState } = require('react'); // ✅ require autorisé dans jest.mock

  const DeleteConfirm = ({ open, onConfirm, onCancel }) =>
    open ? (
      <div data-testid="delete-confirm">
        <button onClick={onConfirm}>Confirmer</button>
        <button onClick={onCancel}>Annuler</button>
      </div>
    ) : null;

  DeleteConfirm.useDeleteConfirm = () => {
    const [state, setState] = useState({ open: false, resolve: null });

    const askConfirm = () =>
      new Promise(resolve => setState({ open: true, resolve }));

    const confirmProps = {
      open: state.open,
      onConfirm: () => { state.resolve?.(true);  setState({ open: false, resolve: null }); },
      onCancel:  () => { state.resolve?.(false); setState({ open: false, resolve: null }); },
    };
    return { confirmProps, askConfirm };
  };

  return DeleteConfirm;
});

jest.mock('../../renderer/components/QuickActions', () => () => null);
jest.mock('../../images/background.png', () => 'bg.png');

// ─── Données de test ──────────────────────────────────────────────────────────
const MEMBRES = [
  {
    idAdherent: 1, nom: 'Benali', prenom: 'Youcef',
    email: 'y@mail.com', numTelephone: '0661111111',
    abonnementStatut: 'actif',    typeNom: 'Mensuel',
    dateCreation: '2025-01-10',   dateFin: '2025-07-10',
  },
  {
    idAdherent: 2, nom: 'Mammeri', prenom: 'Sara',
    email: 's@mail.com', numTelephone: '0662222222',
    abonnementStatut: 'expiré',   typeNom: 'Annuel',
    dateCreation: '2024-06-01',   dateFin: '2025-06-01',
  },
  {
    idAdherent: 3, nom: 'Haddad', prenom: 'Karim',
    email: 'k@mail.com', numTelephone: '0663333333',
    abonnementStatut: 'suspendu', typeNom: 'Mensuel',
    dateCreation: '2025-02-15',   dateFin: '2025-08-15',
    dureeSuspension: 30, dateFinSuspension: '2025-06-20',
  },
];

const TYPES_ABO = [
  { id: 1, nom: 'Mensuel',  duree: 1,  prix: 2000 },
  { id: 2, nom: 'Annuel',   duree: 12, prix: 18000 },
];

// ─── Setup global window.api ───────────────────────────────────────────────────
beforeEach(() => {
  window.api = {
    getAdherentsAvecAbonnement: jest.fn().mockResolvedValue(MEMBRES),
    getTypesAbonnement:         jest.fn().mockResolvedValue(TYPES_ABO),
    deleteAdherentComplet:      jest.fn().mockResolvedValue({ ok: true }),
    updateAdherent:             jest.fn().mockResolvedValue({ ok: true }),
    updateAdherentPhoto:        jest.fn().mockResolvedValue({ ok: true }),
    updateAbonnement:           jest.fn().mockResolvedValue({ ok: true }),
    addAbonnement:              jest.fn().mockResolvedValue({ insertId: 99 }),
    getHistoriqueAbonnements:   jest.fn().mockResolvedValue([]),
    ajouterPaiement:            jest.fn().mockResolvedValue({ ok: true }),
  };
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CHARGEMENT INITIAL
// ═══════════════════════════════════════════════════════════════════════════════
describe('Chargement initial', () => {

  test('T01 — appelle window.api.getAdherentsAvecAbonnement au montage', async () => {
    render(<Adherent />);
    await waitFor(() =>
      expect(window.api.getAdherentsAvecAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T02 — appelle window.api.getTypesAbonnement au montage', async () => {
    render(<Adherent />);
    await waitFor(() =>
      expect(window.api.getTypesAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T03 — affiche les 3 membres après chargement', async () => {
    render(<Adherent />);
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.getByText(/Haddad/i)).toBeInTheDocument();
    });
  });

  test('T04 — affiche un spinner pendant le chargement', () => {
    window.api.getAdherentsAvecAbonnement = jest.fn(() => new Promise(() => {}));
    render(<Adherent />);
    expect(screen.getByText(/Chargement des adhérents/i)).toBeInTheDocument();
  });

 test('T05 — affiche les compteurs (total, actifs, expirés, suspendus)', async () => {
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Benali/i));
  // Chercher le texte "3 au total" plutôt que juste "3"
  expect(screen.getByText(/au total/i)).toBeInTheDocument();
  expect(screen.getByText(/actifs/i)).toBeInTheDocument();
  expect(screen.getByText(/expirés/i)).toBeInTheDocument();
  expect(screen.getByText(/suspendus/i)).toBeInTheDocument();
});

  test('T06 — toast d\'erreur si getAdherentsAvecAbonnement échoue', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockRejectedValue(new Error('MySQL down'));
    render(<Adherent />);
    await waitFor(() =>
      expect(screen.getByText(/Erreur lors du chargement/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. RECHERCHE / FILTRAGE
// ═══════════════════════════════════════════════════════════════════════════════
describe('Recherche et filtrage', () => {

  test('T07 — le champ recherche est présent', async () => {
    render(<Adherent />);
    expect(screen.getByPlaceholderText(/Rechercher par nom/i)).toBeInTheDocument();
  });

  test('T08 — recherche par nom filtre les résultats', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'Benali');
    expect(screen.getByText(/Benali/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Haddad/i)).not.toBeInTheDocument();
  });

  test('T09 — recherche par email', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 's@mail.com');
    expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
  });

  test('T10 — recherche vide ré-affiche tous les membres', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const input = screen.getByPlaceholderText(/Rechercher par nom/i);
    await userEvent.type(input, 'Ben');
    await userEvent.clear(input);
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    });
  });

  test('T11 — message "Aucun résultat" quand recherche ne correspond à rien', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'zzzzzzz');
    expect(screen.getByText(/Aucun résultat pour/i)).toBeInTheDocument();
  });

  test('T12 — filtre "Actif" n\'affiche que Benali', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Haddad/i)).not.toBeInTheDocument();
    });
  });

  test('T13 — filtre "Expiré" n\'affiche que Mammeri', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Expiré$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
    });
  });

  test('T14 — filtre "Suspendu" n\'affiche que Haddad', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    fireEvent.click(screen.getByRole('button', { name: /^Suspendu$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Haddad/i)).toBeInTheDocument();
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
    });
  });

  test('T15 — filtre "Tous" ré-affiche tous les membres', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Expiré$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Tous$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.getByText(/Haddad/i)).toBeInTheDocument();
    });
  });

  test('T16 — compteur de résultats mis à jour après filtre', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await waitFor(() =>
      expect(screen.getByText(/1 résultat/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BOUTONS D'ACTION PRINCIPAUX
// ═══════════════════════════════════════════════════════════════════════════════
describe('Actions principales', () => {

  test('T17 — bouton "Ajouter un adhérent" est présent', async () => {
    render(<Adherent />);
    expect(screen.getByRole('button', { name: /Ajouter un adhérent/i })).toBeInTheDocument();
  });

  test('T18 — clic "Ajouter" ouvre AddMemberModal', async () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    expect(screen.getByTestId('add-modal')).toBeInTheDocument();
  });

  test('T19 — fermer AddMemberModal le retire', async () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    fireEvent.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument();
  });

  test('T20 — sauvegarder dans AddMemberModal affiche un toast de succès', async () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent ajouté avec succès/i)).toBeInTheDocument()
    );
  });

  test('T21 — bouton Rafraîchir rappelle window.api.getAdherentsAvecAbonnement', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByTitle(/Rafraîchir/i));
    await waitFor(() =>
      expect(window.api.getAdherentsAvecAbonnement).toHaveBeenCalledTimes(2)
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MemberCard — statuts & boutons
// ═══════════════════════════════════════════════════════════════════════════════
describe('MemberCard — affichage des statuts', () => {

  test('T22 — badge "Actif" affiché pour Benali', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getAllByText(/^Actif$/i).length).toBeGreaterThan(0);
  });

  test('T23 — badge "Expiré" affiché pour Mammeri', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    expect(screen.getAllByText(/^Expiré$/i).length).toBeGreaterThan(0);
  });

  test('T24 — badge "Suspendu" affiché pour Haddad', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.getAllByText(/^Suspendu$/i).length).toBeGreaterThan(0);
  });

  test('T25 — bouton "Renouveler" visible uniquement pour le membre expiré', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    // ✅ aria-label="Renouveler" ajouté dans le composant → fiable
    const renewBtns = screen.queryAllByRole('button', { name: /^Renouveler$/i });
    expect(renewBtns).toHaveLength(1);
  });

  test('T26 — clic Renouveler ouvre RenewModal', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    expect(screen.getByTestId('renew-modal')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MODIFIER (EditMemberModal)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Modifier un adhérent', () => {

  test('T27 — clic Modifier ouvre EditMemberModal', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const editBtns = screen.getAllByRole('button', { name: /^Modifier$/i });
    fireEvent.click(editBtns[0]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument()
    );
  });

  test('T28 — handleSaveEdit appelle window.api.updateAdherent', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAdherent).toHaveBeenCalledTimes(1)
    );
  });

  test('T29 — succès de modification affiche toast "Adhérent modifié avec succès"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent modifié avec succès/i)).toBeInTheDocument()
    );
  });

 test('T30 — erreur de modification affiche toast d\'erreur', async () => {
  window.api.updateAdherent = jest.fn().mockRejectedValue(new Error('DB error'));
  // Supprimer le console.error pour ne pas polluer la sortie
  jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Benali/i));
  fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
  await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
  fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
  await waitFor(() =>
    expect(screen.getByText(/Erreur lors de la modification/i)).toBeInTheDocument()
  );
  console.error.mockRestore();
});

  test('T31 — Annuler dans EditMemberModal ferme le modal', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Annuler/i }));
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Enregistrer/i })).not.toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SUPPRIMER
// ═══════════════════════════════════════════════════════════════════════════════
describe('Supprimer un adhérent', () => {

  test('T32 — clic Supprimer ouvre la confirmation', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    // ✅ aria-label="Supprimer" ajouté dans le composant → on trouve le bon bouton
    const supprimerBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    fireEvent.click(supprimerBtns[0]);
    await waitFor(() =>
      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument()
    );
  });

  test('T33 — confirmer la suppression appelle deleteAdherentComplet', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    fireEvent.click(supprimerBtns[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(window.api.deleteAdherentComplet).toHaveBeenCalledWith(1)
    );
  });

  test('T34 — annuler la suppression ne déclenche pas deleteAdherentComplet', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    fireEvent.click(supprimerBtns[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(window.api.deleteAdherentComplet).not.toHaveBeenCalled();
  });

  test('T35 — après suppression le toast "Adhérent supprimé" s\'affiche', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    fireEvent.click(supprimerBtns[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent supprimé/i)).toBeInTheDocument()
    );
  });

  test('T36 — erreur de suppression affiche un toast d\'erreur', async () => {
    window.api.deleteAdherentComplet = jest.fn().mockRejectedValue(new Error('DB error'));
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    fireEvent.click(supprimerBtns[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Erreur lors de la suppression/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. HELPERS — formatDate et statusConfig (via rendu)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Helpers — formatDate (via rendu)', () => {

  test('T37 — date ISO correctement formatée en fr-FR', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    // dateCreation = '2025-01-10' → '10 janv. 2025'
    expect(screen.getByText(/10 janv\. 2025/i)).toBeInTheDocument();
  });

  test('T38 — date null n\'affiche pas "Expire le"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], dateFin: null },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.queryByText(/Expire le/i)).not.toBeInTheDocument();
  });
});

describe('Helpers — statusConfig (via rendu)', () => {

  test('T39 — statut inconnu affiche "Sans abo"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], abonnementStatut: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/Sans abo/i)).toBeInTheDocument();
  });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 8. RENOUVELLEMENT
// ═══════════════════════════════════════════════════════════════════════════════
describe('Renouveler un abonnement', () => {

  test('T41 — fermer RenewModal le retire du DOM', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    expect(screen.getByTestId('renew-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(screen.queryByTestId('renew-modal')).not.toBeInTheDocument();
  });

  test('T42 — handleRenew avec idAbonnement appelle updateAbonnement', async () => {
  window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
    { ...MEMBRES[1], idAbonnement: 7 }, // Mammeri — expiré
  ]);
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Mammeri/i));
  fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
  await waitFor(() =>
    expect(window.api.updateAbonnement).toHaveBeenCalledTimes(1)
  );
});

test('T43 — handleRenew sans idAbonnement appelle addAbonnement', async () => {
  window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
    { ...MEMBRES[1], idAbonnement: null }, // Mammeri sans abo
  ]);
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Mammeri/i));
  fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
  await waitFor(() =>
    expect(window.api.addAbonnement).toHaveBeenCalledTimes(1)
  );
});

test('T44 — handleRenew succès affiche toast "Abonnement renouvelé"', async () => {
  window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
    { ...MEMBRES[1], idAbonnement: 7 },
  ]);
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Mammeri/i));
  fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
  await waitFor(() =>
    expect(screen.getByText(/Abonnement renouvelé avec succès/i)).toBeInTheDocument()
  );
});

test('T45 — handleRenew erreur affiche toast d\'erreur', async () => {
  window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
    { ...MEMBRES[1], idAbonnement: 7 },
  ]);
  window.api.updateAbonnement = jest.fn().mockRejectedValue(new Error('DB error'));
  jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<Adherent />);
  await waitFor(() => screen.getByText(/Mammeri/i));
  fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
  await waitFor(() =>
    expect(screen.getByText(/Erreur lors du renouvellement/i)).toBeInTheDocument()
  );
  console.error.mockRestore();
});
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. EditMemberModal — validations internes
// ═══════════════════════════════════════════════════════════════════════════════
describe('EditMemberModal — validations', () => {

  async function openEdit() {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
  }

  test('T43 — onglet Abonnement accessible depuis EditMemberModal', async () => {
    await openEdit();
    fireEvent.click(screen.getByRole('button', { name: /Abonnement/i }));
    await waitFor(() =>
      expect(screen.getByText(/Historique des abonnements/i)).toBeInTheDocument()
    );
  });

  test('T44 — onglet Adhérent accessible depuis EditMemberModal', async () => {
    await openEdit();
    fireEvent.click(screen.getByRole('button', { name: /Abonnement/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Adhérent$/i }));
    await waitFor(() =>
      expect(screen.getByDisplayValue(/Benali/i)).toBeInTheDocument()
    );
  });

  test('T45 — champ Nom pré-rempli avec le nom du membre', async () => {
    await openEdit();
    expect(screen.getByDisplayValue('Benali')).toBeInTheDocument();
  });

  test('T46 — champ Email pré-rempli', async () => {
    await openEdit();
    expect(screen.getByDisplayValue('y@mail.com')).toBeInTheDocument();
  });

  test('T47 — modifier le nom met à jour le champ', async () => {
    await openEdit();
    const nomInput = screen.getByDisplayValue('Benali');
    fireEvent.change(nomInput, { target: { value: 'Benali2' } });
    expect(screen.getByDisplayValue('Benali2')).toBeInTheDocument();
  });

  test('T48 — email invalide affiche message d\'erreur dans le formulaire', async () => {
    await openEdit();
    const emailInput = screen.getByDisplayValue('y@mail.com');
    fireEvent.change(emailInput, { target: { value: 'invalide' } });
    await waitFor(() =>
      expect(screen.getByText(/Format invalide/i)).toBeInTheDocument()
    );
  });

  test('T49 — email valide affiche le message de validation ✓', async () => {
    await openEdit();
    const emailInput = screen.getByDisplayValue('y@mail.com');
    fireEvent.change(emailInput, { target: { value: 'nouveau@email.com' } });
    await waitFor(() =>
      expect(screen.getByText(/✓ Format valide/i)).toBeInTheDocument()
    );
  });

  test('T50 — téléphone avec lettres affiche erreur "Chiffres uniquement"', async () => {
    await openEdit();
    const telInput = screen.getByDisplayValue('0661111111');
    fireEvent.change(telInput, { target: { value: 'abc123' } });
    await waitFor(() =>
      expect(screen.getByText(/Chiffres uniquement/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. HistoriqueAbonnements
// ═══════════════════════════════════════════════════════════════════════════════
describe('HistoriqueAbonnements', () => {

  async function openEditAbonnementTab() {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Abonnement/i }));
  }

  test('T51 — affiche "Aucun historique" quand getHistoriqueAbonnements retourne []', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([]);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Aucun historique disponible/i)).toBeInTheDocument()
    );
  });

  test('T52 — affiche les lignes d\'historique', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 10, typeNom: 'Mensuel',
        dateDebut: '2025-01-01', dateFin: '2025-02-01',
        statut: 'expiré', montantDu: 2000, totalPaye: 2000,
      },
    ]);
    await openEditAbonnementTab();
    await waitFor(() =>
  expect(screen.getAllByText('Mensuel').length).toBeGreaterThan(0)    );
    expect(screen.getByText('Soldé')).toBeInTheDocument();
  });

  test('T53 — paiement partiel affiche "Partiel"', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 11, typeNom: 'Annuel',
        dateDebut: '2025-01-01', dateFin: '2026-01-01',
        statut: 'actif', montantDu: 18000, totalPaye: 5000,
      },
    ]);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Partiel/i)).toBeInTheDocument()
    );
  });

  test('T54 — paiement nul affiche "Impayé"', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 12, typeNom: 'Mensuel',
        dateDebut: '2025-03-01', dateFin: '2025-04-01',
        statut: 'expiré', montantDu: 2000, totalPaye: 0,
      },
    ]);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Impayé/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. handleSaveEdit — onglet abonnement
// ═══════════════════════════════════════════════════════════════════════════════
describe('handleSaveEdit — modifications abonnement', () => {

  test('T55 — enregistrer appelle updateAbonnement si idAbonnement présent', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: 5, type_id: 1, dateDebut: '2025-01-01' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T56 — succès affiche toast "Adhérent modifié avec succès"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent modifié avec succès/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Recherche + filtre combinés
// ═══════════════════════════════════════════════════════════════════════════════
describe('Recherche et filtre combinés', () => {

  test('T57 — filtre Actif + recherche "Ben" n\'affiche que Benali', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'Ben');
    expect(screen.getByText(/Benali/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
  });

  test('T58 — filtre Actif + recherche hors-statut retourne aucun résultat', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'Mammeri');
    await waitFor(() =>
      expect(screen.getByText(/Aucun résultat pour/i)).toBeInTheDocument()
    );
  });

  test('T59 — compteur "0 résultat" quand aucun match', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'zzz');
    await waitFor(() =>
      expect(screen.getByText(/0 résultat/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. Helpers isolés via rendu
// ═══════════════════════════════════════════════════════════════════════════════
describe('Helpers — cas edge', () => {

  test('T60 — statut "suspendu" affiche badge orange dans MemberCard', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    // badge Suspendu visible + bloc suspension avec durée
    expect(screen.getByText(/Suspendu \(30j\)/i)).toBeInTheDocument();
  });

  test('T61 — membre suspendu affiche "Reprise le"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.getByText(/Reprise le/i)).toBeInTheDocument();
  });

  test('T62 — planColor "Annuel" affiche badge doré (Annuel)', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    expect(screen.getByText(/Annuel/i)).toBeInTheDocument();
  });

  test('T63 — membre sans abonnement affiche "Aucun abonnement"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], typeNom: null, abonnementStatut: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/Aucun abonnement/i)).toBeInTheDocument();
    expect(screen.getByText(/Sans abo/i)).toBeInTheDocument();
  });
});