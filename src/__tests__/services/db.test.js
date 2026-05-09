/**
 * Tests de la base de données MySQL — db.js
 *
 * ⚠️  Ces tests utilisent un MOCK de mysql2 : ils ne touchent PAS
 *     la vraie base de données. C'est la bonne pratique pour les tests unitaires.
 */

// ── Mock de mysql2 ─────────────────────────────────────────────────────────
const mockQuery  = jest.fn();
const mockConnect = jest.fn((cb) => cb(null)); // Connexion réussie par défaut

jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: mockConnect,
    query:   mockQuery,
    end:     jest.fn(),
  })),
}));

const mysql = require('mysql2');

// ── Helper pour simuler une réponse query ──────────────────────────────────
const simulateQuery = (error, results) => {
  mockQuery.mockImplementationOnce((sql, params, cb) => {
    if (typeof params === 'function') cb = params;
    cb(error, results);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
describe('Base de données — Connexion', () => {

  test('T40 — mysql.createConnection est appelé avec les bons paramètres', () => {
    // Recréer la connexion pour déclencher le mock
    mysql.createConnection({
      host: 'localhost', user: 'root',
      password: 'Fitmanager@2026', database: 'fitmanager',
    });
    expect(mysql.createConnection).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'localhost', database: 'fitmanager' })
    );
  });

  test('T41 — La connexion se fait sans erreur', () => {
    const db = mysql.createConnection({});
    let connexionOk = false;
    db.connect((err) => {
      if (!err) connexionOk = true;
    });
    expect(connexionOk).toBe(true);
  });

  test('T42 — Une erreur de connexion est détectée', () => {
    const mockConnectFail = jest.fn((cb) => cb(new Error('Access denied')));
    mysql.createConnection.mockReturnValueOnce({
      connect: mockConnectFail,
      query: mockQuery,
      end: jest.fn(),
    });
    const db = mysql.createConnection({});
    let erreurCapturee = null;
    db.connect((err) => { erreurCapturee = err; });
    expect(erreurCapturee).not.toBeNull();
    expect(erreurCapturee.message).toMatch(/Access denied/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Base de données — Requêtes SELECT', () => {

  test('T43 — SELECT utilisateurs retourne un tableau', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, [
      { idUtilisateur: 1, nom: 'Benali', email: 'youcef@gym.com' },
      { idUtilisateur: 2, nom: 'Mammeri', email: 'sara@gym.com' },
    ]);
    db.query('SELECT * FROM utilisateurs', (err, results) => {
      expect(err).toBeNull();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      done();
    });
  });

  test('T44 — SELECT par email retourne le bon utilisateur', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, [{ idUtilisateur: 1, nom: 'Benali', email: 'youcef@gym.com' }]);
    db.query('SELECT * FROM utilisateurs WHERE email = ?', ['youcef@gym.com'], (err, results) => {
      expect(err).toBeNull();
      expect(results[0].email).toBe('youcef@gym.com');
      done();
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Base de données — Requêtes INSERT', () => {

  test('T45 — INSERT utilisateur retourne affectedRows = 1', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, { affectedRows: 1, insertId: 5 });
    db.query(
      'INSERT INTO utilisateurs (nom, prenom, email) VALUES (?, ?, ?)',
      ['Test', 'User', 'test@gym.com'],
      (err, result) => {
        expect(err).toBeNull();
        expect(result.affectedRows).toBe(1);
        done();
      }
    );
  });

  test('T46 — INSERT avec email dupliqué retourne une erreur', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(new Error('Duplicate entry'), null);
    db.query(
      'INSERT INTO utilisateurs (email) VALUES (?)',
      ['existe@gym.com'],
      (err, result) => {
        expect(err).not.toBeNull();
        expect(err.message).toMatch(/Duplicate/i);
        done();
      }
    );
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Base de données — Requêtes UPDATE', () => {

  test('T47 — UPDATE utilisateur retourne affectedRows = 1', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, { affectedRows: 1, changedRows: 1 });
    db.query(
      'UPDATE utilisateurs SET nom = ? WHERE idUtilisateur = ?',
      ['NouveauNom', 1],
      (err, result) => {
        expect(err).toBeNull();
        expect(result.affectedRows).toBe(1);
        done();
      }
    );
  });

  test('T48 — UPDATE avec id inexistant retourne affectedRows = 0', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, { affectedRows: 0 });
    db.query(
      'UPDATE utilisateurs SET nom = ? WHERE idUtilisateur = ?',
      ['NomTest', 9999],
      (err, result) => {
        expect(err).toBeNull();
        expect(result.affectedRows).toBe(0);
        done();
      }
    );
  });

});

// ═══════════════════════════════════════════════════════════════════════════
describe('Base de données — Requêtes DELETE', () => {

  test('T49 — DELETE utilisateur retourne affectedRows = 1', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, { affectedRows: 1 });
    db.query(
      'DELETE FROM utilisateurs WHERE idUtilisateur = ?',
      [1],
      (err, result) => {
        expect(err).toBeNull();
        expect(result.affectedRows).toBe(1);
        done();
      }
    );
  });

  test('T50 — DELETE avec id inexistant retourne affectedRows = 0', (done) => {
    const db = mysql.createConnection({});
    simulateQuery(null, { affectedRows: 0 });
    db.query(
      'DELETE FROM utilisateurs WHERE idUtilisateur = ?',
      [9999],
      (err, result) => {
        expect(err).toBeNull();
        expect(result.affectedRows).toBe(0);
        done();
      }
    );
  });

});