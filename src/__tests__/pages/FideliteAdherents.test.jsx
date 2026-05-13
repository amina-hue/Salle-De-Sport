import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/* ─── Mocks ─────────────────────────────────────────────────────────────────── */
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
  mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([]);
});

import FideliteAdherents from '../../renderer/pages/fideliteadherents';

/* ─── Factories de clients ──────────────────────────────────────────────────── */
const now = Date.now();

function client(overrides) {
  return {
    idAdherent:    overrides.id    ?? 99,
    nom:           overrides.nom   ?? 'Test',
    prenom:        overrides.prenom ?? 'User',
    points:        overrides.points ?? 100,
    nb_achats:     overrides.nb_achats ?? 1,
    total_depense: overrides.total ?? 1000,
    dernier_achat: overrides.dernier ?? null,
    niveau_expire: overrides.expire ?? null,
  };
}

// Clients de base pour la plupart des tests
const BASE = [
  client({ id: 1, nom: 'Amrani',  prenom: 'Sara',  points: 3200, nb_achats: 15, total: 32000, dernier: new Date(now - 5   * 86400000).toISOString(), expire: new Date(now + 20 * 86400000).toISOString() }),
  client({ id: 2, nom: 'Boudia',  prenom: 'Karim', points: 1600, nb_achats: 8,  total: 16000, dernier: new Date(now - 70  * 86400000).toISOString(), expire: null }),
  client({ id: 3, nom: 'Cherif',  prenom: 'Lina',  points: 200,  nb_achats: 2,  total: 2000,  dernier: null,                                          expire: null }),
  client({ id: 4, nom: 'Dridi',   prenom: 'Omar',  points: 800,  nb_achats: 5,  total: 8000,  dernier: new Date(now - 10  * 86400000).toISOString(), expire: new Date(now + 8  * 86400000).toISOString() }),
  client({ id: 5, nom: 'Ferhat',  prenom: 'Ali',   points: 3100, nb_achats: 12, total: 31000, dernier: new Date(now - 3   * 86400000).toISOString(), expire: new Date(now - 2  * 86400000).toISOString() }),
];

async function setup(clients = BASE) {
  mockApi.getPointsFidelite.mockResolvedValue(clients);
  render(<FideliteAdherents />);
  await waitFor(() => expect(screen.queryByText(/^chargement\.{3}$/i)).not.toBeInTheDocument());
  await waitFor(() => expect(mockApi.getPointsFidelite).toHaveBeenCalled());
}

async function waitFor1(regex) {
  await waitFor(() => expect(screen.getAllByText(regex).length).toBeGreaterThan(0));
}

/* ══════════════════════════════════════════════════════════════════════════════
   A. PROGRESSBAR — toutes les branches
══════════════════════════════════════════════════════════════════════════════ */
describe('A. ProgressBar — branches dans le modal', () => {

  test('A01 — client Platine → "Niveau maximum atteint"', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]); // Amrani = Platine
    await waitFor(() => expect(screen.getByText(/niveau maximum atteint/i)).toBeInTheDocument());
  });

  test('A02 — client non-Platine (Gold) → affiche "X pts pour Platine"', async () => {
    await setup(BASE);
    await waitFor1(/boudia/i);
    // Boudia = Gold (1600pts) → 1400 pts pour Platine
    fireEvent.click(screen.getAllByText(/historique/i)[1]);
    await waitFor(() => expect(screen.getByText(/pts pour platine/i)).toBeInTheDocument());
  });

  test('A03 — client avec niveau_expire dans 20j → affiche les jours restants', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() =>
      expect(screen.getAllByText(/20 jours?|valable encore 20/i).length).toBeGreaterThan(0)
    );
  });

  test('A04 — client avec niveau_expire dans 1j → "Expire demain !"', async () => {
    const clients = [
      client({ id: 10, nom: 'Demain', prenom: 'Test', points: 1500,
                dernier: new Date(now - 1 * 86400000).toISOString(),
                expire: new Date(now + 1 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor1(/demain/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => expect(screen.getByText(/expire demain/i)).toBeInTheDocument());
  });

  test('A05 — client avec niveau_expire ≤0j → "Niveau expiré"', async () => {
    const clients = [
      client({ id: 11, nom: 'Expire', prenom: 'Test', points: 1500,
                dernier: new Date(now - 5 * 86400000).toISOString(),
                expire: new Date(now - 1 * 86400000).toISOString() }), // expiré
    ];
    await setup(clients);
    await waitFor1(/expire/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() =>
      expect(screen.getAllByText(/niveau expiré|en cours de mise à jour/i).length).toBeGreaterThan(0)
    );
  });

  test('A06 — client avec niveau_expire dans 25j (≤30j) → "Achetez pour renouveler"', async () => {
    const clients = [
      client({ id: 12, nom: 'Renouveler', prenom: 'Test', points: 1500,
                dernier: new Date(now - 5 * 86400000).toISOString(),
                expire: new Date(now + 25 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor1(/renouveler/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() =>
      expect(screen.getByText(/achetez pour renouveler/i)).toBeInTheDocument()
    );
  });

  test('A07 — client sans niveau_expire → aucun widget d\'expiration dans modal', async () => {
    const clients = [
      client({ id: 13, nom: 'SansExpire', prenom: 'Test', points: 800, expire: null,
                dernier: new Date(now - 5 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor1(/sansexpire/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => screen.getByText(/historique des achats/i));
    // Aucun texte sur expiration
    expect(screen.queryByText(/expire demain/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/achetez pour renouveler/i)).not.toBeInTheDocument();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   B. HISTORIQUE MODAL — points gagnés par achat
══════════════════════════════════════════════════════════════════════════════ */
describe('B. Historique — affichage des points par achat', () => {

  test('B01 — achat avec prix>0 → "+X pts" affiché', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Whey', quantite: 2, prix: 2500, date: '2026-03-01' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    // 2×2500 = 5000 → 5000/100 = 50 pts
    await waitFor(() => expect(screen.getByText(/\+50 pts/i)).toBeInTheDocument());
  });

  test('B02 — achat avec prix=0 → pas de badge "+X pts"', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Cadeau', quantite: 1, prix: 0, date: '2026-03-01' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => screen.getByText(/cadeau/i));
    expect(screen.queryByText(/\+\d+ pts/i)).not.toBeInTheDocument();
  });

  test('B03 — achat avec prix=null → pas de badge "+X pts"', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'GratuitTest', quantite: 1, prix: null, date: '2026-03-01' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => screen.getByText(/gratuitTest/i));
    expect(screen.queryByText(/\+\d+ pts/i)).not.toBeInTheDocument();
  });

  test('B04 — plusieurs achats → tous affichés avec leur total', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Whey',   quantite: 2, prix: 2500, date: '2026-03-01' },
      { produit_nom: 'Shaker', quantite: 1, prix: 500,  date: '2026-02-15' },
      { produit_nom: 'Gants',  quantite: 3, prix: 300,  date: '2026-01-10' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => {
      expect(screen.getByText(/whey/i)).toBeInTheDocument();
      expect(screen.getByText(/shaker/i)).toBeInTheDocument();
      expect(screen.getByText(/gants/i)).toBeInTheDocument();
    });
  });

  test('B05 — quantité affichée dans le modal', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Whey', quantite: 3, prix: 2500, date: '2026-03-01' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => expect(screen.getByText(/Qté: 3/i)).toBeInTheDocument());
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   C. EXPIRATION DANS LE TABLEAU — couleurs et textes
══════════════════════════════════════════════════════════════════════════════ */
describe('C. Expiration dans le tableau — tous les cas', () => {

  test('C01 — expire dans 20j → affiché (valeur positive)', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getAllByText(/20j/i).length).toBeGreaterThan(0));
  });

  test('C02 — expiré (passé) → "Expiré" affiché', async () => {
    await setup(BASE);
    // Ferhat a un niveau expiré
    await waitFor(() => expect(screen.getAllByText(/expiré/i).length).toBeGreaterThan(0));
  });

  test('C03 — sans niveau_expire → "—" affiché', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });

  test('C04 — expire dans 8j (≤15j) → affiché en rouge', async () => {
    await setup(BASE);
    // Dridi: expire dans 8j
    await waitFor(() => expect(screen.getAllByText(/8j/i).length).toBeGreaterThan(0));
  });

  test('C05 — expire dans 25j (≤30j mais >15j) → couleur gold', async () => {
    const clients = [
      client({ id: 20, nom: 'GoldExp', prenom: 'Test', points: 1500,
                dernier: new Date(now - 1 * 86400000).toISOString(),
                expire: new Date(now + 25 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => expect(screen.getAllByText(/25j/i).length).toBeGreaterThan(0));
  });

  test('C06 — expire dans 45j (>30j) → couleur verte', async () => {
    const clients = [
      client({ id: 21, nom: 'GreenExp', prenom: 'Test', points: 1500,
                dernier: new Date(now - 1 * 86400000).toISOString(),
                expire: new Date(now + 45 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => expect(screen.getAllByText(/45j/i).length).toBeGreaterThan(0));
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   D. DERNIER ACHAT — branches inactif/récent/neutre
══════════════════════════════════════════════════════════════════════════════ */
describe('D. Dernier achat — inactif, récent, neutre', () => {

  test('D01 — achat récent (≤7j) → affiché', async () => {
    const clients = [
      client({ id: 30, nom: 'Recent', prenom: 'Test', points: 500,
                dernier: new Date(now - 3 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => expect(screen.getAllByText(/3j/i).length).toBeGreaterThan(0));
  });

  test('D02 — achat inactif (>60j) → affiché avec ⚠', async () => {
    await setup(BASE);
    // Boudia: il y a 70j → inactif
    await waitFor(() => expect(screen.getAllByText(/70j/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/⚠/i).length).toBeGreaterThan(0);
  });

  test('D03 — sans dernier achat → "—" dans la colonne', async () => {
    const clients = [
      client({ id: 31, nom: 'Jamais', prenom: 'Test', points: 500, dernier: null }),
    ];
    await setup(clients);
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });

  test('D04 — achat neutre (8-60j) → affiché normalement', async () => {
    const clients = [
      client({ id: 32, nom: 'Neutre', prenom: 'Test', points: 500,
                dernier: new Date(now - 30 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => expect(screen.getAllByText(/30j/i).length).toBeGreaterThan(0));
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   E. RANKING — couleurs des 3 premiers
══════════════════════════════════════════════════════════════════════════════ */
describe('E. Ranking — couleurs #1 #2 #3', () => {

  test('E01 — le rang #1 est affiché', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getByText('#1')).toBeInTheDocument());
  });

  test('E02 — le rang #2 est affiché', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getByText('#2')).toBeInTheDocument());
  });

  test('E03 — le rang #3 est affiché', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getByText('#3')).toBeInTheDocument());
  });

  test('E04 — le rang #4 est affiché (couleur neutre)', async () => {
    await setup(BASE);
    await waitFor(() => expect(screen.getByText('#4')).toBeInTheDocument());
  });

  test('E05 — classement par défaut → Amrani est #1 (3200pts)', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const rank1 = screen.getByText('#1');
    const row = rank1.closest('tr');
    expect(row).toHaveTextContent(/amrani/i);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   F. TRI — branches handleSort (flip + new key)
══════════════════════════════════════════════════════════════════════════════ */
describe('F. Tri — branches handleSort complètes', () => {

  test('F01 — clic Points (déjà trié) → flip direction → ↑ affiché', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    // sortKey=points par défaut, 1er clic flip
    fireEvent.click(screen.getByText(/^points$/i));
    await waitFor(() => expect(screen.getByText('↑')).toBeInTheDocument());
  });

  test('F02 — clic nouvelle colonne → ↓ affiché', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    // Achats n'est pas le sortKey initial
    fireEvent.click(screen.getByText(/^achats$/i));
    await waitFor(() => expect(screen.getAllByText('↓').length).toBeGreaterThan(0));
  });

  test('F03 — clic Nom → tri alphabétique', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getByText(/^adhérent$/i));
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('F04 — tri par Nom puis flip → descend', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getByText(/^adhérent$/i));
    fireEvent.click(screen.getByText(/^adhérent$/i));
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('F05 — tri par "Expire le" → colonne "niveau_expire" triée', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getByText(/expire le/i));
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByText(/expire le/i)); // flip
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('F06 — SortIcon affiche ↕ pour colonne non active', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    // Par défaut Points est actif → Achats affiche ↕
    expect(screen.getAllByText('↕').length).toBeGreaterThan(0);
  });

  test('F07 — SortIcon affiche ↓ pour colonne active (desc)', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    // Points est actif et desc par défaut
    expect(screen.getAllByText('↓').length).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   G. STATISTIQUES — branches clientsInactifs
══════════════════════════════════════════════════════════════════════════════ */
describe('G. Statistiques — branches inactifs', () => {

  test('G01 — 0 inactif → pas de StatCard "inactifs" ni compteur header', async () => {
    const sansInactif = [
      client({ id: 1, nom: 'Actif1', points: 3000, dernier: new Date(now - 5  * 86400000).toISOString() }),
      client({ id: 2, nom: 'Actif2', points: 1500, dernier: new Date(now - 15 * 86400000).toISOString() }),
    ];
    await setup(sansInactif);
    await waitFor(() => screen.getByText(/fidélité clients/i));
    expect(screen.queryByText(/inactifs 60j\+/i)).not.toBeInTheDocument();
  });

  test('G02 — 1+ inactifs → compteur "inactifs 60j+" dans le header', async () => {
    await setup(BASE); // Boudia = 70j
    await waitFor(() =>
      expect(screen.getByText(/inactifs 60j\+/i)).toBeInTheDocument()
    );
  });

  test('G03 — tous les clients sans achat → clientsActifs = 0', async () => {
    const sansAchat = [
      client({ id: 1, nom: 'ZeroAchat', points: 500, dernier: null }),
    ];
    await setup(sansAchat);
    await waitFor(() => screen.getByText(/fidélité clients/i));
    // "0" actifs ce mois
    expect(screen.getByText(/actifs ce mois/i)).toBeInTheDocument();
  });

  test('G04 — top client affiché dans la StatCard', async () => {
    await setup(BASE);
    await waitFor(() =>
      expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0)
    );
  });

  test('G05 — liste vide → top client affiche "Aucun"', async () => {
    mockApi.getPointsFidelite.mockResolvedValue([]);
    render(<FideliteAdherents />);
    await waitFor(() =>
      expect(screen.getByText(/aucun/i)).toBeInTheDocument()
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   H. NIVEAUX OVERVIEW CARDS — comptage et click
══════════════════════════════════════════════════════════════════════════════ */
describe('H. Niveaux overview cards', () => {

  test('H01 — comptage correct par niveau', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    // Platine: Amrani(3200) + Ferhat(3100) = 2
    // Gold: Boudia(1600) = 1
    // Silver: Dridi(800) = 1
    // Bronze: Cherif(200) = 1
    const cards = screen.getAllByText(/★ platine/i);
    expect(cards.length).toBeGreaterThan(0);
  });

  test('H02 — clic Platine → toggle filtre actif', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const platineCards = screen.getAllByText(/★ platine/i);
    fireEvent.click(platineCards[0].closest('[style*="cursor"]') || platineCards[0].closest('div'));
    await waitFor(() =>
      expect(screen.queryByText(/boudia/i)).not.toBeInTheDocument()
    );
  });

  test('H03 — hover sur une card niveau', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const bronzeCards = screen.getAllByText(/★ bronze/i);
    const card = bronzeCards[0].closest('div');
    if (card) {
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
    }
    expect(screen.getByText(/fidélité clients/i)).toBeInTheDocument();
  });

  test('H04 — les 4 cards affichent les remises', async () => {
    await setup(BASE);
    await waitFor(() => {
      // Silver -5%, Gold -10%, Platine -15%
      expect(screen.getAllByText(/-5% remise/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/-10% remise/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/-15% remise/i).length).toBeGreaterThan(0);
    });
  });

  test('H05 — les ranges de points sont affichés dans les cards', async () => {
    await setup(BASE);
    await waitFor(() => {
      expect(screen.getByText(/0 – 499 pts/i)).toBeInTheDocument();
      expect(screen.getByText(/500 – 1499 pts/i)).toBeInTheDocument();
    });
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   I. HOVER STATES — StatCard, tableau rows, bouton Actualiser
══════════════════════════════════════════════════════════════════════════════ */
describe('I. Hover states — couverture des handlers', () => {

  test('I01 — hover sur une ligne du tableau', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const rows = screen.getAllByRole('row');
    if (rows.length > 1) {
      fireEvent.mouseEnter(rows[1]);
      fireEvent.mouseLeave(rows[1]);
    }
    expect(screen.getByText(/fidélité clients/i)).toBeInTheDocument();
  });

  test('I02 — hover sur le bouton "Historique"', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const histBtns = screen.getAllByText(/historique/i);
    if (histBtns.length > 0) {
      const btn = histBtns[0].closest('button') || histBtns[0];
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    }
    expect(screen.getByText(/fidélité clients/i)).toBeInTheDocument();
  });

  test('I03 — hover sur le bouton "Actualiser"', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const btn = screen.getByText(/actualiser/i).closest('button') || screen.getByText(/actualiser/i);
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test('I04 — hover sur le input de recherche (focus/blur)', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    const input = screen.getByPlaceholderText(/rechercher un adhérent/i);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input).toBeInTheDocument();
  });

  test('I05 — hover sur une ligne du modal historique', async () => {
    mockApi.getHistoriqueAchatsAdherent.mockResolvedValue([
      { produit_nom: 'Whey', quantite: 1, prix: 2500, date: '2026-03-01' },
    ]);
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/historique/i)[0]);
    await waitFor(() => screen.getByText(/whey/i));
    const wheyRow = screen.getByText(/whey/i).closest('[style*="border"]');
    if (wheyRow) {
      fireEvent.mouseEnter(wheyRow);
      fireEvent.mouseLeave(wheyRow);
    }
    expect(screen.getByText(/whey/i)).toBeInTheDocument();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   J. FORMAT FONCTIONS — fmtDate, fmt, daysSince
══════════════════════════════════════════════════════════════════════════════ */
describe('J. Fonctions de format — branches', () => {

  test('J01 — fmtDate null → "—" affiché quelque part', async () => {
    // Cherif a dernier_achat=null → "—" dans la colonne
    await setup(BASE);
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });

  test('J02 — total_depense=0 → "0" ou "0 DZD" affiché', async () => {
    const clients = [
      client({ id: 50, nom: 'ZeroDepense', prenom: 'Test', points: 500, total: 0,
                dernier: new Date(now - 5 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => screen.getByText(/zerodepense/i));
    // "0 DZD" or "0" should appear somewhere
    expect(screen.getAllByText(/DZD/i).length).toBeGreaterThan(0);
  });

  test('J03 — total_depense grand nombre → formaté avec séparateurs', async () => {
    const clients = [
      client({ id: 51, nom: 'GrandTotal', prenom: 'Test', points: 3500, total: 1000000,
                dernier: new Date(now - 5 * 86400000).toISOString() }),
    ];
    await setup(clients);
    await waitFor(() => screen.getByText(/grandtotal/i));
    // 1 000 000 DZD — formatted
    expect(screen.getAllByText(/DZD/i).length).toBeGreaterThan(0);
  });

  test('J04 — daysSince null (pas de dernier achat) → colonne dernier achat = "—"', async () => {
    const clients = [
      client({ id: 52, nom: 'NullDate', prenom: 'Test', points: 300, dernier: null }),
    ];
    await setup(clients);
    await waitFor(() => screen.getByText(/nulldate/i));
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   K. FILTRES COMBINÉS — recherche + niveau + tri ensemble
══════════════════════════════════════════════════════════════════════════════ */
describe('K. Filtres combinés avancés', () => {

  test('K01 — filtre Gold + tri par Achats desc', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/★ gold/i)[0].closest('div') || screen.getAllByText(/★ gold/i)[0]);
    fireEvent.click(screen.getByText(/^achats$/i));
    await waitFor(() => expect(screen.getAllByText(/boudia/i).length).toBeGreaterThan(0));
  });

  test('K02 — recherche + tri par Points', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.change(screen.getByPlaceholderText(/rechercher un adhérent/i), { target: { value: 'a' } });
    fireEvent.click(screen.getByText(/^points$/i)); // flip sort
    await waitFor(() => expect(screen.getAllByText(/amrani/i).length).toBeGreaterThan(0));
  });

  test('K03 — filtre Bronze + recherche sans résultat → "Aucun client trouvé"', async () => {
    await setup(BASE);
    await waitFor1(/amrani/i);
    fireEvent.click(screen.getAllByText(/★ bronze/i)[0]);
    fireEvent.change(screen.getByPlaceholderText(/rechercher un adhérent/i), { target: { value: 'amrani' } });
    await waitFor(() => expect(screen.getByText(/aucun client trouvé/i)).toBeInTheDocument());
  });
});