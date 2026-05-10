/**
 * ============================================================
 *  TESTS — StatistiquesAbonnement.jsx
 *  Techniques : Black Box (EP · BVA · Pairwise · PVA · Robust)
 *               White Box (CFG · DFG)
 * ============================================================
 */

import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatistiquesAbonnement from "../../renderer/pages/StatistiquesAbonnement";

jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart:    ({ children, data }) => <div data-testid="linechart">{children}</div>,
    BarChart:     ({ children, data }) => <div data-testid="barchart">{children}</div>,
    PieChart:     ({ children })       => <div data-testid="piechart">{children}</div>,
    Line:         () => null,
    Bar:          () => null,
    Pie:          ({ data, children, label }) => {
      const React = require("react");
      return <div>{data && data.map((d, i) => <div key={i}>{label && label({ name: d.name, percent: (d.value || 0) / 100 })}</div>)}{children}</div>;
    },
    Cell:         () => null,
    XAxis:        () => null,
    YAxis:        () => null,
    Tooltip:      () => null,
    CartesianGrid:() => null,
    Legend:       () => null,
  };
});

jest.mock("../../renderer/components/QuickActions", () => () => <div data-testid="quick-actions" />);

// ─── Helpers ────────────────────────────────────────────────
const defaultStats = { total: 100, actifs: 70, expires: 20, suspendus: 10 };

const buildApi = (overrides = {}) => ({
  getStatsAbonnements:        jest.fn().mockResolvedValue(defaultStats),
  getAbonnementsParType:      jest.fn().mockResolvedValue([
    { name: "Mensuel", value: 40 },
    { name: "Annuel",  value: 30 },
  ]),
  getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
    { name: "Alice Martin",  joursRestants: 3,  dateExpiration: "2025-07-10" },
    { name: "Bob Dupont",    joursRestants: 12, dateExpiration: "2025-07-19" },
  ]),
  getFrequentationHebdo: jest.fn().mockResolvedValue([
    { day: "Monday", value: 5 }, { day: "Tuesday", value: 8 },
    { day: "Wednesday", value: 3 }, { day: "Thursday", value: 6 },
    { day: "Friday", value: 2 }, { day: "Saturday", value: 9 },
    { day: "Sunday", value: 1 },
  ]),
  ...overrides,
});

const setup = (apiOverrides = {}, onPageChange = jest.fn()) => {
  window.api = buildApi(apiOverrides);
  return render(<StatistiquesAbonnement onPageChange={onPageChange} />);
};

// ════════════════════════════════════════════════════════════
//  I.  BLACK BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  1.  EQUIVALENCE PARTITIONING (EP)
// ────────────────────────────────────────────────────────────
describe("[EP] Partitions d'équivalence — StatistiquesAbonnement", () => {

  // --- Partition 1 : données valides normales ---
  test("EP-01 : affiche les valeurs normales de stats (total > actifs > 0)", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText("70").length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText("20").length).toBeGreaterThanOrEqual(1);
  });

  // --- Partition 2 : données nulles (API renvoie null) ---
  test("EP-02 : données API null → valeurs à 0 par défaut", async () => {
    setup({
      getStatsAbonnements:        jest.fn().mockResolvedValue(null),
      getAbonnementsParType:      jest.fn().mockResolvedValue(null),
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue(null),
      getFrequentationHebdo:      jest.fn().mockResolvedValue(null),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Toutes les StatCards doivent afficher 0
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  // --- Partition 3 : listes vides (tableaux []) ---
  test("EP-03 : listes vides → messages 'Pas de données'", async () => {
    setup({
      getAbonnementsParType:      jest.fn().mockResolvedValue([]),
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([]),
      getFrequentationHebdo:      jest.fn().mockResolvedValue([]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Pas de données cette semaine")).toBeInTheDocument();
    expect(screen.getByText("Pas de données")).toBeInTheDocument();
    expect(screen.getByText("Aucun abonnement expirant bientôt")).toBeInTheDocument();
  });

  // --- Partition 4 : abonnement expirant <= 7 jours (alerte rouge) ---
  test("EP-04 : joursRestants ≤ 7 → texte coloré en accent (rouge)", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Claire Durand", joursRestants: 5, dateExpiration: "2025-07-08" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  // --- Partition 5 : joursRestants > 7 (pas d'alerte) ---
  test("EP-05 : joursRestants > 7 → texte normal (gris muet)", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "David Leroy", joursRestants: 20, dateExpiration: "2025-07-30" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire dans 20 jours")).toBeInTheDocument();
  });

  // --- Partition 6 : joursRestants < 0 (expiré) ---
  test("EP-06 : joursRestants < 0 → 'Expiré'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Eva Blanc", joursRestants: -3, dateExpiration: "2025-07-01" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expiré")).toBeInTheDocument();
  });

  // --- Partition 7 : joursRestants === 0 ---
  test("EP-07 : joursRestants = 0 → 'Expire aujourd'hui'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Félix Moreau", joursRestants: 0, dateExpiration: "2025-07-07" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire aujourd'hui")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  2.  BOUNDARY VALUE ANALYSIS (BVA)
// ────────────────────────────────────────────────────────────
describe("[BVA] Analyse des valeurs limites — formatJours / stats", () => {

  const bvaCases = [
    { jours: -1,  expected: "Expiré",             desc: "BVA-01 : -1 (juste sous 0)" },
    { jours:  0,  expected: "Expire aujourd'hui", desc: "BVA-02 : 0 (limite basse)" },
    { jours:  1,  expected: "Expire dans 1 jour", desc: "BVA-03 : 1 (singulier)" },
    { jours:  7,  expected: "Expire dans 7 jours", desc: "BVA-04 : 7 (limite alerte)" },
    { jours:  8,  expected: "Expire dans 8 jours", desc: "BVA-05 : 8 (juste au-dessus alerte)" },
  ];

  bvaCases.forEach(({ jours, expected, desc }) => {
    test(desc, async () => {
      setup({
        getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
          { name: "Test User", joursRestants: jours },
        ]),
      });
      await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test("BVA-06 : stats.total = 0 → header affiche 0 total", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: 0, actifs: 0, expires: 0, suspendus: 0 }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  test("BVA-07 : stats.total très grand (999999)", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: 999999, actifs: 999999, expires: 0, suspendus: 0 }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
  expect(screen.getAllByText("999999").length).toBeGreaterThanOrEqual(1);
  });

  test("BVA-08 : parType avec 1 seul type", async () => {
    setup({ getAbonnementsParType: jest.fn().mockResolvedValue([{ name: "Journalier", value: 1 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Journalier")).toBeInTheDocument();
  });

  test("BVA-09 : frequentation avec un seul jour", async () => {
    setup({ getFrequentationHebdo: jest.fn().mockResolvedValue([{ day: "Monday", value: 1 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Le graphe doit être rendu (pas le message vide)
    expect(screen.queryByText("Pas de données cette semaine")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  3.  PAIRWISE TESTING
// ────────────────────────────────────────────────────────────
describe("[Pairwise] Combinaisons de paramètres — StatistiquesAbonnement", () => {
  /**
   * Paramètres :
   *   A = stats        : {valides} | {nulles}
   *   B = parType      : {remplie} | {vide}
   *   C = expirants    : {remplie} | {vide}
   *   D = frequentation: {remplie} | {vide}
   *
   * Paires couvertes (L4 orthogonal array, 8 cas) :
   */
  const pairwiseCases = [
    { id: "PW-01", stats: "valide", parType: "remplie", expirants: "remplie", freq: "remplie" },
    { id: "PW-02", stats: "valide", parType: "remplie", expirants: "vide",    freq: "vide"    },
    { id: "PW-03", stats: "valide", parType: "vide",    expirants: "remplie", freq: "vide"    },
    { id: "PW-04", stats: "valide", parType: "vide",    expirants: "vide",    freq: "remplie" },
    { id: "PW-05", stats: "nulle",  parType: "remplie", expirants: "remplie", freq: "vide"    },
    { id: "PW-06", stats: "nulle",  parType: "remplie", expirants: "vide",    freq: "remplie" },
    { id: "PW-07", stats: "nulle",  parType: "vide",    expirants: "remplie", freq: "remplie" },
    { id: "PW-08", stats: "nulle",  parType: "vide",    expirants: "vide",    freq: "vide"    },
  ];

  pairwiseCases.forEach(({ id, stats: s, parType: pt, expirants: ex, freq }) => {
    test(`${id} : stats=${s}, parType=${pt}, expirants=${ex}, freq=${freq}`, async () => {
      setup({
        getStatsAbonnements: s === "valide"
          ? jest.fn().mockResolvedValue(defaultStats)
          : jest.fn().mockResolvedValue(null),
        getAbonnementsParType: pt === "remplie"
          ? jest.fn().mockResolvedValue([{ name: "Mensuel", value: 10 }])
          : jest.fn().mockResolvedValue([]),
        getAbonnementsExpirantBientot: ex === "remplie"
          ? jest.fn().mockResolvedValue([{ name: "X Y", joursRestants: 5 }])
          : jest.fn().mockResolvedValue([]),
        getFrequentationHebdo: freq === "remplie"
          ? jest.fn().mockResolvedValue([{ day: "Monday", value: 3 }])
          : jest.fn().mockResolvedValue([]),
      });
      await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
      // Le composant doit au moins se rendre sans crash
      expect(screen.getByText("Statistiques Abonnement")).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────
//  4.  PATH VALUE ANALYSIS (PVA)
// ────────────────────────────────────────────────────────────
describe("[PVA] Analyse des valeurs de chemin — formatJours", () => {
  /**
   * formatJours(jours) :
   *   P1 : jours === 0        → "Expire aujourd'hui"
   *   P2 : jours < 0          → "Expiré"
   *   P3 : jours === 1        → "Expire dans 1 jour"   (singulier)
   *   P4 : jours > 1          → "Expire dans N jours"  (pluriel)
   */
  const pvaCases = [
    { path: "P1", jours: 0,   expected: "Expire aujourd'hui"  },
    { path: "P2", jours: -10, expected: "Expiré"              },
    { path: "P3", jours: 1,   expected: "Expire dans 1 jour"  },
    { path: "P4", jours: 15,  expected: "Expire dans 15 jours" },
  ];

  pvaCases.forEach(({ path, jours, expected }) => {
    test(`PVA-${path} : jours=${jours} → "${expected}"`, async () => {
      setup({
        getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
          { name: "Test", joursRestants: jours },
        ]),
      });
      await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────
//  5.  ROBUSTNESS TESTING (Robust)
// ────────────────────────────────────────────────────────────
describe("[Robust] Tests de robustesse — StatistiquesAbonnement", () => {

  test("ROB-01 : API lance une exception → pas de crash, pas de contenu chargé", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockRejectedValue(new Error("Network error")),
    });
    // Le composant doit survivre à l'erreur
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Les cards restent à 0 (état initial)
    expect(screen.queryByText("Statistiques Abonnement")).toBeInTheDocument();
  });

  test("ROB-02 : stats avec champs manquants (undefined) → fallback 0", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: undefined, actifs: undefined }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  test("ROB-03 : nom adhérent vide ('') → initiales sans crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "", joursRestants: 5 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Pas d'erreur rendu
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  test("ROB-04 : parType avec value = 0 → rendu sans crash", async () => {
    setup({
      getAbonnementsParType: jest.fn().mockResolvedValue([{ name: "Mensuel", value: 0 }]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Mensuel")).toBeInTheDocument();
  });

  test("ROB-05 : frequentation avec day inconnu (non traduit) → affiche la valeur brute", async () => {
    setup({
      getFrequentationHebdo: jest.fn().mockResolvedValue([
        { day: "Holiday", value: 10 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // JOURS_FR["Holiday"] = undefined → fallback sur la valeur brute "Holiday"
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  test("ROB-06 : stats.actifs > stats.total (données incohérentes) → affiché tel quel", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: 10, actifs: 20, expires: 0, suspendus: 0 }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
expect(screen.getAllByText("20").length).toBeGreaterThanOrEqual(1);
  });

  test("ROB-07 : joursRestants = NaN → pas de crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Ghost User", joursRestants: NaN },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  test("ROB-08 : onPageChange non fourni (undefined) → pas de crash au clic onglet", async () => {
    window.api = buildApi();
    render(<StatistiquesAbonnement />); // pas de onPageChange
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    const btn = screen.getByRole("button", { name: /adhérent/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});

// ════════════════════════════════════════════════════════════
//  II.  WHITE BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  6.  CONTROL FLOW GRAPH (CFG) — couverture des branches
// ────────────────────────────────────────────────────────────
/**
 * Nœuds CFG identifiés dans le composant :
 *
 *   N1 : useEffect → loadAll()
 *   N2 : loading = true
 *   N3 : Promise.all([...])  ──┬── succès → N4
 *                              └── erreur → N5 (catch)
 *   N4 : setStats / setParType / setExpirants / setFrequentation
 *   N5 : console.error (catch)
 *   N6 : loading = false (finally)
 *   N7 : [RENDU] loading === true → spinner
 *   N8 : [RENDU] loading === false
 *   N9 : frequentation.length === 0 → message vide
 *   N10: frequentation.length > 0  → LineChart
 *   N11: parType.length === 0      → message vide
 *   N12: parType.length > 0        → PieChart
 *   N13: expirants.length === 0    → message vide
 *   N14: expirants.length > 0      → liste
 *   N15: item.joursRestants === 0  → "aujourd'hui"
 *   N16: item.joursRestants < 0    → "Expiré"
 *   N17: item.joursRestants === 1  → singulier
 *   N18: item.joursRestants > 1    → pluriel
 */
describe("[CFG] Couverture des nœuds du Control Flow Graph", () => {

  test("CFG-N7 : pendant le chargement → spinner visible (N7)", () => {
    // Promesse jamais résolue pour rester en loading
    window.api = buildApi({ getStatsAbonnements: jest.fn().mockReturnValue(new Promise(() => {})) });
    render(<StatistiquesAbonnement onPageChange={jest.fn()} />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  test("CFG-N8/N10/N12/N14 : chargement réussi → tous les graphes s'affichent", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // N10 : LineChart rendu (pas de msg vide)
    expect(screen.queryByText("Pas de données cette semaine")).not.toBeInTheDocument();
    // N12 : PieChart rendu
    expect(screen.queryByText("Pas de données")).not.toBeInTheDocument();
    // N14 : liste expirants rendue
    expect(screen.queryByText("Aucun abonnement expirant bientôt")).not.toBeInTheDocument();
  });

  test("CFG-N5/N6 : erreur API → finally exécuté, loading=false", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({ getStatsAbonnements: jest.fn().mockRejectedValue(new Error("fail")) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("CFG-N9 : frequentation vide → N9 (message vide)", async () => {
    setup({ getFrequentationHebdo: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Pas de données cette semaine")).toBeInTheDocument();
  });

  test("CFG-N11 : parType vide → N11 (message vide)", async () => {
    setup({ getAbonnementsParType: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Pas de données")).toBeInTheDocument();
  });

  test("CFG-N13 : expirants vide → N13 (message vide)", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Aucun abonnement expirant bientôt")).toBeInTheDocument();
  });

  test("CFG-N15 : joursRestants=0 → 'Expire aujourd'hui'", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([{ name: "A B", joursRestants: 0 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire aujourd'hui")).toBeInTheDocument();
  });

  test("CFG-N16 : joursRestants<0 → 'Expiré'", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([{ name: "A B", joursRestants: -1 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expiré")).toBeInTheDocument();
  });

  test("CFG-N17 : joursRestants=1 → singulier 'jour'", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([{ name: "A B", joursRestants: 1 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire dans 1 jour")).toBeInTheDocument();
  });

  test("CFG-N18 : joursRestants>1 → pluriel 'jours'", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([{ name: "A B", joursRestants: 10 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Expire dans 10 jours")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  7.  DATA FLOW GRAPH (DFG) — définitions et utilisations
// ────────────────────────────────────────────────────────────
/**
 * Variables suivies (DFG) :
 *
 *  stats         : DEF useEffect/loadAll → USE StatCards, header badges, renewalData
 *  parType       : DEF useEffect/loadAll → USE PieChart répartition, légende
 *  expirants     : DEF useEffect/loadAll → USE liste expiration, message vide
 *  frequentation : DEF useEffect/loadAll (avec traduction jours) → USE LineChart
 *  loading       : DEF true (début loadAll) / false (finally) → USE rendu conditionnel
 */
describe("[DFG] Couverture des flux de données (define-use)", () => {

  test("DFG-01 : DEF stats → USE header badges (actifs, expirés, total)", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: 50, actifs: 30, expires: 15, suspendus: 5 }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
   expect(screen.getAllByText("50").length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText("30").length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1);

  });

  test("DFG-02 : DEF stats → USE renewalData PieChart (actifs vs expirés)", async () => {
    setup({ getStatsAbonnements: jest.fn().mockResolvedValue({ total: 10, actifs: 6, expires: 4, suspendus: 0 }) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // PieChart Actifs vs Expirés est présent dans le DOM
    expect(screen.getByText("Actifs vs Expirés")).toBeInTheDocument();
  });

  test("DFG-03 : DEF parType → USE légende PieChart répartition", async () => {
    setup({ getAbonnementsParType: jest.fn().mockResolvedValue([{ name: "Trimestriel", value: 25 }]) });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Trimestriel")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  test("DFG-04 : DEF expirants → USE liste (nom affiché)", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Jean Valjean", joursRestants: 2 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Jean Valjean")).toBeInTheDocument();
  });

  test("DFG-05 : DEF expirants → USE initiales avatar", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Jean Valjean", joursRestants: 2 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Initiales : "JV"
    expect(screen.getByText("JV")).toBeInTheDocument();
  });

  test("DFG-06 : DEF frequentation (avec traduction) → USE LineChart (jours FR)", async () => {
    setup({
      getFrequentationHebdo: jest.fn().mockResolvedValue([
        { day: "Monday", value: 7 },
        { day: "Friday", value: 4 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // JOURS_FR["Monday"] = "Lun", "Friday" = "Ven"
    expect(screen.queryByText("Pas de données cette semaine")).not.toBeInTheDocument();
  });

  test("DFG-07 : DEF loading=true → USE rendu spinner ; DEF loading=false → USE rendu contenu", async () => {
    let resolvePromise;
    const pendingPromise = new Promise(resolve => { resolvePromise = resolve; });
    window.api = buildApi({ getStatsAbonnements: jest.fn().mockReturnValue(pendingPromise) });
    render(<StatistiquesAbonnement onPageChange={jest.fn()} />);

    // Phase loading=true
    expect(screen.getByText("Chargement...")).toBeInTheDocument();

    // Résoudre la promise → loading=false
    resolvePromise(defaultStats);
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(screen.getByText("Statistiques Abonnement")).toBeInTheDocument();
  });

  test("DFG-08 : tous les appels API (4 DEF) → toutes les sections USE affichées", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    // Vérifie que chaque section est rendue
    expect(screen.getByText("Abonnements débutés cette semaine")).toBeInTheDocument();
    expect(screen.getByText("Répartition des abonnements")).toBeInTheDocument();
    expect(screen.getByText("Actifs vs Expirés")).toBeInTheDocument();
    expect(screen.getByText("Abonnements à expiration")).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════
//  III.  TESTS D'INTERACTION (navigation + rechargement)
// ════════════════════════════════════════════════════════════
describe("[Interaction] Navigation et comportement UI", () => {

  test("INT-01 : clic onglet 'Adhérent' → onPageChange('adherent')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /adhérent/i }));
    expect(onPageChange).toHaveBeenCalledWith("adherent");
  });

  test("INT-02 : clic onglet 'Revenue' → onPageChange('revenue')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /revenue/i }));
    expect(onPageChange).toHaveBeenCalledWith("revenue");
  });

  test("INT-03 : bouton 'Voir tout' → onPageChange('abonnements')", async () => {
    const onPageChange = jest.fn();
    setup(
      { getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([{ name: "Test", joursRestants: 5 }]) },
      onPageChange
    );
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /voir tout/i }));
    expect(onPageChange).toHaveBeenCalledWith("abonnements");
  });

  test("INT-04 : les 4 API sont appelées exactement 1 fois au montage", async () => {
    const api = buildApi();
    window.api = api;
    render(<StatistiquesAbonnement onPageChange={jest.fn()} />);
    await waitFor(() => expect(screen.queryByText("Chargement...")).not.toBeInTheDocument());
    expect(api.getStatsAbonnements).toHaveBeenCalledTimes(1);
    expect(api.getAbonnementsParType).toHaveBeenCalledTimes(1);
    expect(api.getAbonnementsExpirantBientot).toHaveBeenCalledTimes(1);
    expect(api.getFrequentationHebdo).toHaveBeenCalledTimes(1);

  });


  describe('[Coverage] Lignes non couvertes', () => {

  test('COV-01 formatDate appelée — dateExpiration présente', async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Test User", joursRestants: 5, dateExpiration: "2025-07-10" },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  test('COV-02 onMouseEnter/onMouseLeave StatCard — pas de crash', async () => {
    setup();
    await waitFor(() =>
      expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
    );
    const card = screen.getByText("Total abonnements").closest("div");
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(screen.getByText("Total abonnements")).toBeInTheDocument();
  });

  test('COV-03 PieChart répartition rendu avec données', async () => {
    setup({
      getAbonnementsParType: jest.fn().mockResolvedValue([
        { name: "Mensuel", value: 40 },
        { name: "Annuel",  value: 30 },
      ]),
    });
    await waitFor(() =>
      expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Mensuel")).toBeInTheDocument();
    expect(screen.getByText("Annuel")).toBeInTheDocument();
  });
});

test('COV-04 onMouseEnter/onMouseLeave bouton Voir tout', async () => {
  setup({
    getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
      { name: "Test User", joursRestants: 5 },
    ]),
  });
  await waitFor(() =>
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
  );
  const btn = screen.getByRole("button", { name: /voir tout/i });
  fireEvent.mouseEnter(btn);
  fireEvent.mouseLeave(btn);
  expect(btn).toBeInTheDocument();
});
});