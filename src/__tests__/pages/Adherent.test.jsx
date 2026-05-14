// src/__tests__/pages/Adherent.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Adherent from '../../renderer/pages/Adherent';

// ─── Mock react-router-dom (variable contrôlable) ────────────────────────────
let mockLocationSearch = '';
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: mockLocationSearch }),
  useNavigate: () => mockNavigate,
}));

// ─── Mock des composants externes ────────────────────────────────────────────
jest.mock('../../renderer/components/AddMemberModal', () => ({ onSave, onClose }) => (
  <div data-testid="add-modal">
    <button onClick={onSave}>Sauvegarder</button>
    <button onClick={onClose}>Fermer</button>
  </div>
));

jest.mock('../../renderer/components/RenewModal', () => ({ onSave, onClose }) => (
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
    <button onClick={() => onSave({
      type_id: 1,
      dateDebut: '2025-07-01',
      dateFin: '2025-08-01',
      montantDu: 2000,
      payerMaintenant: true,
      montant: 1500,
      modePaiement: 'Espèces',
    })}>
      Payer maintenant
    </button>
    <button onClick={onClose}>Fermer</button>
  </div>
));

jest.mock('../../renderer/components/DeleteConfirm', () => {
  const { useState } = require('react');

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

jest.mock('../../renderer/components/QuickActions', () => () => (
  <div data-testid="quick-actions" />
));
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
  { id: 1, nom: 'Mensuel',  duree: 1,  prix: 2000  },
  { id: 2, nom: 'Annuel',   duree: 12, prix: 18000 },
];

// ─── Setup global window.api ──────────────────────────────────────────────────
beforeEach(() => {
  mockLocationSearch = '';
  mockNavigate.mockClear();

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
    getAdherentDetail:          jest.fn().mockResolvedValue({ idAbonnement: 99 }),
  };

  window.alert = jest.fn();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function openEditModal(memberIndex = 0) {
  await waitFor(() => screen.getAllByRole('button', { name: /^Modifier$/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /^Modifier$/i })[memberIndex]);
  await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
}

async function openEditAbonnementTab(memberIndex = 0) {
  await openEditModal(memberIndex);
  fireEvent.click(screen.getByRole('button', { name: /Abonnement/i }));
  await waitFor(() => screen.getByText(/Historique des abonnements/i));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CHARGEMENT INITIAL
// ═══════════════════════════════════════════════════════════════════════════════
describe('Chargement initial', () => {

  test('T01 — appelle getAdherentsAvecAbonnement au montage', async () => {
    render(<Adherent />);
    await waitFor(() =>
      expect(window.api.getAdherentsAvecAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T02 — appelle getTypesAbonnement au montage', async () => {
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
// 2. RECHERCHE ET FILTRAGE
// ═══════════════════════════════════════════════════════════════════════════════
describe('Recherche et filtrage', () => {

  test('T07 — le champ recherche est présent', () => {
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

  test('T17 — recherche par numéro de téléphone partiel', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), '0663');
    await waitFor(() => {
      expect(screen.getByText(/Haddad/i)).toBeInTheDocument();
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
    });
  });

  test('T18 — recherche insensible à la casse', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'MAMMERI');
    expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
  });

  test('T19 — filtre Actif + recherche "Ben" n\'affiche que Benali', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'Ben');
    expect(screen.getByText(/Benali/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
  });

  test('T20 — filtre Actif + recherche hors-statut retourne aucun résultat', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByRole('button', { name: /^Actif$/i }));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'Mammeri');
    await waitFor(() =>
      expect(screen.getByText(/Aucun résultat pour/i)).toBeInTheDocument()
    );
  });

  test('T21 — compteur "0 résultat" quand aucun match', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    await userEvent.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'zzz');
    await waitFor(() =>
      expect(screen.getByText(/0 résultat/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ACTIONS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════
describe('Actions principales', () => {

  test('T22 — bouton "Ajouter un adhérent" est présent', () => {
    render(<Adherent />);
    expect(screen.getByRole('button', { name: /Ajouter un adhérent/i })).toBeInTheDocument();
  });

  test('T23 — clic "Ajouter" ouvre AddMemberModal', () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    expect(screen.getByTestId('add-modal')).toBeInTheDocument();
  });

  test('T24 — fermer AddMemberModal le retire', () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    fireEvent.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument();
  });

  test('T25 — sauvegarder dans AddMemberModal affiche un toast de succès', async () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent ajouté avec succès/i)).toBeInTheDocument()
    );
  });

  test('T26 — bouton Rafraîchir rappelle getAdherentsAvecAbonnement', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getByTitle(/Rafraîchir/i));
    await waitFor(() =>
      expect(window.api.getAdherentsAvecAbonnement).toHaveBeenCalledTimes(2)
    );
  });

  test('T27 — compteur mis à jour après rafraîchissement', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue(
      MEMBRES.filter(m => m.idAdherent !== 1)
    );
    fireEvent.click(screen.getByTitle(/Rafraîchir/i));
    await waitFor(() =>
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument()
    );
    expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. URL PARAM — openModal
// ═══════════════════════════════════════════════════════════════════════════════
describe('URL param — openModal', () => {

  test('T28 — openModal=true dans l\'URL ouvre AddMemberModal', async () => {
    mockLocationSearch = '?openModal=true';
    render(<Adherent />);
    await waitFor(() =>
      expect(screen.getByTestId('add-modal')).toBeInTheDocument()
    );
  });

  test('T29 — openModal=true déclenche navigate pour nettoyer l\'URL', async () => {
    mockLocationSearch = '?openModal=true';
    render(<Adherent />);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/adherents', { replace: true })
    );
  });

  test('T30 — sans openModal, navigate n\'est pas appelé', async () => {
    mockLocationSearch = '';
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MEMBERCARD — STATUTS ET BOUTONS
// ═══════════════════════════════════════════════════════════════════════════════
describe('MemberCard — affichage des statuts', () => {

  test('T31 — badge "Actif" affiché pour Benali', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getAllByText(/^Actif$/i).length).toBeGreaterThan(0);
  });

  test('T32 — badge "Expiré" affiché pour Mammeri', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    expect(screen.getAllByText(/^Expiré$/i).length).toBeGreaterThan(0);
  });

  test('T33 — badge "Suspendu" affiché pour Haddad', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.getAllByText(/^Suspendu$/i).length).toBeGreaterThan(0);
  });

  test('T34 — statut inconnu affiche "Sans abo"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], abonnementStatut: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/Sans abo/i)).toBeInTheDocument();
  });

  test('T35 — bouton "Renouveler" visible uniquement pour le membre expiré', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    const renewBtns = screen.queryAllByRole('button', { name: /^Renouveler$/i });
    expect(renewBtns).toHaveLength(1);
  });

  test('T36 — clic Renouveler ouvre RenewModal', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    expect(screen.getByTestId('renew-modal')).toBeInTheDocument();
  });

  test('T37 — membre suspendu affiche "Suspendu (30j)"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.getByText(/Suspendu \(30j\)/i)).toBeInTheDocument();
  });

  test('T38 — membre suspendu affiche "Reprise le"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.getByText(/Reprise le/i)).toBeInTheDocument();
  });

  test('T39 — membre suspendu sans dateFinSuspension n\'affiche pas "Reprise le"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[2], dateFinSuspension: null },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Haddad/i));
    expect(screen.queryByText(/Reprise le/i)).not.toBeInTheDocument();
  });

  test('T40 — membre sans dateFin n\'affiche pas "Expire le"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], dateFin: null },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.queryByText(/Expire le/i)).not.toBeInTheDocument();
  });

  test('T41 — membre sans abonnement affiche "Aucun abonnement"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], typeNom: null, abonnementStatut: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/Aucun abonnement/i)).toBeInTheDocument();
    expect(screen.getByText(/Sans abo/i)).toBeInTheDocument();
  });

  test('T42 — membre sans email affiche "—"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], email: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  test('T43 — membre sans téléphone affiche "—"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], numTelephone: '' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  test('T44 — planColor "Annuel" affiche badge doré', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    expect(screen.getByText(/Annuel/i)).toBeInTheDocument();
  });

  test('T45 — liste vide affiche "Aucun adhérent trouvé"', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([]);
    render(<Adherent />);
    await waitFor(() =>
      expect(screen.getByText(/Aucun adhérent trouvé/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MODIFIER — EditMemberModal
// ═══════════════════════════════════════════════════════════════════════════════
describe('Modifier un adhérent', () => {

  test('T46 — clic Modifier ouvre EditMemberModal', async () => {
    render(<Adherent />);
    await openEditModal();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  test('T47 — champ Nom pré-rempli avec le nom du membre', async () => {
    render(<Adherent />);
    await openEditModal();
    expect(screen.getByDisplayValue('Benali')).toBeInTheDocument();
  });

  test('T48 — champ Email pré-rempli', async () => {
    render(<Adherent />);
    await openEditModal();
    expect(screen.getByDisplayValue('y@mail.com')).toBeInTheDocument();
  });

  test('T49 — modifier le nom met à jour le champ', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('Benali'), { target: { value: 'Benali2' } });
    expect(screen.getByDisplayValue('Benali2')).toBeInTheDocument();
  });

  test('T50 — email invalide affiche message d\'erreur', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('y@mail.com'), { target: { value: 'invalide' } });
    await waitFor(() =>
      expect(screen.getByText(/Format invalide/i)).toBeInTheDocument()
    );
  });

  test('T51 — email valide affiche "✓ Format valide"', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('y@mail.com'), { target: { value: 'nouveau@email.com' } });
    await waitFor(() =>
      expect(screen.getByText(/✓ Format valide/i)).toBeInTheDocument()
    );
  });

  test('T52 — téléphone avec lettres affiche "Chiffres uniquement"', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('0661111111'), { target: { value: 'abc123' } });
    await waitFor(() =>
      expect(screen.getByText(/Chiffres uniquement/i)).toBeInTheDocument()
    );
  });

  test('T53 — corriger un téléphone invalide fait disparaître l\'erreur', async () => {
    render(<Adherent />);
    await openEditModal();
    const tel = screen.getByDisplayValue('0661111111');
    fireEvent.change(tel, { target: { value: 'abc' } });
    await waitFor(() => screen.getByText(/Chiffres uniquement/i));
    fireEvent.change(tel, { target: { value: '0661111111' } });
    await waitFor(() =>
      expect(screen.queryByText(/Chiffres uniquement/i)).not.toBeInTheDocument()
    );
  });

  test('T54 — handleSaveEdit appelle updateAdherent', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAdherent).toHaveBeenCalledTimes(1)
    );
  });

  test('T55 — succès de modification affiche toast', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent modifié avec succès/i)).toBeInTheDocument()
    );
  });

  test('T56 — erreur de modification affiche toast d\'erreur', async () => {
    window.api.updateAdherent = jest.fn().mockRejectedValue(new Error('DB error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Erreur lors de la modification/i)).toBeInTheDocument()
    );
    console.error.mockRestore();
  });

  test('T57 — Annuler dans EditMemberModal ferme le modal', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Enregistrer/i })).not.toBeInTheDocument()
    );
  });

  test('T58 — onglet Abonnement accessible', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Abonnement/i }));
    await waitFor(() =>
      expect(screen.getByText(/Historique des abonnements/i)).toBeInTheDocument()
    );
  });

  test('T59 — onglet Adhérent accessible depuis Abonnement', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.click(screen.getByRole('button', { name: /^Adhérent$/i }));
    await waitFor(() =>
      expect(screen.getByDisplayValue(/Benali/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. HANDLESCAVE — VALIDATIONS BLOQUANTES
// ═══════════════════════════════════════════════════════════════════════════════
describe('handleSave — validations bloquantes', () => {

  test('T60 — nom vide → alerte et updateAdherent non appelé', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('Benali'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    expect(window.alert).toHaveBeenCalledWith('Le nom est requis.');
    expect(window.api.updateAdherent).not.toHaveBeenCalled();
  });

  test('T61 — email invalide au Save → alerte', async () => {
    render(<Adherent />);
    await openEditModal();
    fireEvent.change(screen.getByDisplayValue('y@mail.com'), { target: { value: 'invalid-no-at' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("L'adresse e-mail n'est pas valide.")
    );
    expect(window.api.updateAdherent).not.toHaveBeenCalled();
  });

  test('T62 — suspension sans durée → alerte bloquante', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : Blessure/i), { target: { value: 'Blessure' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        'La durée et la cause de suspension sont obligatoires.'
      )
    );
    expect(window.api.updateAdherent).not.toHaveBeenCalled();
  });

  test('T63 — suspension sans cause → alerte bloquante', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        'La durée et la cause de suspension sont obligatoires.'
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. SUSPENSION — ONGLET ABONNEMENT
// ═══════════════════════════════════════════════════════════════════════════════
describe('EditMemberModal — gestion de la suspension', () => {

  test('T64 — sélectionner "Suspendu" affiche le bloc suspension', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() =>
      expect(screen.getByText(/Détails de la suspension/i)).toBeInTheDocument()
    );
  });

  test('T65 — repasser à "Actif" masque le bloc suspension', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    const select = screen.getByDisplayValue(/actif/i);
    fireEvent.change(select, { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByText(/Détails de la suspension/i));
    fireEvent.change(select, { target: { value: 'actif' } });
    await waitFor(() =>
      expect(screen.queryByText(/Détails de la suspension/i)).not.toBeInTheDocument()
    );
  });

  test('T66 — saisir une durée calcule automatiquement la date de reprise', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '30' } });
    await waitFor(() =>
      expect(screen.getByText(/Reprise prévue le/i)).toBeInTheDocument()
    );
  });

  test('T67 — vider la durée efface la date de reprise', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '30' } });
    await waitFor(() => screen.getByText(/Reprise prévue le/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '' } });
    await waitFor(() =>
      expect(screen.queryByText(/Reprise prévue le/i)).not.toBeInTheDocument()
    );
  });

  test('T68 — suspension affiche "La durée est requise" si vide', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() =>
      expect(screen.getByText(/La durée est requise/i)).toBeInTheDocument()
    );
  });

  test('T69 — suspension affiche "La cause est requise" si vide', async () => {
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '10' } });
    await waitFor(() =>
      expect(screen.getByText(/La cause est requise/i)).toBeInTheDocument()
    );
  });

  test('T70 — enregistrer avec suspension passe les champs à updateAbonnement', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: 5, type_id: 1, dateDebut: '2025-01-01' },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    fireEvent.change(screen.getByDisplayValue(/actif/i), { target: { value: 'suspendu' } });
    await waitFor(() => screen.getByPlaceholderText(/Ex : 30/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex : 30/i), { target: { value: '15' } });
    fireEvent.change(screen.getByPlaceholderText(/Ex : Blessure/i), { target: { value: 'Blessure genou' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAbonnement).toHaveBeenCalledWith(
        expect.objectContaining({
          statut: 'suspendu',
          dureeSuspension: '15',
          causeSuspension: 'Blessure genou',
        })
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. PHOTO
// ═══════════════════════════════════════════════════════════════════════════════
describe('EditMemberModal — photo', () => {

  test('T71 — photo identique → updateAdherentPhoto non appelé', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], photo: 'data:image/png;base64,SAME' },
    ]);
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent modifié avec succès/i)).toBeInTheDocument()
    );
    expect(window.api.updateAdherentPhoto).not.toHaveBeenCalled();
  });

  test('T72 — photo différente → updateAdherentPhoto appelé', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], photo: 'data:image/png;base64,OLD' },
    ]);
    render(<Adherent />);
    await openEditModal();

    const NEW_PHOTO = 'data:image/png;base64,NEWPHOTO';
    let capturedReader;
    global.FileReader = jest.fn().mockImplementation(() => {
      capturedReader = { onload: null, readAsDataURL: jest.fn() };
      return capturedReader;
    });

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    fireEvent.change(document.getElementById('fileEdit'), { target: { files: [file] } });
    act(() => { capturedReader.onload({ target: { result: NEW_PHOTO } }); });

    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAdherentPhoto).toHaveBeenCalledWith(
        expect.objectContaining({ photo: NEW_PHOTO })
      )
    );
    delete global.FileReader;
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. CAMÉRA
// ═══════════════════════════════════════════════════════════════════════════════
describe('startCamera — catch', () => {

  test('T73 — accès caméra refusé → alerte et caméra non affichée', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
      },
      writable: true, configurable: true,
    });
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Prendre une photo/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Impossible d'accéder à la caméra")
    );
    expect(screen.queryByRole('button', { name: /Capturer/i })).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ABONNEMENT — onglet sans abonnement / updateAbonnement
// ═══════════════════════════════════════════════════════════════════════════════
describe('EditMemberModal — abonnement', () => {

  test('T74 — message "n\'a pas encore d\'abonnement" si idAbonnement null', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: null },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/n'a pas encore d'abonnement/i)).toBeInTheDocument()
    );
  });

  test('T75 — addAbonnement appelé si dateDebut + type_id présents et idAbonnement null', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: null, type_id: 1, dateDebut: '2025-06-01', dateFin: '2025-07-01' },
    ]);
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.addAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T76 — updateAbonnement appelé si idAbonnement présent', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: 5, type_id: 1, dateDebut: '2025-01-01' },
    ]);
    render(<Adherent />);
    await openEditModal();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.api.updateAbonnement).toHaveBeenCalledTimes(1)
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. SUPPRIMER
// ═══════════════════════════════════════════════════════════════════════════════
describe('Supprimer un adhérent', () => {

  test('T77 — clic Supprimer ouvre la confirmation', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Supprimer$/i })[0]);
    await waitFor(() =>
      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument()
    );
  });

  test('T78 — confirmer la suppression appelle deleteAdherentComplet', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Supprimer$/i })[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(window.api.deleteAdherentComplet).toHaveBeenCalledWith(1)
    );
  });

  test('T79 — annuler la suppression ne déclenche pas deleteAdherentComplet', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Supprimer$/i })[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(window.api.deleteAdherentComplet).not.toHaveBeenCalled();
  });

  test('T80 — après suppression le toast "Adhérent supprimé" s\'affiche', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Supprimer$/i })[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent supprimé/i)).toBeInTheDocument()
    );
  });

  test('T81 — erreur de suppression affiche un toast d\'erreur', async () => {
    window.api.deleteAdherentComplet = jest.fn().mockRejectedValue(new Error('DB error'));
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    fireEvent.click(screen.getAllByRole('button', { name: /^Supprimer$/i })[0]);
    await waitFor(() => screen.getByTestId('delete-confirm'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Erreur lors de la suppression/i)).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. RENOUVELLEMENT
// ═══════════════════════════════════════════════════════════════════════════════
describe('Renouveler un abonnement', () => {

  test('T82 — fermer RenewModal le retire du DOM', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    expect(screen.getByTestId('renew-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(screen.queryByTestId('renew-modal')).not.toBeInTheDocument();
  });

  test('T83 — handleRenew avec idAbonnement appelle updateAbonnement', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[1], idAbonnement: 7 },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
    await waitFor(() =>
      expect(window.api.updateAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T84 — handleRenew sans idAbonnement appelle addAbonnement', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[1], idAbonnement: null },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer renouvellement/i }));
    await waitFor(() =>
      expect(window.api.addAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('T85 — handleRenew succès affiche toast', async () => {
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

  test('T86 — handleRenew erreur affiche toast d\'erreur', async () => {
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

  test('T87 — payerMaintenant=true avec idAbonnement appelle ajouterPaiement', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[1], idAbonnement: 7 },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Payer maintenant/i }));
    await waitFor(() =>
      expect(window.api.ajouterPaiement).toHaveBeenCalledWith(
        expect.objectContaining({ abonnement_id: 7, montant: 1500, mode: 'Espèces' })
      )
    );
  });

  test('T88 — payerMaintenant=true sans idAbonnement appelle getAdherentDetail puis ajouterPaiement', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[1], idAbonnement: null },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Mammeri/i));
    fireEvent.click(screen.getByRole('button', { name: /^Renouveler$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Payer maintenant/i }));
    await waitFor(() =>
      expect(window.api.ajouterPaiement).toHaveBeenCalledWith(
        expect.objectContaining({ abonnement_id: 99, montant: 1500 })
      )
    );
  });

  test('T89 — payerMaintenant=false n\'appelle pas ajouterPaiement', async () => {
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
    expect(window.api.ajouterPaiement).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. HISTORIQUE ABONNEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('HistoriqueAbonnements', () => {

  test('T90 — affiche "Aucun historique" quand retourne []', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Aucun historique disponible/i)).toBeInTheDocument()
    );
  });

  test('T91 — erreur réseau affiche "Aucun historique disponible"', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockRejectedValue(new Error('réseau'));
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Aucun historique disponible/i)).toBeInTheDocument()
    );
  });

  test('T92 — idAdherent null → getHistoriqueAbonnements non appelé', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAdherent: null },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Aucun historique disponible/i)).toBeInTheDocument()
    );
    expect(window.api.getHistoriqueAbonnements).not.toHaveBeenCalled();
  });

  test('T93 — affiche les lignes d\'historique (Soldé)', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 10, typeNom: 'Mensuel',
        dateDebut: '2025-01-01', dateFin: '2025-02-01',
        statut: 'expiré', montantDu: 2000, totalPaye: 2000,
      },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getAllByText('Mensuel').length).toBeGreaterThan(0)
    );
    expect(screen.getByText('Soldé')).toBeInTheDocument();
  });

  test('T94 — paiement partiel affiche "Partiel"', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 11, typeNom: 'Annuel',
        dateDebut: '2025-01-01', dateFin: '2026-01-01',
        statut: 'actif', montantDu: 18000, totalPaye: 5000,
      },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Partiel/i)).toBeInTheDocument()
    );
  });

  test('T95 — paiement nul affiche "Impayé"', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 12, typeNom: 'Mensuel',
        dateDebut: '2025-03-01', dateFin: '2025-04-01',
        statut: 'expiré', montantDu: 2000, totalPaye: 0,
      },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText(/Impayé/i)).toBeInTheDocument()
    );
  });

  test('T96 — statut "suspendu" dans historique affiche le badge suspendu', async () => {
    window.api.getHistoriqueAbonnements = jest.fn().mockResolvedValue([
      {
        idAbonnement: 20, typeNom: 'Mensuel',
        dateDebut: '2025-03-01', dateFin: '2025-04-01',
        statut: 'suspendu', montantDu: 2000, totalPaye: 1000,
      },
    ]);
    render(<Adherent />);
    await openEditAbonnementTab();
    await waitFor(() =>
      expect(screen.getByText('suspendu')).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. HELPERS — formatDate ET toInputDate VIA RENDU
// ═══════════════════════════════════════════════════════════════════════════════
describe('Helpers — formatDate et toInputDate', () => {

  test('T97 — date ISO correctement formatée en fr-FR', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/10 janv\. 2025/i)).toBeInTheDocument();
  });

  test('T98 — dateCreation non parseable retourne la chaîne brute', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], dateCreation: 'not-a-date' },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.getByText(/not-a-date/i)).toBeInTheDocument();
  });

  test('T99 — dateFin objet Date JS s\'affiche sans planter', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], dateFin: new Date('2025-08-15') },
    ]);
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('T100 — dateDebut avec heure ISO (T00:00:00Z) : modal s\'ouvre sans erreur', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], idAbonnement: 5, type_id: 1, dateDebut: '2025-01-01T00:00:00Z' },
    ]);
    render(<Adherent />);
    await openEditModal();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  test('T101 — dateNaissance invalide → champ date vide dans le form', async () => {
    window.api.getAdherentsAvecAbonnement = jest.fn().mockResolvedValue([
      { ...MEMBRES[0], dateNaissance: 'invalide-xyz' },
    ]);
    render(<Adherent />);
    await openEditModal();
    const emptyDates = Array.from(document.querySelectorAll('input[type="date"]'))
      .filter(i => i.value === '');
    expect(emptyDates.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 16. TOAST — DISPARITION AUTOMATIQUE
// ═══════════════════════════════════════════════════════════════════════════════
describe('Toast — disparition automatique', () => {

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('T102 — le toast disparaît après 2800ms', async () => {
    render(<Adherent />);
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un adhérent/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sauvegarder/i }));
    await waitFor(() =>
      expect(screen.getByText(/Adhérent ajouté avec succès/i)).toBeInTheDocument()
    );
    act(() => jest.advanceTimersByTime(2800));
    await waitFor(() =>
      expect(screen.queryByText(/Adhérent ajouté avec succès/i)).not.toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ACCESSIBILITÉ
// ═══════════════════════════════════════════════════════════════════════════════
describe('Accessibilité', () => {

  test('T103 — chaque bouton Supprimer a aria-label="Supprimer"', async () => {
    render(<Adherent />);
    await waitFor(() => screen.getByText(/Benali/i));
    const suppBtns = screen.getAllByRole('button', { name: /^Supprimer$/i });
    expect(suppBtns).toHaveLength(MEMBRES.length);
  });

  test('T104 — le champ de recherche est accessible via son placeholder', () => {
    render(<Adherent />);
    const input = screen.getByPlaceholderText(/Rechercher par nom, email, téléphone/i);
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  test('T105 — le titre principal "Gestion des adhérents" est présent', () => {
    render(<Adherent />);
    expect(screen.getByText(/Gestion des adhérents/i)).toBeInTheDocument();
  });

  test('T106 — le bouton Rafraîchir a un title accessible', () => {
    render(<Adherent />);
    expect(screen.getByTitle(/Rafraîchir/i)).toBeInTheDocument();
  });
});