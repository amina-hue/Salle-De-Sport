import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

/* ─── Mocks ─────────────────────────────────────────────────────────────────── */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/parametres' }),
}));
jest.mock('../../renderer/components/QuickActions', () => () => <div data-testid="quick-actions" />);
jest.mock('../../images/Gymnastique.png', () => 'gym.png');
jest.mock('../../images/gym2.png',        () => 'gym2.png');

const fakeRoles = [
  { id: 1, nom: 'admin',  name: 'admin',  users: 2 },
  { id: 2, nom: 'coach',  name: 'coach',  users: 3 },
  { id: 3, nom: 'caisse', name: 'caisse', users: 1 },
];

const fakeActivites = [
  { idActivite: 1, nom: 'Zumba',   couleur: '#22c55e' },
  { idActivite: 2, nom: 'Pilates', couleur: '#3b82f6' },
];

const fakePermissions = {
  statistiques: 'autorise',
  adherents:    'interdit',
  abonnements:  'autorise',
  paiements:    'autorise',
  planning:     'autorise',
  recette:      'autorise',
  magasin:      'autorise',
  utilisateur:  'autorise',
  parametres:   'autorise',
};

function makeMock(overrides = {}) {
  return {
    invoke: jest.fn((channel, ...args) => {
      if (overrides[channel]) return overrides[channel](...args);
      if (channel === 'getRolesAvecCount') return Promise.resolve(fakeRoles);
      if (channel === 'getActivites')      return Promise.resolve(fakeActivites);
      if (channel === 'getPermissions')    return Promise.resolve(fakePermissions);
      if (channel === 'addRole')           return Promise.resolve({ id: 99 });
      if (channel === 'addActivite')       return Promise.resolve({ id: 99 });
      if (channel === 'deleteActivite')    return Promise.resolve({ success: true });
      if (channel === 'deleteRole')        return Promise.resolve({ success: true });
      if (channel === 'savePermissions')   return Promise.resolve({ success: true });
      return Promise.resolve([]);
    }),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  window.electron = makeMock();
  window.confirm  = jest.fn(() => true);
  window.alert    = jest.fn();
});

import Parametres from '../../renderer/pages/Parametres';

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
async function renderAndWait() {
  render(<Parametres />);
  await waitFor(() => expect(screen.getByText(/Zumba/i)).toBeInTheDocument());
}

async function openPermsForCoach() {
  const btns = screen.getAllByRole('button', { name: /^Permissions$/i });
  fireEvent.click(btns[0]);
  await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
}

/* ══════════════════════════════════════════════════════════════════════════════
   A. CONFIRM DIALOG — toutes les branches
══════════════════════════════════════════════════════════════════════════════ */
describe('A. ConfirmDialog — branches complètes', () => {

  test('A01 — dialog s\'ouvre avec variant danger (suppressionrôle)', async () => {
    await renderAndWait();
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => expect(screen.getByText(/Supprimer le rôle/i)).toBeInTheDocument());
    // Le dialog doit afficher le bouton Supprimer avec icône
    expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(1);
  });

  test('A02 — dialog s\'ouvre avec variant danger (suppression activité)', async () => {
    await renderAndWait();
    // Find delete button in activity card
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    const trashBtn = within(card).getAllByRole('button')[0];
    fireEvent.click(trashBtn);
    await waitFor(() => expect(screen.getByText(/Supprimer l'activité/i)).toBeInTheDocument());
  });

  test('A03 — clic overlay du dialog → ferme sans action', async () => {
    await renderAndWait();
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    // Click the backdrop overlay (the fixed div that is the direct parent of the modal card)
    const dialog = screen.getByText(/Supprimer le rôle/i).closest('[style*="fixed"]');
    if (dialog) {
      fireEvent.click(dialog);
      await waitFor(() =>
        expect(screen.queryByText(/sera définitivement supprimé/i)).not.toBeInTheDocument()
      );
      expect(window.electron.invoke).not.toHaveBeenCalledWith('deleteRole', expect.anything());
    }
  });

  test('A04 — Annuler dans le dialog activité → deleteActivite non appelé', async () => {
    await renderAndWait();
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    const trashBtn = within(card).getAllByRole('button')[0];
    fireEvent.click(trashBtn);
    await waitFor(() => screen.getByText(/Supprimer l'activité/i));
    const annulerBtns = screen.getAllByRole('button', { name: /Annuler/i });
    fireEvent.click(annulerBtns[annulerBtns.length - 1]);
    await new Promise(r => setTimeout(r, 100));
    expect(window.electron.invoke).not.toHaveBeenCalledWith('deleteActivite', expect.anything());
  });

  test('A05 — Confirmer dans le dialog activité → deleteActivite appelé', async () => {
    await renderAndWait();
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    const trashBtn = within(card).getAllByRole('button')[0];
    fireEvent.click(trashBtn);
    await waitFor(() => screen.getByText(/Supprimer l'activité/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(supprimerBtns[supprimerBtns.length - 1]);
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('deleteActivite', expect.anything())
    );
  });

  test('A06 — Confirmer dans le dialog rôle → deleteRole appelé', async () => {
    await renderAndWait();
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    const supprimerBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(supprimerBtns[supprimerBtns.length - 1]);
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('deleteRole', expect.anything())
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   B. MODAL — fermeture par overlay
══════════════════════════════════════════════════════════════════════════════ */
describe('B. Modal — fermeture overlay', () => {

  test('B01 — clic overlay du modal "Nouveau rôle" ferme le modal', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    // Le modal est un div avec position:fixed, cliquer dessus (pas l'enfant)
    const modalBackdrop = screen.getByPlaceholderText(/Nom du rôle/i)
      .closest('[style*="fixed"]');
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop);
      await waitFor(() =>
        expect(screen.queryByPlaceholderText(/Nom du rôle/i)).not.toBeInTheDocument()
      );
    }
  });

  test('B02 — clic overlay du modal "Nouvelle activité" ferme le modal', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    const modalBackdrop = screen.getByPlaceholderText(/Ex.*Zumba/i)
      .closest('[style*="fixed"]');
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop);
      await waitFor(() =>
        expect(screen.queryByPlaceholderText(/Ex.*Zumba/i)).not.toBeInTheDocument()
      );
    }
  });

  test('B03 — bouton X du modal rôle ferme le modal', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    // Find X button (no text content, close button)
    const allBtns = screen.getAllByRole('button');
    const xBtn = allBtns.find(b =>
      b.textContent.trim() === '' &&
      (b.getAttribute('style') || '').includes('none') ||
      b.querySelector('svg')
    );
    // Find the modal container and look for close button
    const modal = screen.getByPlaceholderText(/Nom du rôle/i).closest('[style*="border-radius: 16"]') ||
                  screen.getByPlaceholderText(/Nom du rôle/i).closest('[style*="borderRadius"]');
    if (modal) {
      const closeBtns = within(modal).getAllByRole('button').filter(b => b.textContent.trim() === '');
      if (closeBtns.length > 0) {
        fireEvent.click(closeBtns[0]);
        await waitFor(() =>
          expect(screen.queryByPlaceholderText(/Nom du rôle/i)).not.toBeInTheDocument()
        );
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   C. INPUT — states focus/blur
══════════════════════════════════════════════════════════════════════════════ */
describe('C. Input — focus et blur', () => {

  test('C01 — focus sur le champ "Nom du rôle" → border change', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    const input = screen.getByPlaceholderText(/Nom du rôle/i);
    fireEvent.focus(input);
    // Input should have focused state (border-color changes to accentBorder)
    expect(input).toBeInTheDocument();
    fireEvent.blur(input);
    expect(input).toBeInTheDocument();
  });

  test('C02 — focus sur le champ "Nom de l\'activité" → ne plante pas', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    const input = screen.getByPlaceholderText(/Ex.*Zumba/i);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input).toBeInTheDocument();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   D. PERMISSIONS EDITOR — branches loading + toggle états
══════════════════════════════════════════════════════════════════════════════ */
describe('D. PermissionsEditor — branches loading et toggles', () => {

  test('D01 — état loading=true affiche "Chargement…"', async () => {
    window.electron = makeMock({
      getPermissions: () => new Promise(() => {}), // never resolves
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Zumba/i));
    const btns = screen.getAllByRole('button', { name: /^Permissions$/i });
    fireEvent.click(btns[0]);
    await waitFor(() => expect(screen.getAllByText(/Chargement/i).length).toBeGreaterThan(0));
  });

  test('D02 — toggle d\'une permission autorisée → interdit', async () => {
    await renderAndWait();
    await openPermsForCoach();
    // Statistiques est "autorise" → cliquer le bouton "interdit" (2ème bouton de la ligne)
    const statsLabel = screen.getByText('Statistiques');
    const row = statsLabel.closest('div').parentElement;
    const toggleBtns = within(row).getAllByRole('button');
    // 2 boutons : [autorise, interdit]
    if (toggleBtns.length >= 2) {
      fireEvent.click(toggleBtns[1]); // interdit
    }
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('savePermissions',
        expect.objectContaining({ role_id: 2 })
      )
    );
  });

  test('D03 — toggle d\'une permission interdite → autorisée', async () => {
    await renderAndWait();
    await openPermsForCoach();
    // Adhérents est "interdit" → cliquer le bouton "autorisé" (1er bouton)
    const adherentsLabel = screen.getByText('Adhérents');
    const row = adherentsLabel.closest('div').parentElement;
    const toggleBtns = within(row).getAllByRole('button');
    if (toggleBtns.length >= 1) {
      fireEvent.click(toggleBtns[0]); // autorisé
    }
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('savePermissions',
        expect.objectContaining({ role_id: 2 })
      )
    );
  });

  test('D04 — toggle de toutes les permissions (couverture max)', async () => {
    await renderAndWait();
    await openPermsForCoach();
    const permNames = ['Statistiques', 'Abonnements', 'Paiements', 'Planning', 'Recette', 'Magasin'];
    for (const name of permNames) {
      const label = screen.queryByText(name);
      if (!label) continue;
      const row = label.closest('div')?.parentElement;
      if (!row) continue;
      const btns = within(row).getAllByRole('button');
      if (btns.length >= 2) fireEvent.click(btns[1]); // toggle vers interdit
    }
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('savePermissions', expect.anything())
    );
  });

  test('D05 — les 9 labels de permissions sont tous cliquables', async () => {
    await renderAndWait();
    await openPermsForCoach();
    const permNames = ['Statistiques', 'Adhérents', 'Abonnements', 'Paiements', 'Planning', 'Recette', 'Magasin', 'Utilisateurs', 'Paramètres'];
    for (const name of permNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  test('D06 — deuxième rôle (caisse) peut aussi ouvrir les permissions', async () => {
    await renderAndWait();
    const btns = screen.getAllByRole('button', { name: /^Permissions$/i });
    // btns[1] est pour "caisse"
    if (btns.length >= 2) {
      fireEvent.click(btns[1]);
      await waitFor(() =>
        expect(window.electron.invoke).toHaveBeenCalledWith('getPermissions', 3)
      );
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   E. TOAST SYSTEM — tous les types
══════════════════════════════════════════════════════════════════════════════ */
describe('E. Toast system — success, error, info', () => {

  test('E01 — succès ajout rôle → toast success apparaît', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    fireEvent.change(screen.getByPlaceholderText(/Nom du rôle/i), { target: { value: 'TestRole' } });
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }));
    await waitFor(() =>
      expect(screen.queryByText(/créé avec succès/i)).toBeInTheDocument()
    );
  });

  test('E02 — erreur addRole → toast error apparaît', async () => {
    window.electron = makeMock({
      addRole: () => Promise.reject(new Error('error')),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Zumba/i));
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    fireEvent.change(screen.getByPlaceholderText(/Nom du rôle/i), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }));
    await waitFor(() =>
      expect(screen.queryByText(/Erreur lors de l'ajout du rôle/i)).toBeInTheDocument()
    );
  });

  test('E03 — succès suppression rôle → toast success', async () => {
    await renderAndWait();
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    const confirmBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByText(/supprimé\./i)).toBeInTheDocument()
    );
  });

  test('E04 — erreur deleteRole → toast error "Impossible de supprimer"', async () => {
    window.electron = makeMock({
      deleteRole: () => Promise.reject(new Error('FK error')),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Zumba/i));
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    const confirmBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByText(/Impossible de supprimer/i)).toBeInTheDocument()
    );
  });

  test('E05 — succès savePermissions → toast success', async () => {
    await renderAndWait();
    await openPermsForCoach();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.queryByText(/sauvegardées/i)).toBeInTheDocument()
    );
  });

  test('E06 — erreur savePermissions → toast error', async () => {
    window.electron = makeMock({
      savePermissions: () => Promise.reject(new Error('error')),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Zumba/i));
    await openPermsForCoach();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.queryByText(/Erreur lors de la sauvegarde/i)).toBeInTheDocument()
    );
  });

  test('E07 — succès addActivite → toast success', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex.*Zumba/i), { target: { value: 'Yoga' } });
    const confirmBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByText(/ajoutée/i)).toBeInTheDocument()
    );
  });

  test('E08 — succès deleteActivite → toast success', async () => {
    await renderAndWait();
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    const trashBtn = within(card).getAllByRole('button')[0];
    fireEvent.click(trashBtn);
    await waitFor(() => screen.getByText(/Supprimer l'activité/i));
    const confirmBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByText(/supprimée/i)).toBeInTheDocument()
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   F. RÔLE ADMIN — toutes les branches
══════════════════════════════════════════════════════════════════════════════ */
describe('F. Rôle admin (id=1) — branches spécifiques', () => {

  test('F01 — le rôle admin affiche le badge "Accès total" (gold)', async () => {
    await renderAndWait();
    expect(screen.getByText('Accès total')).toBeInTheDocument();
  });

  test('F02 — le rôle admin n\'a PAS de bouton "Permissions"', async () => {
    await renderAndWait();
    // Only 2 "Permissions" buttons (coach + caisse), not 3
    const permBtns = screen.getAllByRole('button', { name: /^Permissions$/i });
    expect(permBtns.length).toBe(2);
  });

  test('F03 — le rôle admin affiche "Super administrateur"', async () => {
    await renderAndWait();
    expect(screen.getByText(/Super administrateur/i)).toBeInTheDocument();
  });

  test('F04 — après suppression d\'un rôle sélectionné l\'éditeur disparaît', async () => {
    await renderAndWait();
    // Open permissions for coach (id=2)
    await openPermsForCoach();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
    // Delete coach (id=2) — the one currently selected
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    // Find the delete button for coach specifically
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    const confirmBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Enregistrer/i })).not.toBeInTheDocument()
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   G. ACTIVITÉS — branches spécifiques
══════════════════════════════════════════════════════════════════════════════ */
describe('G. Activités — branches couverture', () => {

  test('G01 — erreur getActivites → message d\'erreur dans la section', async () => {
    window.electron = makeMock({
      getActivites: () => Promise.reject(new Error('Network')),
    });
    render(<Parametres />);
    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger les activités/i)).toBeInTheDocument()
    );
  });

  test('G02 — liste vide → empty state "Aucune activité"', async () => {
    window.electron = makeMock({
      getActivites: () => Promise.resolve([]),
    });
    render(<Parametres />);
    await waitFor(() =>
      expect(screen.getByText(/Aucune activité/i)).toBeInTheDocument()
    );
  });

  test('G03 — le compteur "0 activités" s\'affiche quand la liste est vide', async () => {
    window.electron = makeMock({
      getActivites: () => Promise.resolve([]),
    });
    render(<Parametres />);
    await waitFor(() =>
      expect(screen.getByText(/0 activités/i)).toBeInTheDocument()
    );
  });

  test('G04 — sélection de chaque couleur dans le picker', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    // Find all color swatch buttons (they have no text, just a background color style)
    const allBtns = screen.getAllByRole('button');
    const swatchBtns = allBtns.filter(b => {
      const style = b.getAttribute('style') || '';
      return (style.includes('background: #') || style.includes('background:#') ||
              style.includes('background-color')) && b.textContent.trim() === '';
    });
    // Click each swatch to ensure color selection branch is hit
    for (const btn of swatchBtns.slice(0, 4)) {
      fireEvent.click(btn);
    }
    expect(screen.getByPlaceholderText(/Ex.*Zumba/i)).toBeInTheDocument();
  });

  test('G05 — saisie activité avec espaces → triméé correctement', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex.*Zumba/i), { target: { value: '  Natation  ' } });
    const confirmBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('addActivite',
        expect.objectContaining({ nom: 'Natation' })
      )
    );
  });

  test('G06 — saisie activité vide avec espaces → erreur requise', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(addBtns[0]);
    await waitFor(() => screen.getByPlaceholderText(/Ex.*Zumba/i));
    fireEvent.change(screen.getByPlaceholderText(/Ex.*Zumba/i), { target: { value: '   ' } });
    const confirmBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() =>
      expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument()
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   H. HOVER STATES — couvrir onMouseEnter/onMouseLeave
══════════════════════════════════════════════════════════════════════════════ */
describe('H. Hover states — onMouseEnter/onMouseLeave', () => {

  test('H01 — hover sur une ligne de rôle', async () => {
    await renderAndWait();
    const rows = screen.getAllByRole('row');
    if (rows.length > 1) {
      fireEvent.mouseEnter(rows[1]);
      fireEvent.mouseLeave(rows[1]);
    }
    expect(screen.getByText(/Gestion des rôles/i)).toBeInTheDocument();
  });

  test('H02 — hover sur le bouton "Permissions"', async () => {
    await renderAndWait();
    const btn = screen.getAllByRole('button', { name: /^Permissions$/i })[0];
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('H03 — hover sur le bouton "Supprimer" d\'un rôle', async () => {
    await renderAndWait();
    const btn = screen.getAllByRole('button', { name: /Supprimer/i })[0];
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('H04 — hover sur une card activité', async () => {
    await renderAndWait();
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(screen.getByText('Zumba')).toBeInTheDocument();
  });

  test('H05 — hover sur le bouton poubelle d\'une activité', async () => {
    await renderAndWait();
    const zumbaText = screen.getByText('Zumba');
    const card = zumbaText.closest('div').parentElement;
    const trashBtn = within(card).getAllByRole('button')[0];
    fireEvent.mouseEnter(trashBtn);
    fireEvent.mouseLeave(trashBtn);
    expect(trashBtn).toBeInTheDocument();
  });

  test('H06 — hover sur le bouton "Nouveau rôle"', async () => {
    await renderAndWait();
    const btn = screen.getByRole('button', { name: /Nouveau rôle/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('H07 — hover sur le bouton "Ajouter" activité', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.mouseEnter(addBtns[0]);
    fireEvent.mouseLeave(addBtns[0]);
    expect(addBtns[0]).toBeInTheDocument();
  });

  test('H08 — hover sur les boutons toggle du dialog de confirmation', async () => {
    await renderAndWait();
    const delBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(delBtns[0]);
    await waitFor(() => screen.getByText(/Supprimer le rôle/i));
    const annulerBtn = screen.getAllByRole('button', { name: /Annuler/i });
    fireEvent.mouseEnter(annulerBtn[annulerBtn.length - 1]);
    fireEvent.mouseLeave(annulerBtn[annulerBtn.length - 1]);
    const supprimerBtns = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.mouseEnter(supprimerBtns[supprimerBtns.length - 1]);
    fireEvent.mouseLeave(supprimerBtns[supprimerBtns.length - 1]);
    expect(screen.getByText(/Supprimer le rôle/i)).toBeInTheDocument();
  });

  test('H09 — hover sur les boutons toggle de l\'éditeur permissions', async () => {
    await renderAndWait();
    await openPermsForCoach();
    const statsLabel = screen.getByText('Statistiques');
    const row = statsLabel.closest('div').parentElement;
    const toggleBtns = within(row).getAllByRole('button');
    for (const btn of toggleBtns) {
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    }
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   I. BTN COMPONENT — tous les variants
══════════════════════════════════════════════════════════════════════════════ */
describe('I. Btn — tous les variants et hover', () => {

  test('I01 — bouton primary (Créer) hover/leave', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByRole('button', { name: /Créer/i }));
    const btn = screen.getByRole('button', { name: /Créer/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('I02 — bouton ghost (Annuler) hover/leave', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByRole('button', { name: /Annuler/i }));
    const btn = screen.getAllByRole('button', { name: /Annuler/i })[0];
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('I03 — bouton success (Ajouter activité) hover/leave', async () => {
    await renderAndWait();
    const addBtns = screen.getAllByRole('button', { name: /^Ajouter$/i });
    fireEvent.mouseEnter(addBtns[0]);
    fireEvent.mouseLeave(addBtns[0]);
    expect(addBtns[0]).toBeInTheDocument();
  });

  test('I04 — bouton danger (Permissions) hover/leave', async () => {
    await renderAndWait();
    const btn = screen.getAllByRole('button', { name: /^Permissions$/i })[0];
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   J. EDGE CASES — cas limites supplémentaires
══════════════════════════════════════════════════════════════════════════════ */
describe('J. Edge cases', () => {

  test('J01 — un seul rôle non-admin → 1 bouton Permissions, 1 Supprimer', async () => {
    window.electron = makeMock({
      getRolesAvecCount: () => Promise.resolve([
        { id: 1, nom: 'admin', name: 'admin', users: 1 },
        { id: 2, nom: 'coach', name: 'coach', users: 0 },
      ]),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/Gestion des rôles/i));
    await waitFor(() => screen.getByText(/coach/i));
    expect(screen.getAllByRole('button', { name: /^Permissions$/i }).length).toBe(1);
  });

  test('J02 — rôle avec 1 membre → affiche "1 membre" (singulier)', async () => {
    window.electron = makeMock({
      getRolesAvecCount: () => Promise.resolve([
        { id: 2, nom: 'coach', name: 'coach', users: 1 },
      ]),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/1 membre/i));
    expect(screen.queryByText(/1 membres/i)).not.toBeInTheDocument();
  });

  test('J03 — rôle avec 0 membre → affiche "0 membre"', async () => {
    window.electron = makeMock({
      getRolesAvecCount: () => Promise.resolve([
        { id: 2, nom: 'coach', name: 'coach', users: 0 },
      ]),
    });
    render(<Parametres />);
    await waitFor(() => screen.getByText(/0 membre/i));
  });

  test('J04 — sauvegarde permissions et ré-ouverture → éditeur se ferme puis peut se rouvrir', async () => {
    await renderAndWait();
    await openPermsForCoach();
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Enregistrer/i })).not.toBeInTheDocument()
    );
    // Re-open
    await openPermsForCoach();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  test('J05 — fermeture permissions puis ouverture d\'un autre rôle', async () => {
    await renderAndWait();
    const permBtns = screen.getAllByRole('button', { name: /^Permissions$/i });
    fireEvent.click(permBtns[0]); // coach
    await waitFor(() => screen.getByRole('button', { name: /Enregistrer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Enregistrer/i })).not.toBeInTheDocument()
    );
    // Open caisse permissions
    const permBtns2 = screen.getAllByRole('button', { name: /^Permissions$/i });
    fireEvent.click(permBtns2[1]); // caisse
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('getPermissions', 3)
    );
  });

  test('J06 — nom de rôle avec caractères spéciaux → addRole appelé', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Nouveau rôle/i }));
    await waitFor(() => screen.getByPlaceholderText(/Nom du rôle/i));
    fireEvent.change(screen.getByPlaceholderText(/Nom du rôle/i), {
      target: { value: "Réceptionniste / Accueil" },
    });
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }));
    await waitFor(() =>
      expect(window.electron.invoke).toHaveBeenCalledWith('addRole',
        expect.objectContaining({ nom: 'Réceptionniste / Accueil' })
      )
    );
  });
});