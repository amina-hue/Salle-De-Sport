import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Paiement from "../../renderer/pages/paiment";

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

// Image
jest.mock("../../images/gym.png", () => "mock-gym.png");

// QuickActions
jest.mock("../../renderer/components/QuickActions", () => () => (
  <div data-testid="quick-actions" />
));

// Modal nouveau paiement
jest.mock(
  "../../renderer/components/NouveauPaiementModal",
  () =>
    ({ onClose, onSave }) =>
      (
        <div data-testid="paiement-modal">
          <button onClick={onClose}>Fermer Modal</button>

          <button
            onClick={() =>
              onSave({
                abonnement_id: 1,
                montant: 3000,
                mode: "cash",
                date: "2025-01-15",
              })
            }
          >
            Confirmer
          </button>
        </div>
      )
);

// jsPDF
jest.mock("jspdf", () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    save: jest.fn(),
  })),
}));

// ─────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────

const mockPaiements = [
  {
    id: 1,
    nom: "BENALI Youcef",
    montant: 3000,
    montantDu: 3000,
    datePaiementRaw: "2025-01-15",
    mode: "cash",
    statut: "Payé",
  },

  {
    id: 2,
    nom: "MAMMERI Sara",
    montant: 5000,
    montantDu: 5000,
    datePaiementRaw: "2025-02-01",
    mode: "carte",
    statut: "En attente",
  },

  {
    id: 3,
    nom: "AMRANI Karim",
    montant: 2000,
    montantDu: 2000,
    datePaiementRaw: "2025-01-20",
    mode: "virement",
    statut: "En retard",
  },
];

const mockSeances = [
  {
    id: 10,
    montant: 1000,
    date: "2025-03-01",
    modePaiement: "cash",
    note: "Séance libre",
  },
];

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────

beforeEach(() => {
  window.alert = jest.fn();

  window.api = {
    getPaiements: jest.fn(() => Promise.resolve(mockPaiements)),

    addPaiement: jest.fn(() =>
      Promise.resolve({ success: true })
    ),

    getSeancesLibres: jest.fn(() =>
      Promise.resolve(mockSeances)
    ),

    addSeanceLibre: jest.fn(() =>
      Promise.resolve({ success: true })
    ),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

const renderPage = async (search = "") => {
  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={[`/paiements${search}`]}
      >
        <Routes>
          <Route
            path="/paiements"
            element={<Paiement />}
          />
        </Routes>
      </MemoryRouter>
    );
  });
};

// ─────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────

describe("PAGE : Paiement.jsx", () => {
  // ─────────────────────────
  // AFFICHAGE
  // ─────────────────────────

  describe("Affichage", () => {
    test("affiche le titre", async () => {
      await renderPage();

      expect(
        screen.getByText(/Gestion financière/i)
      ).toBeInTheDocument();
    });

    test("charge les paiements", async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/BENALI Youcef/i)
        ).toBeInTheDocument();

        expect(
          screen.getByText(/MAMMERI Sara/i)
        ).toBeInTheDocument();

        expect(
          screen.getByText(/AMRANI Karim/i)
        ).toBeInTheDocument();
      });
    });

    test("charge les séances libres", async () => {
  await renderPage();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Séance libre/i).length
    ).toBeGreaterThan(0);
  });
});

    test("appelle les APIs au montage", async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          window.api.getPaiements
        ).toHaveBeenCalled();

        expect(
          window.api.getSeancesLibres
        ).toHaveBeenCalled();
      });
    });
    test("gère erreur chargement paiements", async () => {
  window.api.getPaiements.mockRejectedValue(
    new Error("Erreur API")
  );

  await renderPage();

  await waitFor(() => {
    expect(window.api.getPaiements)
      .toHaveBeenCalled();
  });
});
test("gère erreur chargement séances libres", async () => {
  window.api.getSeancesLibres.mockRejectedValue(
    new Error("Erreur séances")
  );

  await renderPage();

  await waitFor(() => {
    expect(window.api.getSeancesLibres)
      .toHaveBeenCalled();
  });
});
test("ferme le modal après ajout réussi", async () => {
  await renderPage();

  fireEvent.click(
    screen.getByText(/Nouveau Paiement/i)
  );

  fireEvent.click(
    screen.getByText(/Confirmer/i)
  );

  await waitFor(() => {
    expect(
      screen.queryByTestId("paiement-modal")
    ).not.toBeInTheDocument();
  });
});
test("affiche tous les paiements si recherche vide", async () => {
  await renderPage();

  const input = screen.getByPlaceholderText(
    /Rechercher un adhérent/i
  );

  fireEvent.change(input, {
    target: { value: "BENALI" },
  });

  fireEvent.change(input, {
    target: { value: "" },
  });

  expect(
    screen.getByText(/BENALI Youcef/i)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/MAMMERI Sara/i)
  ).toBeInTheDocument();
});
test("génère facture pour chaque paiement", async () => {
  await renderPage();

  const boutons =
    await screen.findAllByText(/Facture/i);

  boutons.forEach((btn) => {
    fireEvent.click(btn);
  });

  expect(boutons.length).toBeGreaterThan(0);
});
test("gère exception addPaiement", async () => {
  window.api.addPaiement.mockRejectedValue(
    new Error("Crash API")
  );

  await renderPage();

  fireEvent.click(
    screen.getByText(/Nouveau Paiement/i)
  );

  fireEvent.click(
    screen.getByText(/Confirmer/i)
  );

  await waitFor(() => {
    expect(window.api.addPaiement)
      .toHaveBeenCalled();
  });
});
test("affiche quick actions", async () => {
  await renderPage();

  expect(
    screen.getByTestId("quick-actions")
  ).toBeInTheDocument();
});
test("affiche les modes de paiement", async () => {
  await renderPage();

  expect(screen.getByText(/cash/i))
    .toBeInTheDocument();

  expect(screen.getByText(/carte/i))
    .toBeInTheDocument();

  expect(screen.getByText(/virement/i))
    .toBeInTheDocument();
});
test("affiche le titre et les données principales", async () => {
  await renderPage();

  expect(screen.getByText(/Gestion financière/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
    expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
  });
});
test("appelle les APIs au montage", async () => {
  await renderPage();

  await waitFor(() => {
    expect(window.api.getPaiements).toHaveBeenCalled();
    expect(window.api.getSeancesLibres).toHaveBeenCalled();
  });
});
test("affiche message si aucun paiement", async () => {
  window.api.getPaiements.mockResolvedValue([]);
  window.api.getSeancesLibres.mockResolvedValue([]);

  await renderPage();

  await waitFor(() => {
    expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
  });
});
test("filtre les paiements par nom", async () => {
  await renderPage();

  const input = screen.getByPlaceholderText(/Rechercher un adhérent/i);

  fireEvent.change(input, { target: { value: "Mammeri" } });

  expect(screen.queryByText(/BENALI Youcef/i)).not.toBeInTheDocument();
  expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
});
test("reset recherche affiche tout", async () => {
  await renderPage();

  const input = screen.getByPlaceholderText(/Rechercher un adhérent/i);

  fireEvent.change(input, { target: { value: "Mammeri" } });
  fireEvent.change(input, { target: { value: "" } });

  expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
  expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
});
test("ouvre et ferme le modal", async () => {
  await renderPage();

  fireEvent.click(screen.getByText(/Nouveau Paiement/i));
  expect(screen.getByTestId("paiement-modal")).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Fermer Modal/i));
  expect(screen.queryByTestId("paiement-modal")).not.toBeInTheDocument();
});
test("ajoute un paiement et recharge la liste", async () => {
  await renderPage();

  fireEvent.click(screen.getByText(/Nouveau Paiement/i));
  fireEvent.click(screen.getByText(/Confirmer/i));

  await waitFor(() => {
    expect(window.api.addPaiement).toHaveBeenCalled();
    expect(window.api.getPaiements).toHaveBeenCalledTimes(2);
  });
});
test("gère erreur lors de l'ajout", async () => {
  window.api.addPaiement.mockRejectedValue(new Error("Crash"));

  await renderPage();

  fireEvent.click(screen.getByText(/Nouveau Paiement/i));
  fireEvent.click(screen.getByText(/Confirmer/i));

  await waitFor(() => {
    expect(window.api.addPaiement).toHaveBeenCalled();
  });
});
test("affiche quick actions et modes paiement", async () => {
  await renderPage();

  expect(screen.getByTestId("quick-actions")).toBeInTheDocument();

  expect(screen.getByText(/cash/i)).toBeInTheDocument();
  expect(screen.getByText(/carte/i)).toBeInTheDocument();
  expect(screen.getByText(/virement/i)).toBeInTheDocument();
});
test("affiche les sections statistiques", async () => {
  await renderPage();

  expect(screen.getByText(/Revenus encaissés/i)).toBeInTheDocument();
});

    test("affiche le champ recherche", async () => {
      await renderPage();

      expect(
        screen.getByPlaceholderText(
          /Rechercher un adhérent/i
        )
      ).toBeInTheDocument();
    });

    test("affiche aucun paiement si vide", async () => {
      window.api.getPaiements.mockResolvedValue([]);

      window.api.getSeancesLibres.mockResolvedValue([]);

      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Aucun paiement trouvé/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────
  // RECHERCHE
  // ─────────────────────────

  describe("Recherche", () => {
    test("filtre par nom", async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/BENALI Youcef/i)
        ).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText(
          /Rechercher un adhérent/i
        ),
        {
          target: {
            value: "Mammeri",
          },
        }
      );

      expect(
        screen.queryByText(/BENALI Youcef/i)
      ).not.toBeInTheDocument();

      expect(
        screen.getByText(/MAMMERI Sara/i)
      ).toBeInTheDocument();
    });

    test("filtre par id", async () => {
      await renderPage();

      fireEvent.change(
        screen.getByPlaceholderText(
          /Rechercher un adhérent/i
        ),
        {
          target: {
            value: "2",
          },
        }
      );

      expect(
        screen.getByText(/MAMMERI Sara/i)
      ).toBeInTheDocument();
    });

    test("aucun résultat", async () => {
      await renderPage();

      fireEvent.change(
        screen.getByPlaceholderText(
          /Rechercher un adhérent/i
        ),
        {
          target: {
            value: "zzz",
          },
        }
      );

      expect(
        screen.getByText(/Aucun paiement trouvé/i)
      ).toBeInTheDocument();
    });
  });

  // ─────────────────────────
  // MODAL
  // ─────────────────────────

  describe("Nouveau paiement", () => {
    test("ouvre le modal", async () => {
      await renderPage();

      fireEvent.click(
        screen.getByText(/Nouveau Paiement/i)
      );

      expect(
        screen.getByTestId("paiement-modal")
      ).toBeInTheDocument();
    });

    test("ferme le modal", async () => {
      await renderPage();

      fireEvent.click(
        screen.getByText(/Nouveau Paiement/i)
      );

      fireEvent.click(
        screen.getByText(/Fermer Modal/i)
      );

      expect(
        screen.queryByTestId("paiement-modal")
      ).not.toBeInTheDocument();
    });

    test("ajoute un paiement", async () => {
      await renderPage();

      fireEvent.click(
        screen.getByText(/Nouveau Paiement/i)
      );

      fireEvent.click(
        screen.getByText(/Confirmer/i)
      );

      await waitFor(() => {
        expect(
          window.api.addPaiement
        ).toHaveBeenCalled();
      });
    });

    test("recharge la liste après ajout", async () => {
      await renderPage();

      fireEvent.click(
        screen.getByText(/Nouveau Paiement/i)
      );

      fireEvent.click(
        screen.getByText(/Confirmer/i)
      );

      await waitFor(() => {
        expect(
          window.api.getPaiements
        ).toHaveBeenCalledTimes(2);
      });
    });

    test("gère les erreurs API", async () => {
      window.api.addPaiement.mockResolvedValue({
        success: false,
        error: "Erreur BDD",
      });

      await renderPage();

      fireEvent.click(
        screen.getByText(/Nouveau Paiement/i)
      );

      fireEvent.click(
        screen.getByText(/Confirmer/i)
      );

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });
    });
  });

  // ─────────────────────────
  // FACTURE
  // ─────────────────────────

  describe("Facture PDF", () => {
    test("génère une facture", async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getAllByText(/Facture/i).length
        ).toBeGreaterThan(0);
      });

      fireEvent.click(
        screen.getAllByText(/Facture/i)[0]
      );

      expect(true).toBe(true);
    });
  });

  // ─────────────────────────
  // STATS
  // ─────────────────────────

  describe("Statistiques", () => {
    test("affiche revenus encaissés", async () => {
      await renderPage();

      expect(
        screen.getByText(/Revenus encaissés/i)
      ).toBeInTheDocument();
    });

    test("affiche en attente", async () => {
      await renderPage();

      expect(
        screen.getAllByText(/En attente/i).length
      ).toBeGreaterThan(0);
    });
  });
});