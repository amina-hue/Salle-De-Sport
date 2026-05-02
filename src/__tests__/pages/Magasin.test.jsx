import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Magasin from '../../renderer/pages/Magasin';

// ── Mock window.api ──
const mockProduits = [
  { idProduit: 1, nom: 'Haltères 10kg',   reference: 'ALG001', categorie: 'Musculation', stock: 15, prix: '6000'  },
  { idProduit: 2, nom: 'Tapis de course',  reference: 'ALG002', categorie: 'Cardio',      stock: 3,  prix: '45000' },
];

global.window.api = {
  getProduits:    jest.fn(() => Promise.resolve(mockProduits)),
  addProduit:     jest.fn(() => Promise.resolve({ idProduit: 3 })),
  updateProduit:  jest.fn(() => Promise.resolve({ success: true })),
  deleteProduit:  jest.fn(() => Promise.resolve({ success: true })),
  addTransaction: jest.fn(() => Promise.resolve({ success: true })),
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/magasin' }),
}));

jest.mock('../../renderer/components/QuickActions', () => () => null);

const renderMagasin = () =>
  render(<MemoryRouter><Magasin /></MemoryRouter>);

describe('PAGE Magasin', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    global.window.api.getProduits.mockResolvedValue(mockProduits);
  });

  // T01 — Afficher la liste des produits
  test('T01 — affiche la liste des produits après chargement', async () => {
    renderMagasin();
    await waitFor(() => {
      expect(screen.getByText(/Haltères 10kg/i)).toBeInTheDocument();
      expect(screen.getByText(/Tapis de course/i)).toBeInTheDocument();
    });
  });

  // T02 — Champ de recherche visible
  test('T02 — affiche le champ de recherche', async () => {
    renderMagasin();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Rechercher nom/i)).toBeInTheDocument();
    });
  });

  // T03 — Bouton Ajouter visible
  test('T03 — affiche le bouton Ajouter un produit', async () => {
    renderMagasin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter un produit/i })).toBeInTheDocument();
    });
  });

  // T04 — Ajouter un nouveau produit → ouvre la modal
  test('T04 — ouvre la modal Nouveau Produit au clic sur Ajouter', async () => {
    renderMagasin();
    await waitFor(() => screen.getByRole('button', { name: /ajouter un produit/i }));
    fireEvent.click(screen.getByRole('button', { name: /ajouter un produit/i }));
    expect(screen.getByText(/Nouveau Produit/i)).toBeInTheDocument();
  });

  // T05 — Modifier un produit → ouvre la modal en mode édition
  test('T05 — ouvre la modal en mode Modifier au clic sur Modifier', async () => {
    renderMagasin();
    await waitFor(() => screen.getAllByTitle('Modifier'));
    fireEvent.click(screen.getAllByTitle('Modifier')[0]);
    expect(screen.getByText(/Modifier le Produit/i)).toBeInTheDocument();
  });

  // T06 — Supprimer un produit avec confirmation
  test('T06 — supprime le produit après confirmation', async () => {
    global.confirm = jest.fn(() => true);
    renderMagasin();
    await waitFor(() => screen.getAllByTitle('Supprimer'));
    fireEvent.click(screen.getAllByTitle('Supprimer')[0]);
    await waitFor(() => {
      expect(window.api.deleteProduit).toHaveBeenCalledWith(1);
    });
  });

  // T07 — Supprimer annulé → API pas appelée
  test('T07 — ne supprime pas si l\'utilisateur annule', async () => {
    global.confirm = jest.fn(() => false);
    renderMagasin();
    await waitFor(() => screen.getAllByTitle('Supprimer'));
    fireEvent.click(screen.getAllByTitle('Supprimer')[0]);
    expect(window.api.deleteProduit).not.toHaveBeenCalled();
  });

  // T08 — La recherche filtre les produits
  test('T08 — la recherche filtre la liste des produits', async () => {
    renderMagasin();
    await waitFor(() => screen.getByText(/Haltères 10kg/i));
    fireEvent.change(screen.getByPlaceholderText(/Rechercher nom/i), {
      target: { value: 'Tapis' },
    });
    expect(screen.queryByText(/Haltères 10kg/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Tapis de course/i)).toBeInTheDocument();
  });

});