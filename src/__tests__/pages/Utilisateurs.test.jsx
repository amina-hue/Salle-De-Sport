import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// ── Router mock ───────────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/utilisateurs" }),
}));

// ── Images mock ───────────────────────────────────────────────────────────────
jest.mock("../../images/gym.png",  () => "gym.png");
jest.mock("../../images/gym2.png", () => "gym2.png");

// ── QuickActions mock ─────────────────────────────────────────────────────────
jest.mock("../../renderer/components/QuickActions", () => () => null);

// ── DeleteConfirm mock — simule toujours une confirmation ─────────────────────
jest.mock("../../renderer/components/DeleteConfirm", () => {
  const React = require("react");
  const DeleteConfirm = () => null;
  const useDeleteConfirm = () => ({
    confirmProps: {},
    askConfirm: jest.fn(() => Promise.resolve(true)),
  });
  return { __esModule: true, default: DeleteConfirm, useDeleteConfirm };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
const fakeUsers = [
  { idUtilisateur: 1, nom: "Benali",  prenom: "Youcef", email: "youcef@gym.com", roleNom: "admin" },
  { idUtilisateur: 2, nom: "Mammeri", prenom: "Sara",   email: "sara@gym.com",   roleNom: "coach" },
];
const fakeRoles = [
  { id: 1, nom: "admin" },
  { id: 2, nom: "coach" },
];

// ── API mock ──────────────────────────────────────────────────────────────────
const mockApi = {
  getUtilisateurs:   jest.fn(() => Promise.resolve(fakeUsers)),
  getRoles:          jest.fn(() => Promise.resolve(fakeRoles)),
  addUtilisateur:    jest.fn(() => Promise.resolve({ id: 3 })),
  deleteUtilisateur: jest.fn(() => Promise.resolve({ success: true })),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.window.api = mockApi;
  mockApi.getUtilisateurs.mockResolvedValue(fakeUsers);
  mockApi.getRoles.mockResolvedValue(fakeRoles);
  mockApi.addUtilisateur.mockResolvedValue({ id: 3 });
  mockApi.deleteUtilisateur.mockResolvedValue({ success: true });
});

import Utilisateur from "../../renderer/pages/Utilisateurs";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const renderAndWait = async () => {
  const utils = render(<Utilisateur />);
  await waitFor(() =>
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
  );
  return utils;
};

const openModal = async () => {
  fireEvent.click(screen.getByRole("button", { name: /Ajouter un utilisateur/i }));
  await waitFor(() => screen.getByRole("dialog"));
};

// ═════════════════════════════════════════════════════════════════════════════
// AFFICHAGE
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Affichage", () => {

  test("T11 — Affiche le titre principal", async () => {
    await renderAndWait();
    expect(screen.getByRole("heading", { name: /Gestion des utilisateurs/i })).toBeInTheDocument();
  });

  test("T12 — Affiche les deux utilisateurs chargés", async () => {
    await renderAndWait();
    expect(screen.getByText(/Benali/i)).toBeInTheDocument();
    expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
  });

  test("T13 — Bouton « Ajouter un utilisateur » est présent", async () => {
    await renderAndWait();
    expect(screen.getByRole("button", { name: /Ajouter un utilisateur/i })).toBeInTheDocument();
  });

  test("T14 — Champ de recherche est présent", async () => {
    await renderAndWait();
    expect(screen.getByPlaceholderText(/Rechercher par nom/i)).toBeInTheDocument();
  });

  test("T14b — Les emails des utilisateurs sont affichés", async () => {
    await renderAndWait();
    expect(screen.getByText("youcef@gym.com")).toBeInTheDocument();
    expect(screen.getByText("sara@gym.com")).toBeInTheDocument();
  });

  test("T14c — Affiche un message si aucun résultat ne correspond au filtre", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "XYZInexistant" },
    });
    await waitFor(() =>
      expect(screen.getByText(/Aucun utilisateur trouvé/i)).toBeInTheDocument()
    );
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// MODAL — AJOUTER
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Ajouter un utilisateur", () => {

  test("T15 — Cliquer sur Ajouter ouvre le modal (role=dialog)", async () => {
    await renderAndWait();
    await openModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Créer un nouveau compte utilisateur/i)).toBeInTheDocument();
  });

  test("T16 — Formulaire vide → erreur « Nom et prénom sont requis »", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(within(modal).getByRole("alert")).toHaveTextContent(/Nom et prénom sont requis/i)
    );
  });

  test("T16b — Nom+prénom remplis mais email vide → erreur email", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),    { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i), { target: { value: "Jean" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(within(modal).getByRole("alert")).toHaveTextContent(/email est requis/i)
    );
  });

  test("T16c — Email rempli mais mot de passe vide → erreur mot de passe", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),    { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i), { target: { value: "Jean" } });
    fireEvent.change(within(modal).getByLabelText(/Email/i),   { target: { value: "j@gym.com" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(within(modal).getByRole("alert")).toHaveTextContent(/mot de passe est requis/i)
    );
  });

  test("T17 — Clic « Annuler » ferme le modal", async () => {
    await renderAndWait();
    await openModal();
    fireEvent.click(screen.getByRole("button", { name: /Annuler/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  test("T17b — Touche Échap ferme le modal", async () => {
    await renderAndWait();
    await openModal();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  test("T17c — Formulaire complet appelle addUtilisateur et ferme le modal", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),         { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i),      { target: { value: "Jean" } });
    fireEvent.change(within(modal).getByLabelText(/Email/i),        { target: { value: "jean@gym.com" } });
    fireEvent.change(within(modal).getByLabelText(/Mot de passe/i), { target: { value: "secret123" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() => {
      expect(mockApi.addUtilisateur).toHaveBeenCalledWith(
        expect.objectContaining({ nom: "Dupont", prenom: "Jean", email: "jean@gym.com" })
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// SUPPRESSION
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Supprimer", () => {

  test("T18 — Bouton désactiver accessible via aria-label", async () => {
    await renderAndWait();
    expect(
      screen.getByRole("button", { name: /Désactiver Youcef Benali/i })
    ).toBeInTheDocument();
  });

  test("T18b — Clic Désactiver appelle deleteUtilisateur avec le bon id", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole("button", { name: /Désactiver Youcef Benali/i }));
    await waitFor(() =>
      expect(mockApi.deleteUtilisateur).toHaveBeenCalledWith(1)
    );
  });

  test("T18c — Après suppression, getUtilisateurs est rappelé (2×)", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole("button", { name: /Désactiver Youcef Benali/i }));
    await waitFor(() =>
      expect(mockApi.getUtilisateurs).toHaveBeenCalledTimes(2)
    );
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// RECHERCHE & FILTRES
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Recherche", () => {

  test("T19 — Rechercher « Benali » filtre et masque Mammeri", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "Benali" },
    });
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
    });
  });

  test("T20 — Filtrer par rôle « coach » masque Benali (admin)", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByRole("combobox", { name: /Filtrer par rôle/i }), {
      target: { value: "coach" },
    });
    await waitFor(() => {
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
    });
  });

  test("T21 — Bouton « Réinitialiser » efface la recherche", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "Benali" },
    });
    const resetBtn = await screen.findByRole("button", { name: /Réinitialiser/i });
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Réinitialiser/i })).not.toBeInTheDocument();
    });
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// ERREUR RÉSEAU
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Gestion d'erreurs", () => {

  test("T22 — Erreur réseau affiche un message d'alerte", async () => {
    mockApi.getUtilisateurs.mockRejectedValueOnce(new Error("Network error"));
    render(<Utilisateur />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Impossible de charger les utilisateurs/i)
    );
  });

  test("T23 — Erreur sur getRoles n'empêche pas le rendu", async () => {
    mockApi.getRoles.mockRejectedValueOnce(new Error("Roles error"));
    render(<Utilisateur />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Impossible de charger/i)
    );
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// CHARGEMENT
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — État de chargement", () => {

  test("T24 — Indicateur de chargement visible pendant le fetch", () => {
    // Ne pas await → snapshot pendant le loading
    mockApi.getUtilisateurs.mockReturnValue(new Promise(() => {})); // ne résout jamais
    render(<Utilisateur />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  test("T25 — getUtilisateurs et getRoles sont appelés au montage", async () => {
    await renderAndWait();
    expect(mockApi.getUtilisateurs).toHaveBeenCalledTimes(1);
    expect(mockApi.getRoles).toHaveBeenCalledTimes(1);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// MODAL — CHAMPS & ÉTAT INTERNE
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Modal : champs et état interne", () => {

  test("T26 — Les champs du modal sont vides à l'ouverture", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    expect(within(modal).getByLabelText(/^Nom/i).value).toBe("");
    expect(within(modal).getByLabelText(/^Prénom/i).value).toBe("");
    expect(within(modal).getByLabelText(/Email/i).value).toBe("");
    expect(within(modal).getByLabelText(/Mot de passe/i).value).toBe("");
  });

  test("T27 — Le select Rôle contient les rôles chargés", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    const select = within(modal).getByRole("combobox");
    expect(within(select).getByRole("option", { name: /admin/i })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: /coach/i })).toBeInTheDocument();
  });

  test("T28 — Saisie dans les champs met à jour leur valeur", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    const nomInput = within(modal).getByLabelText(/^Nom/i);
    fireEvent.change(nomInput, { target: { value: "Kaci" } });
    expect(nomInput.value).toBe("Kaci");
  });

  test("T29 — Fermer le modal via la croix le masque", async () => {
    await renderAndWait();
    await openModal();
    fireEvent.click(screen.getByRole("button", { name: /Fermer/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  test("T30 — Erreur email dupliqué affichée si l'API retourne Duplicate", async () => {
    mockApi.addUtilisateur.mockRejectedValueOnce(new Error("Duplicate entry"));
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),         { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i),      { target: { value: "Jean" } });
    fireEvent.change(within(modal).getByLabelText(/Email/i),        { target: { value: "jean@gym.com" } });
    fireEvent.change(within(modal).getByLabelText(/Mot de passe/i), { target: { value: "pass123" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(within(modal).getByRole("alert")).toHaveTextContent(/email existe déjà/i)
    );
  });

  test("T31 — Erreur générique affichée si l'API échoue sans Duplicate", async () => {
    mockApi.addUtilisateur.mockRejectedValueOnce(new Error("Server error"));
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),         { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i),      { target: { value: "Jean" } });
    fireEvent.change(within(modal).getByLabelText(/Email/i),        { target: { value: "jean@gym.com" } });
    fireEvent.change(within(modal).getByLabelText(/Mot de passe/i), { target: { value: "pass123" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(within(modal).getByRole("alert")).toHaveTextContent(/Erreur lors de l'ajout/i)
    );
  });

  test("T32 — Après ajout réussi, la liste est rechargée", async () => {
    await renderAndWait();
    await openModal();
    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/^Nom/i),         { target: { value: "Dupont" } });
    fireEvent.change(within(modal).getByLabelText(/^Prénom/i),      { target: { value: "Jean" } });
    fireEvent.change(within(modal).getByLabelText(/Email/i),        { target: { value: "jean@gym.com" } });
    fireEvent.change(within(modal).getByLabelText(/Mot de passe/i), { target: { value: "pass123" } });
    fireEvent.click(within(modal).getByRole("button", { name: /^Ajouter$/i }));
    await waitFor(() =>
      expect(mockApi.getUtilisateurs).toHaveBeenCalledTimes(2)
    );
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// RECHERCHE — CAS AVANCÉS
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Recherche avancée", () => {

  test("T33 — La recherche est insensible à la casse", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "benali" }, // minuscules
    });
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.queryByText(/Mammeri/i)).not.toBeInTheDocument();
    });
  });

  test("T34 — Recherche par prénom fonctionne aussi", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "Sara" },
    });
    await waitFor(() => {
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
      expect(screen.queryByText(/Benali/i)).not.toBeInTheDocument();
    });
  });

  test("T35 — Combinaison recherche + filtre rôle fonctionne", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "Benali" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /Filtrer par rôle/i }), {
      target: { value: "coach" }, // Benali est admin, pas coach
    });
    await waitFor(() =>
      expect(screen.getByText(/Aucun utilisateur trouvé/i)).toBeInTheDocument()
    );
  });

  test("T36 — Réinitialiser efface aussi le filtre rôle", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByRole("combobox", { name: /Filtrer par rôle/i }), {
      target: { value: "coach" },
    });
    const resetBtn = await screen.findByRole("button", { name: /Réinitialiser/i });
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(screen.getByText(/Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Mammeri/i)).toBeInTheDocument();
    });
  });

  test("T37 — Compteur de résultats se met à jour après filtrage", async () => {
    await renderAndWait();
    expect(screen.getByText(/2 résultats/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom/i), {
      target: { value: "Benali" },
    });
    await waitFor(() =>
      expect(screen.getByText(/1 résultat/i)).toBeInTheDocument()
    );
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// TABLE
// ═════════════════════════════════════════════════════════════════════════════
describe("Page Utilisateurs — Table", () => {

  test("T38 — Les en-têtes de la table sont présents", async () => {
    await renderAndWait();
    expect(screen.getByRole("columnheader", { name: /Nom complet/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Rôle/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Actions/i })).toBeInTheDocument();
  });

  test("T39 — Les IDs sont formatés avec padding (#0001, #0002)", async () => {
    await renderAndWait();
    expect(screen.getByText("#0001")).toBeInTheDocument();
    expect(screen.getByText("#0002")).toBeInTheDocument();
  });

  test("T40 — Un bouton désactiver existe pour chaque utilisateur", async () => {
    await renderAndWait();
    expect(screen.getByRole("button", { name: /Désactiver Youcef Benali/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Désactiver Sara Mammeri/i })).toBeInTheDocument();
  });

  test("T41 — Liste vide quand l'API retourne un tableau vide", async () => {
    mockApi.getUtilisateurs.mockResolvedValueOnce([]);
    render(<Utilisateur />);
    await waitFor(() =>
      expect(screen.getByText(/Aucun utilisateur trouvé/i)).toBeInTheDocument()
    );
  });

});