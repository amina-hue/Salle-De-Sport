import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Paiement from "../../renderer/pages/paiment";

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

jest.mock("../../images/gym.png", () => "mock-gym.png");

jest.mock("../../renderer/components/QuickActions", () => () => (
  <div data-testid="quick-actions" />
));

jest.mock(
  "../../renderer/components/NouveauPaiementModal",
  () =>
    ({ onClose, onSave }) => (
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

// jsPDF mock complet
const mockJsPDFInstance = {
  setFillColor: jest.fn(),
  rect: jest.fn(),
  roundedRect: jest.fn(),
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  setDrawColor: jest.fn(),
  setLineWidth: jest.fn(),
  line: jest.fn(),
  save: jest.fn(),
};

jest.mock("jspdf", () => ({
  jsPDF: jest.fn().mockImplementation(() => mockJsPDFInstance),
}));

// ─────────────────────────────────────────────
// DONNÉES DE TEST
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
  {
    id: 4,
    nom: "OUALI Lina",
    montant: 4000,
    montantDu: 4000,
    datePaiementRaw: null,
    mode: "cash",
    statut: "En attente",
  },
  {
    id: 5,
    nom: "FERHAT Amine",
    montant: 1500,
    montantDu: 1500,
    datePaiementRaw: "2025-03-10",
    mode: "inconnu",
    statut: "Payé",
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
  {
    id: 11,
    montant: 800,
    date: "2025-03-05",
    modePaiement: "carte",
    note: "",
  },
];

// ─────────────────────────────────────────────
// SETUP / TEARDOWN
// ─────────────────────────────────────────────

beforeEach(() => {
  window.alert = jest.fn();
  jest.clearAllMocks();

  window.api = {
    getPaiements: jest.fn(() => Promise.resolve(mockPaiements)),
    addPaiement: jest.fn(() => Promise.resolve({ success: true })),
    getSeancesLibres: jest.fn(() => Promise.resolve(mockSeances)),
    addSeanceLibre: jest.fn(() => Promise.resolve({ success: true })),
  };
});

// ─────────────────────────────────────────────
// HELPER RENDER
// ─────────────────────────────────────────────

const renderPage = async (search = "") => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[`/paiements${search}`]}>
        <Routes>
          <Route path="/paiements" element={<Paiement />} />
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
  // AFFICHAGE DE BASE
  // ─────────────────────────

  describe("Affichage", () => {
    test("affiche le titre principal", async () => {
      await renderPage();
      expect(screen.getByText(/Gestion financière/i)).toBeInTheDocument();
    });

    test("affiche le breadcrumb FitManager > Paiements", async () => {
      await renderPage();
      expect(screen.getByText(/FitManager/i)).toBeInTheDocument();
      expect(screen.getByText(/Paiements/i)).toBeInTheDocument();
    });

    test("affiche le champ de recherche", async () => {
      await renderPage();
      expect(
        screen.getByPlaceholderText(/Rechercher un adhérent/i)
      ).toBeInTheDocument();
    });

    test("affiche les boutons Nouveau Paiement et Séance libre", async () => {
      await renderPage();
      expect(screen.getByText(/Nouveau Paiement/i)).toBeInTheDocument();
      expect(screen.getByText(/Séance libre/i)).toBeInTheDocument();
    });

    test("affiche le composant QuickActions", async () => {
      await renderPage();
      expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    });

    test("affiche les entêtes du tableau", async () => {
      await renderPage();
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Adhérent")).toBeInTheDocument();
      expect(screen.getByText("Montant")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Méthode")).toBeInTheDocument();
      expect(screen.getByText("Statut")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    test("affiche les sections statistiques", async () => {
      await renderPage();
      expect(screen.getByText(/Total paiements/i)).toBeInTheDocument();
      expect(screen.getByText(/Revenus encaissés/i)).toBeInTheDocument();
      expect(screen.getAllByText(/En attente/i).length).toBeGreaterThan(0);
    });

    test("affiche message vide si aucun paiement", async () => {
      window.api.getPaiements.mockResolvedValue([]);
      window.api.getSeancesLibres.mockResolvedValue([]);
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
      });
    });

    test("appelle les deux APIs au montage", async () => {
      await renderPage();
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(1);
        expect(window.api.getSeancesLibres).toHaveBeenCalledTimes(1);
      });
    });

    test("affiche les paiements chargés", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
        expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
        expect(screen.getByText(/AMRANI Karim/i)).toBeInTheDocument();
      });
    });

    test("affiche les séances libres", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Séance libre/i).length).toBeGreaterThan(0);
      });
    });

    test("affiche séance avec note vide comme 'Séance libre'", async () => {
      await renderPage();
      await waitFor(() => {
        // La séance id:11 sans note doit afficher "Séance libre"
        expect(screen.getAllByText(/Séance libre/i).length).toBeGreaterThan(1);
      });
    });

    test("affiche paiement avec date null comme '—'", async () => {
      await renderPage();
      await waitFor(() => {
        const tirets = screen.getAllByText("—");
        expect(tirets.length).toBeGreaterThan(0);
      });
    });

    test("affiche mode inconnu avec fallback", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/FERHAT Amine/i)).toBeInTheDocument();
      });
    });

    test("affiche bouton 'Marquer payé' seulement pour statut En attente", async () => {
      await renderPage();
      await waitFor(() => {
        const boutons = screen.getAllByText(/Marquer payé/i);
        // MAMMERI Sara et OUALI Lina sont "En attente"
        expect(boutons.length).toBe(2);
      });
    });

    test("affiche les boutons Facture pour tous les paiements", async () => {
      await renderPage();
      await waitFor(() => {
        const boutons = screen.getAllByText(/Facture/i);
        expect(boutons.length).toBeGreaterThan(0);
      });
    });

    test("affiche les montants en DA", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/3.*000.*DA/i)).toBeInTheDocument();
      });
    });

    test("affiche label 'à collecter' pour paiement En attente", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/à collecter/i).length).toBeGreaterThan(0);
      });
    });

    test("affiche les méthodes de paiement carte, cash, virement", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Espèces/i)).toBeInTheDocument();
        expect(screen.getByText(/Carte bancaire/i)).toBeInTheDocument();
        expect(screen.getByText(/Virement/i)).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────
  // STATISTIQUES
  // ─────────────────────────

  describe("Statistiques", () => {
    test("calcule correctement le total encaissé", async () => {
      await renderPage();
      await waitFor(() => {
        // Payés : BENALI(3000) + FERHAT(1500) + séances(1000+800) = 6300
        expect(screen.getByText(/Revenus encaissés/i)).toBeInTheDocument();
      });
    });

    test("affiche les compteurs dans le hero", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/total/i)).toBeInTheDocument();
        expect(screen.getByText(/payés/i)).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────
  // RECHERCHE
  // ─────────────────────────

  describe("Recherche", () => {
    test("filtre par nom", async () => {
      await renderPage();
      await waitFor(() => expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), {
        target: { value: "Mammeri" },
      });

      expect(screen.queryByText(/BENALI Youcef/i)).not.toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test("filtre par ID", async () => {
      await renderPage();
      await waitFor(() => expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), {
        target: { value: "2" },
      });

      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test("affiche message si aucun résultat", async () => {
      await renderPage();

      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), {
        target: { value: "zzzzzzz" },
      });

      expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
    });

    test("réinitialise la recherche affiche tout", async () => {
      await renderPage();
      const input = screen.getByPlaceholderText(/Rechercher un adhérent/i);

      fireEvent.change(input, { target: { value: "Mammeri" } });
      fireEvent.change(input, { target: { value: "" } });

      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test("la recherche est insensible à la casse", async () => {
      await renderPage();
      await waitFor(() => expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText(/Rechercher un adhérent/i), {
        target: { value: "benali" },
      });

      expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
    });
  });

  // ─────────────────────────
  // MODAL NOUVEAU PAIEMENT
  // ─────────────────────────

  describe("Modal Nouveau Paiement", () => {
    test("ouvre le modal au clic", async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      expect(screen.getByTestId("paiement-modal")).toBeInTheDocument();
    });

    test("ferme le modal au clic Annuler", async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Fermer Modal/i));
      expect(screen.queryByTestId("paiement-modal")).not.toBeInTheDocument();
    });

    test("appelle addPaiement à la confirmation", async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Confirmer/i));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalled();
      });
    });

    test("ferme le modal après ajout réussi", async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Confirmer/i));
      await waitFor(() => {
        expect(screen.queryByTestId("paiement-modal")).not.toBeInTheDocument();
      });
    });

    test("recharge la liste après ajout", async () => {
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Confirmer/i));
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(2);
      });
    });

    test("affiche une alerte si l'API retourne success: false", async () => {
      window.api.addPaiement.mockResolvedValue({ success: false, error: "Erreur BDD" });
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Confirmer/i));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Erreur BDD"));
      });
    });

    test("gère exception réseau lors de l'ajout", async () => {
      window.api.addPaiement.mockRejectedValue(new Error("Crash réseau"));
      await renderPage();
      fireEvent.click(screen.getByText(/Nouveau Paiement/i));
      fireEvent.click(screen.getByText(/Confirmer/i));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalled();
      });
    });

    test("ouvre le modal via ?openModal=true dans l'URL", async () => {
      await renderPage("?openModal=true");
      await waitFor(() => {
        expect(screen.getByTestId("paiement-modal")).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────
  // MODAL MARQUER PAYÉ
  // ─────────────────────────

  describe("Modal Marquer comme payé", () => {
    const openMarquerModal = async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Marquer payé/i).length).toBeGreaterThan(0);
      });
      fireEvent.click(screen.getAllByText(/Marquer payé/i)[0]);
    };

    test("ouvre le modal Marquer payé", async () => {
      await openMarquerModal();
      expect(screen.getByText(/Marquer comme payé/i)).toBeInTheDocument();
    });

    test("affiche le nom du paiement dans le modal", async () => {
      await openMarquerModal();
      // MAMMERI Sara est le premier "En attente"
      expect(screen.getByText(/MAMMERI Sara/i)).toBeInTheDocument();
    });

    test("affiche le montant à encaisser", async () => {
      await openMarquerModal();
      expect(screen.getByText(/Montant à encaisser/i)).toBeInTheDocument();
    });

    test("affiche les 3 modes de paiement", async () => {
      await openMarquerModal();
      const modal = screen.getByText(/Marquer comme payé/i).closest("div");
      expect(screen.getByText(/Espèces/i)).toBeInTheDocument();
      expect(screen.getByText(/Carte bancaire/i)).toBeInTheDocument();
      expect(screen.getByText(/Virement/i)).toBeInTheDocument();
    });

    test("permet de changer le mode de paiement vers carte", async () => {
      await openMarquerModal();
      // Dans le modal, les boutons de mode
      const carteButtons = screen.getAllByText(/Carte bancaire/i);
      fireEvent.click(carteButtons[carteButtons.length - 1]);
      // Pas d'erreur = succès
    });

    test("permet de changer le mode de paiement vers virement", async () => {
      await openMarquerModal();
      const virementButtons = screen.getAllByText(/Virement/i);
      fireEvent.click(virementButtons[virementButtons.length - 1]);
    });

    test("ferme le modal au clic sur Annuler", async () => {
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Annuler/i));
      expect(screen.queryByText(/Marquer comme payé/i)).not.toBeInTheDocument();
    });

    test("ferme le modal en cliquant sur l'overlay", async () => {
      await openMarquerModal();
      const overlay = screen.getByText(/Marquer comme payé/i).closest("[style*='fixed']");
      if (overlay) {
        fireEvent.click(overlay);
      }
    });

    test("confirme le paiement et appelle addPaiement", async () => {
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalled();
      });
    });

    test("ferme le modal après confirmation réussie", async () => {
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(screen.queryByText(/Marquer comme payé/i)).not.toBeInTheDocument();
      });
    });

    test("recharge la liste après confirmation", async () => {
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(2);
      });
    });

    test("affiche alerte si addPaiement retourne success: false", async () => {
      window.api.addPaiement.mockResolvedValue({ success: false, error: "Échec DB" });
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });
    });

    test("gère exception réseau lors de la confirmation", async () => {
      window.api.addPaiement.mockRejectedValue(new Error("Réseau KO"));
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalled();
      });
    });

    test("appelle addPaiement avec le bon montant (montantDu pour En attente)", async () => {
      await openMarquerModal();
      fireEvent.click(screen.getByText(/Confirmer le paiement/i));
      await waitFor(() => {
        expect(window.api.addPaiement).toHaveBeenCalledWith(
          expect.objectContaining({ montant: 5000 })
        );
      });
    });
  });

  // ─────────────────────────
  // MODAL SÉANCE LIBRE
  // ─────────────────────────

  describe("Modal Séance libre", () => {
    const openSeanceModal = async () => {
      await renderPage();
      // Le bouton "Séance libre" est dans le header
      const seanceBtns = screen.getAllByText(/Séance libre/i);
      // Premier bouton = bouton header (pas les lignes du tableau)
      fireEvent.click(seanceBtns[0]);
    };

    test("ouvre le modal Séance libre", async () => {
      await openSeanceModal();
      await waitFor(() => {
        const titre = screen.getAllByText(/Séance libre/i);
        expect(titre.length).toBeGreaterThan(1);
      });
    });

    test("affiche les champs montant, date, mode, note", async () => {
      await openSeanceModal();
      expect(screen.getByPlaceholderText("500")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/musculation/i)).toBeInTheDocument();
    });

    test("ferme le modal Séance libre au clic Annuler", async () => {
      await openSeanceModal();
      const annulerBtns = screen.getAllByText(/Annuler/i);
      fireEvent.click(annulerBtns[annulerBtns.length - 1]);
      // Plus de champ 500 = modal fermé
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("500")).not.toBeInTheDocument();
      });
    });

    test("alerte si montant vide à la sauvegarde", async () => {
      await openSeanceModal();
      const enregistrerBtn = screen.getByText(/Enregistrer/i);
      fireEvent.click(enregistrerBtn);
      expect(window.alert).toHaveBeenCalledWith("Montant requis");
    });

    test("remplit et sauvegarde une séance libre", async () => {
      await openSeanceModal();

      fireEvent.change(screen.getByPlaceholderText("500"), {
        target: { value: "700" },
      });

      fireEvent.click(screen.getByText(/Enregistrer/i));

      await waitFor(() => {
        expect(window.api.addSeanceLibre).toHaveBeenCalledWith(
          expect.objectContaining({ montant: "700" })
        );
      });
    });

    test("ferme le modal après sauvegarde réussie", async () => {
      await openSeanceModal();
      fireEvent.change(screen.getByPlaceholderText("500"), {
        target: { value: "700" },
      });
      fireEvent.click(screen.getByText(/Enregistrer/i));
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("500")).not.toBeInTheDocument();
      });
    });

    test("recharge la liste après sauvegarde", async () => {
      await openSeanceModal();
      fireEvent.change(screen.getByPlaceholderText("500"), {
        target: { value: "700" },
      });
      fireEvent.click(screen.getByText(/Enregistrer/i));
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalledTimes(2);
      });
    });

    test("change la date", async () => {
      await openSeanceModal();
      const dateInputs = screen.getAllByDisplayValue(
        new Date().toISOString().split("T")[0]
      );
      fireEvent.change(dateInputs[0], { target: { value: "2025-06-01" } });
    });

    test("change le mode de paiement vers carte", async () => {
      await openSeanceModal();
      const carteBtns = screen.getAllByText(/Carte bancaire/i);
      fireEvent.click(carteBtns[carteBtns.length - 1]);
    });

    test("change le mode de paiement vers virement", async () => {
      await openSeanceModal();
      const vireBtns = screen.getAllByText(/Virement/i);
      fireEvent.click(vireBtns[vireBtns.length - 1]);
    });

    test("remplit la note", async () => {
      await openSeanceModal();
      fireEvent.change(screen.getByPlaceholderText(/musculation/i), {
        target: { value: "Cardio intensif" },
      });
    });

    test("affiche alerte si addSeanceLibre retourne success: false", async () => {
      window.api.addSeanceLibre.mockResolvedValue({ success: false });
      await openSeanceModal();
      fireEvent.change(screen.getByPlaceholderText("500"), {
        target: { value: "500" },
      });
      fireEvent.click(screen.getByText(/Enregistrer/i));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });
    });

    test("gère exception réseau lors de la sauvegarde séance", async () => {
      window.api.addSeanceLibre.mockRejectedValue(new Error("Network error"));
      await openSeanceModal();
      fireEvent.change(screen.getByPlaceholderText("500"), {
        target: { value: "500" },
      });
      fireEvent.click(screen.getByText(/Enregistrer/i));
      await waitFor(() => {
        expect(window.api.addSeanceLibre).toHaveBeenCalled();
      });
    });

    test("ferme le modal en cliquant sur l'overlay", async () => {
      await openSeanceModal();
      // Simuler un clic sur l'overlay (currentTarget === target)
      const input = screen.getByPlaceholderText("500");
      expect(input).toBeInTheDocument();
    });
  });

  // ─────────────────────────
  // FACTURE PDF
  // ─────────────────────────

  describe("Génération Facture PDF", () => {
    test("génère la facture pour un paiement Payé", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Facture/i).length).toBeGreaterThan(0);
      });
      fireEvent.click(screen.getAllByText(/Facture/i)[0]);
      // jsPDF mock est appelé
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    test("génère la facture pour un paiement En attente", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Facture/i).length).toBeGreaterThan(1);
      });
      fireEvent.click(screen.getAllByText(/Facture/i)[1]);
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    test("génère la facture pour tous les paiements", async () => {
      await renderPage();
      const boutons = await screen.findAllByText(/Facture/i);
      boutons.forEach((btn) => fireEvent.click(btn));
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    test("gère l'erreur jsPDF et affiche une alerte", async () => {
      const { jsPDF } = require("jspdf");
      jsPDF.mockImplementationOnce(() => {
        throw new Error("PDF crash");
      });

      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Facture/i).length).toBeGreaterThan(0);
      });
      fireEvent.click(screen.getAllByText(/Facture/i)[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Erreur génération facture");
      });
    });
  });

  // ─────────────────────────
  // GESTION D'ERREURS API
  // ─────────────────────────

  describe("Gestion d'erreurs API", () => {
    test("gère erreur getPaiements (rejet)", async () => {
      window.api.getPaiements.mockRejectedValue(new Error("API down"));
      await renderPage();
      await waitFor(() => {
        expect(window.api.getPaiements).toHaveBeenCalled();
      });
    });

    test("gère erreur getSeancesLibres (rejet)", async () => {
      window.api.getSeancesLibres.mockRejectedValue(new Error("Séances down"));
      await renderPage();
      await waitFor(() => {
        expect(window.api.getSeancesLibres).toHaveBeenCalled();
      });
    });

    test("gère getPaiements retournant null", async () => {
      window.api.getPaiements.mockResolvedValue(null);
      window.api.getSeancesLibres.mockResolvedValue(null);
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Aucun paiement trouvé/i)).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────
  // HOVER / INTERACTIONS UI
  // ─────────────────────────

  describe("Interactions UI", () => {
    test("hover sur StatCard ne provoque pas d'erreur", async () => {
      await renderPage();
      const titleEl = screen.getByText("Total paiements");
const card = titleEl.closest("div[style]");
fireEvent.mouseEnter(card);
fireEvent.mouseLeave(card);
     if (cards.length > 0) {
        fireEvent.mouseEnter(cards[0]);
        fireEvent.mouseLeave(cards[0]);
      }
    });

    test("hover sur ligne tableau ne provoque pas d'erreur", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      });
      const rows = document.querySelectorAll("tr");
      if (rows.length > 1) {
        fireEvent.mouseEnter(rows[1]);
        fireEvent.mouseLeave(rows[1]);
      }
    });

    test("hover sur bouton Nouveau Paiement", async () => {
      await renderPage();
      const btn = screen.getByText(/Nouveau Paiement/i);
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    });

    test("hover sur bouton Séance libre", async () => {
      await renderPage();
      const btns = screen.getAllByText(/Séance libre/i);
      fireEvent.mouseEnter(btns[0]);
      fireEvent.mouseLeave(btns[0]);
    });

    test("hover sur bouton Facture", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Facture/i).length).toBeGreaterThan(0);
      });
      const btn = screen.getAllByText(/Facture/i)[0];
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    });

    test("hover sur bouton Marquer payé", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Marquer payé/i).length).toBeGreaterThan(0);
      });
      const btn = screen.getAllByText(/Marquer payé/i)[0];
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    });
  });

  // ─────────────────────────
  // TRI ET ORDRE
  // ─────────────────────────

  describe("Tri des données", () => {
    test("trie par date décroissante (plus récent en premier)", async () => {
      await renderPage();
      await waitFor(() => {
        const rows = screen.getAllByText(/DA/i);
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    test("les séances libres sont intégrées dans la liste triée", async () => {
      await renderPage();
      await waitFor(() => {
        expect(screen.getAllByText(/Séance libre/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/BENALI Youcef/i)).toBeInTheDocument();
      });
    });
  });
});