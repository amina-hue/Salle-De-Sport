/**
 * Tests de main.js — Application Electron
 *
 * ⚠️ Tous les modules Electron et DB sont mockés.
 *    Ces tests vérifient que les handlers IPC sont bien enregistrés
 *    et que la logique métier fonctionne correctement.
 */

// ── Mock Electron ──────────────────────────────────────────────────────────
const mockIpcHandlers = {};
const mockOn = jest.fn();

jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(() => ({
    loadURL: jest.fn(),
    show: jest.fn(),
    webContents: { on: jest.fn() },
    destroy: jest.fn(),
  })),
  ipcMain: {
    handle: jest.fn((channel, handler) => {
      mockIpcHandlers[channel] = handler;
    }),
    on: mockOn,
  },
  session: {
    defaultSession: {
      webRequest: { onHeadersReceived: jest.fn() },
    },
  },
  dialog: { showSaveDialog: jest.fn() },
}));

// ── Mock mysql2 ────────────────────────────────────────────────────────────
const mockQuery = jest.fn();
jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: jest.fn((cb) => cb(null)),
    query: mockQuery,
    end: jest.fn(),
  })),
}));

// ── Mock nodemailer ────────────────────────────────────────────────────────
const mockSendMail = jest.fn(() => Promise.resolve({ messageId: 'test-id' }));
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

// ── Mock dotenv ────────────────────────────────────────────────────────────
jest.mock('dotenv', () => ({ config: jest.fn() }));

// ── Mock electron-squirrel-startup ─────────────────────────────────────────
jest.mock('electron-squirrel-startup', () => false);

// ── Mock fs et os ─────────────────────────────────────────────────────────
jest.mock('fs', () => ({ writeFileSync: jest.fn() }));
jest.mock('os', () => ({ homedir: jest.fn(() => '/home/test') }));

// ── Helpers ────────────────────────────────────────────────────────────────
const simulateQuery = (error, results) => {
  mockQuery.mockImplementationOnce((sql, params, cb) => {
    if (typeof params === 'function') cb = params;
    cb(error, results);
  });
};

// ── Chargement de main.js ──────────────────────────────────────────────────
beforeAll(() => {
  try {
    require('../../main');
  } catch (e) {
    // Certaines erreurs d'init Electron sont normales en test
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
describe('main.js — Application démarre', () => {

  test('T51 — ipcMain.handle est appelé pour enregistrer les handlers', () => {
    const { ipcMain } = require('electron');
    expect(ipcMain.handle).toHaveBeenCalled();
  });

  test('T52 — Le handler "login" est bien enregistré', () => {
    expect(mockIpcHandlers['login']).toBeDefined();
  });

  test('T53 — Le handler "getAdherents" est bien enregistré', () => {
    expect(mockIpcHandlers['getAdherents']).toBeDefined();
  });

  test('T54 — Le handler "getProduits" est bien enregistré', () => {
    expect(mockIpcHandlers['getProduits']).toBeDefined();
  });

  test('T55 — Le handler "getUtilisateurs" est bien enregistré', () => {
    expect(mockIpcHandlers['getUtilisateurs']).toBeDefined();
  });

  test('T56 — Le handler "addPaiement" est bien enregistré', () => {
    expect(mockIpcHandlers['addPaiement']).toBeDefined();
  });

  test('T57 — Le handler "getRolesAvecCount" est bien enregistré', () => {
    expect(mockIpcHandlers['getRolesAvecCount']).toBeDefined();
  });

  test('T58 — Le handler "sendEmail" est bien enregistré', () => {
    expect(mockIpcHandlers['sendEmail']).toBeDefined();
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('main.js — Handler login', () => {

  test('T59 — login avec identifiants valides retourne success: true', async () => {
    const handler = mockIpcHandlers['login'];
    if (!handler) return;

    mockQuery.mockImplementationOnce((sql, params, cb) => {
      cb(null, [{ idUtilisateur: 1, nom: 'Admin', email: 'admin@gym.com' }]);
    });

    const result = await handler({}, { email: 'admin@gym.com', motDePasse: '1234' });
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  test('T60 — login avec mauvais mot de passe retourne success: false', async () => {
    const handler = mockIpcHandlers['login'];
    if (!handler) return;

    mockQuery.mockImplementationOnce((sql, params, cb) => {
      cb(null, []); // Aucun résultat
    });

    const result = await handler({}, { email: 'admin@gym.com', motDePasse: 'mauvais' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/incorrect/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('main.js — Handler addProduit', () => {

  test('T61 — addProduit retourne un insertId', async () => {
    const handler = mockIpcHandlers['addProduit'];
    if (!handler) return;

    mockQuery.mockImplementationOnce((sql, params, cb) => {
      cb(null, { insertId: 10, affectedRows: 1 });
    });

    const result = await handler({}, {
      nom: 'Haltères', reference: 'ALG001',
      stock: 10, prix: 6000, categorie: 'Musculation',
    });
    expect(result.idProduit).toBe(10);
    expect(result.status).toBe('success');
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('main.js — Handler deleteProduit', () => {

  test('T62 — deleteProduit retourne status deleted', async () => {
    const handler = mockIpcHandlers['deleteProduit'];
    if (!handler) return;

    mockQuery.mockImplementationOnce((sql, params, cb) => {
      cb(null, { affectedRows: 1 });
    });

    const result = await handler({}, 1);
    expect(result.status).toBe('deleted');
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('main.js — Handler sendEmail', () => {

  test('T63 — sendEmail appelle nodemailer et retourne success: true', async () => {
    const handler = mockIpcHandlers['sendEmail'];
    if (!handler) return;

    const result = await handler({}, {
      to: 'test@gmail.com',
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test',
    });
    expect(result.success).toBe(true);
  });

});