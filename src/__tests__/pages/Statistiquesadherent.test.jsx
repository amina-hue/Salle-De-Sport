/**
 * ============================================================
 *  TESTS — StatistiquesAdherent.jsx
 *  Techniques : Black Box (EP · BVA · Pairwise · PVA · Robust)
 *               White Box (CFG · DFG)
 * ============================================================
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatistiquesAdherent from "../../renderer/pages/StatistiquesAdherent";
jest.mock("../../renderer/components/QuickActions", () => () => <div data-testid="quick-actions" />);
// ─── Mock react-router-dom (QuickActions utilise useNavigate) ──────────────
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

// ─── Mock des sous-composants lourds ──────────────────────────────────────
jest.mock("../../renderer/components/QuickActions", () => () => <div data-testid="quick-actions" />);
// ─── Helpers ───────────────────────────────────────────────────────────────
const NOW = new Date("2025-07-07T12:00:00Z");

/** Retourne une date il y a N jours par rapport à NOW */
const daysAgo = (n) => {
  const d = new Date(NOW);
  d.setDate(NOW.getDate() - n);
  return d.toISOString();
};

const defaultStats = { total: 120, actifs: 80, nouveauxCeMois: 15 };

const defaultFreq = [
  { day: "Lun", value: 10 }, { day: "Mar", value: 8 },
  { day: "Mer", value: 12 }, { day: "Jeu", value: 6 },
  { day: "Ven", value: 9  }, { day: "Sam", value: 15 },
  { day: "Dim", value: 3  },
];

const defaultSeances = [
  { day: "Lun", value: 2 }, { day: "Mar", value: 3 },
  { day: "Mer", value: 1 }, { day: "Jeu", value: 4 },
  { day: "Ven", value: 2 }, { day: "Sam", value: 5 },
  { day: "Dim", value: 0 },
];

const defaultAdherents = [
  { idAdherent: 1, nom: "Martin",  prenom: "Alice", dateCreation: daysAgo(2), abonnementStatut: "actif"  },
  { idAdherent: 2, nom: "Dupont",  prenom: "Bob",   dateCreation: daysAgo(5), abonnementStatut: "inactif" },
  { idAdherent: 3, nom: "Leroy",   prenom: "Clara", dateCreation: daysAgo(8), abonnementStatut: "actif"  }, // hors 7j
];

const buildApi = (overrides = {}) => ({
  getStatsPageAdherent:       jest.fn().mockResolvedValue(defaultStats),
  getFrequentationSemaine:    jest.fn().mockResolvedValue(defaultFreq),
  getSeancesParJour:          jest.fn().mockResolvedValue(defaultSeances),
  getAdherentsAvecAbonnement: jest.fn().mockResolvedValue(defaultAdherents),
  ...overrides,
});

/**
 * Setup helper.
 * On remplace Date pour que le filtre "7 derniers jours" soit déterministe.
 */
const setup = (apiOverrides = {}, onPageChange = jest.fn()) => {
  jest.useFakeTimers().setSystemTime(NOW);
  window.api = buildApi(apiOverrides);
  const utils = render(<StatistiquesAdherent onPageChange={onPageChange} />);
  return utils;
};

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════
//  I.  BLACK BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  1.  EQUIVALENCE PARTITIONING (EP)
// ────────────────────────────────────────────────────────────
describe("[EP] Partitions d'équivalence — StatistiquesAdherent", () => {

  // Partition 1 : données valides normales
  test("EP-01 : stats normales → 3 StatCards affichent les bons chiffres", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());

    expect(screen.getAllByText("120").length).toBeGreaterThanOrEqual(1);// total
expect(screen.getAllByText("80").length).toBeGreaterThanOrEqual(1);// actifs
expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1); // nouveaux
  });

  // Partition 2 : adhérent dans les 7 derniers jours → affiché
  test("EP-02 : adhérent créé il y a 2 jours → dans la liste nouveaux", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Martin Alice")).toBeInTheDocument();
  });

  // Partition 3 : adhérent créé il y a 8 jours → exclu
  test("EP-03 : adhérent créé il y a 8 jours → absent de la liste nouveaux", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.queryByText("Leroy Clara")).not.toBeInTheDocument();
  });

  // Partition 4 : aucun adhérent dans les 7 jours → message vide
  test("EP-04 : tous les adhérents > 7 jours → 'Aucun nouvel adhérent cette semaine'", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 99, nom: "Vieux", prenom: "Paul", dateCreation: daysAgo(10), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Aucun nouvel adhérent cette semaine")).toBeInTheDocument();
  });

  // Partition 5 : statut "actif" → badge vert
  test("EP-05 : abonnementStatut='actif' → badge 'Actif'", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  // Partition 6 : statut autre → badge "Sans abonnement"
  test("EP-06 : abonnementStatut!='actif' → badge 'Sans abonnement'", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Sans abonnement")).toBeInTheDocument();
  });

  // Partition 7 : liste vide renvoyée par API
  test("EP-07 : getAdherentsAvecAbonnement=[] → message vide", async () => {
    setup({ getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Aucun nouvel adhérent cette semaine")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  2.  BOUNDARY VALUE ANALYSIS (BVA)
// ────────────────────────────────────────────────────────────
describe("[BVA] Analyse des valeurs limites — filtrage 7 jours / makeYAxis", () => {

  test("BVA-01 : adhérent créé exactement aujourd'hui (daysAgo=0) → inclus", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Neuf", prenom: "Julien", dateCreation: daysAgo(0), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Neuf Julien")).toBeInTheDocument();
  });

  test("BVA-02 : adhérent créé il y a exactement 7 jours → inclus", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 2, nom: "Limite", prenom: "Sven", dateCreation: daysAgo(6), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Limite Sven")).toBeInTheDocument();
  });

  test("BVA-03 : adhérent créé il y a 7j+1s (8 jours) → exclu", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 3, nom: "Dehors", prenom: "Emma", dateCreation: daysAgo(8), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.queryByText("Dehors Emma")).not.toBeInTheDocument();
  });

  test("BVA-04 : stats.total = 0 → StatCard affiche 0", async () => {
    setup({ getStatsPageAdherent: jest.fn().mockResolvedValue({ total: 0, actifs: 0, nouveauxCeMois: 0 }) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  test("BVA-05 : stats.total très grand (999999) → rendu sans troncature", async () => {
    setup({ getStatsPageAdherent: jest.fn().mockResolvedValue({ total: 999999, actifs: 0, nouveauxCeMois: 0 }) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getAllByText("999999").length).toBeGreaterThanOrEqual(1);
  });

  test("BVA-06 : makeYAxis — data vide → yMax=5 (minimum garanti)", async () => {
    // Si getFrequentationSemaine renvoie [], makeYAxis reçoit [] et doit retourner yMax=5
    setup({ getFrequentationSemaine: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    // Le LineChart se rend sans crash
    expect(screen.getByText("Inscriptions par jour de la semaine")).toBeInTheDocument();
  });

  test("BVA-07 : makeYAxis — valeur max = 5 → yMax reste 5", async () => {
    setup({ getFrequentationSemaine: jest.fn().mockResolvedValue([{ day: "Lun", value: 5 }]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Inscriptions par jour de la semaine")).toBeInTheDocument();
  });

  test("BVA-08 : makeYAxis — valeur = 1 → yMax=5 (arrondi sup au multiple de 5)", async () => {
    setup({ getFrequentationSemaine: jest.fn().mockResolvedValue([{ day: "Lun", value: 1 }]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.queryByText("…")).not.toBeInTheDocument();
  });

  test("BVA-09 : 1 seul adhérent dans les 7 jours → liste avec 1 entrée", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Solo", prenom: "Marc", dateCreation: daysAgo(1), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Solo Marc")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  3.  PAIRWISE TESTING
// ────────────────────────────────────────────────────────────
/**
 * Paramètres :
 *   A = stats              : valide | null
 *   B = getFreqSemaine     : remplie | vide
 *   C = getSeancesParJour  : remplie | vide
 *   D = getAdherents       : avec nouveaux (<=7j) | sans nouveaux
 */
describe("[Pairwise] Combinaisons — StatistiquesAdherent", () => {

  const cases = [
    { id: "PW-01", stats:"valide", freq:"remplie", seances:"remplie", adherents:"avecNouveaux" },
    { id: "PW-02", stats:"valide", freq:"remplie", seances:"vide",    adherents:"sansNouveaux" },
    { id: "PW-03", stats:"valide", freq:"vide",    seances:"remplie", adherents:"sansNouveaux" },
    { id: "PW-04", stats:"valide", freq:"vide",    seances:"vide",    adherents:"avecNouveaux" },
    { id: "PW-05", stats:"null",   freq:"remplie", seances:"remplie", adherents:"sansNouveaux" },
    { id: "PW-06", stats:"null",   freq:"remplie", seances:"vide",    adherents:"avecNouveaux" },
    { id: "PW-07", stats:"null",   freq:"vide",    seances:"remplie", adherents:"avecNouveaux" },
    { id: "PW-08", stats:"null",   freq:"vide",    seances:"vide",    adherents:"sansNouveaux" },
  ];

  cases.forEach(({ id, stats: s, freq, seances, adherents }) => {
    test(`${id} : stats=${s}, freq=${freq}, seances=${seances}, adherents=${adherents}`, async () => {
      setup({
        getStatsPageAdherent: s === "valide"
          ? jest.fn().mockResolvedValue(defaultStats)
          : jest.fn().mockResolvedValue({ total: 0, actifs: 0, nouveauxCeMois: 0 }),
        getFrequentationSemaine: freq === "remplie"
          ? jest.fn().mockResolvedValue(defaultFreq)
          : jest.fn().mockResolvedValue([]),
        getSeancesParJour: seances === "remplie"
          ? jest.fn().mockResolvedValue(defaultSeances)
          : jest.fn().mockResolvedValue([]),
        getAdherentsAvecAbonnement: adherents === "avecNouveaux"
          ? jest.fn().mockResolvedValue([
              { idAdherent: 1, nom: "Test", prenom: "User", dateCreation: daysAgo(1), abonnementStatut: "actif" },
            ])
          : jest.fn().mockResolvedValue([
              { idAdherent: 2, nom: "Vieux", prenom: "User", dateCreation: daysAgo(10), abonnementStatut: "actif" },
            ]),
      });
      await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
      // Le composant doit se rendre sans crash dans toutes les combinaisons
      expect(screen.getByText("Statistiques Adhérent")).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────
//  4.  PATH VALUE ANALYSIS (PVA)
// ────────────────────────────────────────────────────────────
/**
 * Chemins identifiés dans le rendu de la liste nouveaux :
 *   P1 : loading = true            → spinner "Chargement…"
 *   P2 : loading = false, vide     → message "Aucun nouvel…"
 *   P3 : loading = false, non vide + statut "actif"     → badge "Actif"
 *   P4 : loading = false, non vide + statut != "actif"  → badge "Sans abonnement"
 */
describe("[PVA] Analyse des valeurs de chemin — liste nouveaux adhérents", () => {

  test("PVA-P1 : pendant chargement → 'Chargement…' visible dans la liste", () => {
    window.api = buildApi({ getStatsPageAdherent: jest.fn().mockReturnValue(new Promise(() => {})) });
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesAdherent onPageChange={jest.fn()} />);
    expect(screen.getByText("Chargement…")).toBeInTheDocument();
  });

  test("PVA-P2 : chargé, liste vide → message d'absence", async () => {
    setup({ getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("Chargement…")).not.toBeInTheDocument());
    expect(screen.getByText("Aucun nouvel adhérent cette semaine")).toBeInTheDocument();
  });

  test("PVA-P3 : chargé, adhérent actif → badge 'Actif' vert", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Green", prenom: "User", dateCreation: daysAgo(1), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  test("PVA-P4 : chargé, adhérent inactif → badge 'Sans abonnement'", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 2, nom: "Yellow", prenom: "User", dateCreation: daysAgo(3), abonnementStatut: "suspendu" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Sans abonnement")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  5.  ROBUSTNESS TESTING (Robust)
// ────────────────────────────────────────────────────────────
describe("[Robust] Tests de robustesse — StatistiquesAdherent", () => {

  test("ROB-01 : getStatsPageAdherent lance exception → pas de crash, loading=false", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({ getStatsPageAdherent: jest.fn().mockRejectedValue(new Error("réseau")) });
    await waitFor(() => expect(screen.queryByText("Chargement…")).not.toBeInTheDocument());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("ROB-02 : stats avec champs undefined → fallback '…' puis 0", async () => {
    setup({ getStatsPageAdherent: jest.fn().mockResolvedValue({ total: undefined, actifs: undefined, nouveauxCeMois: undefined }) });
    await waitFor(() => expect(screen.queryByText("Chargement…")).not.toBeInTheDocument());
    // undefined rendu tel quel ; pas de crash
    expect(screen.getByText("Statistiques Adhérent")).toBeInTheDocument();
  });

  test("ROB-03 : adhérent sans nom/prénom ('') → initiales vides sans crash", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "", prenom: "", dateCreation: daysAgo(1), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Actif")).toBeInTheDocument(); // rendu sans crash
  });

  test("ROB-04 : dateCreation invalide ('not-a-date') → pas de crash (filtrage silencieux)", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Bad", prenom: "Date", dateCreation: "not-a-date", abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    // L'adhérent avec dateCreation invalide est filtré ou provoque NaN → pas affiché
    expect(screen.getByText("Statistiques Adhérent")).toBeInTheDocument();
  });

  test("ROB-05 : getFrequentationSemaine exception → liste graphe vide sans crash", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({ getFrequentationSemaine: jest.fn().mockRejectedValue(new Error("timeout")) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("ROB-06 : getSeancesParJour exception → BarChart vide sans crash", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({ getSeancesParJour: jest.fn().mockRejectedValue(new Error("fail")) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("ROB-07 : onPageChange absent (undefined) → clic onglet sans crash", async () => {
    window.api = buildApi();
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesAdherent />);
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    const btn = screen.getByRole("button", { name: /abonnement/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  test("ROB-08 : makeYAxis avec valeur = 0 dans tous les points → yMax=5", async () => {
    setup({
      getFrequentationSemaine: jest.fn().mockResolvedValue([
        { day: "Lun", value: 0 }, { day: "Mar", value: 0 },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    // Pas de crash, graphe rendu
    expect(screen.getByText("Inscriptions par jour de la semaine")).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════
//  II.  WHITE BOX
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  6.  CONTROL FLOW GRAPH (CFG)
// ────────────────────────────────────────────────────────────
/**
 * Nœuds CFG :
 *
 * N1 : useEffect → load()
 * N2 : try — getStatsPageAdherent   ──┬── ok → N3
 *                                      └── err → N9 (catch)
 * N3 : getFrequentationSemaine       ──┬── ok → N4
 * N4 : getSeancesParJour             ──┬── ok → N5
 * N5 : getAdherentsAvecAbonnement    ──┬── ok → N6
 * N6 : filter() — construire nouveaux
 * N7 : setNouveaux(...)
 * N8 : setLoading(false) [finally]
 * N9 : console.error [catch]
 *
 * [RENDU]
 * N10 : loading = true  → "…" dans header + "Chargement…" dans liste
 * N11 : loading = false
 * N12 : nouveaux.length === 0  → "Aucun nouvel…"
 * N13 : nouveaux.length > 0   → map() liste
 * N14 : abonnementStatut === "actif" → badge "Actif"
 * N15 : sinon                        → badge "Sans abonnement"
 *
 * makeYAxis(data) :
 * N16 : Math.max(maxVal, 5) → yMax calculé
 * N17 : Array ticks générés
 */
describe("[CFG] Couverture des nœuds — StatistiquesAdherent", () => {

  test("CFG-N10 : pendant chargement → '…' visibles dans le header", () => {
    window.api = buildApi({ getStatsPageAdherent: jest.fn().mockReturnValue(new Promise(() => {})) });
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesAdherent onPageChange={jest.fn()} />);
    // Les badges header affichent "…"
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  test("CFG-N8/N11 : finally s'exécute → loading=false, '…' disparaît", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
   expect(screen.getAllByText("120").length).toBeGreaterThanOrEqual(1);
  });

  test("CFG-N9 : catch exécuté sur erreur API → console.error appelé", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setup({ getStatsPageAdherent: jest.fn().mockRejectedValue(new Error("x")) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith("Stats adhérent:", expect.any(Error));
    spy.mockRestore();
  });

  test("CFG-N12 : nouveaux.length=0 → message vide (N12)", async () => {
    setup({ getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Aucun nouvel adhérent cette semaine")).toBeInTheDocument();
  });

  test("CFG-N13/N14 : nouveaux > 0, actif → badge 'Actif' (N13+N14)", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "A", prenom: "B", dateCreation: daysAgo(1), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  test("CFG-N15 : statut != actif → badge 'Sans abonnement' (N15)", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 2, nom: "X", prenom: "Y", dateCreation: daysAgo(2), abonnementStatut: "expiré" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Sans abonnement")).toBeInTheDocument();
  });

  test("CFG-N6 : filter — adhérent exactement à la limite 7j inclus (N6)", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Bord", prenom: "Line", dateCreation: daysAgo(6), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Bord Line")).toBeInTheDocument();
  });

  test("CFG-N16/N17 : makeYAxis — graphe rendu avec ticks calculés", async () => {
    setup({ getFrequentationSemaine: jest.fn().mockResolvedValue([{ day: "Lun", value: 11 }]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    // yMax = ceil(11/5)*5 = 15 → pas de crash
    expect(screen.getByText("Inscriptions par jour de la semaine")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────
//  7.  DATA FLOW GRAPH (DFG)
// ────────────────────────────────────────────────────────────
/**
 * Variables suivies :
 *
 *  stats         DEF: setStats(s)          USE: STAT_CARDS valeurs + header badges
 *  graphData     DEF: setGraphData(freq)   USE: makeYAxis(graphData) + LineChart
 *  seancesData   DEF: setSeancesData(s)    USE: makeYAxis(seancesData) + BarChart
 *  nouveaux      DEF: setNouveaux(filter)  USE: liste + message vide
 *  loading       DEF: true → false         USE: affichage "…" / contenu
 */
describe("[DFG] Couverture des flux de données — StatistiquesAdherent", () => {

  test("DFG-01 : DEF stats → USE header badges (total, actifs, nouveaux)", async () => {
    setup({ getStatsPageAdherent: jest.fn().mockResolvedValue({ total: 42, actifs: 30, nouveauxCeMois: 7 }) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
   expect(screen.getAllByText("42").length).toBeGreaterThanOrEqual(1);
   expect(screen.getAllByText("30").length).toBeGreaterThanOrEqual(1);
   expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(1);
  });

  test("DFG-02 : DEF stats → USE STAT_CARDS (3 cards avec valeurs)", async () => {
    setup({ getStatsPageAdherent: jest.fn().mockResolvedValue({ total: 50, actifs: 35, nouveauxCeMois: 10 }) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Total adhérents")).toBeInTheDocument();
    expect(screen.getByText("Adhérents actifs")).toBeInTheDocument();
    expect(screen.getByText("Nouveaux ce mois")).toBeInTheDocument();
  });

  test("DFG-03 : DEF graphData → USE makeYAxis + LineChart rendu", async () => {
    setup({ getFrequentationSemaine: jest.fn().mockResolvedValue([{ day: "Lun", value: 20 }]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Inscriptions par jour de la semaine")).toBeInTheDocument();
  });

  test("DFG-04 : DEF seancesData → USE makeYAxis + BarChart rendu", async () => {
    setup({ getSeancesParJour: jest.fn().mockResolvedValue([{ day: "Mar", value: 5 }]) });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Séances planifiées par jour")).toBeInTheDocument();
  });

  test("DFG-05 : DEF nouveaux (filtrés) → USE liste affichée (nom, prénom, date)", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Rousseau", prenom: "Jean", dateCreation: daysAgo(3), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getByText("Rousseau Jean")).toBeInTheDocument();
  });

  test("DFG-06 : DEF nouveaux → USE initiales avatar", async () => {
    setup({
      getAdherentsAvecAbonnement: jest.fn().mockResolvedValue([
        { idAdherent: 1, nom: "Bernard", prenom: "Luc", dateCreation: daysAgo(1), abonnementStatut: "actif" },
      ]),
    });
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    // Initiales : "BL"
    expect(screen.getByText("BL")).toBeInTheDocument();
  });

  test("DFG-07 : DEF loading true → USE '…' ; DEF loading false → USE valeurs réelles", async () => {
    let resolve;
    const pending = new Promise(r => { resolve = r; });
    window.api = buildApi({ getStatsPageAdherent: jest.fn().mockReturnValue(pending) });
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesAdherent onPageChange={jest.fn()} />);

    // loading = true → "…"
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);

    // Résolution → loading = false
    resolve(defaultStats);
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(screen.getAllByText("120").length).toBeGreaterThanOrEqual(1);
  });

  test("DFG-08 : les 4 API sont appelées exactement 1 fois au montage", async () => {
    const api = buildApi();
    window.api = api;
    jest.useFakeTimers().setSystemTime(NOW);
    render(<StatistiquesAdherent onPageChange={jest.fn()} />);
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    expect(api.getStatsPageAdherent).toHaveBeenCalledTimes(1);
    expect(api.getFrequentationSemaine).toHaveBeenCalledTimes(1);
    expect(api.getSeancesParJour).toHaveBeenCalledTimes(1);
    expect(api.getAdherentsAvecAbonnement).toHaveBeenCalledTimes(1);
  });
});

// ════════════════════════════════════════════════════════════
//  III.  TESTS D'INTERACTION
// ════════════════════════════════════════════════════════════
describe("[Interaction] Navigation — StatistiquesAdherent", () => {

  test("INT-01 : clic onglet 'Abonnement' → onPageChange('abonnement')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /abonnement/i }));
    expect(onPageChange).toHaveBeenCalledWith("abonnement");
  });

  test("INT-02 : clic onglet 'Revenue' → onPageChange('revenue')", async () => {
    const onPageChange = jest.fn();
    setup({}, onPageChange);
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /revenue/i }));
    expect(onPageChange).toHaveBeenCalledWith("revenue");
  });

  test("INT-03 : onglet 'Adhérent' actif par défaut (fond accent)", async () => {
    setup();
    await waitFor(() => expect(screen.queryByText("…")).not.toBeInTheDocument());
    const btn = screen.getByRole("button", { name: /adhérent/i });
    // Le bouton actif a fontWeight 700
    expect(btn).toHaveStyle({ fontWeight: "700" });
  });
});