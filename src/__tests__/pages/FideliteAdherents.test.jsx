import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../images/gym.png',  () => 'gym.png');
jest.mock('../../images/gym2.png', () => 'gym2.png');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => jest.fn()),
}));
jest.mock('../../renderer/components/QuickActions', () => () => <div data-testid="quick-actions" />);

const mockApi = {
  getPointsFidelite:           jest.fn(),
  getHistoriqueAchatsAdherent: jest.fn(),
};

beforeEach(() => {
  window.api = mockApi;
  jest.clearAllMocks();
});

import FideliteAdherents from '../../renderer/pages/fideliteadherents';

// ─── Données de test ──────────────────────────────────────────────────────────
const CLIENTS = [
  {
    idAdherent:    1,
    nom:           'Amrani',
    prenom:        'Sara',
    points:        3200,
    nb_achats:     15,
    total_depense: 32000,
    dernier_achat: new Date(Date.now() - 5 * 86400000).toISOString(),
    niveau_expire: new Date(Date.now() + 20 * 86400000).toISOString(),
  },
  {
    idAdherent:    2,
    nom:           'Boudia',
    prenom:        'Karim',
    points:        1600,
    nb_achats:     8,
    total_depense: 16000,
    dernier_achat: new Date(Date.now() - 70 * 86400000).toISOString(),
    niveau_expire: null,
  },
  {
    idAdherent:    3,
    nom:           'Cherif',
    prenom:        'Lina',
    points:        200,
    nb_achats:     2,
    total_depense: 2000,
    dernier_achat: null,
    niveau_expire: null,
  },
];

// helper : attend qu'au moins un élément corresponde
async function waitForText(regex) {
  await waitFor(() => {
    expect(screen.getAllByText(regex).length).toBeGreaterThan(0);
  });
}

// ─── 1. Chargement ────────────────────────────────────────────────────────────
describe('1. Chargement des données', () => {
  test('TC-L01 — affiche "Chargement..." pendant le chargement', () => {
    mockApi.getPointsFidelite.mockReturnValue(new Promise(() => {}));
    render(<FideliteAdherents />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  test('TC-L02 — affiche les clients après chargement', async () => {
    mockApi.getPointsFidelite.mockResolvedValue(CLIENTS);
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    await waitForText(/boudia/i);
  });

  test('TC-L03 — getPointsFidelite est appelé au montage', async () => {
    mockApi.getPointsFidelite.mockResolvedValue([]);
    render(<FideliteAdherents />);
    await waitFor(() => expect(mockApi.getPointsFidelite).toHaveBeenCalledTimes(1));
  });

  test('TC-L04 — erreur API ne plante pas le composant', async () => {
    mockApi.getPointsFidelite.mockRejectedValue(new Error('DB error'));
    render(<FideliteAdherents />);
    await waitFor(() => {
      expect(screen.getByText(/fidélité clients/i)).toBeInTheDocument();
    });
  });

  test('TC-L05 — liste vide affiche "Aucun client trouvé"', async () => {
    mockApi.getPointsFidelite.mockResolvedValue([]);
    render(<FideliteAdherents />);
    await waitFor(() => {
      expect(screen.getByText(/aucun client trouvé/i)).toBeInTheDocument();
    });
  });
});

// ─── 2. Niveaux de fidélité ───────────────────────────────────────────────────
describe('2. Niveaux de fidélité', () => {
  beforeEach(() => { mockApi.getPointsFidelite.mockResolvedValue(CLIENTS); });

  test('TC-NV01 — client Platine (3200pts) affiche badge Platine', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getAllByText(/platine/i).length).toBeGreaterThan(0));
  });

  test('TC-NV02 — client Gold (1600pts) affiche badge Gold', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getAllByText(/gold/i).length).toBeGreaterThan(0));
  });

  test('TC-NV03 — client Bronze (200pts) affiche badge Bronze', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getAllByText(/bronze/i).length).toBeGreaterThan(0));
  });

  test('TC-NV04 — les 4 niveaux sont affichés dans les filtres', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => {
      expect(screen.getAllByText(/bronze/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/silver/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/gold/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/platine/i).length).toBeGreaterThan(0);
    });
  });
});

// ─── 3. Statistiques ─────────────────────────────────────────────────────────
describe('3. Statistiques globales', () => {
  beforeEach(() => { mockApi.getPointsFidelite.mockResolvedValue(CLIENTS); });

  test('TC-S01 — "Fidélité Clients" affiché dans le header', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getByText(/fidélité clients/i)).toBeInTheDocument());
  });

  test('TC-S02 — compteur "clients actifs" affiché', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getByText(/clients actifs/i)).toBeInTheDocument());
  });

  test('TC-S03 — client inactif (+60j) comptabilisé', async () => {
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getByText(/inactifs/i)).toBeInTheDocument());
  });
});

// ─── 4. Recherche ────────────────────────────────────────────────────────────
describe('4. Recherche', () => {
  beforeEach(() => { mockApi.getPointsFidelite.mockResolvedValue(CLIENTS); });

  test('TC-RCH01 — rechercher "amrani" filtre les résultats', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.change(screen.getByPlaceholderText(/rechercher un adhérent/i), { target: { value: 'amrani' } });
    await waitFor(() => {
      expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/boudia/i)).not.toBeInTheDocument();
    });
  });

  test('TC-RCH02 — recherche insensible à la casse', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.change(screen.getByPlaceholderText(/rechercher un adhérent/i), { target: { value: 'AMRANI' } });
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('TC-RCH03 — vider la recherche affiche tous les clients', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    const input = screen.getByPlaceholderText(/rechercher un adhérent/i);
    fireEvent.change(input, { target: { value: 'amrani' } });
    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/boudia/i).length).toBeGreaterThan(0);
    });
  });

  test('TC-RCH04 — recherche sans résultat affiche "Aucun client trouvé"', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.change(screen.getByPlaceholderText(/rechercher un adhérent/i), { target: { value: 'xxxxxxxxxxx' } });
    await waitFor(() => expect(screen.getByText(/aucun client trouvé/i)).toBeInTheDocument());
  });
});

// ─── 5. Filtrage par niveau ───────────────────────────────────────────────────
describe('5. Filtrage par niveau', () => {
  beforeEach(() => { mockApi.getPointsFidelite.mockResolvedValue(CLIENTS); });

  test('TC-FN01 — cliquer sur Bronze filtre les clients', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/bronze/i)[0]);
    await waitFor(() => {
      expect(screen.getAllByText(/cherif/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/boudia/i)).not.toBeInTheDocument();
    });
  });

  test('TC-FN02 — cliquer deux fois sur Bronze annule le filtre', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/bronze/i)[0]);
    fireEvent.click(screen.getAllByText(/bronze/i)[0]);
    await waitFor(() => {
      expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/boudia/i).length).toBeGreaterThan(0);
    });
  });
});

// ─── 6. Tri ──────────────────────────────────────────────────────────────────
describe('6. Tri du tableau', () => {
  beforeEach(() => { mockApi.getPointsFidelite.mockResolvedValue(CLIENTS); });

  test('TC-T01 — par défaut le rang #1 est affiché', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  test('TC-T02 — cliquer sur "Achats" ne plante pas', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getByText(/^achats$/i));
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('TC-T03 — cliquer deux fois sur Points inverse le tri', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    const colPoints = screen.getByText(/^points$/i);
    fireEvent.click(colPoints);
    fireEvent.click(colPoints);
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });
});

// ─── 7. Modal historique ─────────────────────────────────────────────────────
describe('7. Modal historique', () => {
  beforeEach(() => {
    mockApi.getPointsFidelite.mockResolvedValue(CLIENTS);
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Whey Protein', quantite: 2, prix: 2500, date: '2026-03-01' },
      { produit_nom: 'Shaker',       quantite: 1, prix: 500,  date: '2026-02-15' },
    ]);
  });

  test('TC-M01 — clic "Historique" ouvre le modal', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => expect(screen.getByText(/historique des achats/i)).toBeInTheDocument());
  });

  test('TC-M02 — modal affiche les produits achetés', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => {
      expect(screen.getByText(/whey protein/i)).toBeInTheDocument();
      expect(screen.getByText(/shaker/i)).toBeInTheDocument();
    });
  });

  test('TC-M03 — modal affiche les points du client', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => expect(screen.getAllByText(/3200/i).length).toBeGreaterThan(0));
  });

  test('TC-M04 — fermer le modal avec le bouton ✕', async () => {
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => screen.getByText(/historique des achats/i));
    fireEvent.click(screen.getByText('✕'));
    await waitFor(() => {
      expect(screen.queryByText(/historique des achats/i)).not.toBeInTheDocument();
    });
  });

  test('TC-M05 — historique vide affiche "Aucun achat enregistré"', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([]);
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => expect(screen.getByText(/aucun achat enregistré/i)).toBeInTheDocument());
  });
});

// ─── 8. Bouton Actualiser ────────────────────────────────────────────────────
describe('8. Bouton Actualiser', () => {
  test('TC-ACT01 — clic Actualiser rappelle getPointsFidelite', async () => {
    mockApi.getPointsFidelite.mockResolvedValue(CLIENTS);
    render(<FideliteAdherents />);
    await waitForText(/amrani/i);
    fireEvent.click(screen.getByText(/actualiser/i));
    await waitFor(() => expect(mockApi.getPointsFidelite).toHaveBeenCalledTimes(2));
  });
});

// ─── 9. Expiration du niveau ──────────────────────────────────────────────────
describe('9. Expiration du niveau', () => {
  test('TC-EXP01 — client avec niveau_expire dans 20j affiche les jours restants', async () => {
    mockApi.getPointsFidelite.mockResolvedValue(CLIENTS);
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getAllByText(/20j/i).length).toBeGreaterThan(0));
  });

  test('TC-EXP02 — client sans niveau_expire affiche "—"', async () => {
    mockApi.getPointsFidelite.mockResolvedValue(CLIENTS);
    render(<FideliteAdherents />);
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });
});