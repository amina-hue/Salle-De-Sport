
const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');
const db = require('./db');

if (require('electron-squirrel-startup')) app.quit();

// ══════════════════════════════════════════════
//  FENÊTRE PRINCIPALE
// ══════════════════════════════════════════════

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 650,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
          "img-src 'self' data: https: http:; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "connect-src 'self' https: http:;"
        ]
      }
    });
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.on('did-finish-load', () => mainWindow.show());
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Helper : transforme un db.query callback en Promise ──────────────────────
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
  );

// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════

ipcMain.handle('login', async (_, { email, motDePasse }) => {
  const result = await query(
    'SELECT * FROM Utilisateur WHERE email = ? AND motDePasse = ?',
    [email, motDePasse]
  );
  if (!result.length) return { success: false, message: 'Email ou mot de passe incorrect' };
  return { success: true, user: result[0] };
});

// ══════════════════════════════════════════════
//  ADHÉRENTS
// ══════════════════════════════════════════════

ipcMain.handle('getAdherents', async () => {
  return query('SELECT * FROM Adherent ORDER BY dateCreation DESC');
});

ipcMain.handle('getAdherentDetail', async (_, id) => {
  const result = await query(
    `SELECT
       ad.*,
       ab.idAbonnement, ab.dateDebut, ab.dateFin, ab.statut AS abonnementStatut,
       t.nom AS typeNom, t.prix AS typePrix, t.duree
     FROM Adherent ad
     LEFT JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent AND ab.statut = 'actif'
     LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
     WHERE ad.idAdherent = ?
     ORDER BY ab.dateDebut DESC
     LIMIT 1`,
    [id]
  );
  return result[0] || null;
});

ipcMain.handle('getAdherentsAvecAbonnement', async () => {
  return query(
    `SELECT
       ad.*,
       ab.idAbonnement, ab.dateDebut, ab.dateFin, ab.statut AS abonnementStatut,
       t.nom AS typeNom, t.prix AS typePrix
     FROM Adherent ad
     LEFT JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent AND ab.statut = 'actif'
     LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
     ORDER BY ad.dateCreation DESC`
  );
});

ipcMain.handle('searchAdherents', async (_, q) => {
  const like = `%${q}%`;
  return query(
    `SELECT ad.*, ab.statut AS abonnementStatut, t.nom AS typeNom
     FROM Adherent ad
     LEFT JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent AND ab.statut = 'actif'
     LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
     WHERE ad.nom LIKE ? OR ad.prenom LIKE ? OR ad.email LIKE ? OR ad.numTelephone LIKE ?
     ORDER BY ad.nom ASC`,
    [like, like, like, like]
  );
});

ipcMain.handle('addAdherent', async (_, { nom, prenom, dateNaissance, numTelephone, email, sexe }) => {
  const result = await query(
    'INSERT INTO Adherent (nom, prenom, dateNaissance, numTelephone, email, sexe) VALUES (?, ?, ?, ?, ?, ?)',
    [nom, prenom, dateNaissance, numTelephone, email, sexe]
  );
  return { insertId: result.insertId };
});

ipcMain.handle('updateAdherent', async (_, { idAdherent, nom, prenom, dateNaissance, numTelephone, email, sexe }) => {
  return query(
    'UPDATE Adherent SET nom=?, prenom=?, dateNaissance=?, numTelephone=?, email=?, sexe=? WHERE idAdherent=?',
    [nom, prenom, dateNaissance, numTelephone, email, sexe, idAdherent]
  );
});

ipcMain.handle('updateAdherentPhoto', async (_, { idAdherent, photo }) => {
  return query('UPDATE Adherent SET photo = ? WHERE idAdherent = ?', [photo, idAdherent]);
});

ipcMain.handle('deleteAdherent', async (_, id) => {
  return query('DELETE FROM Adherent WHERE idAdherent=?', [id]);
});

ipcMain.handle('deleteAdherentComplet', async (_, id) => {
  // 1. Présences
  await query('DELETE FROM Presence WHERE adherent_id = ?', [id]);

  // 2. Paiements liés aux abonnements
  const abos = await query('SELECT idAbonnement FROM Abonnement WHERE adherent_id = ?', [id]);
  const aboIds = abos.map(a => a.idAbonnement);
  if (aboIds.length) {
    await query('DELETE FROM Paiement WHERE abonnement_id IN (?)', [aboIds]);
  }

  // 3. Abonnements
  await query('DELETE FROM Abonnement WHERE adherent_id = ?', [id]);

  // 4. Adhérent
  return query('DELETE FROM Adherent WHERE idAdherent = ?', [id]);
});

// ══════════════════════════════════════════════
//  STATISTIQUES ADHÉRENTS
// ══════════════════════════════════════════════

ipcMain.handle('getStatsAdherents', async () => {
  const result = await query(
    `SELECT
       COUNT(DISTINCT ad.idAdherent)                                  AS total,
       SUM(CASE WHEN ab.statut = 'actif'    THEN 1 ELSE 0 END)       AS actifs,
       SUM(CASE WHEN ab.statut = 'expiré'   THEN 1 ELSE 0 END)       AS expires,
       SUM(CASE WHEN ab.statut = 'suspendu' THEN 1 ELSE 0 END)       AS suspendus,
       SUM(CASE WHEN ad.sexe  = 'Homme'     THEN 1 ELSE 0 END)       AS hommes,
       SUM(CASE WHEN ad.sexe  = 'Femme'     THEN 1 ELSE 0 END)       AS femmes
     FROM Adherent ad
     LEFT JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent`
  );
  return result[0];
});

ipcMain.handle('getStatsPageAdherent', async () => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM Adherent)AS total,
       (SELECT COUNT(DISTINCT ad.idAdherent)
        FROM Adherent ad
        JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent
        WHERE ab.statut = 'actif') AS actifs,
           (SELECT COUNT(*)
        FROM Adherent
        WHERE dateCreation >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ) AS nouveauxCeMois`
  );
  return result[0];
});

ipcMain.handle('getAdherentsParMois', async () => {
  return query(
    `SELECT
       DATE_FORMAT(dateCreation, '%Y-%m') AS mois,
       COUNT(*)                           AS total
     FROM Adherent
     WHERE YEAR(dateCreation) = YEAR(CURDATE())
     GROUP BY mois
     ORDER BY mois ASC`
  );
});

ipcMain.handle('getFrequentationSemaine', async () => {
  const result = await query(
    `SELECT
       DAYOFWEEK(dateCreation) AS jourNum,
       COUNT(*) AS total
     FROM Adherent
     GROUP BY DAYOFWEEK(dateCreation)`
  );

  const map = {};
  result.forEach(r => {
    map[Number(r.jourNum)] = r.total;
  });

  const jours = [
    { jourNum: 1, day: 'Dim' },
    { jourNum: 2, day: 'Lun' },
    { jourNum: 3, day: 'Mar' },
    { jourNum: 4, day: 'Mer' },
    { jourNum: 5, day: 'Jeu' },
    { jourNum: 6, day: 'Ven' },
    { jourNum: 7, day: 'Sam' },
  ];

  return jours.map(j => ({
    day: j.day,
    value: map[j.jourNum] || 0
  }));
});

// ══════════════════════════════════════════════
//  ABONNEMENTS
// ══════════════════════════════════════════════

ipcMain.handle('getAbonnements', async () => {
  return query(
    `SELECT
       a.*,
       CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom,
       t.nom AS typeNom, t.prix AS typePrix
     FROM Abonnement a
     LEFT JOIN Adherent ad       ON a.adherent_id = ad.idAdherent
     LEFT JOIN TypeAbonnement t  ON a.type_id = t.id
     ORDER BY a.dateDebut DESC`
  );
});

ipcMain.handle('addAbonnement', async (_, { adherent_id, type_id, dateDebut, dateFin, statut }) => {
  return query(
    'INSERT INTO Abonnement (adherent_id, type_id, dateDebut, dateFin, statut) VALUES (?, ?, ?, ?, ?)',
    [adherent_id, type_id, dateDebut, dateFin, statut]
  );
});

ipcMain.handle('updateAbonnement', async (_, { idAbonnement, type_id, dateDebut, dateFin, statut }) => {
  return query(
    'UPDATE Abonnement SET type_id=?, dateDebut=?, dateFin=?, statut=? WHERE idAbonnement=?',
    [type_id, dateDebut, dateFin, statut, idAbonnement]
  );
});

// ══════════════════════════════════════════════
//  TYPES D'ABONNEMENT
// ══════════════════════════════════════════════

ipcMain.handle('getTypesAbonnement', async () => {
  return query('SELECT * FROM TypeAbonnement');
});

ipcMain.handle('getTypeAbonnements', async () => {
  const types  = await query('SELECT * FROM TypeAbonnement ORDER BY nom ASC');
  if (!types.length) return [];
  const regles = await query('SELECT * FROM Regles');
  return types.map(t => ({
    ...t,
    features: regles
      .filter(r => r.type_abonnement_id === t.id)
      .map(r => r.description),
  }));
});

ipcMain.handle('addTypeAbonnement', async (_, { nom, duree, prix, features = [] }) => {
  const result = await query(
    'INSERT INTO TypeAbonnement (nom, duree, prix) VALUES (?, ?, ?)',
    [nom, duree, prix]
  );
  if (!features.length) return result;

  const typeId       = result.insertId;
  const placeholders = features.map(() => '(?, ?)').join(', ');
  const flatValues   = features.flatMap(f => [typeId, f]);
  await query(`INSERT INTO Regles (type_abonnement_id, description) VALUES ${placeholders}`, flatValues);
  return result;
});

ipcMain.handle('updateTypeAbonnement', async (_, { id, nom, duree, prix, features = [] }) => {
  await query('UPDATE TypeAbonnement SET nom=?, duree=?, prix=? WHERE id=?', [nom, duree, prix, id]);
  await query('DELETE FROM Regles WHERE type_abonnement_id=?', [id]);
  if (!features.length) return { success: true };
  const values = features.map(f => [id, f]);
  await query('INSERT INTO Regles (type_abonnement_id, description) VALUES ?', [values]);
  return { success: true };
});

ipcMain.handle('deleteTypeAbonnement', async (_, id) => {
  await query('DELETE FROM Abonnement WHERE type_id=?', [id]);
  return query('DELETE FROM TypeAbonnement WHERE id=?', [id]);
});

// ══════════════════════════════════════════════
//  PAIEMENTS
// ══════════════════════════════════════════════

ipcMain.handle('getPaiements', async () => {
  return query(
    `SELECT
       p.*,
       CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom
     FROM Paiement p
     JOIN Abonnement a  ON p.abonnement_id = a.idAbonnement
     JOIN Adherent   ad ON a.adherent_id   = ad.idAdherent
     ORDER BY p.datePaiement DESC`
  );
});

ipcMain.handle('addPaiement', async (_, { abonnement_id, montant, datePaiement, modePaiement }) => {
  return query(
    'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement) VALUES (?, ?, ?, ?)',
    [abonnement_id, montant, datePaiement, modePaiement]
  );
});

// ══════════════════════════════════════════════
//  RECETTE
// ══════════════════════════════════════════════

ipcMain.handle('getRecette', async () => {
  const result = await query(
    `SELECT
       (SELECT IFNULL(SUM(montant), 0)
        FROM Paiement WHERE statut = 'validé')                          AS recettePaiements,
       (SELECT IFNULL(SUM(p.prix * h.quantite), 0)
        FROM HistoriqueVente h
        JOIN Produit p ON h.produit_id = p.idProduit)                   AS recetteVentes`
  );
  const r = result[0];
  return {
    recettePaiements: r.recettePaiements,
    recetteVentes:    r.recetteVentes,
    total:            parseFloat(r.recettePaiements) + parseFloat(r.recetteVentes),
  };
});

ipcMain.handle('getRecetteParMois', async () => {
  return query(
    `SELECT
       DATE_FORMAT(datePaiement, '%Y-%m') AS mois,
       SUM(montant)                       AS total
     FROM Paiement
     GROUP BY mois
     ORDER BY mois DESC
     LIMIT 12`
  );
});

// ══════════════════════════════════════════════
//  PRODUITS
// ══════════════════════════════════════════════

ipcMain.handle('getProduits', async () => {
  return query('SELECT * FROM Produit ORDER BY nom');
});

ipcMain.handle('addProduit', async (_, { nom, reference, stock, prix, categorie }) => {
  return query(
    'INSERT INTO Produit (nom, reference, stock, prix, categorie) VALUES (?, ?, ?, ?, ?)',
    [nom, reference, stock, prix, categorie]
  );
});

ipcMain.handle('updateProduit', async (_, { idProduit, nom, reference, stock, prix, categorie }) => {
  return query(
    'UPDATE Produit SET nom=?, reference=?, stock=?, prix=?, categorie=? WHERE idProduit=?',
    [nom, reference, stock, prix, categorie, idProduit]
  );
});

ipcMain.handle('deleteProduit', async (_, id) => {
  return query('DELETE FROM Produit WHERE idProduit=?', [id]);
});

// ══════════════════════════════════════════════
//  ACTIVITÉS
// ══════════════════════════════════════════════

ipcMain.handle('getActivites', async () => {
  return query('SELECT * FROM Activite ORDER BY nom');
});

ipcMain.handle('addActivite', async (_, { nom, couleur }) => {
  const result = await query('INSERT INTO Activite (nom, couleur) VALUES (?, ?)', [nom, couleur]);
  return { insertId: result.insertId };
});

ipcMain.handle('deleteActivite', async (_, id) => {
  return query('DELETE FROM Activite WHERE idActivite=?', [id]);
});

// ══════════════════════════════════════════════
//  SÉANCES
// ══════════════════════════════════════════════

ipcMain.handle('getSeances', async () => {
  return query('SELECT * FROM Seance ORDER BY date DESC');
});

ipcMain.handle('getSeancesPlanning', async () => {
  return query(
    `SELECT
       s.*,
       CONCAT(u.nom, ' ', u.prenom) AS coachNom,
       a.nom    AS activiteNom,
       a.couleur AS activiteCouleur
     FROM Seance s
     LEFT JOIN Utilisateur u ON s.coach_id    = u.idUtilisateur
     LEFT JOIN Activite    a ON s.activite_id = a.idActivite
     ORDER BY s.date, s.heureDebut`
  );
});

ipcMain.handle('addSeance', async (_, { date, heureDebut, heureFin, participantsMax, coach_id, activite_id }) => {
  const result = await query(
    'INSERT INTO Seance (date, heureDebut, heureFin, participantsMax, coach_id, activite_id) VALUES (?, ?, ?, ?, ?, ?)',
    [date, heureDebut, heureFin, participantsMax, coach_id, activite_id]
  );
  return { insertId: result.insertId };
});

ipcMain.handle('deleteSeance', async (_, id) => {
  return query('DELETE FROM Seance WHERE idSeance=?', [id]);
});

// ══════════════════════════════════════════════
//  UTILISATEURS
// ══════════════════════════════════════════════

ipcMain.handle('getUtilisateurs', async () => {
  return query(
    `SELECT u.*, r.nom AS roleNom
     FROM Utilisateur u
     LEFT JOIN Role r ON u.role_id = r.id
     ORDER BY u.idUtilisateur DESC`
  );
});

ipcMain.handle('addUtilisateur', async (_, { nom, prenom, email, motDePasse, role_id }) => {
  const result = await query(
    'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, role_id) VALUES (?, ?, ?, ?, ?)',
    [nom, prenom, email, motDePasse, role_id]
  );
  return { insertId: result.insertId };
});

ipcMain.handle('updateUtilisateur', async (_, { idUtilisateur, nom, prenom, email, role_id }) => {
  return query(
    'UPDATE Utilisateur SET nom=?, prenom=?, email=?, role_id=? WHERE idUtilisateur=?',
    [nom, prenom, email, role_id, idUtilisateur]
  );
});

ipcMain.handle('deleteUtilisateur', async (_, id) => {
  return query('DELETE FROM Utilisateur WHERE idUtilisateur=?', [id]);
});

ipcMain.handle('getRoles', async () => {
  return query('SELECT * FROM Role ORDER BY nom');
});

ipcMain.handle('getCoachs', async () => {
  return query(
    `SELECT u.idUtilisateur, u.nom, u.prenom
     FROM Utilisateur u
     JOIN Role r ON u.role_id = r.id
     WHERE r.nom = 'coach'`
  );
});