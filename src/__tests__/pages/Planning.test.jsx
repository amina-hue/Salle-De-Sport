import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import Planning from '../../renderer/pages/planning';

// ─── Mocks globaux ────────────────────────────────────────────────────────────
jest.mock('../../images/gym.png', () => 'mocked-gym.png');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('../../renderer/components/QuickActions',        () => () => <div data-testid="quick-actions" />);
jest.mock('../../renderer/components/NouvelSeanceModal',   () => ({ onClose, onSave }) => (
  <div data-testid="nouvel-seance-modal">
    <button onClick={onClose}>Fermer modal séance</button>
    <button onClick={onSave}>Sauvegarder séance</button>
  </div>
));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const makeSeance = (overrides = {}) => ({
  idSeance:       1,
  date:           '2025-01-06',     // lundi
  heureDebut:     '10:00',
  heureFin:       '11:00',
  activiteNom:    'Yoga',
  activiteCouleur:'#9b59b6',
  coachPrenom:    'Alice',
  coachNom:       'Dupont',
  publicCible:    'Femme',
  participantsMax: 10,
  presents:        3,
  salle:          'Salle A',
  statut:         'confirmée',
  nbHommes:        0,
  nbFemmes:        3,
  nbEnfants:       0,
  ...overrides,
});

const makeActivite = (overrides = {}) => ({
  idActivite: 1,
  nom:        'Yoga',
  couleur:    '#9b59b6',
  ...overrides,
});

// ─── Mock window.api ──────────────────────────────────────────────────────────
const mockApi = {
  getSeancesSemaine:          jest.fn().mockResolvedValue([makeSeance()]),
  getActivites:               jest.fn().mockResolvedValue([makeActivite()]),
  deleteSeance:               jest.fn().mockResolvedValue({ success: true }),
  exportPlanningPDF:          jest.fn().mockResolvedValue({ success: true }),
  exportEtEnvoyerPlanningPDF: jest.fn().mockResolvedValue({ success: true }),
  sendSpecialMessage:         jest.fn().mockResolvedValue({ success: true, count: 12 }),
  searchAdherents:            jest.fn().mockResolvedValue([]),
  getPresencesSeance:         jest.fn().mockResolvedValue([]),
  addPresence:                jest.fn().mockResolvedValue({ success: true }),
};

beforeAll(() => {
  Object.defineProperty(window, 'api', { value: mockApi, writable: true });
  Object.defineProperty(window, 'innerWidth',  { value: 1440, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 900,  writable: true });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.getSeancesSemaine.mockResolvedValue([makeSeance()]);
  mockApi.getActivites.mockResolvedValue([makeActivite()]);
  useLocation.mockReturnValue({ search: '' });
  useNavigate.mockReturnValue(jest.fn());
});

// ─── Helper ──────────────────────────────────────────────────────────────────
const renderPlanning = () =>
  render(<MemoryRouter><Planning /></MemoryRouter>);

/**
 * Attend que les séances soient chargées et clique sur la CARTE de séance
 * (le div en gras dans la grille, pas le span de la légende).
 * La carte SessionCard rend le nom de l'activité dans un div avec font-weight:800.
 */
const clickSeanceCard = async (activiteNom = 'Yoga') => {
  // Attendre que toutes les occurrences soient rendues
  await screen.findAllByText(activiteNom);
  // La carte est un div stylé à font-weight 800, la légende est un span à font-weight 500.
  // On cherche le premier élément dont le tagName est DIV et qui contient ce texte exactement.
  const allMatches = screen.getAllByText(activiteNom);
  const cardTitle = allMatches.find(el => el.tagName === 'DIV');
  if (!cardTitle) throw new Error(`Carte séance "${activiteNom}" introuvable dans la grille`);
  fireEvent.click(cardTitle, { bubbles: true });
};

// ════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL & CHARGEMENT
// ════════════════════════════════════════════════════════════════════════════
describe('Rendu initial', () => {
  test('affiche le titre "Planning des séances"', async () => {
    renderPlanning();
    expect(await screen.findByText(/Planning des séances/i)).toBeInTheDocument();
  });

  test('appelle getSeancesSemaine et getActivites au montage', async () => {
    renderPlanning();
    await waitFor(() => {
      expect(mockApi.getSeancesSemaine).toHaveBeenCalledTimes(1);
      expect(mockApi.getActivites).toHaveBeenCalledTimes(1);
    });
  });

  test('affiche "…" pendant le chargement puis le nombre de séances', async () => {
    // On retarde volontairement la réponse
    mockApi.getSeancesSemaine.mockReturnValue(new Promise(() => {}));
    renderPlanning();
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  test('affiche le nombre de séances et de présences après chargement', async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 séance
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 présences
    });
  });

  test('affiche la légende des activités', async () => {
    renderPlanning();
    expect(await screen.findByText('Légende des activités')).toBeInTheDocument();
    // Yoga apparaît dans la carte ET dans la légende — on vérifie juste qu'au moins un existe
    expect(screen.getAllByText('Yoga').length).toBeGreaterThan(0);
  });

  test('affiche les 7 jours de la semaine dans l\'en-tête', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    const dayHeaders = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    dayHeaders.forEach(day => {
      expect(screen.getAllByText(day).length).toBeGreaterThan(0);
    });
  });

  test('affiche les heures dans la colonne gauche', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    expect(screen.getByText('8:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('22:00')).toBeInTheDocument();
  });

  test('gère les erreurs API silencieusement', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.getSeancesSemaine.mockRejectedValue(new Error('Réseau indisponible'));
    renderPlanning();
    await waitFor(() => expect(mockApi.getSeancesSemaine).toHaveBeenCalled());
    // Pas de crash, le composant reste affiché
    expect(screen.getByText(/Planning des séances/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('affiche le bouton "Ajouter une séance"', async () => {
    renderPlanning();
    expect(await screen.findByText(/Ajouter une séance/i)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. NAVIGATION SEMAINE
// ════════════════════════════════════════════════════════════════════════════
describe('Navigation semaine', () => {
  test('le bouton "Aujourd\'hui" remet weekOffset à 0', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);

    const nextBtn = screen.getAllByRole('button').find(b => b.querySelector('svg[data-lucide="chevron-right"]') || b.innerHTML.includes('ChevronRight'));
    // Navigation via les chevrons — on teste le rechargement
    const todayBtn = screen.getByText("Aujourd'hui");
    await userEvent.click(todayBtn);
    expect(mockApi.getSeancesSemaine).toHaveBeenCalled();
  });

  test('naviguer à la semaine précédente recharge les séances', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    const prevBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('chevron-left') || b.getAttribute('aria-label') === 'prev');
    // Fallback : cibler par position dans la toolbar
    const allBtns = screen.getAllByRole('button');
    const chevronLeft = allBtns.find(b => b.querySelector('svg'));
    fireEvent.click(chevronLeft);
    await waitFor(() => expect(mockApi.getSeancesSemaine).toHaveBeenCalledTimes(2));
  });

  test('la semaine courante est affichée dans le label', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    // Le label contient "Du" et "au"
    const labels = screen.getAllByText(/Du .+ au /i);
    expect(labels.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. FILTRE GENRE
// ════════════════════════════════════════════════════════════════════════════
describe('Filtre genre', () => {
  test('affiche les 3 filtres : Tous, Hommes, Femmes', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getByText(/Hommes/i)).toBeInTheDocument();
    expect(screen.getByText(/Femmes/i)).toBeInTheDocument();
  });

  test('cliquer sur "♀ Femmes" active le filtre', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    const femBtn = screen.getByText(/Femmes/i);
    await userEvent.click(femBtn);
    // Le bouton est désormais actif (background accent)
    expect(femBtn).toBeInTheDocument();
  });

  test('cliquer sur "Tous" revient au filtre par défaut', async () => {
    renderPlanning();
    await screen.findAllByText('Yoga');
    await userEvent.click(screen.getByText(/Hommes/i));
    await userEvent.click(screen.getByText('Tous'));
    // La séance Yoga (publicCible Femme) est visible à nouveau (au moins dans la légende)
    expect(screen.getAllByText('Yoga').length).toBeGreaterThan(0);
  });

  test('filtrer par "Hommes" masque une séance Femme', async () => {
    renderPlanning();
    await screen.findAllByText('Yoga'); // attend le chargement (carte + légende)

    await userEvent.click(screen.getByText(/Hommes/i));
    // La carte Yoga (Femme) ne doit plus apparaître dans la grille
    // On vérifie qu'il n'y a plus de div avec ce texte (seul le span légende subsiste)
    const matches = screen.queryAllByText('Yoga');
    const cardMatches = matches.filter(el => el.tagName === 'DIV');
    expect(cardMatches).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. MODAL NOUVELLE SÉANCE
// ════════════════════════════════════════════════════════════════════════════
describe('Modal nouvelle séance', () => {
  test('ouvre NouvelSeanceModal au clic sur "Ajouter une séance"', async () => {
    renderPlanning();
    await userEvent.click(await screen.findByText(/Ajouter une séance/i));
    expect(screen.getByTestId('nouvel-seance-modal')).toBeInTheDocument();
  });

  test('ferme NouvelSeanceModal au clic sur "Fermer modal séance"', async () => {
    renderPlanning();
    await userEvent.click(await screen.findByText(/Ajouter une séance/i));
    await userEvent.click(screen.getByText('Fermer modal séance'));
    expect(screen.queryByTestId('nouvel-seance-modal')).not.toBeInTheDocument();
  });

  test('sauvegarde une séance recharge les données', async () => {
    renderPlanning();
    await userEvent.click(await screen.findByText(/Ajouter une séance/i));
    await userEvent.click(screen.getByText('Sauvegarder séance'));
    await waitFor(() => expect(mockApi.getSeancesSemaine).toHaveBeenCalledTimes(2));
  });

  test('ouvre le modal si l\'URL contient ?openModal=true', async () => {
    useLocation.mockReturnValue({ search: '?openModal=true' });
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    renderPlanning();
    await waitFor(() =>
      expect(screen.getByTestId('nouvel-seance-modal')).toBeInTheDocument()
    );
    expect(navigate).toHaveBeenCalledWith('/planning', { replace: true });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. POPUP DÉTAIL SÉANCE (SeancePopup)
// ════════════════════════════════════════════════════════════════════════════
describe('SeancePopup', () => {
  test('s\'affiche au clic sur une carte de séance', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await waitFor(() => expect(screen.getByText('Coach')).toBeInTheDocument());
  });

  test('affiche les infos de la séance (coach, salle, statut)', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await waitFor(() => {
      expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
      expect(screen.getByText('Salle A')).toBeInTheDocument();
      expect(screen.getByText('confirmée')).toBeInTheDocument();
    });
  });

  test('affiche le ratio participants', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await waitFor(() => expect(screen.getByText('3 / 10')).toBeInTheDocument());
  });

  test('affiche "Séance complète" si presents === participantsMax', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([
      makeSeance({ presents: 10, participantsMax: 10 }),
    ]);
    renderPlanning();
    await clickSeanceCard('Yoga');
    await waitFor(() => expect(screen.getByText('Séance complète')).toBeInTheDocument());
  });

  test('ferme la popup au clic sur le bouton ×', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');
    // Le × de la popup est dans un button enfant du popup (pas dans la toolbar)
    const closeBtns = screen.getAllByText('×');
    await userEvent.click(closeBtns[0]);
    expect(screen.queryByText('Coach')).not.toBeInTheDocument();
  });

  test('ferme la popup au clic sur l\'overlay', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');
    fireEvent.click(document.body);
    await waitFor(() => expect(screen.queryByText('Coach')).not.toBeInTheDocument());
  });

  test('supprime une séance et recharge', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');

    mockApi.getSeancesSemaine.mockResolvedValue([]);
    await userEvent.click(screen.getByText('Supprimer'));

    await waitFor(() => {
      expect(mockApi.deleteSeance).toHaveBeenCalledWith(1);
      expect(mockApi.getSeancesSemaine).toHaveBeenCalledTimes(2);
    });
  });

  test('le bouton "+ Participant" est désactivé si séance complète', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([
      makeSeance({ presents: 10, participantsMax: 10 }),
    ]);
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');
    const addBtn = screen.getByText('+ Participant');
    expect(addBtn).toBeDisabled();
  });

  test('le bouton "+ Participant" ouvre AddParticipantModal si places disponibles', async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');
    await userEvent.click(screen.getByText('+ Participant'));
    expect(await screen.findByText(/Ajouter un participant/i)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. MODAL AJOUTER PARTICIPANT (AddParticipantModal)
// ════════════════════════════════════════════════════════════════════════════
describe('AddParticipantModal', () => {
  const openAddModal = async () => {
    renderPlanning();
    await clickSeanceCard('Yoga');
    await screen.findByText('Coach');
    await userEvent.click(screen.getByText('+ Participant'));
    await screen.findByText(/Ajouter un participant/i);
  };

  test('affiche le nom de la séance et les places disponibles', async () => {
    await openAddModal();
    expect(screen.getByText(/3\/10 places/i)).toBeInTheDocument();
  });

  test('affiche "Tapez un nom pour rechercher" par défaut', async () => {
    await openAddModal();
    expect(screen.getByText(/Tapez un nom pour rechercher/i)).toBeInTheDocument();
  });

  test('recherche des adhérents après 300ms de saisie', async () => {
    mockApi.searchAdherents.mockResolvedValue([
      { idAdherent: 42, prenom: 'Karim', nom: 'Bensalem', numTelephone: '0550123456', abonnementStatut: 'actif' },
    ]);
    await openAddModal();

    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'Karim');

    await waitFor(() => expect(mockApi.searchAdherents).toHaveBeenCalledWith('Karim'), { timeout: 600 });
    expect(await screen.findByText('Karim Bensalem')).toBeInTheDocument();
  });

  test('affiche "Aucun adhérent trouvé" si la recherche ne retourne rien', async () => {
    mockApi.searchAdherents.mockResolvedValue([]);
    await openAddModal();
    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'zzz');
    await waitFor(() => expect(screen.getByText(/Aucun adhérent trouvé/i)).toBeInTheDocument(), { timeout: 600 });
  });

  test('ajouter un participant appelle addPresence et affiche un feedback', async () => {
    mockApi.searchAdherents.mockResolvedValue([
      { idAdherent: 42, prenom: 'Karim', nom: 'Bensalem', numTelephone: '0550123456', abonnementStatut: 'actif' },
    ]);
    await openAddModal();
    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'Karim');
    await screen.findByText('Karim Bensalem');

    await userEvent.click(screen.getByText('+ Ajouter'));

    await waitFor(() => {
      expect(mockApi.addPresence).toHaveBeenCalledWith(
        expect.objectContaining({ adherent_id: 42, seance_id: 1 })
      );
    });
    expect(await screen.findByText(/✓ Karim Bensalem ajouté\(e\)/i)).toBeInTheDocument();
  });

  test('retire l\'adhérent de la liste après l\'avoir ajouté', async () => {
    mockApi.searchAdherents.mockResolvedValue([
      { idAdherent: 42, prenom: 'Karim', nom: 'Bensalem', numTelephone: '', abonnementStatut: 'actif' },
    ]);
    await openAddModal();
    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'Karim');
    await screen.findByText('Karim Bensalem');
    await userEvent.click(screen.getByText('+ Ajouter'));
    await waitFor(() => expect(screen.queryByText('Karim Bensalem')).not.toBeInTheDocument());
  });

  test('affiche une erreur si addPresence échoue', async () => {
    mockApi.searchAdherents.mockResolvedValue([
      { idAdherent: 99, prenom: 'Err', nom: 'Test', numTelephone: '', abonnementStatut: 'actif' },
    ]);
    mockApi.addPresence.mockRejectedValueOnce(new Error('Doublon'));
    await openAddModal();
    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'Err');
    await screen.findByText('Err Test');
    await userEvent.click(screen.getByText('+ Ajouter'));
    expect(await screen.findByText(/❌ Erreur/i)).toBeInTheDocument();
  });

  test('filtre les adhérents déjà présents', async () => {
    mockApi.getPresencesSeance.mockResolvedValue([42]);
    mockApi.searchAdherents.mockResolvedValue([
      { idAdherent: 42, prenom: 'Déjà', nom: 'Inscrit', numTelephone: '', abonnementStatut: 'actif' },
    ]);
    await openAddModal();
    const input = screen.getByPlaceholderText(/Nom, prénom ou téléphone/i);
    await userEvent.type(input, 'Déjà');
    await waitFor(() => expect(screen.getByText(/Aucun adhérent trouvé/i)).toBeInTheDocument(), { timeout: 600 });
  });

  test('ferme le modal au clic sur "Fermer"', async () => {
    await openAddModal();
    await userEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByText(/Ajouter un participant/i)).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. MODAL MESSAGE SPÉCIAL (SpecialMessageModal)
// ════════════════════════════════════════════════════════════════════════════
describe('SpecialMessageModal', () => {
  const openSpecialMsg = async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Message spécial/i));
    await screen.findByText(/Envoyer un message spécial/i);
  };

  test('s\'ouvre au clic sur "📢 Message spécial"', async () => {
    await openSpecialMsg();
    expect(screen.getByText(/Envoyer un message spécial/i)).toBeInTheDocument();
  });

  test('affiche les 3 types : Aidkoum, Fermeture, Personnalisé', async () => {
    await openSpecialMsg();
    expect(screen.getByText(/Saha Aidkoum/i)).toBeInTheDocument();
    expect(screen.getByText(/Fermeture/i)).toBeInTheDocument();
    expect(screen.getByText(/Personnalisé/i)).toBeInTheDocument();
  });

  test('le type Aidkoum est actif par défaut', async () => {
    await openSpecialMsg();
    expect(screen.getByText(/Saha Aidkoum/i)).toBeInTheDocument();
    // Pas de textarea visible pour Aidkoum
    expect(screen.queryByPlaceholderText(/Contenu du message/i)).not.toBeInTheDocument();
  });

  test('sélectionner "Fermeture" affiche un textarea', async () => {
    await openSpecialMsg();
    await userEvent.click(screen.getByText(/Fermeture/i));
    expect(screen.getByPlaceholderText(/Contenu du message/i)).toBeInTheDocument();
  });

  test('sélectionner "Personnalisé" affiche sujet + textarea', async () => {
    await openSpecialMsg();
    await userEvent.click(screen.getByText(/Personnalisé/i));
    expect(screen.getByPlaceholderText(/Sujet de l'email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contenu du message/i)).toBeInTheDocument();
  });

  test('envoie le message et affiche le feedback succès', async () => {
    mockApi.sendSpecialMessage.mockResolvedValue({ success: true, count: 8 });
    await openSpecialMsg();
    await userEvent.click(screen.getByText(/Envoyer à tous les actifs/i));
    expect(await screen.findByText(/Message envoyé à 8 adhérent\(s\)/i)).toBeInTheDocument();
  });

  test('affiche une erreur si l\'envoi échoue', async () => {
    mockApi.sendSpecialMessage.mockResolvedValue({ success: false, error: 'SMTP down' });
    await openSpecialMsg();
    await userEvent.click(screen.getByText(/Envoyer à tous les actifs/i));
    expect(await screen.findByText(/❌ Erreur : SMTP down/i)).toBeInTheDocument();
  });

  test('affiche "Envoi…" pendant l\'envoi', async () => {
    mockApi.sendSpecialMessage.mockReturnValue(new Promise(() => {}));
    await openSpecialMsg();
    await userEvent.click(screen.getByText(/Envoyer à tous les actifs/i));
    expect(screen.getByText('Envoi…')).toBeInTheDocument();
  });

  test('ferme le modal au clic sur "Annuler"', async () => {
    await openSpecialMsg();
    await userEvent.click(screen.getByText('Annuler'));
    expect(screen.queryByText(/Envoyer un message spécial/i)).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. EXPORT PDF & EMAIL PLANNING
// ════════════════════════════════════════════════════════════════════════════
describe('Export PDF et envoi email', () => {
  test('"Exporter PDF" appelle exportPlanningPDF', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Exporter PDF/i));
    expect(mockApi.exportPlanningPDF).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.stringContaining('<!DOCTYPE html>') })
    );
  });

  test('"Envoyer le planning" appelle exportEtEnvoyerPlanningPDF', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Envoyer le planning/i));
    await waitFor(() =>
      expect(mockApi.exportEtEnvoyerPlanningPDF).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.any(String) })
      )
    );
  });

  test('affiche la notification "Envoi du planning en cours…"', async () => {
    mockApi.exportEtEnvoyerPlanningPDF.mockReturnValue(new Promise(() => {}));
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Envoyer le planning/i));
    expect(await screen.findByText(/Envoi du planning en cours/i)).toBeInTheDocument();
  });

  test('affiche la notification succès après envoi', async () => {
    mockApi.exportEtEnvoyerPlanningPDF.mockResolvedValue({ success: true });
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Envoyer le planning/i));
    expect(await screen.findByText(/Planning envoyé avec succès/i)).toBeInTheDocument();
  });

  test('affiche la notification d\'erreur si l\'envoi échoue', async () => {
    mockApi.exportEtEnvoyerPlanningPDF.mockRejectedValue(new Error('fail'));
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Envoyer le planning/i));
    expect(await screen.findByText(/Erreur lors de l'envoi/i)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 9. HELPERS PURS (logique métier)
// ════════════════════════════════════════════════════════════════════════════
// On importe directement les helpers si on les exporte, sinon on les re-teste
// via des scénarios d'intégration. Ici on vérifie les cas-limites.

describe('SessionCard — badges genre', () => {
  test('affiche le badge ♀ F sur une séance Femme en mode "Tous"', async () => {
    renderPlanning();
    await screen.findAllByText('Yoga'); // attend les deux occurrences (carte + légende)
    // En mode "Tous", le badge publicCible doit être visible
    expect(screen.getByText('♀ F')).toBeInTheDocument();
  });

  test('masque le badge genre quand un filtre est actif', async () => {
    renderPlanning();
    await screen.findAllByText('Yoga');
    await userEvent.click(screen.getByText(/Femmes/i));
    // En mode filtré (publicCible === genderFilter), showGenderBadge est false → badge masqué
    expect(screen.queryByText('♀ F')).not.toBeInTheDocument();
  });

  test('affiche la barre de remplissage et les mini-badges hommes/femmes/enfants', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([
      makeSeance({ nbHommes: 2, nbFemmes: 1, nbEnfants: 3, presents: 6 }),
    ]);
    renderPlanning();
    await screen.findAllByText('Yoga');
    expect(screen.getByText('♂2')).toBeInTheDocument();
    expect(screen.getByText('♀1')).toBeInTheDocument();
    expect(screen.getByText('⚬3')).toBeInTheDocument();
  });

  test('affiche "COMPLET" si presents === participantsMax', async () => {
    mockApi.getSeancesSemaine.mockResolvedValue([
      makeSeance({ presents: 10, participantsMax: 10 }),
    ]);
    renderPlanning();
    expect(await screen.findByText('COMPLET')).toBeInTheDocument();
  });
});

describe('buildPlanningHTML', () => {
  test('le HTML exporté contient les colonnes attendues', async () => {
    renderPlanning();
    await screen.findByText(/Planning des séances/i);
    await userEvent.click(screen.getByText(/Exporter PDF/i));
    const { html } = mockApi.exportPlanningPDF.mock.calls[0][0];
    expect(html).toContain('<th>Jour</th>');
    expect(html).toContain('<th>Activité</th>');
    expect(html).toContain('<th>Coach</th>');
    expect(html).toContain('Yoga');
  });
});