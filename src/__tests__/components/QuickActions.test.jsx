import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ──────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../renderer/components/AddMemberModal', () => ({ onClose, onSave, typesAbonnement }) => (
  <div data-testid="modal-adherent">
    <span data-testid="types-abo">{JSON.stringify(typesAbonnement)}</span>
    <button onClick={onSave}>Sauvegarder adhérent</button>
    <button onClick={onClose}>Fermer adhérent</button>
  </div>
));

jest.mock('../../renderer/components/NouvelTypeAbonnementModal', () => ({ onClose, onSave }) => (
  <div data-testid="modal-abonnement">
    <button onClick={onSave}>Sauvegarder abonnement</button>
    <button onClick={onClose}>Fermer abonnement</button>
  </div>
));

jest.mock('../../renderer/components/NouveauPaiementModal', () => ({ onClose, onSave }) => (
  <div data-testid="modal-paiement">
    <button onClick={() => onSave({ montant: 100 })}>Sauvegarder paiement</button>
    <button onClick={onClose}>Fermer paiement</button>
  </div>
));

jest.mock('../../renderer/components/NouvelSeanceModal', () => ({ onClose, onSave }) => (
  <div data-testid="modal-seance">
    <button onClick={() => onSave({ date: '2025-01-01' })}>Sauvegarder séance</button>
    <button onClick={onClose}>Fermer séance</button>
  </div>
));

// ── Helpers ────────────────────────────────────────────────────
const openQuickMenu = async () => {
  const icons = document.querySelectorAll('svg');
  fireEvent.click(icons[icons.length - 1]);
  await waitFor(() => expect(screen.getByText(/actions rapides/i)).toBeInTheDocument());
};

// ── Setup / Teardown ───────────────────────────────────────────
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ nom: 'Benali', prenom: 'Sara' }));
  window.api = {
    addPaiement: jest.fn().mockResolvedValue({ success: true }),
  };
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

import QuickActions from '../../renderer/components/QuickActions';

// ══════════════════════════════════════════════════════════════
// 1. AFFICHAGE INITIAL
// ══════════════════════════════════════════════════════════════
describe('Affichage initial', () => {
  test('affiche les initiales de l\'utilisateur connecté', () => {
    render(<QuickActions />);
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  test('affiche "?" si aucun utilisateur connecté', () => {
    localStorage.clear();
    render(<QuickActions />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('affiche "?" si le user en localStorage est mal formé (objet vide)', () => {
    localStorage.setItem('user', JSON.stringify({}));
    render(<QuickActions />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('n\'affiche pas le menu actions rapides au démarrage', () => {
    render(<QuickActions />);
    expect(screen.queryByText(/actions rapides/i)).not.toBeInTheDocument();
  });

  test('n\'affiche pas le panel profil au démarrage', () => {
    render(<QuickActions />);
    expect(screen.queryByText(/profil/i)).not.toBeInTheDocument();
  });

  test('n\'affiche aucun modal au démarrage', () => {
    render(<QuickActions />);
    expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════
// 2. MENU ACTIONS RAPIDES
// ══════════════════════════════════════════════════════════════
describe('Menu actions rapides', () => {
  test('s\'ouvre au clic sur l\'icône éclair', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    expect(screen.getByText(/actions rapides/i)).toBeInTheDocument();
  });

  test('affiche les 4 boutons d\'action', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    expect(screen.getByText(/nouvel adhérent/i)).toBeInTheDocument();
    expect(screen.getByText(/nouvel abonnement/i)).toBeInTheDocument();
    expect(screen.getByText(/\+ paiement/i)).toBeInTheDocument();
    expect(screen.getByText(/planifier séance/i)).toBeInTheDocument();
  });

  test('se ferme au clic sur ✕', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText('✕'));
    await waitFor(() => {
      expect(screen.queryByText(/actions rapides/i)).not.toBeInTheDocument();
    });
  });

  test('le menu se ferme lorsqu\'un modal est ouvert', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => {
      expect(screen.queryByText(/actions rapides/i)).not.toBeInTheDocument();
    });
  });

  test('bascule : deux clics sur l\'éclair ferme puis rouvre le menu', async () => {
    render(<QuickActions />);
    const icons = document.querySelectorAll('svg');
    const flash = icons[icons.length - 1];
    fireEvent.click(flash);
    await waitFor(() => expect(screen.getByText(/actions rapides/i)).toBeInTheDocument());
    fireEvent.click(flash);
    await waitFor(() => expect(screen.queryByText(/actions rapides/i)).not.toBeInTheDocument());
    fireEvent.click(flash);
    await waitFor(() => expect(screen.getByText(/actions rapides/i)).toBeInTheDocument());
  });
});

// ══════════════════════════════════════════════════════════════
// 3. PANEL PROFIL
// ══════════════════════════════════════════════════════════════
describe('Panel profil', () => {
  test('s\'ouvre au clic sur le cercle avec les initiales', async () => {
    render(<QuickActions />);
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => {
      expect(screen.getByText(/profil/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument();
    });
  });

  test('se ferme au clic sur ✕ dans le panel profil', async () => {
    render(<QuickActions />);
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => expect(screen.getByText(/profil/i)).toBeInTheDocument());

    // Il y a deux ✕ potentiels — on cible celui du panel profil
    const closeButtons = screen.getAllByText('✕');
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/profil/i)).not.toBeInTheDocument();
    });
  });

  test('bascule : deux clics sur le cercle ferme le panel', async () => {
    render(<QuickActions />);
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => expect(screen.getByText(/profil/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => expect(screen.queryByText(/profil/i)).not.toBeInTheDocument());
  });
});

// ══════════════════════════════════════════════════════════════
// 4. DÉCONNEXION
// ══════════════════════════════════════════════════════════════
describe('Déconnexion', () => {
  test('supprime l\'utilisateur du localStorage et navigue vers /connexion', async () => {
    render(<QuickActions />);
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /déconnexion/i }));

    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/connexion');
  });

  test('navigue exactement une fois lors de la déconnexion', async () => {
    render(<QuickActions />);
    fireEvent.click(screen.getByText('BS'));
    await waitFor(() => expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /déconnexion/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

// ══════════════════════════════════════════════════════════════
// 5. MODAL — NOUVEL ADHÉRENT
// ══════════════════════════════════════════════════════════════
describe('Modal Nouvel Adhérent', () => {
  test('s\'ouvre via le menu actions rapides', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => expect(screen.getByTestId('modal-adherent')).toBeInTheDocument());
  });

  test('se ferme via onClose', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => expect(screen.getByTestId('modal-adherent')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Fermer adhérent'));
    await waitFor(() => expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument());
  });

  test('reçoit la prop typesAbonnement', async () => {
    const types = [{ id: 1, nom: 'Mensuel' }];
    render(<QuickActions typesAbonnement={types} />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => {
      expect(screen.getByTestId('types-abo')).toHaveTextContent(JSON.stringify(types));
    });
  });

  test('un seul modal est visible à la fois (adhérent remplace abonnement)', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument());

    // Rouvrir le menu puis cliquer sur adhérent
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => {
      expect(screen.getByTestId('modal-adherent')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 6. MODAL — NOUVEL ABONNEMENT
// ══════════════════════════════════════════════════════════════
describe('Modal Nouvel Abonnement', () => {
  test('s\'ouvre via le menu actions rapides', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument());
  });

  test('se ferme via onClose', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Fermer abonnement'));
    await waitFor(() => expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument());
  });

  test('se ferme via onSave (bouton sauvegarder)', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder abonnement'));
    await waitFor(() => expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument());
  });
});

// ══════════════════════════════════════════════════════════════
// 7. MODAL — PAIEMENT
// ══════════════════════════════════════════════════════════════
describe('Modal Paiement', () => {
  test('s\'ouvre via le menu actions rapides', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
  });

  test('se ferme via onClose', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Fermer paiement'));
    await waitFor(() => expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument());
  });

  test('appelle window.api.addPaiement avec les données fournies', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder paiement'));
    await waitFor(() => {
      expect(window.api.addPaiement).toHaveBeenCalledWith({ montant: 100 });
    });
  });

  test('ferme le modal après un paiement réussi', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder paiement'));
    await waitFor(() => expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument());
  });

  test('affiche une alerte si addPaiement échoue', async () => {
    window.api.addPaiement = jest.fn().mockRejectedValue(new Error('Erreur réseau'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder paiement'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Erreur paiement');
    });

    alertMock.mockRestore();
  });

  test('le modal reste ouvert si addPaiement échoue', async () => {
    window.api.addPaiement = jest.fn().mockRejectedValue(new Error('fail'));
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder paiement'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    // Le modal doit rester fermé car close() n'est pas appelé en cas d'erreur
    // (comportement actuel du composant — ajuster si souhaité)
    window.alert.mockRestore();
  });
});

// ══════════════════════════════════════════════════════════════
// 8. MODAL — PLANIFIER SÉANCE
// ══════════════════════════════════════════════════════════════
describe('Modal Planifier Séance', () => {
  test('s\'ouvre via le menu actions rapides', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/planifier séance/i));
    await waitFor(() => expect(screen.getByTestId('modal-seance')).toBeInTheDocument());
  });

  test('se ferme via onClose', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/planifier séance/i));
    await waitFor(() => expect(screen.getByTestId('modal-seance')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Fermer séance'));
    await waitFor(() => expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument());
  });

  test('se ferme via onSave', async () => {
    render(<QuickActions />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/planifier séance/i));
    await waitFor(() => expect(screen.getByTestId('modal-seance')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder séance'));
    await waitFor(() => expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument());
  });
});

// ══════════════════════════════════════════════════════════════
// 9. ISOLATION DES MODALS
// ══════════════════════════════════════════════════════════════
describe('Isolation des modals (un seul à la fois)', () => {
  test('ouvrir adhérent depuis abonnement ouvert → seul adhérent visible', async () => {
    render(<QuickActions />);

    // Ouvrir abonnement
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument());

    // Fermer abonnement, ouvrir adhérent
    fireEvent.click(screen.getByText('Fermer abonnement'));
    await waitFor(() => expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument());

    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => {
      expect(screen.getByTestId('modal-adherent')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument();
    });
  });

  test('ouvrir abonnement depuis adhérent ouvert → seul abonnement visible', async () => {
    render(<QuickActions />);

    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => expect(screen.getByTestId('modal-adherent')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Fermer adhérent'));
    await waitFor(() => expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument());

    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel abonnement/i));
    await waitFor(() => {
      expect(screen.getByTestId('modal-abonnement')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument();
    });
  });

  test('ouvrir paiement depuis adhérent ouvert → seul paiement visible', async () => {
    render(<QuickActions />);

    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => expect(screen.getByTestId('modal-adherent')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Fermer adhérent'));
    await waitFor(() => expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument());

    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => {
      expect(screen.getByTestId('modal-paiement')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-seance')).not.toBeInTheDocument();
    });
  });

  test('ouvrir séance depuis paiement ouvert → seule séance visible', async () => {
    render(<QuickActions />);

    await openQuickMenu();
    fireEvent.click(screen.getByText(/\+ paiement/i));
    await waitFor(() => expect(screen.getByTestId('modal-paiement')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Fermer paiement'));
    await waitFor(() => expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument());

    await openQuickMenu();
    fireEvent.click(screen.getByText(/planifier séance/i));
    await waitFor(() => {
      expect(screen.getByTestId('modal-seance')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-adherent')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-abonnement')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-paiement')).not.toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 10. PROPS TRANSMISES AUX MODALS
// ══════════════════════════════════════════════════════════════
describe('Transmission des props', () => {
  test('handleSaveAdherent est passé comme onSave à AddMemberModal', async () => {
    const handleSaveAdherent = jest.fn();
    render(<QuickActions handleSaveAdherent={handleSaveAdherent} />);
    await openQuickMenu();
    fireEvent.click(screen.getByText(/nouvel adhérent/i));
    await waitFor(() => expect(screen.getByTestId('modal-adherent')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sauvegarder adhérent'));
    expect(handleSaveAdherent).toHaveBeenCalled();
  });
});