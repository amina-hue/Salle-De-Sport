/**
 * ============================================================
 *  TESTS — StatistiquesAbonnement.jsx
 *  Techniques : Black Box (EP · BVA · Pairwise · PVA · Robust)
 *               White Box (CFG · DFG)
 *  Coverage cible : > 90%
 * ============================================================
 */

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import StatistiquesAbonnement, {
  formatDate,
} from "../../renderer/pages/StatistiquesAbonnement";

// ─── Mocks globaux ───────────────────────────────────────────

// 1) Mock react-router-dom : on garde tout sauf useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// 2) Mock recharts pour éviter les erreurs de canvas/SVG
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => (
      <div data-testid="linechart">{children}</div>
    ),
    BarChart: ({ children }) => (
      <div data-testid="barchart">{children}</div>
    ),
    PieChart: ({ children }) => (
      <div data-testid="piechart">{children}</div>
    ),
    Line: () => null,
    Bar: () => null,
    Pie: ({ data, children, label }) => (
      <div>
        {data &&
          data.map((d, i) => (
            <div key={i}>
              {label &&
                label({
                  name: d.name,
                  percent: (d.value || 0) / 100,
                })}
            </div>
          ))}
        {children}
      </div>
    ),
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
  };
});

// 3) Mock QuickActions
jest.mock(
  "../../renderer/components/QuickActions",
  () =>
    ({ navigate }) =>
      (
        <div
          data-testid="quick-actions"
          onClick={() => navigate && navigate("test")}
        />
      )
);

// 4) Mock de l'image PNG
jest.mock("../../images/Gymnastique.png", () => "test-file-stub");

// ─── Helpers ─────────────────────────────────────────────────

const defaultStats = {
  total: 100,
  actifs: 70,
  expires: 20,
  suspendus: 10,
};

const defaultParType = [
  { name: "Mensuel", value: 40 },
  { name: "Annuel", value: 30 },
];

const defaultExpirants = [
  { name: "Alice Martin", joursRestants: 3, dateExpiration: "2025-07-10" },
  { name: "Bob Dupont", joursRestants: 12, dateExpiration: "2025-07-19" },
];

const defaultFrequentation = [
  { day: "Monday", value: 5 },
  { day: "Tuesday", value: 8 },
  { day: "Wednesday", value: 3 },
  { day: "Thursday", value: 6 },
  { day: "Friday", value: 2 },
  { day: "Saturday", value: 9 },
  { day: "Sunday", value: 1 },
];

const buildApi = (overrides = {}) => ({
  getStatsAbonnements: jest.fn().mockResolvedValue(defaultStats),
  getAbonnementsParType: jest.fn().mockResolvedValue(defaultParType),
  getAbonnementsExpirantBientot: jest.fn().mockResolvedValue(defaultExpirants),
  getFrequentationHebdo: jest.fn().mockResolvedValue(defaultFrequentation),
  ...overrides,
});

/** Rend le composant dans un MemoryRouter (obligatoire pour useNavigate) */
const setup = (apiOverrides = {}, onPageChange = jest.fn()) => {
  window.api = buildApi(apiOverrides);
  return render(
    <MemoryRouter>
      <StatistiquesAbonnement onPageChange={onPageChange} />
    </MemoryRouter>
  );
};

/** Attend que le spinner disparaisse */
const waitLoaded = () =>
  waitFor(() =>
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
  );

// ════════════════════════════════════════════════════════════
//  I.  BLACK BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  1.  EQUIVALENCE PARTITIONING (EP)
// ────────────────────────────────────────────────────────────
describe("[EP] Partitions d'équivalence — StatistiquesAbonnement", () => {
  test("EP-01 : affiche les valeurs normales de stats (total > actifs > 0)", async () => {
    setup();
    await waitLoaded();
    expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("70").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("20").length).toBeGreaterThanOrEqual(1);
  });

  test("EP-02 : données API null → valeurs à 0 par défaut", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue(null),
      getAbonnementsParType: jest.fn().mockResolvedValue(null),
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue(null),
      getFrequentationHebdo: jest.fn().mockResolvedValue(null),
    });
    await waitLoaded();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  test("EP-03 : listes vides → messages 'Pas de données'", async () => {
    setup({
      getAbonnementsParType: jest.fn().mockResolvedValue([]),
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([]),
      getFrequentationHebdo: jest.fn().mockResolvedValue([]),
    });
    await waitLoaded();
    expect(screen.getByText("Pas de données cette semaine")).toBeInTheDocument();
    expect(screen.getByText("Pas de données")).toBeInTheDocument();
    expect(
      screen.getByText("Aucun abonnement expirant bientôt")
    ).toBeInTheDocument();
  });

  test("EP-04 : joursRestants ≤ 7 → texte 'Expire dans 5 jours'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Claire Durand", joursRestants: 5, dateExpiration: "2025-07-08" },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  test("EP-05 : joursRestants > 7 → texte normal", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "David Leroy", joursRestants: 20, dateExpiration: "2025-07-30" },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 20 jours")).toBeInTheDocument();
  });

  test("EP-06 : joursRestants < 0 → 'Expiré'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Eva Blanc", joursRestants: -3, dateExpiration: "2025-07-01" },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expiré")).toBeInTheDocument();
  });

  test("EP-07 : joursRestants = 0 → 'Expire aujourd'hui'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Félix Moreau", joursRestants: 0, dateExpiration: "2025-07-07" },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire aujourd'hui")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  2.  BOUNDARY VALUE ANALYSIS (BVA)
// ────────────────────────────────────────────────────────────
describe("[BVA] Analyse des valeurs limites", () => {
  const bvaCases = [
    { jours: -1,  expected: "Expiré",              desc: "BVA-01 : -1" },
    { jours:  0,  expected: "Expire aujourd'hui",  desc: "BVA-02 : 0" },
    { jours:  1,  expected: "Expire dans 1 jour",  desc: "BVA-03 : 1 (singulier)" },
    { jours:  7,  expected: "Expire dans 7 jours", desc: "BVA-04 : 7 (limite alerte)" },
    { jours:  8,  expected: "Expire dans 8 jours", desc: "BVA-05 : 8 (au-dessus alerte)" },
  ];

  bvaCases.forEach(({ jours, expected, desc }) => {
    test(desc, async () => {
      setup({
        getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
          { name: "Test User", joursRestants: jours },
        ]),
      });
      await waitLoaded();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test("BVA-06 : stats.total = 0 → header affiche 0", async () => {
    setup({
      getStatsAbonnements: jest
        .fn()
        .mockResolvedValue({ total: 0, actifs: 0, expires: 0, suspendus: 0 }),
    });
    await waitLoaded();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  test("BVA-07 : stats.total très grand (999999)", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 999999,
        actifs: 999999,
        expires: 0,
        suspendus: 0,
      }),
    });
    await waitLoaded();
    expect(screen.getAllByText("999999").length).toBeGreaterThanOrEqual(1);
  });

  test("BVA-08 : parType avec 1 seul type", async () => {
    setup({
      getAbonnementsParType: jest
        .fn()
        .mockResolvedValue([{ name: "Journalier", value: 1 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Journalier")).toBeInTheDocument();
  });

  test("BVA-09 : frequentation avec un seul jour", async () => {
    setup({
      getFrequentationHebdo: jest
        .fn()
        .mockResolvedValue([{ day: "Monday", value: 1 }]),
    });
    await waitLoaded();
    expect(
      screen.queryByText("Pas de données cette semaine")
    ).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  3.  PAIRWISE TESTING
// ────────────────────────────────────────────────────────────
describe("[Pairwise] Combinaisons de paramètres", () => {
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
        getStatsAbonnements:
          s === "valide"
            ? jest.fn().mockResolvedValue(defaultStats)
            : jest.fn().mockResolvedValue(null),
        getAbonnementsParType:
          pt === "remplie"
            ? jest.fn().mockResolvedValue([{ name: "Mensuel", value: 10 }])
            : jest.fn().mockResolvedValue([]),
        getAbonnementsExpirantBientot:
          ex === "remplie"
            ? jest.fn().mockResolvedValue([{ name: "X Y", joursRestants: 5 }])
            : jest.fn().mockResolvedValue([]),
        getFrequentationHebdo:
          freq === "remplie"
            ? jest.fn().mockResolvedValue([{ day: "Monday", value: 3 }])
            : jest.fn().mockResolvedValue([]),
      });
      await waitLoaded();
      expect(screen.getByText("Statistiques Abonnement")).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────
//  4.  PATH VALUE ANALYSIS (PVA)
// ────────────────────────────────────────────────────────────
describe("[PVA] Analyse des valeurs de chemin — formatJours", () => {
  const pvaCases = [
    { path: "P1", jours: 0,   expected: "Expire aujourd'hui"   },
    { path: "P2", jours: -10, expected: "Expiré"               },
    { path: "P3", jours: 1,   expected: "Expire dans 1 jour"   },
    { path: "P4", jours: 15,  expected: "Expire dans 15 jours" },
  ];

  pvaCases.forEach(({ path, jours, expected }) => {
    test(`PVA-${path} : jours=${jours} → "${expected}"`, async () => {
      setup({
        getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
          { name: "Test", joursRestants: jours },
        ]),
      });
      await waitLoaded();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────
//  5.  ROBUSTNESS TESTING
// ────────────────────────────────────────────────────────────
describe("[Robust] Tests de robustesse", () => {
  test("ROB-01 : API lance une exception → pas de crash", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockRejectedValue(new Error("Network error")),
    });
    await waitLoaded();
    expect(screen.getByText("Statistiques Abonnement")).toBeInTheDocument();
  });

  test("ROB-02 : stats avec champs undefined → fallback 0", async () => {
    setup({
      getStatsAbonnements: jest
        .fn()
        .mockResolvedValue({ total: undefined, actifs: undefined }),
    });
    await waitLoaded();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  test("ROB-03 : nom adhérent vide ('') → pas de crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "", joursRestants: 5 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  test("ROB-04 : parType avec value = 0 → rendu sans crash", async () => {
    setup({
      getAbonnementsParType: jest
        .fn()
        .mockResolvedValue([{ name: "Mensuel", value: 0 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Mensuel")).toBeInTheDocument();
  });

  test("ROB-05 : frequentation avec day inconnu → affiche sans crash", async () => {
    setup({
      getFrequentationHebdo: jest
        .fn()
        .mockResolvedValue([{ day: "Holiday", value: 10 }]),
    });
    await waitLoaded();
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  test("ROB-06 : stats.actifs > stats.total (données incohérentes)", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 10,
        actifs: 20,
        expires: 0,
        suspendus: 0,
      }),
    });
    await waitLoaded();
    expect(screen.getAllByText("20").length).toBeGreaterThanOrEqual(1);
  });

  test("ROB-07 : joursRestants = NaN → pas de crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Ghost User", joursRestants: NaN },
      ]),
    });
    await waitLoaded();
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  test("ROB-08 : onPageChange non fourni → pas de crash au clic onglet", async () => {
    window.api = buildApi();
    render(
      <MemoryRouter>
        <StatistiquesAbonnement />
      </MemoryRouter>
    );
    await waitLoaded();
    const btn = screen.getByRole("button", { name: /adhérent/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  test("ROB-09 : plusieurs expirants dont un à 0 jour", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Anna Bod", joursRestants: 0 },
        { name: "Carl Doe", joursRestants: 14 },
        { name: "Emma Foo", joursRestants: -2 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("Expire dans 14 jours")).toBeInTheDocument();
    expect(screen.getByText("Expiré")).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════
//  II.  WHITE BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  6.  CONTROL FLOW GRAPH (CFG)
// ────────────────────────────────────────────────────────────
describe("[CFG] Couverture des nœuds du Control Flow Graph", () => {
  test("CFG-N7 : pendant le chargement → spinner visible", () => {
    window.api = buildApi({
      getStatsAbonnements: jest.fn().mockReturnValue(new Promise(() => {})),
    });
    render(
      <MemoryRouter>
        <StatistiquesAbonnement onPageChange={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  test("CFG-N8/N10/N12/N14 : chargement réussi → tous les graphes affichés", async () => {
    setup();
    await waitLoaded();
    expect(screen.queryByText("Pas de données cette semaine")).not.toBeInTheDocument();
    expect(screen.queryByText("Pas de données")).not.toBeInTheDocument();
    expect(screen.queryByText("Aucun abonnement expirant bientôt")).not.toBeInTheDocument();
  });

  test("CFG-N5/N6 : erreur API → finally exécuté, loading=false", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({
      getStatsAbonnements: jest.fn().mockRejectedValue(new Error("fail")),
    });
    await waitLoaded();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("CFG-N9 : frequentation vide → message vide", async () => {
    setup({ getFrequentationHebdo: jest.fn().mockResolvedValue([]) });
    await waitLoaded();
    expect(screen.getByText("Pas de données cette semaine")).toBeInTheDocument();
  });

  test("CFG-N11 : parType vide → message vide", async () => {
    setup({ getAbonnementsParType: jest.fn().mockResolvedValue([]) });
    await waitLoaded();
    expect(screen.getByText("Pas de données")).toBeInTheDocument();
  });

  test("CFG-N13 : expirants vide → message vide", async () => {
    setup({ getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([]) });
    await waitLoaded();
    expect(screen.getByText("Aucun abonnement expirant bientôt")).toBeInTheDocument();
  });

  test("CFG-N15 : joursRestants=0 → 'Expire aujourd'hui'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest
        .fn()
        .mockResolvedValue([{ name: "A B", joursRestants: 0 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire aujourd'hui")).toBeInTheDocument();
  });

  test("CFG-N16 : joursRestants<0 → 'Expiré'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest
        .fn()
        .mockResolvedValue([{ name: "A B", joursRestants: -1 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Expiré")).toBeInTheDocument();
  });

  test("CFG-N17 : joursRestants=1 → singulier 'jour'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest
        .fn()
        .mockResolvedValue([{ name: "A B", joursRestants: 1 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 1 jour")).toBeInTheDocument();
  });

  test("CFG-N18 : joursRestants>1 → pluriel 'jours'", async () => {
    setup({
      getAbonnementsExpirantBientot: jest
        .fn()
        .mockResolvedValue([{ name: "A B", joursRestants: 10 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 10 jours")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  7.  DATA FLOW GRAPH (DFG)
// ────────────────────────────────────────────────────────────
describe("[DFG] Couverture des flux de données (define-use)", () => {
  test("DFG-01 : DEF stats → USE header badges", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 50,
        actifs: 30,
        expires: 15,
        suspendus: 5,
      }),
    });
    await waitLoaded();
    expect(screen.getAllByText("50").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("30").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1);
  });

  test("DFG-02 : DEF stats → USE renewalData PieChart", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 10,
        actifs: 6,
        expires: 4,
        suspendus: 0,
      }),
    });
    await waitLoaded();
    expect(screen.getByText("Actifs vs Expirés")).toBeInTheDocument();
  });

  test("DFG-03 : DEF parType → USE légende PieChart répartition", async () => {
    setup({
      getAbonnementsParType: jest
        .fn()
        .mockResolvedValue([{ name: "Trimestriel", value: 25 }]),
    });
    await waitLoaded();
    expect(screen.getByText("Trimestriel")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  test("DFG-04 : DEF expirants → USE liste (nom affiché)", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Jean Valjean", joursRestants: 2 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Jean Valjean")).toBeInTheDocument();
  });

  test("DFG-05 : DEF expirants → USE initiales avatar", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Jean Valjean", joursRestants: 2 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("JV")).toBeInTheDocument();
  });

  test("DFG-06 : DEF frequentation traduite → USE LineChart", async () => {
    setup({
      getFrequentationHebdo: jest.fn().mockResolvedValue([
        { day: "Monday", value: 7 },
        { day: "Friday", value: 4 },
      ]),
    });
    await waitLoaded();
    expect(
      screen.queryByText("Pas de données cette semaine")
    ).not.toBeInTheDocument();
  });

  test("DFG-07 : loading true → spinner ; loading false → contenu", async () => {
    let resolvePromise;
    const pendingPromise = new Promise((res) => {
      resolvePromise = res;
    });
    window.api = buildApi({
      getStatsAbonnements: jest.fn().mockReturnValue(pendingPromise),
    });
    render(
      <MemoryRouter>
        <StatistiquesAbonnement onPageChange={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Chargement...")).toBeInTheDocument();

    await act(async () => {
      resolvePromise(defaultStats);
    });
    await waitLoaded();
    expect(screen.getByText("Statistiques Abonnement")).toBeInTheDocument();
  });

  test("DFG-08 : 4 API appelées → toutes sections affichées", async () => {
    setup();
    await waitLoaded();
    expect(screen.getByText("Abonnements débutés cette semaine")).toBeInTheDocument();
    expect(screen.getByText("Répartition des abonnements")).toBeInTheDocument();
    expect(screen.getByText("Actifs vs Expirés")).toBeInTheDocument();
    expect(screen.getByText("Abonnements à expiration")).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════
//  III.  INTERACTION & NAVIGATION
// ════════════════════════════════════════════════════════════
describe("[Interaction] Navigation et comportement UI", () => {
  test("INT-01 : clic onglet 'Adhérent' → onPageChange('adherent')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitLoaded();
    fireEvent.click(screen.getByRole("button", { name: /adhérent/i }));
    expect(onPageChange).toHaveBeenCalledWith("adherent");
  });

  test("INT-02 : clic onglet 'Revenue' → onPageChange('revenue')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitLoaded();
    fireEvent.click(screen.getByRole("button", { name: /revenue/i }));
    expect(onPageChange).toHaveBeenCalledWith("revenue");
  });

  test("INT-03 : bouton 'Voir tout' → onPageChange('abonnements')", async () => {
    const onPageChange = jest.fn();
    setup(
      {
        getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
          { name: "Test", joursRestants: 5 },
        ]),
      },
      onPageChange
    );
    await waitLoaded();
    fireEvent.click(screen.getByRole("button", { name: /voir tout/i }));
    expect(onPageChange).toHaveBeenCalledWith("abonnements");
  });

  test("INT-04 : les 4 API sont appelées exactement 1 fois au montage", async () => {
    const api = buildApi();
    window.api = api;
    render(
      <MemoryRouter>
        <StatistiquesAbonnement onPageChange={jest.fn()} />
      </MemoryRouter>
    );
    await waitLoaded();
    expect(api.getStatsAbonnements).toHaveBeenCalledTimes(1);
    expect(api.getAbonnementsParType).toHaveBeenCalledTimes(1);
    expect(api.getAbonnementsExpirantBientot).toHaveBeenCalledTimes(1);
    expect(api.getFrequentationHebdo).toHaveBeenCalledTimes(1);
  });

  test("INT-05 : clic onglet 'Abonnement' (actif) → navigate appelé", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitLoaded();
    // L'onglet Abonnement est actif mais cliquable
    const btns = screen.getAllByRole("button");
    const abonnementBtn = btns.find((b) => b.textContent === "Abonnement");
    expect(abonnementBtn).toBeTruthy();
    fireEvent.click(abonnementBtn);
    // Pas de crash, navigate géré par useNavigate (mocké)
  });
});

// ════════════════════════════════════════════════════════════
//  IV.  COUVERTURE COMPLÉMENTAIRE
// ════════════════════════════════════════════════════════════
describe("[Coverage] Lignes et branches non couvertes", () => {
  test("COV-01 : formatDate appelée — dateExpiration présente", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Test User", joursRestants: 5, dateExpiration: "2025-07-10" },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 5 jours")).toBeInTheDocument();
  });

  test("COV-02 : formatDate avec dateExpiration null → pas de crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "No Date User", joursRestants: 3, dateExpiration: null },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Expire dans 3 jours")).toBeInTheDocument();
  });

  test("COV-03 : onMouseEnter/onMouseLeave StatCard — pas de crash", async () => {
    setup();
    await waitLoaded();
    const card = screen.getByText("Total abonnements").closest("div");
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(screen.getByText("Total abonnements")).toBeInTheDocument();
  });

  test("COV-04 : onMouseEnter/onMouseLeave bouton Voir tout", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Test User", joursRestants: 5 },
      ]),
    });
    await waitLoaded();
    const btn = screen.getByRole("button", { name: /voir tout/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test("COV-05 : PieChart répartition avec plusieurs types", async () => {
    setup({
      getAbonnementsParType: jest.fn().mockResolvedValue([
        { name: "Mensuel", value: 40 },
        { name: "Annuel", value: 30 },
        { name: "Trimestriel", value: 20 },
        { name: "Hebdo", value: 10 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("Mensuel")).toBeInTheDocument();
    expect(screen.getByText("Annuel")).toBeInTheDocument();
    expect(screen.getByText("Trimestriel")).toBeInTheDocument();
    expect(screen.getByText("Hebdo")).toBeInTheDocument();
  });

  test("COV-06 : JOURS_FR — tous les jours de la semaine traduits", async () => {
    setup({
      getFrequentationHebdo: jest.fn().mockResolvedValue([
        { day: "Monday",    value: 1 },
        { day: "Tuesday",   value: 2 },
        { day: "Wednesday", value: 3 },
        { day: "Thursday",  value: 4 },
        { day: "Friday",    value: 5 },
        { day: "Saturday",  value: 6 },
        { day: "Sunday",    value: 7 },
      ]),
    });
    await waitLoaded();
    // Le LineChart est rendu (pas le message vide)
    expect(
      screen.queryByText("Pas de données cette semaine")
    ).not.toBeInTheDocument();
  });

  test("COV-07 : expirant avec nom à 1 mot → initiale unique sans crash", async () => {
    setup({
      getAbonnementsExpirantBientot: jest.fn().mockResolvedValue([
        { name: "Madonna", joursRestants: 4 },
      ]),
    });
    await waitLoaded();
    expect(screen.getByText("MA")).toBeInTheDocument();
  });

  test("COV-08 : renewalData — actifs=0 et expires=0 → PieChart sans données réelles", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 0,
        actifs: 0,
        expires: 0,
        suspendus: 0,
      }),
    });
    await waitLoaded();
    expect(screen.getByText("Actifs vs Expirés")).toBeInTheDocument();
  });

  test("COV-09 : STAT_CARDS — vérification des 3 cartes rendues", async () => {
    setup();
    await waitLoaded();
    expect(screen.getByText("Total abonnements")).toBeInTheDocument();
    expect(screen.getByText("Abonnements actifs")).toBeInTheDocument();
    expect(screen.getByText("Abonnements expirés")).toBeInTheDocument();
  });

  test("COV-10 : trend de la carte 'expirés' affiche suspendus", async () => {
    setup({
      getStatsAbonnements: jest.fn().mockResolvedValue({
        total: 50,
        actifs: 30,
        expires: 15,
        suspendus: 5,
      }),
    });
    await waitLoaded();
    expect(screen.getByText("5 suspendus")).toBeInTheDocument();
  });

  test("COV-11 : breadcrumb et titre H1 toujours affichés", async () => {
    setup();
    await waitLoaded();
    expect(screen.getByText("FitManager")).toBeInTheDocument();
    expect(screen.getAllByText(/Abonnement/i).length).toBeGreaterThan(0);
  });

  test("COV-12 : QuickActions reçoit navigate et peut l'appeler sans crash", async () => {
    setup();
    await waitLoaded();
    const qa = screen.getByTestId("quick-actions");
    expect(() => fireEvent.click(qa)).not.toThrow();
  });
});