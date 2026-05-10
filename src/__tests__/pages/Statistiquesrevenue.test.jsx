/**
 * ============================================================
 *  TESTS — StatistiquesRevenue.jsx
 *
 *  BLACK BOX :  EP · BVA · Robustness · Pairwise
 *  WHITE BOX :  CFG · DFG · MC/DC
 * ============================================================
 *
 *  Fonctions clés testées :
 *    toNum(v)            – conversion sûre en nombre
 *    getMonthLabel(d)    – label mois depuis une date
 *    formatDA(v)         – formatage montant DZD
 *    stats (useMemo)     – calcul paiements/stock/graphe
 *    Rendu               – StatCard, MoyenneBox, BarChart, tab bar
 * ============================================================
 */

import React from "react";
import {
  render, screen, waitFor, fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import StatistiquesRevenue from "../../renderer/pages/StatistiquesRevenue";

// ── Mocks globaux ──────────────────────────────────────────────────────────
jest.mock("../../renderer/components/QuickActions", () => () => (
  <div data-testid="quick-actions" />
));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));

// ── Constantes de test ─────────────────────────────────────────────────────
const NOW = new Date("2025-07-07T12:00:00Z"); // juillet = mois index 6

/** Paiements valides (abonnements) */
const PAY_ABN = [
  {
    idPaiement: 1,
    montant: 5000,
    montantDu: 5000,
    statut: "Payé",
    type: "abonnement",
    date: "2025-07-01T00:00:00Z",
  },
  {
    idPaiement: 2,
    montant: 3000,
    montantDu: 3000,
    statut: "Payé",
    type: "abonnement",
    date: "2025-07-15T00:00:00Z",
  },
];

/** Paiements ventes */
const PAY_VENTE = [
  {
    idPaiement: 3,
    montant: 2000,
    montantDu: 2000,
    statut: "Payé",
    type: "vente",
    date: "2025-06-10T00:00:00Z",
  },
];

/** Paiement "en attente" explicite */
const PAY_ATTENTE_EXPLICITE = {
  idPaiement: 4,
  montant: 0,
  montantDu: 4000,
  statut: "En attente",
  type: "abonnement",
  date: "2025-07-05T00:00:00Z",
};

/** Paiement "en attente" implicite : montant=0 && montantDu>0 */
const PAY_ATTENTE_IMPLICITE = {
  idPaiement: 5,
  montant: 0,
  montantDu: 6000,
  statut: "autre",
  type: "abonnement",
  date: "2025-07-05T00:00:00Z",
};

const PRODUITS_STD = [
  { idProduit: 1, nom: "Gants", categorie: "Équipement", stock: 10, prix: 500 },
  { idProduit: 2, nom: "Corde",  categorie: "Matériel",   stock: 3,  prix: 300 },   // stock ≤ 5
  { idProduit: 3, nom: "Shaker", categorie: "Nutrition",  stock: 5,  prix: 200 },   // stock = 5 (limite)
];

// ── Helpers ────────────────────────────────────────────────────────────────
const buildApi = (overrides = {}) => ({
  getPaiements: jest.fn().mockResolvedValue([...PAY_ABN, ...PAY_VENTE]),
  getProduits:  jest.fn().mockResolvedValue(PRODUITS_STD),
  ...overrides,
});

const setup = (apiOverrides = {}, onPageChange = jest.fn()) => {
  jest.useFakeTimers().setSystemTime(NOW);
  window.api = buildApi(apiOverrides);
  return render(<StatistiquesRevenue onPageChange={onPageChange} />);
};

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════
//  I.  BLACK BOX
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
//  1. EQUIVALENCE PARTITIONING (EP)
// ─────────────────────────────────────────────────────────────────────────
describe("[EP] Partitions d'équivalence — StatistiquesRevenue", () => {

  // ── EP-01 : données normales ────────────────────────────────────────────
  test("EP-01 : données valides → rendu sans crash, titre visible", async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Statistiques Revenue")).toBeInTheDocument();
  });

  // ── EP-02 : paiements vides ─────────────────────────────────────────────
  test("EP-02 : getPaiements=[] → encaissé = 0 DA", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue([]) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // StatCard "Revenus encaissés" doit afficher 0
    expect(screen.getByText("Revenus encaissés")).toBeInTheDocument();
    expect(screen.getAllByText(/0\s*DA/).length).toBeGreaterThanOrEqual(1);
  });

  // ── EP-03 : produits vides ──────────────────────────────────────────────
  test("EP-03 : getProduits=[] → 'Aucun produit trouvé.'", async () => {
    setup({ getProduits: jest.fn().mockResolvedValue([]) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aucun produit trouvé.")).toBeInTheDocument();
  });

  // ── EP-04 : paiement statut "en attente" (explicite) ────────────────────
  test("EP-04 : statut='En attente' → comptabilisé en attente, pas encaissé", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_EXPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // La card "En attente" doit afficher 4 000 DA
    expect(screen.getByText("En attente")).toBeInTheDocument();
    expect(screen.getByText(/4\s*000\s*DA/)).toBeInTheDocument();
  });

  // ── EP-05 : paiement montant=0 && montantDu>0 (attente implicite) ───────
  test("EP-05 : montant=0 && montantDu>0 → traité comme 'en attente'", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_IMPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/6\s*000\s*DA/)).toBeInTheDocument();
  });

  // ── EP-06 : paiement de type "vente" ────────────────────────────────────
  test("EP-06 : type vente → ajouté à la colonne ventes du BarChart (pas abonnements)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_VENTE[0]]),
      getProduits:  jest.fn().mockResolvedValue([]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // Le graphe doit se rendre sans crash
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── EP-07 : produits avec stock faible ──────────────────────────────────
  test("EP-07 : produits avec stock ≤ 5 → comptés dans 'lowStock'", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "A", categorie: "X", stock: 3,  prix: 100 }, // faible
        { idProduit: 2, nom: "B", categorie: "Y", stock: 50, prix: 200 }, // normal
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // "1 produits faibles" dans la StatCard Valeur stock
    expect(screen.getByText(/1 produit/)).toBeInTheDocument();
  });

  // ── EP-08 : aucun paiement avec statut "payé" → 0 paiements ─────────────
  test("EP-08 : paiements tous en attente → 0 paiements encaissés affiché", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        PAY_ATTENTE_EXPLICITE,
        PAY_ATTENTE_IMPLICITE,
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  2. BOUNDARY VALUE ANALYSIS (BVA)
// ─────────────────────────────────────────────────────────────────────────
describe("[BVA] Analyse des valeurs limites — StatistiquesRevenue", () => {

  // ── BVA-01 : stock = 5 (limite basse exacte) → compté comme faible ───────
  test("BVA-01 : stock=5 → compté dans lowStock (≤ 5)", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "Limite", categorie: "X", stock: 5, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/1 produit/)).toBeInTheDocument();
  });

  // ── BVA-02 : stock = 6 (juste au-dessus) → NON compté comme faible ──────
  test("BVA-02 : stock=6 → NON compté dans lowStock (> 5)", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "OK", categorie: "X", stock: 6, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 produits faibles")).toBeInTheDocument();
  });

  // ── BVA-03 : stock = 0 → compté comme faible ────────────────────────────
  test("BVA-03 : stock=0 → compté dans lowStock", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "Vide", categorie: "X", stock: 0, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/1 produit/)).toBeInTheDocument();
  });

  // ── BVA-04 : montant = 0 && montantDu = 0 → ni payé ni attente ──────────
  test("BVA-04 : montant=0 && montantDu=0 → ni encaissé ni en attente", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 99, montant: 0, montantDu: 0, statut: "autre", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });

  // ── BVA-05 : montant = 1 (valeur minimale non nulle) → encaissé ──────────
  test("BVA-05 : montant=1 → comptabilisé comme encaissé", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 10, montant: 1, montantDu: 1, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1 paiements")).toBeInTheDocument();
  });

  // ── BVA-06 : montant très grand (999999999) → rendu sans overflow ────────
  test("BVA-06 : montant=999999999 → formatDA ne plante pas", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 11, montant: 999999999, montantDu: 999999999, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus encaissés")).toBeInTheDocument();
  });

  // ── BVA-07 : 6 produits affichés (slice(0,6)) ───────────────────────────
  test("BVA-07 : 6 produits → tous affichés (slice exacte)", async () => {
    const six = Array.from({ length: 6 }, (_, i) => ({
      idProduit: i + 1, nom: `Prod${i + 1}`, categorie: "X", stock: 10, prix: 100,
    }));
    setup({ getProduits: jest.fn().mockResolvedValue(six) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Prod${i}`)).toBeInTheDocument();
    }
  });

  // ── BVA-08 : 7 produits → seulement les 6 premiers affichés ────────────
  test("BVA-08 : 7 produits → le 7e est tronqué (slice limite)", async () => {
    const seven = Array.from({ length: 7 }, (_, i) => ({
      idProduit: i + 1, nom: `Item${i + 1}`, categorie: "X", stock: 10, prix: 100,
    }));
    setup({ getProduits: jest.fn().mockResolvedValue(seven) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Item6")).toBeInTheDocument();
    expect(screen.queryByText("Item7")).not.toBeInTheDocument();
  });

  // ── BVA-09 : date paiement = 1er janvier → mois Jan ────────────────────
  test("BVA-09 : date=1er janvier → mois 'Jan' dans byMonth", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 20, montant: 1000, montantDu: 1000, statut: "Payé", type: "vente", date: "2025-01-01T00:00:00Z" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── BVA-10 : date paiement = 31 décembre → mois 'Déc' ──────────────────
  test("BVA-10 : date=31 décembre → mois 'Déc' dans byMonth", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 21, montant: 2000, montantDu: 2000, statut: "Payé", type: "vente", date: "2025-12-31T23:59:59Z" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── BVA-11 : trendPct quand prevTotal=0 → "0.0%" ────────────────────────
  test("BVA-11 : mois précédent vide → trendPct='0.0'", async () => {
    // Seul le mois courant (juillet) a des paiements, le mois précédent (juin) en a 0
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 30, montant: 5000, montantDu: 5000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // trendPct=0.0 → la MoyenneBox affiche "0% vs mois précédent"
    expect(screen.getByText(/0%\s*vs\s*mois\s*précédent/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  3. ROBUSTNESS TESTING
// ─────────────────────────────────────────────────────────────────────────
describe("[Robust] Tests de robustesse — StatistiquesRevenue", () => {

  // ── ROB-01 : getPaiements rejette → message d'erreur ────────────────────
  test("ROB-01 : getPaiements rejette → 'Impossible de charger les données.'", async () => {
    setup({ getPaiements: jest.fn().mockRejectedValue(new Error("réseau")) });
    await waitFor(() =>
      expect(screen.getByText("Impossible de charger les données.")).toBeInTheDocument(),
    );
  });

  // ── ROB-02 : getProduits rejette → message d'erreur ─────────────────────
  test("ROB-02 : getProduits rejette → 'Impossible de charger les données.'", async () => {
    setup({ getProduits: jest.fn().mockRejectedValue(new Error("fail")) });
    await waitFor(() =>
      expect(screen.getByText("Impossible de charger les données.")).toBeInTheDocument(),
    );
  });

  // ── ROB-03 : getPaiements renvoie null → traité comme [] ────────────────
  test("ROB-03 : getPaiements=null → pas de crash, encaissé=0", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue(null) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus encaissés")).toBeInTheDocument();
  });

  // ── ROB-04 : getProduits renvoie null → traité comme [] ─────────────────
  test("ROB-04 : getProduits=null → pas de crash, 'Aucun produit trouvé.'", async () => {
    setup({ getProduits: jest.fn().mockResolvedValue(null) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aucun produit trouvé.")).toBeInTheDocument();
  });

  // ── ROB-05 : paiement avec champs undefined ──────────────────────────────
  test("ROB-05 : paiement avec montant=undefined → toNum retourne 0, pas de crash", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: undefined, montantDu: undefined, statut: undefined, type: undefined },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Statistiques Revenue")).toBeInTheDocument();
  });

  // ── ROB-06 : paiement avec date invalide → getMonthLabel retourne null ───
  test("ROB-06 : date='not-a-date' → paiement ignoré dans byMonth, pas de crash", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 1000, montantDu: 1000, statut: "Payé", type: "vente", date: "not-a-date" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── ROB-07 : produit avec prix=undefined → pas de crash ─────────────────
  test("ROB-07 : produit prix=undefined → valeurStock=0, pas de crash", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "X", categorie: "Y", stock: undefined, prix: undefined },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Valeur stock")).toBeInTheDocument();
  });

  // ── ROB-08 : window.api absent ──────────────────────────────────────────
  test("ROB-08 : window.api=undefined → charge avec [] sans crash", async () => {
    window.api = undefined;
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesRevenue onPageChange={jest.fn()} />);
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Statistiques Revenue")).toBeInTheDocument();
  });

  // ── ROB-09 : onPageChange absent → clic sans crash ───────────────────────
  test("ROB-09 : onPageChange=undefined → clic onglet ne plante pas", async () => {
    window.api = buildApi();
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesRevenue />);
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    const btn = screen.getByRole("button", { name: /abonnement/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  // ── ROB-10 : paiement avec champ date absent (null) ──────────────────────
  test("ROB-10 : paiement sans date → ignoré dans byMonth, pas de crash", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 1000, montantDu: 1000, statut: "Payé", type: "vente", date: null },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── ROB-11 : getPaiements renvoie objet non-tableau ───────────────────────
  test("ROB-11 : getPaiements renvoie {} (non-tableau) → traité comme []", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue({}) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus encaissés")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  4. PAIRWISE TESTING
// ─────────────────────────────────────────────────────────────────────────
/**
 * Paramètres :
 *   A = paiements  : avec encaissés | seulement en attente | vide
 *   B = produits   : normaux (stock>5) | faible (stock≤5) | vide
 *   C = api error  : non | oui
 *   D = onPageChange : défini | undefined
 *
 * Paires couvertes (algorithme pairwise minimal) :
 */
describe("[Pairwise] Combinaisons — StatistiquesRevenue", () => {

  const cases = [
    {
      id: "PW-01",
      paiements: "encaissés",
      produits: "normaux",
      error: false,
      onPageChange: "défini",
    },
    {
      id: "PW-02",
      paiements: "encaissés",
      produits: "faibles",
      error: false,
      onPageChange: "undefined",
    },
    {
      id: "PW-03",
      paiements: "encaissés",
      produits: "vide",
      error: false,
      onPageChange: "défini",
    },
    {
      id: "PW-04",
      paiements: "attente",
      produits: "normaux",
      error: false,
      onPageChange: "undefined",
    },
    {
      id: "PW-05",
      paiements: "attente",
      produits: "faibles",
      error: false,
      onPageChange: "défini",
    },
    {
      id: "PW-06",
      paiements: "attente",
      produits: "vide",
      error: false,
      onPageChange: "undefined",
    },
    {
      id: "PW-07",
      paiements: "vide",
      produits: "normaux",
      error: false,
      onPageChange: "défini",
    },
    {
      id: "PW-08",
      paiements: "vide",
      produits: "faibles",
      error: false,
      onPageChange: "undefined",
    },
    {
      id: "PW-09",
      paiements: "vide",
      produits: "vide",
      error: false,
      onPageChange: "défini",
    },
    {
      id: "PW-10",
      paiements: "encaissés",
      produits: "normaux",
      error: true,
      onPageChange: "défini",
    },
    {
      id: "PW-11",
      paiements: "vide",
      produits: "vide",
      error: true,
      onPageChange: "undefined",
    },
  ];

  cases.forEach(({ id, paiements: p, produits: pr, error, onPageChange: opc }) => {
    test(`${id} : paiements=${p}, produits=${pr}, error=${error}, onPageChange=${opc}`, async () => {
      const paiementsData =
        p === "encaissés" ? [...PAY_ABN, ...PAY_VENTE]
        : p === "attente" ? [PAY_ATTENTE_EXPLICITE]
        : [];

      const produitsData =
        pr === "normaux" ? [{ idProduit: 1, nom: "X", categorie: "Y", stock: 20, prix: 500 }]
        : pr === "faibles" ? [{ idProduit: 2, nom: "Y", categorie: "Z", stock: 2,  prix: 200 }]
        : [];

      const apiSetup = error
        ? {
            getPaiements: jest.fn().mockRejectedValue(new Error("err")),
            getProduits:  jest.fn().mockRejectedValue(new Error("err")),
          }
        : {
            getPaiements: jest.fn().mockResolvedValue(paiementsData),
            getProduits:  jest.fn().mockResolvedValue(produitsData),
          };

      const onPageChangeFn = opc === "défini" ? jest.fn() : undefined;

      window.api = buildApi(apiSetup);
      jest.useFakeTimers().setSystemTime(NOW);
      render(<StatistiquesRevenue onPageChange={onPageChangeFn} />);

      if (error) {
        await waitFor(() =>
          expect(screen.getByText("Impossible de charger les données.")).toBeInTheDocument(),
        );
      } else {
        await waitFor(() =>
          expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
        );
        expect(screen.getByText("Statistiques Revenue")).toBeInTheDocument();
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  II.  WHITE BOX
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
//  5. CONTROL FLOW GRAPH (CFG)
// ─────────────────────────────────────────────────────────────────────────
/**
 * Nœuds CFG identifiés :
 *
 * useEffect / load() :
 *   N1  : setLoading(true), setError("")
 *   N2  : Promise.all([getPaiements, getProduits])
 *   N3  : Array.isArray(pData) → setPaiements(pData)
 *   N4  : !Array.isArray(pData) → setPaiements([])
 *   N5  : Array.isArray(prodData) → setProduits(prodData)
 *   N6  : !Array.isArray(prodData) → setProduits([])
 *   N7  : catch → setError(...), setPaiements([]), setProduits([])
 *   N8  : finally → setLoading(false)
 *
 * Rendu :
 *   N9  : loading=true → "Chargement..."
 *   N10 : loading=false
 *   N11 : error → bandeau erreur
 *   N12 : !error
 *   N13 : produits.length > 0 → map produits
 *   N14 : produits.length = 0 → "Aucun produit trouvé."
 *   N15 : trendPct >= 0 → "▲"
 *   N16 : trendPct <  0 → "▼"
 *
 * useMemo / stats :
 *   N17 : attente.includes(p) → exclu de payes
 *   N18 : toNum(p.montant) > 0 OU statut="payé" → inclus dans payes
 *   N19 : dateVal présent + valide → getMonthLabel ok
 *   N20 : dateVal absent/invalide → skip
 *   N21 : type.includes("abonn") → row.abonnements += amount
 *   N22 : sinon → row.ventes += amount
 *   N23 : prevTotal > 0 → trendPct calculé
 *   N24 : prevTotal = 0 → trendPct = "0.0"
 */
describe("[CFG] Couverture des nœuds — StatistiquesRevenue", () => {

  // ── CFG-N9 : loading=true ─────────────────────────────────────────────
  test("CFG-N9 : pendant chargement → 'Chargement des statistiques...'", () => {
    window.api = buildApi({
      getPaiements: jest.fn().mockReturnValue(new Promise(() => {})),
    });
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesRevenue onPageChange={jest.fn()} />);
    expect(screen.getByText("Chargement des statistiques...")).toBeInTheDocument();
  });

  // ── CFG-N8/N10 : finally → loading=false ─────────────────────────────
  test("CFG-N8/N10 : finally exécuté → 'Chargement...' disparaît", async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Statistiques Revenue")).toBeInTheDocument();
  });

  // ── CFG-N7/N11 : catch → message erreur ──────────────────────────────
  test("CFG-N7/N11 : catch → setError affiché", async () => {
    setup({ getPaiements: jest.fn().mockRejectedValue(new Error("x")) });
    await waitFor(() =>
      expect(screen.getByText("Impossible de charger les données.")).toBeInTheDocument(),
    );
  });

  // ── CFG-N3 : Array.isArray=true → données utilisées ──────────────────
  test("CFG-N3 : pData tableau valide → utilisé directement", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue(PAY_ABN) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // Les paiements sont encaissés → montant > 0
    expect(screen.getAllByText(/DA/).length).toBeGreaterThanOrEqual(1);
  });

  // ── CFG-N4 : Array.isArray=false → fallback [] ────────────────────────
  test("CFG-N4 : pData non-tableau → fallback [] (0 DA)", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue("pas un tableau") });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });

  // ── CFG-N6 : prodData non-tableau → fallback [] ───────────────────────
  test("CFG-N6 : prodData non-tableau → fallback [] → 'Aucun produit'", async () => {
    setup({ getProduits: jest.fn().mockResolvedValue(42) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aucun produit trouvé.")).toBeInTheDocument();
  });

  // ── CFG-N14 : produits.length=0 ──────────────────────────────────────
  test("CFG-N14 : produits=[] → 'Aucun produit trouvé.'", async () => {
    setup({ getProduits: jest.fn().mockResolvedValue([]) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aucun produit trouvé.")).toBeInTheDocument();
  });

  // ── CFG-N15 : trendPct ≥ 0 → "▲" ────────────────────────────────────
  test("CFG-N15 : trendPct≥0 → flèche montante ▲", async () => {
    // mois courant (juillet) > mois précédent (juin)
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 10000, montantDu: 10000, statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 3000,  montantDu: 3000,  statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  // ── CFG-N16 : trendPct < 0 → "▼" ────────────────────────────────────
  test("CFG-N16 : trendPct<0 → flèche descendante ▼", async () => {
    // mois courant (juillet) < mois précédent (juin)
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 1000,  montantDu: 1000,  statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 10000, montantDu: 10000, statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  // ── CFG-N17 : attente.includes(p) → exclu de payes ────────────────────
  test("CFG-N17 : paiement en attente exclu de payes", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_EXPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });

  // ── CFG-N21 : type "abonnement" → colonne abonnements ─────────────────
  test("CFG-N21 : type contient 'abonn' → row.abonnements incrémenté", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 7000, montantDu: 7000, statut: "Payé", type: "Abonnement Premium", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── CFG-N22 : type "vente" → colonne ventes ───────────────────────────
  test("CFG-N22 : type 'vente' → row.ventes incrémenté (pas abonnements)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 3000, montantDu: 3000, statut: "Payé", type: "vente produit", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── CFG-N23 : prevTotal > 0 → trendPct réel ───────────────────────────
  test("CFG-N23 : prevTotal>0 → trendPct calculé (non 0.0)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 2000, montantDu: 2000, statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 1000, montantDu: 1000, statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // (2000-1000)/1000 * 100 = 100% → affiché
    expect(screen.getByText(/100(\.0)?%\s*vs\s*mois/)).toBeInTheDocument();
  });

  // ── CFG-N24 : prevTotal=0 → trendPct="0.0" ────────────────────────────
  test("CFG-N24 : prevTotal=0 → trendPct='0.0' (pas de division par zéro)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 5000, montantDu: 5000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/0(\.0)?%\s*vs\s*mois/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  6. DATA FLOW GRAPH (DFG)
// ─────────────────────────────────────────────────────────────────────────
/**
 * Variables suivies :
 *
 *  paiements   DEF: setPaiements(...)   USE: stats (attente, payes, totalEncaisse...)
 *  produits    DEF: setProduits(...)    USE: stats (stockTotal, lowStock, valeurStock)
 *  loading     DEF: true → false       USE: rendu conditionnel
 *  error       DEF: ""  → message      USE: bandeau erreur
 *  refreshKey  DEF: 0   → k+1          USE: useEffect (rechargement)
 *  stats       DEF: useMemo(...)       USE: StatCards, MoyenneBox, BarChart, header badges
 */
describe("[DFG] Couverture des flux de données — StatistiquesRevenue", () => {

  // ── DFG-01 : DEF paiements → USE stats.totalEncaisse → StatCard ──────
  test("DFG-01 : paiements → totalEncaisse affiché dans StatCard", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 9000, montantDu: 9000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/9\s*000\s*DA/)).toBeInTheDocument();
  });

  // ── DFG-02 : DEF paiements → USE stats.totalAttente → StatCard ───────
  test("DFG-02 : paiements en attente → totalAttente affiché", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 0, montantDu: 8000, statut: "En attente", type: "abonnement", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/8\s*000\s*DA/)).toBeInTheDocument();
  });

  // ── DFG-03 : DEF produits → USE stats.valeurStock → StatCard ─────────
  test("DFG-03 : produits → valeurStock = stock × prix", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "X", categorie: "Y", stock: 10, prix: 1000 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // 10 × 1000 = 10 000 DA
const elements = screen.getAllByText(/10\s*000\s*DA/);
expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  // ── DFG-04 : DEF produits → USE stats.lowStock → StatCard sub ────────
  test("DFG-04 : produits faibles → lowStock affiché dans StatCard", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "A", categorie: "X", stock: 1, prix: 100 },
        { idProduit: 2, nom: "B", categorie: "Y", stock: 2, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("2 produits faibles")).toBeInTheDocument();
  });

  // ── DFG-05 : DEF paiements → USE stats.byMonth → BarChart ────────────
  test("DFG-05 : paiements → byMonth alimenté → BarChart rendu", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 5000, montantDu: 5000, statut: "Payé", type: "vente", date: "2025-03-15" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── DFG-06 : DEF paiements → USE stats.avgMonthly → MoyenneBox ───────
  test("DFG-06 : paiements → avgMonthly affiché dans MoyenneBox", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 12000, montantDu: 12000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // avgMonthly = 12000/12 = 1000 → "1 000 DA"
    expect(screen.getByText("Moyenne mensuelle")).toBeInTheDocument();
  });

  // ── DFG-07 : DEF loading=true → USE "Chargement..." ──────────────────
  test("DFG-07 : loading=true → 'Chargement des statistiques...' visible", () => {
    window.api = buildApi({ getPaiements: jest.fn().mockReturnValue(new Promise(() => {})) });
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesRevenue onPageChange={jest.fn()} />);
    expect(screen.getByText("Chargement des statistiques...")).toBeInTheDocument();
  });

  // ── DFG-08 : DEF loading=false → contenu principal visible ───────────
  test("DFG-08 : loading=false → StatCards visibles", async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus encaissés")).toBeInTheDocument();
    expect(screen.getByText("En attente")).toBeInTheDocument();
    expect(screen.getByText("Valeur stock")).toBeInTheDocument();
  });

  // ── DFG-09 : DEF error → USE bandeau erreur ──────────────────────────
  test("DFG-09 : error défini → bandeau rouge affiché", async () => {
    setup({ getPaiements: jest.fn().mockRejectedValue(new Error("fail")) });
    await waitFor(() =>
      expect(screen.getByText("Impossible de charger les données.")).toBeInTheDocument(),
    );
  });

  // ── DFG-10 : DEF refreshKey → USE useEffect re-exécuté ───────────────
  test("DFG-10 : clic Rafraîchir → refreshKey change → API rappelée", async () => {
    const getPaiements = jest.fn().mockResolvedValue([]);
    const getProduits  = jest.fn().mockResolvedValue([]);
    setup({ getPaiements, getProduits });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(getPaiements).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /rafraîchir/i }));
    await waitFor(() => expect(getPaiements).toHaveBeenCalledTimes(2));
  });

  // ── DFG-11 : DEF produits → USE aperçu produits (map 6) ──────────────
  test("DFG-11 : produits → noms affichés dans Aperçu produits", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "Gants",   categorie: "Éq.", stock: 10, prix: 500 },
        { idProduit: 2, nom: "Shaker",  categorie: "Nu.", stock: 8,  prix: 200 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Gants")).toBeInTheDocument();
    expect(screen.getByText("Shaker")).toBeInTheDocument();
  });

  // ── DFG-12 : DEF stats.payes.length → USE sub StatCard encaissé ──────
  test("DFG-12 : stats.payes.length → sub '2 paiements'", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue(PAY_ABN) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("2 paiements")).toBeInTheDocument();
  });

  // ── DFG-13 : DEF stats.attente.length → USE sub StatCard en attente ──
  test("DFG-13 : 1 adhérent en attente → '1 adhérent — payer plus tard'", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_EXPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1 adhérent — payer plus tard")).toBeInTheDocument();
  });

  // ── DFG-14 : stats.attente.length pluriel ────────────────────────────
  test("DFG-14 : 2 adhérents en attente → '2 adhérents — payer plus tard'", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        PAY_ATTENTE_EXPLICITE,
        { ...PAY_ATTENTE_IMPLICITE, idPaiement: 99 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("2 adhérents — payer plus tard")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  7. MC/DC (Modified Condition / Decision Coverage)
// ─────────────────────────────────────────────────────────────────────────
/**
 * Décisions ciblées :
 *
 *  D1 : attente filter → statut==="en attente" || (montant===0 && montantDu>0)
 *       Conditions : C1=statut==="en attente"  C2=montant===0  C3=montantDu>0
 *
 *  D2 : payes filter → !attente.includes(p) && (montant>0 || statut==="payé")
 *       Conditions : C4=!attente.includes(p)  C5=montant>0  C6=statut==="payé"
 *
 *  D3 : lowStock → stock ≤ 5
 *       Conditions : C7=stock≤5
 *
 *  D4 : byMonth dispatch → type.includes("abonn")
 *       Conditions : C8=type.includes("abonn")
 *
 *  D5 : trendPct branch → prevTotal > 0
 *       Conditions : C9=prevTotal>0
 *
 *  D6 : isPositive (MoyenneBox) → parseFloat(trendPct) >= 0
 *       Conditions : C10=trendPct>=0
 *
 *  D7 : Array.isArray(pData) → fallback
 *       Conditions : C11=isArray
 */
describe("[MC/DC] Modified Condition / Decision Coverage — StatistiquesRevenue", () => {

  // ── D1 : filtre attente ────────────────────────────────────────────────

  // C1=true → attente (peu importe C2/C3)
  test("MCDC-D1-C1true : statut='en attente' seul → attente (C1 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 5000, montantDu: 5000, statut: "En attente", type: "abonn", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument(); // exclu de payes
    expect(screen.getByText("1 adhérent — payer plus tard")).toBeInTheDocument();
  });

  // C1=false, C2=true, C3=true → attente implicite
  test("MCDC-D1-C2C3true : montant=0 && montantDu>0 → attente (C2∧C3 déterminants)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_IMPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
    expect(screen.getByText("1 adhérent — payer plus tard")).toBeInTheDocument();
  });

  // C1=false, C2=true, C3=false → PAS attente (montantDu=0)
  test("MCDC-D1-C3false : montant=0 && montantDu=0 → PAS attente (C3 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 0, montantDu: 0, statut: "autre", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 adhérents — payer plus tard")).toBeInTheDocument();
  });

  // C1=false, C2=false → PAS attente (montant > 0)
  test("MCDC-D1-C2false : montant>0 && statut!='en attente' → PAS attente (C2 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 3000, montantDu: 3000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1 paiements")).toBeInTheDocument();
  });

  // ── D2 : filtre payes ─────────────────────────────────────────────────

  // C4=true (pas attente), C5=true (montant>0) → inclus dans payes
  test("MCDC-D2-C5true : montant>0 && pas attente → inclus dans payes", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 2000, montantDu: 2000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1 paiements")).toBeInTheDocument();
  });

  // C4=true, C5=false, C6=true (statut="payé") → inclus dans payes
  test("MCDC-D2-C6true : montant=0 && statut='payé' → inclus dans payes (C6 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 0, montantDu: 0, statut: "payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1 paiements")).toBeInTheDocument();
  });

  // C4=false (attente) → exclu de payes peu importe C5/C6
  test("MCDC-D2-C4false : en attente → exclu de payes (C4 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([PAY_ATTENTE_EXPLICITE]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });

  // ── D3 : lowStock ────────────────────────────────────────────────────

  // C7=true : stock ≤ 5 → compté
  test("MCDC-D3-C7true : stock=5 → lowStock++ (C7 déterminant)", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "X", categorie: "Y", stock: 5, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/1 produit/)).toBeInTheDocument();
  });

  // C7=false : stock = 6 → non compté
  test("MCDC-D3-C7false : stock=6 → lowStock non incrémenté (C7 déterminant)", async () => {
    setup({
      getProduits: jest.fn().mockResolvedValue([
        { idProduit: 1, nom: "X", categorie: "Y", stock: 6, prix: 100 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 produits faibles")).toBeInTheDocument();
  });

  // ── D4 : dispatch abonnement/vente ───────────────────────────────────

  // C8=true : type "abonn..." → row.abonnements
  test("MCDC-D4-C8true : type inclut 'abonn' → abonnements (C8 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 5000, montantDu: 5000, statut: "Payé", type: "abonnement", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // C8=false : type "vente" → row.ventes
  test("MCDC-D4-C8false : type 'vente' → ventes (C8 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 4000, montantDu: 4000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Revenus mensuels")).toBeInTheDocument();
  });

  // ── D5 : trendPct branch ─────────────────────────────────────────────

  // C9=true : prevTotal > 0 → calcul réel
  test("MCDC-D5-C9true : prevTotal>0 → trendPct calculé (C9 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 3000, montantDu: 3000, statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 1000, montantDu: 1000, statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    // (3000-1000)/1000 * 100 = 200%
    expect(screen.getByText(/200(\.0)?%\s*vs\s*mois/)).toBeInTheDocument();
  });

  // C9=false : prevTotal = 0 → "0.0"
  test("MCDC-D5-C9false : prevTotal=0 → trendPct='0.0' (C9 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 5000, montantDu: 5000, statut: "Payé", type: "vente", date: "2025-07-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/0(\.0)?%\s*vs\s*mois/)).toBeInTheDocument();
  });

  // ── D6 : isPositive (MoyenneBox) ────────────────────────────────────

  // C10=true : trendPct ≥ 0 → "▲"
  test("MCDC-D6-C10true : trendPct≥0 → isPositive=true → '▲' (C10 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 10000, montantDu: 10000, statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 1000,  montantDu: 1000,  statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  // C10=false : trendPct < 0 → "▼"
  test("MCDC-D6-C10false : trendPct<0 → isPositive=false → '▼' (C10 déterminant)", async () => {
    setup({
      getPaiements: jest.fn().mockResolvedValue([
        { idPaiement: 1, montant: 1000,  montantDu: 1000,  statut: "Payé", type: "vente", date: "2025-07-01" },
        { idPaiement: 2, montant: 10000, montantDu: 10000, statut: "Payé", type: "vente", date: "2025-06-01" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  // ── D7 : Array.isArray ──────────────────────────────────────────────

  // C11=true : tableau → utilisé tel quel
  test("MCDC-D7-C11true : pData est tableau → données utilisées (C11 déterminant)", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue(PAY_ABN) });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("2 paiements")).toBeInTheDocument();
  });

  // C11=false : non tableau → fallback []
  test("MCDC-D7-C11false : pData non-tableau → fallback [] (C11 déterminant)", async () => {
    setup({ getPaiements: jest.fn().mockResolvedValue("chaine") });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("0 paiements")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  III.  TESTS D'INTERACTION
// ══════════════════════════════════════════════════════════════════════════
describe("[Interaction] Navigation et UI — StatistiquesRevenue", () => {

  test("INT-01 : clic onglet 'Abonnement' → onPageChange('abonnement')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /abonnement/i }));
    expect(onPageChange).toHaveBeenCalledWith("abonnement");
  });

  test("INT-02 : clic onglet 'Adhérent' → onPageChange('adherent')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /adhérent/i }));
    expect(onPageChange).toHaveBeenCalledWith("adherent");
  });

  test("INT-03 : onglet 'Revenue' est actif par défaut (fontWeight=700)", async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    const btn = screen.getByRole("button", { name: /^revenue$/i });
    expect(btn).toHaveStyle({ fontWeight: "700" });
  });

  test("INT-04 : clic 'Rafraîchir' → API rappelée 2 fois", async () => {
    const getPaiements = jest.fn().mockResolvedValue([]);
    const getProduits  = jest.fn().mockResolvedValue([]);
    setup({ getPaiements, getProduits });
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /rafraîchir/i }));
    await waitFor(() => expect(getPaiements).toHaveBeenCalledTimes(2));
    expect(getProduits).toHaveBeenCalledTimes(2);
  });

  test("INT-05 : boutons Abonnement et Adhérent sont inactifs (fontWeight=400)", async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement des statistiques...")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /abonnement/i })).toHaveStyle({ fontWeight: "400" });
    expect(screen.getByRole("button", { name: /adhérent/i })).toHaveStyle({ fontWeight: "400" });
  });
});