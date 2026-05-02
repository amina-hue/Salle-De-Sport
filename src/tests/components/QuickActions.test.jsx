import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import QuickActions from '../../renderer/components/QuickActions';

// Mock des modals internes pour éviter les erreurs de dépendances
jest.mock('../../renderer/components/AddMemberModal',        () => () => <div data-testid="modal-adherent" />);
jest.mock('../../renderer/components/NouvelAbonnementModal', () => () => <div data-testid="modal-abonnement" />);
jest.mock('../../renderer/components/NouveauPaiementModal',  () => () => <div data-testid="modal-paiement" />);
jest.mock('../../renderer/components/NouvelSeanceModal',     () => () => <div data-testid="modal-seance" />);

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage
const mockUser = { nom: 'Benali', prenom: 'Youcef' };
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  jest.clearAllMocks();
});
afterEach(() => {
  localStorage.clear();
});

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('QuickActions Component', () => {
  test('affiche les initiales de l\'utilisateur connecté', () => {
    renderWithRouter(<QuickActions />);
    expect(screen.getByText('BY')).toBeInTheDocument();
  });

  test('le bouton thunder (SVG) est présent', () => {
    const { container } = renderWithRouter(<QuickActions />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('ouvre le menu des actions rapides au clic sur le thunder', () => {
    const { container } = renderWithRouter(<QuickActions />);
    // Récupérer le SVG (icône IoFlash) directement
    const svg = container.querySelector('svg');
    fireEvent.click(svg);
    expect(screen.getByText('Actions rapides')).toBeInTheDocument();
  });

  test('affiche les 4 boutons d\'actions rapides après ouverture', () => {
    const { container } = renderWithRouter(<QuickActions />);
    const svg = container.querySelector('svg');
    fireEvent.click(svg);
    expect(screen.getByText('+ Nouvel Adhérent')).toBeInTheDocument();
    expect(screen.getByText('+ Nouvel Abonnement')).toBeInTheDocument();
    expect(screen.getByText('+ Paiement')).toBeInTheDocument();
    expect(screen.getByText('+ Planifier séance')).toBeInTheDocument();
  });

  test('affiche le menu profil au clic sur le cercle', () => {
    renderWithRouter(<QuickActions />);
    fireEvent.click(screen.getByText('BY'));
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  test('déconnexion supprime l\'utilisateur du localStorage et redirige', () => {
    renderWithRouter(<QuickActions />);
    fireEvent.click(screen.getByText('BY'));
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/connexion');
  });

  test('ferme le menu profil au clic sur ✕', () => {
    renderWithRouter(<QuickActions />);
    fireEvent.click(screen.getByText('BY'));
    expect(screen.getByText('Profil')).toBeInTheDocument();
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
  });

  test('affiche ? si aucun utilisateur en localStorage', () => {
    localStorage.clear();
    renderWithRouter(<QuickActions />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('ouvre le modal Adhérent au clic sur "+ Nouvel Adhérent"', () => {
    const { container } = renderWithRouter(<QuickActions />);
    fireEvent.click(container.querySelector('svg'));
    fireEvent.click(screen.getByText('+ Nouvel Adhérent'));
    expect(screen.getByTestId('modal-adherent')).toBeInTheDocument();
  });

  test('ouvre le modal Paiement au clic sur "+ Paiement"', () => {
    const { container } = renderWithRouter(<QuickActions />);
    fireEvent.click(container.querySelector('svg'));
    fireEvent.click(screen.getByText('+ Paiement'));
    expect(screen.getByTestId('modal-paiement')).toBeInTheDocument();
  });
});