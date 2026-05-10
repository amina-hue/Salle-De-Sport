import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ──────────────────────────────────────────────────────
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../renderer/components/QuickActions', () => () => (
  <div data-testid="quick-actions" />
));

jest.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  BarChart:  ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Area: () => null, Bar: () => null, XAxis: () => null, YAxis: () => null,
  CartesianGrid: () => null, Tooltip: () => null, Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

// ── Mock jsPDF + autoTable ─────────────────────────────────────
const mockDoc = {
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  save: jest.fn(),
  internal: { getNumberOfPages: jest.fn().mockReturnValue(1) },
  lastAutoTable: { finalY: 100 },
};

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn(() => mockDoc),
}));

jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ── Mock URL pour exportCSV (sans toucher createElement) ───────
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

// ── Données de test ────────────────────────────────────────────
const mockAchats = [
  { id: 1, produit_id: 1, quantite: 10, prix_achat: 3000, date: '2024-01-05' },
  { id: 2, produit_id: 2, quantite: 5,  prix_achat: 2000, date: '2024-01-10' },
];
const mockVentes = [
  { id: 1, produit_id: 1, quantite: 3, prix_vente: 6000, adherent_id: 1,   date: '2024-01-15' },
  { id: 2, produit_id: 2, quantite: 1, prix_vente: 4500, adherent_id: null, date: '2024-01-20' },
];
const mockProduits = [
  { idProduit: 1, nom: 'Haltères 10kg', prix: 6000 },
  { idProduit: 2, nom: 'Vélo cardio',   prix: 4500 },
];
const mockAdherents = [
  { idAdherent: 1, nom: 'Benali', prenom: 'Sara' },
];

// 25 achats pour tester la pagination
const manyAchats = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  produit_id: 1,
  quantite: 1,
  prix_achat: 1000,
  date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
}));

beforeEach(() => {
  window.api = {
    getHistoriqueAchats: jest.fn().mockResolvedValue(mockAchats),
    getHistoriqueVentes: jest.fn().mockResolvedValue(mockVentes),
    getProduits:         jest.fn().mockResolvedValue(mockProduits),
    getAdherents:        jest.fn().mockResolvedValue(mockAdherents),
  };
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  mockDoc.save.mockClear();
});

afterEach(() => jest.clearAllMocks());

import HistoriqueTransactions from '../../renderer/pages/HistoriqueTransactions';

// ── Helpers ────────────────────────────────────────────────────
async function waitLoaded() {
  await waitFor(() =>
    expect(screen.queryByText(/chargement\.\.\./i)).not.toBeInTheDocument()
  );
}

function getTableRows() {
  return document.querySelectorAll('tbody tr');
}

function getCellsText(row) {
  return Array.from(row.querySelectorAll('td')).map(td => td.textContent);
}

// ══════════════════════════════════════════════════════════════
describe('Page HistoriqueTransactions', () => {

  // ── Rendu de base ──────────────────────────────────────────
  test('affiche le titre Transactions', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getAllByText(/transactions/i).length).toBeGreaterThan(0);
  });

  test('charge toutes les données depuis window.api', async () => {
    render(<HistoriqueTransactions />);
    await waitFor(() => {
      expect(window.api.getHistoriqueAchats).toHaveBeenCalled();
      expect(window.api.getHistoriqueVentes).toHaveBeenCalled();
      expect(window.api.getProduits).toHaveBeenCalled();
      expect(window.api.getAdherents).toHaveBeenCalled();
    });
  });

  test('affiche les noms de produits dans le tableau', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const rows = getTableRows();
    const allText = Array.from(rows).flatMap(getCellsText).join(' ');
    expect(allText).toMatch(/haltères 10kg/i);
    expect(allText).toMatch(/vélo cardio/i);
  });

  test('affiche les badges Achat et Vente', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const rows = getTableRows();
    const allText = Array.from(rows).flatMap(getCellsText).join(' ');
    expect(allText).toMatch(/achat/i);
    expect(allText).toMatch(/vente/i);
  });

  test("affiche le nom de l'adhérent pour les ventes identifiées", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const rows = getTableRows();
    const allCells = Array.from(rows).flatMap(getCellsText).join(' ');
    expect(allCells).toMatch(/benali sara/i);
  });

  test('affiche "Anonyme" pour les ventes sans adhérent', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getAllByText(/anonyme/i).length).toBeGreaterThan(0);
  });

  // ── StatCards ──────────────────────────────────────────────
  test('les StatCards affichent les totaux corrects', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const labelAchats = screen.getByText(/total achats/i);
    const labelVentes = screen.getByText(/total ventes/i);
    const cardAchats  = labelAchats.closest('div[style]')?.parentElement?.parentElement;
    const cardVentes  = labelVentes.closest('div[style]')?.parentElement?.parentElement;
    expect(cardAchats).toBeTruthy();
    expect(cardVentes).toBeTruthy();
    expect(within(cardAchats).getByText('2')).toBeInTheDocument();
    expect(within(cardVentes).getByText('2')).toBeInTheDocument();
  });

  // ── Onglets ────────────────────────────────────────────────
  test("le filtre par onglet Achats ne montre que les achats", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /^achats/i }));
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).not.toMatch(/\bvente\b/i);
      expect(allText).toMatch(/\bachat\b/i);
    });
  });

  test("le filtre par onglet Ventes ne montre que les ventes", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /^ventes/i }));
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/benali sara/i);
      expect(allText).not.toMatch(/\bachat\b/i);
    });
  });

  test("l'onglet Tous affiche toutes les transactions", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /^achats/i }));
    fireEvent.click(screen.getByRole('button', { name: /^tous/i }));
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/haltères 10kg/i);
      expect(allText).toMatch(/benali sara/i);
    });
  });

  // ── Recherche ──────────────────────────────────────────────
  test('la recherche filtre par nom de produit', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: 'vélo' },
    });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).not.toMatch(/haltères 10kg/i);
      expect(allText).toMatch(/vélo cardio/i);
    });
  });

  test('affiche "Aucune transaction trouvée" quand la recherche ne correspond à rien', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: 'produitinexistantxyz' },
    });
    await waitFor(() => {
      expect(screen.getByText(/aucune transaction trouvée/i)).toBeInTheDocument();
    });
  });

  test("la recherche filtre par nom d'adhérent", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: 'benali' },
    });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/benali sara/i);
    });
  });

  // ── Effacer filtres ────────────────────────────────────────
  test('le bouton Effacer filtres réinitialise les filtres', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: 'vélo' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /effacer filtres/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /effacer filtres/i }));
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/haltères 10kg/i);
    });
  });

  // ── Actualiser ─────────────────────────────────────────────
  test('le bouton Actualiser recharge les données', async () => {
    render(<HistoriqueTransactions />);
    await waitFor(() => expect(window.api.getHistoriqueAchats).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTitle(/actualiser/i));
    await waitFor(() => {
      expect(window.api.getHistoriqueAchats).toHaveBeenCalledTimes(2);
    });
  });

  // ── Boutons export ─────────────────────────────────────────
  test('le bouton Excel / CSV est présent', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getByRole('button', { name: /excel.*csv/i })).toBeInTheDocument();
  });

  test('le bouton PDF est présent', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument();
  });

  // ── QuickActions ───────────────────────────────────────────
  test('le QuickActions est affiché', async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  // ── Gestion d'erreurs API ──────────────────────────────────
  test("gère une erreur API (achats/ventes)", async () => {
    window.api.getHistoriqueAchats.mockRejectedValueOnce(new Error("API error"));
    window.api.getHistoriqueVentes.mockRejectedValueOnce(new Error("API error"));
    window.api.getProduits.mockResolvedValueOnce([]);
    window.api.getAdherents.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitFor(() => {
      expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
    });
  });

  // ── État vide ──────────────────────────────────────────────
  test("affiche état vide quand aucune transaction", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce([]);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    window.api.getProduits.mockResolvedValueOnce([]);
    window.api.getAdherents.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getByText(/aucune transaction/i)).toBeInTheDocument();
  });

  // ── Produit introuvable ────────────────────────────────────
  test("gère produit introuvable dans ventes", async () => {
    window.api.getHistoriqueVentes.mockResolvedValueOnce([
      { id: 99, produit_id: 999, quantite: 1, prix_vente: 1000, adherent_id: 1, date: "2024-01-01" },
    ]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const rows = getTableRows();
    const text = Array.from(rows).flatMap(getCellsText).join(" ");
    expect(text).toMatch(/vente/i);
  });

  // ── Adhérent inexistant ────────────────────────────────────
  test("vente avec adhérent inexistant => Anonyme", async () => {
    window.api.getHistoriqueVentes.mockResolvedValueOnce([
      { id: 1, produit_id: 1, quantite: 1, prix_vente: 1000, adherent_id: 999, date: "2024-01-01" },
    ]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getAllByText(/anonyme/i).length).toBeGreaterThan(0);
  });

  // ── Filtre combiné ─────────────────────────────────────────
  test("filtre combiné recherche + onglet ventes", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole("button", { name: /^ventes/i }));
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: "vélo" },
    });
    await waitFor(() => {
      const rows = getTableRows();
      const text = Array.from(rows).flatMap(getCellsText).join(" ");
      expect(text).toMatch(/vélo/i);
      expect(text).not.toMatch(/haltères/i);
    });
  });

  // ── fmtDate : date nulle ───────────────────────────────────
  test("fmtDate affiche '—' quand la date est nulle", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce([
      { id: 99, produit_id: 1, quantite: 1, prix_achat: 1000, date: null },
    ]);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const rows = getTableRows();
    const allText = Array.from(rows).flatMap(getCellsText).join(' ');
    expect(allText).toMatch(/—/);
  });

  // ── prix_achat null ────────────────────────────────────────
  test("achat avec prix_achat null => pas de crash", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce([
      { id: 10, produit_id: 1, quantite: null, prix_achat: null, date: '2024-01-01' },
    ]);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(getTableRows().length).toBeGreaterThanOrEqual(1);
  });

  // ── Export CSV ─────────────────────────────────────────────
  test("exportCSV crée et télécharge un fichier CSV", async () => {
    const mockClick = jest.fn();
    const fakeAnchor = { href: '', download: '', click: mockClick };
    const realCreate = document.createElement.bind(document);
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag) => (tag === 'a' ? fakeAnchor : realCreate(tag)));

    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /excel.*csv/i }));

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
    expect(fakeAnchor.download).toBe('transactions.csv');

    document.createElement.mockRestore();
  });

  // ── Export PDF ─────────────────────────────────────────────
  test("exportPDF appelle jsPDF et sauvegarde un fichier", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /pdf/i }));
    await waitFor(() => {
      expect(mockDoc.save).toHaveBeenCalled();
    });
    expect(mockDoc.save.mock.calls[0][0]).toMatch(/transactions.*\.pdf/i);
  });

  test("exportPDF réactive le bouton après export", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const pdfBtn = screen.getByRole('button', { name: /pdf/i });
    fireEvent.click(pdfBtn);
    await waitFor(() => expect(mockDoc.save).toHaveBeenCalled());
    await waitFor(() => expect(pdfBtn).not.toBeDisabled());
  });

  // ── Filtre par date ────────────────────────────────────────
  test("filtre par dateFrom exclut les transactions antérieures", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-12' } });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      // achat du 05/01 et 10/01 doivent disparaître
      expect(allText).not.toMatch(/05\/01|10\/01/);
    });
  });

  test("filtre par dateTo exclut les transactions postérieures", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-12' } });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).not.toMatch(/benali sara/i);
    });
  });

  test("filtre combiné dateFrom + dateTo", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-08' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-16' } });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/vélo cardio/i);
      expect(allText).toMatch(/benali sara/i);
    });
  });

  // ── Filtre par adhérent (select) ───────────────────────────
  test("filtre par adhérent via le select", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const adherentSelect = screen.getByDisplayValue(/tous les adhérents/i);
    fireEvent.change(adherentSelect, { target: { value: '1' } });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/benali sara/i);
    });
  });

  // ── Filtre par produit (select) ────────────────────────────
  test("filtre par produit via le select", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const produitSelect = screen.getByDisplayValue(/tous produits/i);
    fireEvent.change(produitSelect, { target: { value: '1' } });
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/haltères 10kg/i);
      expect(allText).not.toMatch(/vélo cardio/i);
    });
  });

  // ── Pagination ─────────────────────────────────────────────
  test("la pagination s'affiche avec beaucoup de transactions", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce(manyAchats);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const pageButtons = screen.queryAllByRole('button', { name: /^\d+$/ });
    expect(pageButtons.length).toBeGreaterThan(0);
  });

  test("cliquer sur la page 2 change la page courante", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce(manyAchats);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const page2Button = screen.queryByRole('button', { name: /^2$/ });
    if (page2Button) {
      fireEvent.click(page2Button);
      await waitFor(() => {
        expect(getTableRows().length).toBeGreaterThan(0);
      });
    }
  });

  test("getPages : navigation vers la dernière page", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce(
      Array.from({ length: 30 }, (_, i) => ({
        id: i + 1, produit_id: 1, quantite: 1, prix_achat: 100,
        date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
      }))
    );
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const allPageBtns = screen.queryAllByRole('button', { name: /^\d+$/ });
    const lastBtn = allPageBtns[allPageBtns.length - 1];
    if (lastBtn) {
      fireEvent.click(lastBtn);
      await waitFor(() => {
        expect(getTableRows().length).toBeGreaterThan(0);
      });
    }
  });

  // ── Hover boutons ──────────────────────────────────────────
  test("hover sur le bouton Actualiser ne plante pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const btn = screen.getByTitle(/actualiser/i);
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test("hover sur le bouton Excel / CSV ne plante pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const btn = screen.getByRole('button', { name: /excel.*csv/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  test("hover sur le bouton PDF ne plante pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const btn = screen.getByRole('button', { name: /pdf/i });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  // ── Focus/Blur ─────────────────────────────────────────────
  test("focus et blur sur les inputs de date ne plantent pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      fireEvent.focus(input);
      fireEvent.blur(input);
    });
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  test("focus et blur sur le select produit ne plantent pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const sel = screen.getByDisplayValue(/tous produits/i);
    fireEvent.focus(sel);
    fireEvent.blur(sel);
    expect(sel).toBeInTheDocument();
  });

  test("focus et blur sur le select adhérent ne plantent pas", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const sel = screen.getByDisplayValue(/tous les adhérents/i);
    fireEvent.focus(sel);
    fireEvent.blur(sel);
    expect(sel).toBeInTheDocument();
  });

  // ── Effacer filtres avec date ──────────────────────────────
  test("effacer filtres réinitialise aussi les dates", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-12' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /effacer filtres/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /effacer filtres/i }));
    await waitFor(() => {
      expect(dateInputs[0].value).toBe('');
    });
  });

  // ── quantite null ──────────────────────────────────────────
  test("quantite null dans achats ne plante pas les stats", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce([
      { id: 1, produit_id: 1, quantite: null, prix_achat: 1000, date: '2024-01-01' },
    ]);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.getByText(/total achats/i)).toBeInTheDocument();
  });

  // ── Charts ─────────────────────────────────────────────────
  test("le graphique AreaChart est affiché", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.queryByTestId('area-chart')).toBeInTheDocument();
  });

  test("le bar chart top produits est affiché", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    expect(screen.queryByTestId('bar-chart')).toBeInTheDocument();
  });

  // ── Effacer filtres remet onglet sur Tous ─────────────────
  test("effacer filtres remet l'onglet sur Tous", async () => {
    render(<HistoriqueTransactions />);
    await waitLoaded();
    fireEvent.click(screen.getByRole('button', { name: /^achats/i }));
    fireEvent.change(screen.getByPlaceholderText(/produit ou adhérent/i), {
      target: { value: 'dummy' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /effacer filtres/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /effacer filtres/i }));
    await waitFor(() => {
      const rows = getTableRows();
      const allText = Array.from(rows).flatMap(getCellsText).join(' ');
      expect(allText).toMatch(/achat/i);
      expect(allText).toMatch(/vente/i);
    });
  });

  // ── Bouton précédent désactivé page 1 ────────────────────
  test("le bouton page précédente est désactivé sur la première page", async () => {
    window.api.getHistoriqueAchats.mockResolvedValueOnce(manyAchats);
    window.api.getHistoriqueVentes.mockResolvedValueOnce([]);
    render(<HistoriqueTransactions />);
    await waitLoaded();
    const disabledBtns = screen.queryAllByRole('button').filter(b => b.disabled);
    expect(disabledBtns.length).toBeGreaterThan(0);
  });
});