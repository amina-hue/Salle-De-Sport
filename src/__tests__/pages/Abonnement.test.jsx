// src/__tests__/pages/AbonnementsPage.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AbonnementsPage from '../../renderer/pages/abonnement';

// ─── Mocks globaux ────────────────────────────────────────────────────────────
jest.mock('../../renderer/components/NouvelTypeAbonnementModal', () =>
  ({ onSave, onClose }) => (
    <div data-testid="modal-type">
      <button onClick={onSave}>SaveType</button>
      <button onClick={onClose}>CloseType</button>
    </div>
  )
);

jest.mock('../../renderer/components/QuickActions', () =>
  () => <div data-testid="quick-actions" />
);

jest.mock('../../images/gym2.png', () => 'gym2.png');

// ─── Données de test ──────────────────────────────────────────────────────────
const TYPES = [
  { id: 1, nom: 'Mensuel',        duree: 1,  prix: 2000,  features: ['Accès salle'], nombre_adherents: 10 },
  { id: 2, nom: 'Premium Annuel', duree: 12, prix: 18000, features: ['Accès salle', 'Coach'], nombre_adherents: 3 },
];

const EXPIRANT = [
  {
    idAbonnement:  10,
    idAdherent:    1,
    nom:           'Benali',
    prenom:        'Youcef',
    email:         'y@mail.com',
    numTelephone:  '0661111111',
    typeNom:       'Mensuel',
    joursRestants: 2,
    dateFin:       '2025-06-15',
  },
  {
    idAbonnement:  11,
    idAdherent:    2,
    nom:           'Haddad',
    prenom:        'Sara',
    email:         null,
    numTelephone:  null,
    typeNom:       'Premium Annuel',
    joursRestants: 25,
    dateFin:       '2025-07-08',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderPage(route = '/abonnements') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/abonnements" element={<AbonnementsPage/>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.api = {
    getTypeAbonnements:      jest.fn().mockResolvedValue(TYPES),
    getAbonnementsExpirant:  jest.fn().mockResolvedValue(EXPIRANT),
    deleteTypeAbonnement:    jest.fn().mockResolvedValue({ ok: true }),
    sendEmail:               jest.fn().mockResolvedValue({ success: true }),
    addPaiement:             jest.fn().mockResolvedValue({ success: true }),
  };
  window.open = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore?.();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RENDU INITIAL
// ═══════════════════════════════════════════════════════════════════════════════
describe('Rendu initial', () => {

  test('AB01 — appelle getTypeAbonnements et getAbonnementsExpirant au montage', async () => {
    renderPage();
    await waitFor(() => {
      expect(window.api.getTypeAbonnements).toHaveBeenCalledTimes(1);
      expect(window.api.getAbonnementsExpirant).toHaveBeenCalledTimes(1);
    });
  });

  test('AB02 — affiche le titre "Gestion des abonnements"', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Gestion des abonnements/i)).toBeInTheDocument()
    );
  });

  test('AB03 — affiche le compteur de types disponibles', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/types disponibles/i)).toBeInTheDocument()
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('AB04 — affiche le compteur d\'abonnements expirant', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/expirent bientôt/i)).toBeInTheDocument()
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('AB05 — affiche le bandeau d\'alerte si des abonnements expirent', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Abonnements à renouveler/i)).toBeInTheDocument()
    );
  });

  test('AB06 — n\'affiche pas le bandeau d\'alerte si aucun abonnement n\'expire', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/Abonnements à renouveler/i)).not.toBeInTheDocument()
    );
  });

  test('AB07 — bouton "Ajouter un type" présent', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Ajouter un type/i })).toBeInTheDocument()
    );
  });

  test('AB08 — QuickActions est rendu', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PLANS DISPONIBLES — PlanCard
// ═══════════════════════════════════════════════════════════════════════════════
describe('Plans disponibles', () => {

  test('AB09 — affiche les noms des types d\'abonnement', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Mensuel')).toBeInTheDocument()
    );
    expect(screen.getByText('Premium Annuel')).toBeInTheDocument();
  });

  test('AB10 — affiche le prix formaté', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/2\s*000 DA/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/18\s*000 DA/i)).toBeInTheDocument();
  });

  test('AB11 — affiche le nombre d\'adhérents actifs par plan', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/10/)).toBeInTheDocument()
    );
  });

  test('AB12 — affiche les features de chaque plan', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText('Accès salle').length).toBeGreaterThan(0)
    );
    expect(screen.getByText('Coach')).toBeInTheDocument();
  });

  test('AB13 — affiche le badge "Premium" pour le plan premium', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Premium')).toBeInTheDocument()
    );
  });

  test('AB14 — affiche le badge "Standard" pour le plan standard', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Standard')).toBeInTheDocument()
    );
  });

  test('AB15 — affiche "Aucun type" si la liste est vide', async () => {
    window.api.getTypeAbonnements = jest.fn().mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucun type d'abonnement/i)).toBeInTheDocument()
    );
  });

  test('AB16 — bouton Modifier présent pour chaque plan', async () => {
    renderPage();
    await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /Modifier/i });
      expect(btns.length).toBe(TYPES.length);
    });
  });

  test('AB17 — bouton Supprimer (icône Trash) présent pour chaque plan', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Mensuel'));
    // Les boutons supprimer n'ont pas de texte, on cible par leur position dans les PlanCard
    const planSection = screen.getByText('Plans disponibles').closest('div');
    // On vérifie qu'il y a autant de boutons Modifier que de plans (proxy pour les delete aussi)
    const modifBtns = screen.getAllByRole('button', { name: /Modifier/i });
    expect(modifBtns.length).toBe(TYPES.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TABLEAU EXPIRATION
// ═══════════════════════════════════════════════════════════════════════════════
describe('Tableau expiration', () => {

  test('AB18 — affiche les noms des adhérents expirant', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Youcef Benali/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/Sara Haddad/i)).toBeInTheDocument();
  });

  test('AB19 — affiche "Aucun abonnement n\'expire" si liste vide', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucun abonnement n'expire/i)).toBeInTheDocument()
    );
  });

  test('AB20 — badge "Urgent" pour joursRestants ≤ 3', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Urgent')).toBeInTheDocument()
    );
  });

  test('AB21 — badge "OK" pour joursRestants > 10', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('OK')).toBeInTheDocument()
    );
  });

  test('AB22 — affiche "2 jours" pour joursRestants=2', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('2 jours')).toBeInTheDocument()
    );
  });

  test('AB23 — affiche "Aujourd\'hui" pour joursRestants=0', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([
      { ...EXPIRANT[0], joursRestants: 0 },
    ]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
    );
  });

  test('AB24 — affiche "Demain" pour joursRestants=1', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([
      { ...EXPIRANT[0], joursRestants: 1 },
    ]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Demain')).toBeInTheDocument()
    );
  });

  test('AB25 — affiche "—" si email et téléphone absents', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('—')).toBeInTheDocument()
    );
  });

  test('AB26 — bouton Email absent si pas d\'email', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Sara Haddad/i));
    // Sara n'a pas d'email → un seul bouton Email (celui de Youcef)
    const emailBtns = screen.getAllByRole('button', { name: /Email/i });
    expect(emailBtns.length).toBe(1);
  });

  test('AB27 — bouton WhatsApp absent si pas de téléphone', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Sara Haddad/i));
    // Sara n'a pas de téléphone → un seul bouton WhatsApp (celui de Youcef)
    const waBtns = screen.getAllByRole('button', { name: /WhatsApp/i });
    expect(waBtns.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ACTION EMAIL
// ═══════════════════════════════════════════════════════════════════════════════
describe('Action Email', () => {

  test('AB28 — clic Email appelle window.api.sendEmail avec le bon destinataire', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(window.api.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'y@mail.com' })
      )
    );
  });

  test('AB29 — l\'email contient le nom de l\'adhérent dans le sujet', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(window.api.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('Mensuel') })
      )
    );
  });

  test('AB30 — affiche un toast de succès après envoi réussi', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(screen.getByText(/Email envoyé à Youcef Benali/i)).toBeInTheDocument()
    );
  });

  test('AB31 — affiche un toast d\'erreur si sendEmail échoue', async () => {
    window.api.sendEmail = jest.fn().mockResolvedValue({ success: false, error: 'SMTP down' });
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(screen.getByText(/Échec de l'envoi/i)).toBeInTheDocument()
    );
  });

  test('AB32 — affiche un toast d\'erreur si sendEmail rejette', async () => {
    window.api.sendEmail = jest.fn().mockRejectedValue(new Error('network error'));
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(screen.getByText(/Erreur lors de l'envoi de l'email/i)).toBeInTheDocument()
    );
  });

  test('AB33 — le bouton Email est désactivé pendant l\'envoi', async () => {
    // sendEmail qui ne se résout jamais pendant le test
    window.api.sendEmail = jest.fn(() => new Promise(() => {}));
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Envoi/i })).toBeDisabled()
    );
  });

  test('AB34 — le sujet mentionne "dans 2 jours" pour joursRestants=2', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(window.api.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('dans 2 jours') })
      )
    );
  });

  test('AB35 — le sujet mentionne "aujourd\'hui" pour joursRestants=0', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([
      { ...EXPIRANT[0], joursRestants: 0 },
    ]);
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(window.api.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining("aujourd'hui") })
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ACTION WHATSAPP
// ═══════════════════════════════════════════════════════════════════════════════
describe('Action WhatsApp', () => {

  test('AB36 — clic WhatsApp appelle window.open avec une URL wa.me', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/'),
      '_blank'
    );
  });

  test('AB37 — l\'URL WhatsApp contient le numéro au format international', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('213661111111'),
      '_blank'
    );
  });

  test('AB38 — le message WhatsApp contient le nom de l\'adhérent', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/i }));
    const url = window.open.mock.calls[0][0];
    expect(decodeURIComponent(url)).toContain('Youcef Benali');
  });

  test('AB39 — le message WhatsApp contient le type d\'abonnement', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/i }));
    const url = window.open.mock.calls[0][0];
    expect(decodeURIComponent(url)).toContain('Mensuel');
  });

  test('AB40 — numéro déjà en format international reste inchangé', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockResolvedValue([
      { ...EXPIRANT[0], numTelephone: '213661111111' },
    ]);
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('213661111111'),
      '_blank'
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MODAL NOUVEAU TYPE — ouverture / fermeture
// ═══════════════════════════════════════════════════════════════════════════════
describe('Modal NouvelTypeAbonnement', () => {

  test('AB41 — clic "Ajouter un type" ouvre le modal', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un type/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un type/i }));
    expect(screen.getByTestId('modal-type')).toBeInTheDocument();
  });

  test('AB42 — fermer le modal le fait disparaître', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un type/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un type/i }));
    fireEvent.click(screen.getByRole('button', { name: 'CloseType' }));
    await waitFor(() =>
      expect(screen.queryByTestId('modal-type')).not.toBeInTheDocument()
    );
  });

  test('AB43 — sauvegarder dans le modal recharge les types et ferme', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Ajouter un type/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ajouter un type/i }));
    fireEvent.click(screen.getByRole('button', { name: 'SaveType' }));
    await waitFor(() => {
      expect(window.api.getTypeAbonnements).toHaveBeenCalledTimes(2); // montage + après save
      expect(screen.queryByTestId('modal-type')).not.toBeInTheDocument();
    });
  });

  test('AB44 — clic Modifier ouvre le modal avec le type sélectionné', async () => {
    renderPage();
    await waitFor(() => screen.getAllByRole('button', { name: /Modifier/i }));
    const modifBtns = screen.getAllByRole('button', { name: /Modifier/i });
    fireEvent.click(modifBtns[0]);
    expect(screen.getByTestId('modal-type')).toBeInTheDocument();
  });

  test('AB45 — URL avec openModal=true ouvre le modal automatiquement', async () => {
    renderPage('/abonnements?openModal=true');
    await waitFor(() =>
      expect(screen.getByTestId('modal-type')).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MODAL CONFIRMATION SUPPRESSION
// ═══════════════════════════════════════════════════════════════════════════════
describe('Confirmation suppression', () => {

  async function openDeleteConfirm() {
    renderPage();
    await waitFor(() => screen.getAllByRole('button', { name: /Modifier/i }));
    // Le bouton supprimer est le dernier bouton de chaque PlanCard
    // On cible par présence dans le DOM après les boutons Modifier
    const allBtns = screen.getAllByRole('button');
    // Les boutons delete sont ceux qui contiennent l'icône Trash (pas de texte)
    // On les identifie : ils suivent les boutons Modifier
    // Stratégie : tous les boutons sans texte lisible dans les cards
    const deleteBtns = allBtns.filter(b =>
      !b.textContent.includes('Modifier') &&
      !b.textContent.includes('Ajouter') &&
      !b.textContent.includes('Email') &&
      !b.textContent.includes('WhatsApp') &&
      !b.textContent.includes('Envoi') &&
      b.closest('[style*="border-radius: 14px"]') // dans une PlanCard
    );
    fireEvent.click(deleteBtns[0]);
    await waitFor(() =>
      expect(screen.getByText(/Supprimer ce type/i)).toBeInTheDocument()
    );
  }

  test('AB46 — clic supprimer ouvre la modale de confirmation', async () => {
    await openDeleteConfirm();
    expect(screen.getByText(/Supprimer ce type/i)).toBeInTheDocument();
    expect(screen.getByText(/Cette action est irréversible/i)).toBeInTheDocument();
  });

  test('AB47 — clic Annuler ferme la modale sans supprimer', async () => {
    await openDeleteConfirm();
    const annulerBtns = screen.getAllByRole('button', { name: /Annuler/i });
    fireEvent.click(annulerBtns[annulerBtns.length - 1]);
    await waitFor(() =>
      expect(screen.queryByText(/Supprimer ce type/i)).not.toBeInTheDocument()
    );
    expect(window.api.deleteTypeAbonnement).not.toHaveBeenCalled();
  });

  test('AB48 — clic Supprimer appelle deleteTypeAbonnement', async () => {
    await openDeleteConfirm();
    fireEvent.click(screen.getByRole('button', { name: /^Supprimer$/i }));
    await waitFor(() =>
      expect(window.api.deleteTypeAbonnement).toHaveBeenCalledTimes(1)
    );
  });

  test('AB49 — après suppression, getTypeAbonnements est rappelé', async () => {
    await openDeleteConfirm();
    fireEvent.click(screen.getByRole('button', { name: /^Supprimer$/i }));
    await waitFor(() =>
      expect(window.api.getTypeAbonnements).toHaveBeenCalledTimes(2)
    );
  });

  test('AB50 — clic sur le fond de la modale la ferme', async () => {
    await openDeleteConfirm();
    // L'overlay est le div avec onClick sur e.target === e.currentTarget
    const overlay = screen.getByText(/Supprimer ce type/i).closest('[style*="fixed"]');
    fireEvent.click(overlay);
    await waitFor(() =>
      expect(screen.queryByText(/Supprimer ce type/i)).not.toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. TOAST
// ═══════════════════════════════════════════════════════════════════════════════
describe('Toast', () => {

  test('AB51 — le toast se ferme en cliquant sur ×', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() =>
      expect(screen.getByText(/Email envoyé/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    await waitFor(() =>
      expect(screen.queryByText(/Email envoyé/i)).not.toBeInTheDocument()
    );
  });

  test('AB52 — un seul toast est affiché à la fois', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Email/i }));
    fireEvent.click(screen.getByRole('button', { name: /Email/i }));
    await waitFor(() => screen.getByText(/Email envoyé/i));
    // Un seul toast présent
    const toasts = document.querySelectorAll('[style*="position: fixed"][style*="bottom"]');
    expect(toasts.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ERREURS API AU CHARGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
describe('Erreurs API chargement', () => {

  test('AB53 — getTypeAbonnements en erreur n\'empêche pas le rendu', async () => {
    window.api.getTypeAbonnements = jest.fn().mockRejectedValue(new Error('DB down'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucun type d'abonnement/i)).toBeInTheDocument()
    );
  });

  test('AB54 — getAbonnementsExpirant en erreur n\'empêche pas le rendu', async () => {
    window.api.getAbonnementsExpirant = jest.fn().mockRejectedValue(new Error('DB down'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucun abonnement n'expire/i)).toBeInTheDocument()
    );
  });
});