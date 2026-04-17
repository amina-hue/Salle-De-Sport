
const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');
const db = require('./db');

if (require('electron-squirrel-startup')) app.quit();

// ══════════════════════════════════════════════
//  FENÊTRE PRINCIPALE
// ══════════════════════════════════════════════

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 650, show: false,
    webPreferences: { preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY },
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
  mainWindow.webContents.on('did-finish-load', () => { mainWindow.show(); });
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
//  LOGIN
// ══════════════════════════════════════════════
ipcMain.handle('login', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { email, motDePasse } = data;
    db.query('SELECT * FROM Utilisateur WHERE email = ? AND motDePasse = ?', [email, motDePasse],
      (err, result) => {
        if (err) reject(err);
        else if (result.length === 0) resolve({ success: false, message: 'Email ou mot de passe incorrect' });
        else resolve({ success: true, user: result[0] });
      }
    );
  });
});

// ══════════════════════════════════════════════
//  ADHERENTS
// ══════════════════════════════════════════════

ipcMain.handle('getAdherents', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Adherent ORDER BY dateCreation DESC',
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('addAdherent', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, prenom, dateNaissance, numTelephone, email, sexe } = data;
    db.query(
      'INSERT INTO Adherent (nom, prenom, dateNaissance, numTelephone, email, sexe) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, dateNaissance, numTelephone, email, sexe],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('updateAbonnement', async (event, data) => {
  console.log('updateAbonnement reçu:', data); // ← ajouter cette ligne
  return new Promise((resolve, reject) => {
    const { idAbonnement, type_id, dateDebut, dateFin, statut, montantDu } = data;
    console.log('montantDu en BDD:', montantDu); // ← et celle-ci
    db.query(
      'UPDATE Abonnement SET type_id=?, dateDebut=?, dateFin=?, statut=?, montantDu=? WHERE idAbonnement=?',
      [type_id, dateDebut, dateFin, statut, montantDu ?? null, idAbonnement],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('deleteAdherent', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Adherent WHERE idAdherent=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ✅ CORRIGÉ : Récupère le dernier abonnement (quel que soit le statut) + auto-expire
ipcMain.handle('getAdherentDetail', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE Abonnement SET statut = 'expiré'
       WHERE statut = 'actif' AND dateFin < CURDATE()`,
      (errUpdate) => {
        if (errUpdate) console.error('Auto-expire error:', errUpdate);

        db.query(
          `SELECT ad.*, ab.idAbonnement, ab.type_id, ab.dateDebut, ab.dateFin,
              ab.statut AS abonnementStatut,
              t.nom AS typeNom, t.prix AS typePrix, t.duree
           FROM Adherent ad
           LEFT JOIN Abonnement ab ON ab.idAbonnement = (
             SELECT idAbonnement FROM Abonnement
             WHERE adherent_id = ad.idAdherent
             ORDER BY dateDebut DESC LIMIT 1
           )
           LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
           WHERE ad.idAdherent = ?`,
          [id],
          (err, result) => { if (err) reject(err); else resolve(result[0] || null); }
        );
      }
    );
  });
});

// ✅ CORRIGÉ : Auto-expire + récupère le dernier abonnement sans filtrer sur statut='actif'
ipcMain.handle('getAdherentsAvecAbonnement', async () => {
  return new Promise((resolve, reject) => {

    // Étape 1 : mettre à jour automatiquement les abonnements expirés
    db.query(
      `UPDATE Abonnement SET statut = 'expiré'
       WHERE statut = 'actif' AND dateFin < CURDATE()`,
      (errUpdate) => {
        if (errUpdate) console.error('Auto-expire error:', errUpdate);

        // Étape 2 : récupérer tous les adhérents avec leur abonnement le plus récent
        db.query(
          `SELECT ad.*,
              ab.idAbonnement, ab.type_id, ab.dateDebut, ab.dateFin,
              ab.statut AS abonnementStatut,
              t.nom AS typeNom, t.prix AS typePrix
           FROM Adherent ad
           LEFT JOIN Abonnement ab ON ab.idAbonnement = (
             SELECT idAbonnement FROM Abonnement
             WHERE adherent_id = ad.idAdherent
             ORDER BY dateDebut DESC
             LIMIT 1
           )
           LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
           ORDER BY ad.dateCreation DESC`,
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      }
    );
  });
});
ipcMain.handle('updateAdherent', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idAdherent, nom, prenom, dateNaissance, numTelephone, email, sexe } = data;
    db.query(
      'UPDATE Adherent SET nom=?, prenom=?, dateNaissance=?, numTelephone=?, email=?, sexe=? WHERE idAdherent=?',
      [nom, prenom, dateNaissance, numTelephone, email, sexe, idAdherent],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
ipcMain.handle('updateAdherentPhoto', async (event, { idAdherent, photo }) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE Adherent SET photo = ? WHERE idAdherent = ?', [photo, idAdherent],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('deleteAdherentComplet', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Presence WHERE adherent_id = ?', [id], (err) => {
      if (err) return reject(err);
      db.query('SELECT idAbonnement FROM Abonnement WHERE adherent_id = ?', [id], (err2, abos) => {
        if (err2) return reject(err2);
        const aboIds = abos.map(a => a.idAbonnement);
        const deletePaiements = (cb) => {
          if (!aboIds.length) return cb();
          db.query('DELETE FROM Paiement WHERE abonnement_id IN (?)', [aboIds], cb);
        };
        deletePaiements((err3) => {
          if (err3) return reject(err3);
          db.query('DELETE FROM Abonnement WHERE adherent_id = ?', [id], (err4) => {
            if (err4) return reject(err4);
            db.query('DELETE FROM Adherent WHERE idAdherent = ?', [id], (err5, result) => {
              if (err5) reject(err5); else resolve(result);
            });
          });
        });
      });
    });
  });
});

ipcMain.handle('searchAdherents', async (event, query) => {
  return new Promise((resolve, reject) => {
    const q = `%${query}%`;
    db.query(
      `SELECT ad.*, ab.statut AS abonnementStatut, t.nom AS typeNom
       FROM Adherent ad
       LEFT JOIN Abonnement ab ON ab.idAbonnement = (
         SELECT idAbonnement FROM Abonnement
         WHERE adherent_id = ad.idAdherent
         ORDER BY dateDebut DESC LIMIT 1
       )
       LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
       WHERE ad.nom LIKE ? OR ad.prenom LIKE ? OR ad.email LIKE ? OR ad.numTelephone LIKE ?
       ORDER BY ad.nom ASC`,
      [q, q, q, q],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getStatsAdherents', async () => {
  return new Promise((resolve, reject) => {
    // Auto-expire d'abord
    db.query(
      `UPDATE Abonnement SET statut = 'expiré'
       WHERE statut = 'actif' AND dateFin < CURDATE()`,
      () => {
        db.query(
          `SELECT COUNT(DISTINCT ad.idAdherent) AS total,
            SUM(CASE WHEN ab.statut = 'actif'    THEN 1 ELSE 0 END) AS actifs,
            SUM(CASE WHEN ab.statut = 'expiré'   THEN 1 ELSE 0 END) AS expires,
            SUM(CASE WHEN ab.statut = 'suspendu' THEN 1 ELSE 0 END) AS suspendus,
            SUM(CASE WHEN ad.sexe = 'Homme'      THEN 1 ELSE 0 END) AS hommes,
            SUM(CASE WHEN ad.sexe = 'Femme'      THEN 1 ELSE 0 END) AS femmes
           FROM Adherent ad
           LEFT JOIN Abonnement ab ON ab.idAbonnement = (
             SELECT idAbonnement FROM Abonnement
             WHERE adherent_id = ad.idAdherent
             ORDER BY dateDebut DESC LIMIT 1
           )`,
          (err, result) => { if (err) reject(err); else resolve(result[0]); }
        );
      }
    );
  });
});

ipcMain.handle('getAdherentsParMois', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT DATE_FORMAT(dateCreation, '%Y-%m') AS mois, COUNT(*) AS total
       FROM Adherent GROUP BY mois ORDER BY mois DESC LIMIT 12`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

// ══════════════════════════════════════════════
//  ABONNEMENTS
// ══════════════════════════════════════════════

ipcMain.handle('getTypeAbonnements', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM TypeAbonnement ORDER BY nom ASC', (err, types) => {
      if (err) return reject(err);
      if (!types.length) return resolve([]);

      db.query('SELECT * FROM Regles', (err2, regles) => {
        if (err2) return reject(err2);

        db.query(
          `SELECT type_id, COUNT(*) AS nombre_adherents
           FROM Abonnement
           WHERE statut = 'actif'
           GROUP BY type_id`,
          (err3, counts) => {
            if (err3) return reject(err3);

            const result = types.map(t => ({
              ...t,
              features: regles
                .filter(r => r.type_abonnement_id === t.id)
                .map(r => r.description),
              nombre_adherents: Number(counts.find(c => c.type_id === t.id)?.nombre_adherents ?? 0),
            }));

            resolve(result);
          }
        );
      });
    });
  });
});

ipcMain.handle('addTypeAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, duree, prix, features = [] } = data;
    db.query('INSERT INTO TypeAbonnement (nom, duree, prix) VALUES (?, ?, ?)', [nom, duree, prix],
      (err, result) => {
        if (err) return reject(err);
        const typeId = result.insertId;
        if (!features.length) return resolve(result);
        const placeholders = features.map(() => '(?, ?)').join(', ');
        const flatValues = features.flatMap(f => [typeId, f]);
        db.query(`INSERT INTO Regles (type_abonnement_id, description) VALUES ${placeholders}`, flatValues,
          (err2) => { if (err2) reject(err2); else resolve(result); }
        );
      }
    );
  });
});

ipcMain.handle('updateTypeAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { id, nom, duree, prix, features = [] } = data;
    db.query('UPDATE TypeAbonnement SET nom=?, duree=?, prix=? WHERE id=?', [nom, duree, prix, id], (err) => {
      if (err) return reject(err);
      db.query('DELETE FROM Regles WHERE type_abonnement_id=?', [id], (err2) => {
        if (err2) return reject(err2);
        if (!features.length) return resolve({ success: true });
        const values = features.map(f => [id, f]);
        db.query('INSERT INTO Regles (type_abonnement_id, description) VALUES ?', [values],
          (err3) => { if (err3) reject(err3); else resolve({ success: true }); }
        );
      });
    });
  });
});

ipcMain.handle('deleteTypeAbonnement', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Abonnement WHERE type_id=?', [id], (err) => {
      if (err) return reject(err);
      db.query('DELETE FROM TypeAbonnement WHERE id=?', [id],
        (err2, result) => { if (err2) reject(err2); else resolve(result); }
      );
    });
  });
});

ipcMain.handle('getAbonnements', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT a.*, CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom,
        t.nom AS typeNom, t.prix AS typePrix
       FROM Abonnement a
       LEFT JOIN Adherent ad ON a.adherent_id = ad.idAdherent
       LEFT JOIN TypeAbonnement t ON a.type_id = t.id
       ORDER BY a.dateDebut DESC`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getAbonnementsExpirant', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT
        ad.nom, ad.prenom, ad.numTelephone, ad.email,
        ab.idAbonnement, ab.dateFin, ab.statut,
        t.nom AS typeNom,
        DATEDIFF(ab.dateFin, CURDATE()) AS joursRestants
       FROM Abonnement ab
       JOIN Adherent ad ON ab.adherent_id = ad.idAdherent
       JOIN TypeAbonnement t  ON ab.type_id  = t.id
       WHERE ab.statut = 'actif'
         AND ab.dateFin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY ab.dateFin ASC`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('addAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { adherent_id, type_id, dateDebut, dateFin, statut } = data;
    db.query(
      'INSERT INTO Abonnement (adherent_id, type_id, dateDebut, dateFin, statut) VALUES (?, ?, ?, ?, ?)',
      [adherent_id, type_id, dateDebut, dateFin, statut],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});


ipcMain.handle('getTypesAbonnement', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM TypeAbonnement ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ══════════════════════════════════════════════
//  PAIEMENTS
// ══════════════════════════════════════════════
ipcMain.handle('getPaiements', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        p.idPaiement AS id,
        p.montant,
        DATE_FORMAT(p.datePaiement, '%d/%m/%Y') AS date,
        p.modePaiement AS mode,
        CONCAT(a.prenom, ' ', a.nom) AS nom,   -- ← nom complet
        'Payé' AS statut
      FROM Paiement p
      JOIN Abonnement ab ON p.abonnement_id = ab.idAbonnement
      JOIN Adherent a ON ab.adherent_id = a.idAdherent
      ORDER BY p.datePaiement DESC
    `;
    db.query(sql, (err, results) => {
      if (err) { console.error("Erreur getPaiements:", err); reject(err); }
      else resolve(results);
    });
  });
});

ipcMain.handle('addPaiement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { abonnement_id, montant, date, mode } = data;
    
    // 1. Mapping du mode de paiement pour correspondre à l'ENUM de ta BDD
    // Ta BDD attend : 'cash', 'carte', 'virement'
    let modeSQL = 'cash'; 
    if (mode === 'Carte bancaire') modeSQL = 'carte';
    if (mode === 'Virement') modeSQL = 'virement';
    if (mode === 'Espèces') modeSQL = 'cash';

    // 2. Requête SQL (Note : datePaiement et modePaiement selon ton script SQL)
    const sql = 'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement) VALUES (?, ?, ?, ?)';
    
    db.query(
      sql,
      [abonnement_id, montant, date, modeSQL],
      (err, result) => {
        if (err) {
          console.error("❌ ERREUR SQL addPaiement:", err);
          // On résout avec success: false pour que le catch de React ne se déclenche pas violemment
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, insertId: result.insertId });
        }
      }
    );
  });
});

ipcMain.handle('getAdherentsWithAbonnement', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT ad.*,
        ab.idAbonnement, ab.type_id, ab.dateDebut, ab.dateFin,
        ab.statut AS abonnementStatut,
        t.nom AS typeNom, t.prix AS typePrix
       FROM Adherent ad
       INNER JOIN Abonnement ab ON ab.idAbonnement = (
         SELECT idAbonnement FROM Abonnement
         WHERE adherent_id = ad.idAdherent
         AND statut = 'actif'
         ORDER BY dateDebut DESC LIMIT 1
       )
       LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
       ORDER BY ad.nom ASC`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
ipcMain.handle('getAbonnementsNonPaies', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        ad.nom, ad.prenom,
        ab.idAbonnement, ab.dateDebut, ab.dateFin,
        ab.statut AS abonnementStatut,
        t.nom AS typeNom, t.prix AS typePrix,
        COALESCE(ab.montantDu, t.prix) AS montantDu,
        COALESCE(SUM(p.montant), 0) AS totalPaye
      FROM Abonnement ab
      JOIN Adherent ad ON ab.adherent_id = ad.idAdherent
      JOIN TypeAbonnement t ON ab.type_id = t.id
      LEFT JOIN Paiement p ON p.abonnement_id = ab.idAbonnement
      WHERE ab.statut = 'actif'
      GROUP BY ab.idAbonnement, ad.nom, ad.prenom, ab.dateDebut, ab.dateFin, 
               ab.statut, t.nom, t.prix, ab.montantDu
      HAVING COALESCE(ab.montantDu, t.prix) > COALESCE(SUM(p.montant), 0)
      ORDER BY ad.nom ASC
    `;
    db.query(sql, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});
// ══════════════════════════════════════════════
//  PRODUITS
// ══════════════════════════════════════════════

//  PRODUITS (MAGASIN)
// ─────────────────────────────────────────────────────────────────────────────

// 1. Récupérer tous les produits
ipcMain.handle('getProduits', async () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Produit ORDER BY nom ASC';
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Erreur SQL (getProduits):", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

// 2. Ajouter un produit
ipcMain.handle('addProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, reference, stock, prix, categorie } = data;
    const sql = 'INSERT INTO Produit (nom, reference, stock, prix, categorie) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [nom, reference, stock, prix, categorie], (err, result) => {
      if (err) {
        console.error("Erreur SQL (addProduit):", err);
        reject(err);
      } else {
        // Renvoie l'ID généré pour confirmer l'ajout
        resolve({ idProduit: result.insertId, status: 'success' });
      }
    });
  });
});

// 3. Modifier un produit
ipcMain.handle('updateProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    // Note : on utilise idProduit qui vient de l'objet p de React
    const { idProduit, nom, reference, stock, prix, categorie } = data;
    const sql = `
      UPDATE Produit 
      SET nom = ?, reference = ?, stock = ?, prix = ?, categorie = ? 
      WHERE idProduit = ?
    `;
    
    db.query(sql, [nom, reference, stock, prix, categorie, idProduit], (err, result) => {
      if (err) {
        console.error("Erreur SQL (updateProduit):", err);
        reject(err);
      } else {
        resolve({ status: 'updated', affectedRows: result.affectedRows });
      }
    });
  });
});

// 4. Supprimer un produit
ipcMain.handle('deleteProduit', async (event, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Produit WHERE idProduit = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Erreur SQL (deleteProduit):", err);
        reject(err);
      } else {
        resolve({ status: 'deleted' });
      }
    });
  });
});
// ══════════════════════════════════════════════
//  STATS MAGASIN (DYNAMIQUES)
// ══════════════════════════════════════════════
ipcMain.handle('getStatsMagasin', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Produit) AS totalProduits,
        (SELECT SUM(stock) FROM Produit) AS totalStock,
        (SELECT COUNT(*) FROM Produit WHERE stock <= 5) AS alertesStock,
        (SELECT COUNT(*) FROM HistoriqueVente) AS totalVentes,
        (SELECT COUNT(*) FROM HistoriqueVente WHERE date = CURDATE()) AS ventesAujourdhui,
        (SELECT IFNULL(SUM(quantite), 0) FROM HistoriqueVente WHERE date = CURDATE()) AS quantiteVendueAujourdhui,
        (SELECT COUNT(*) FROM HistoriqueVente WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())) AS ventesCeMois,
        (SELECT IFNULL(SUM(quantite), 0) FROM HistoriqueVente WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())) AS quantiteVendueCeMois
    `;
    
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Erreur SQL (getStatsMagasin):", err);
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
});
// ══════════════════════════════════════════════
//  UTILISATEURS
// ══════════════════════════════════════════════

ipcMain.handle('getUtilisateurs', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.*, r.nom AS roleNom FROM Utilisateur u
       LEFT JOIN Role r ON u.role_id = r.id ORDER BY u.idUtilisateur DESC`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('addUtilisateur', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, prenom, email, motDePasse, role_id } = data;
    db.query('INSERT INTO Utilisateur (nom, prenom, email, motDePasse, role_id) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, motDePasse, role_id],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('deleteUtilisateur', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Utilisateur WHERE idUtilisateur=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('updateUtilisateur', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idUtilisateur, nom, prenom, email, role_id } = data;
    db.query('UPDATE Utilisateur SET nom=?, prenom=?, email=?, role_id=? WHERE idUtilisateur=?',
      [nom, prenom, email, role_id, idUtilisateur],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getRoles', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Role ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('getCoachs', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.idUtilisateur, u.nom, u.prenom FROM Utilisateur u
       JOIN Role r ON u.role_id = r.id WHERE r.nom = 'coach'`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getRolesAvecCount', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT r.id, r.nom AS name, COUNT(u.idUtilisateur) AS users
       FROM Role r
       LEFT JOIN Utilisateur u ON u.role_id = r.id
       GROUP BY r.id, r.nom
       ORDER BY r.id`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});
//permissions
// Récupérer les permissions d'un rôle
ipcMain.handle('getPermissions', async (event, role_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT page_key, statut FROM Permissions WHERE role_id = ?',
      [role_id],
      (err, result) => {
        if (err) reject(err);
        else {
          // Convertir en objet { page_key: statut }
          const perms = {};
          result.forEach(r => { perms[r.page_key] = r.statut; });
          resolve(perms);
        }
      }
    );
  });
});

// ══════════════════════════════════════════════
//  STATISTIQUES PAGE ADHÉRENT
// ══════════════════════════════════════════════
ipcMain.handle('getStatsPageAdherent', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT
        (SELECT COUNT(*) FROM Adherent) AS total,

        (SELECT COUNT(DISTINCT ad.idAdherent)
         FROM Adherent ad
         JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent
         WHERE ab.statut = 'actif') AS actifs,

        (SELECT COUNT(*)
         FROM Adherent
         WHERE MONTH(dateCreation) = MONTH(CURDATE())
         AND YEAR(dateCreation) = YEAR(CURDATE())) AS nouveauxCeMois`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      }
    );
  });
});

// Sauvegarder les permissions d'un rôle
ipcMain.handle('savePermissions', async (event, { role_id, permissions }) => {
  return new Promise((resolve, reject) => {
    // Supprimer les anciennes permissions du rôle
    db.query('DELETE FROM Permissions WHERE role_id = ?', [role_id], (err) => {
      if (err) return reject(err);

      const entries = Object.entries(permissions);
      if (!entries.length) return resolve({ success: true });

      // Insérer les nouvelles
      const values = entries.map(([key, statut]) => [role_id, key, statut]);
      db.query(
        'INSERT INTO Permissions (role_id, page_key, statut) VALUES ?',
        [values],
        (err2) => {
          if (err2) reject(err2);
          else resolve({ success: true });
        }
      );
    });
  });
});
ipcMain.handle('getStatsAbonnements', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN statut = 'actif'    THEN 1 ELSE 0 END) AS actifs,
        SUM(CASE WHEN statut = 'expiré'   THEN 1 ELSE 0 END) AS expires,
        SUM(CASE WHEN statut = 'suspendu' THEN 1 ELSE 0 END) AS suspendus
       FROM Abonnement`,
      (err, result) => { if (err) reject(err); else resolve(result[0]); }
    );
  });
});

ipcMain.handle('getAbonnementsParType', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT t.nom AS name, COUNT(*) AS value
       FROM Abonnement a
       JOIN TypeAbonnement t ON a.type_id = t.id
       GROUP BY t.id, t.nom`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getAbonnementsExpirantBientot', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT CONCAT(ad.nom, ' ', ad.prenom) AS name,
        ab.dateFin,
        DATEDIFF(ab.dateFin, CURDATE()) AS joursRestants
       FROM Abonnement ab
       JOIN Adherent ad ON ab.adherent_id = ad.idAdherent
       WHERE ab.statut = 'actif'
         AND ab.dateFin >= CURDATE()
       ORDER BY ab.dateFin ASC
       LIMIT 5`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getFrequentationHebdo', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        DAYNAME(dateDebut) AS day,
        COUNT(*) AS value
       FROM Abonnement
       WHERE dateDebut >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DAYNAME(dateDebut), DAYOFWEEK(dateDebut)
       ORDER BY DAYOFWEEK(dateDebut)`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
// Fréquentation par jour de la semaine
ipcMain.handle('getFrequentationSemaine', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        DAYOFWEEK(date) AS jourNum,
        COUNT(*) AS total
       FROM Presence
       GROUP BY DAYOFWEEK(date)
       ORDER BY DAYOFWEEK(date)`,
      (err, result) => {
        if (err) return reject(err);

        // DAYOFWEEK : 1=Dim, 2=Lun, 3=Mar, 4=Mer, 5=Jeu, 6=Ven, 7=Sam
        const jours = [
          { jourNum: 1, day: "Dim" },
          { jourNum: 2, day: "Lun" },
          { jourNum: 3, day: "Mar" },
          { jourNum: 4, day: "Mer" },
          { jourNum: 5, day: "Jeu" },
          { jourNum: 6, day: "Ven" },
          { jourNum: 7, day: "Sam" },
        ];

        // Fusionner — si un jour a 0 présences il apparaît quand même avec 0
        const data = jours.map(j => {
          const found = result.find(r => r.jourNum === j.jourNum);
          return { day: j.day, value: found ? found.total : 0 };
        });

        resolve(data);
      }
    );
  });
});
// ══════════════════════════════════════════════
//  STATS MAGASIN 
// ══════════════════════════════════════════════
// ipcMain.handle('getStatsMagasin', async () => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT 
//         (SELECT COUNT(*) FROM Produit) AS totalProduits,
//         (SELECT COUNT(*) FROM Produit WHERE stock < 5) AS alertesStock,
//         (SELECT IFNULL(SUM(quantite), 0) FROM HistoriqueVente WHERE date = CURDATE()) AS ventesAujourdhui,
//         (SELECT p.nom FROM HistoriqueVente h 
//          JOIN Produit p ON h.produit_id = p.idProduit 
//          GROUP BY h.produit_id ORDER BY SUM(h.quantite) DESC LIMIT 1) AS topProduit
//     `;
//     db.query(sql, (err, result) => {
//       if (err) reject(err);
//       else resolve(result[0]);
//     });
//   });
// });

ipcMain.handle('vendreProduit', async (event, { produit_id, utilisateur_id, quantite }) => {
  return new Promise((resolve, reject) => {
    // 1. Vérifier et mettre à jour le stock
    db.query(
      'UPDATE Produit SET stock = stock - ? WHERE idProduit = ? AND stock >= ?',
      [quantite, produit_id, quantite],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
            return resolve({ success: false, message: "Stock insuffisant ou produit inexistant" });
        }

        // 2. Enregistrer dans l'historique
        db.query(
          'INSERT INTO HistoriqueVente (date, utilisateur_id, produit_id, quantite) VALUES (CURDATE(), ?, ?, ?)',
          [utilisateur_id, produit_id, quantite],
          (err2) => {
            if (err2) reject(err2);
            else resolve({ success: true });
          }
        );
      }
    );
  });
});
ipcMain.handle('createAdherentComplet', async (event, data) => {
  return new Promise((resolve, reject) => {
    const {
      nom, prenom, dateNaissance, numTelephone, email, sexe, photo,
      type_id, dateDebut, dateFin,
      montant, modePaiement, montantDu
    } = data;

    // 1. Créer l'adhérent
    db.query(
      'INSERT INTO Adherent (nom, prenom, dateNaissance, numTelephone, email, sexe, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, dateNaissance || null, numTelephone, email || null, sexe, photo || null],
      (err, resAdherent) => {
        if (err) return reject(err);
        const adherent_id = resAdherent.insertId;

        // 2. Créer l'abonnement
        db.query(
          'INSERT INTO Abonnement (adherent_id, type_id, dateDebut, dateFin, statut, montantDu) VALUES (?, ?, ?, ?, ?, ?)',
  [adherent_id, type_id, dateDebut, dateFin || null, 'actif', montantDu || null],
          (err2, resAbo) => {
            if (err2) return reject(err2);
            const abonnement_id = resAbo.insertId;

            // 3. Créer le paiement seulement si montant > 0
            if (!montant || montant <= 0) {
              return resolve({ success: true, adherent_id, abonnement_id });
            }

            let modeSQL = 'cash';
            if (modePaiement === 'carte')    modeSQL = 'carte';
            if (modePaiement === 'virement') modeSQL = 'virement';

            db.query(
              'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement, statut) VALUES (?, ?, ?, ?, ?)',
[abonnement_id, montant, dateDebut, modeSQL, 'Payé'],

              (err3) => {
                if (err3) return reject(err3);
                resolve({ success: true, adherent_id, abonnement_id });
              }
            );
          }
        );
      }
    );
  });
});
// Dans main.js, remplace ajouterPaiement pour qu'il mette aussi à jour le statut
ipcMain.handle('ajouterPaiement', async (event, { abonnement_id, montant, mode, date }) => {
  return new Promise((resolve, reject) => {
    const modeMap = { 'Espèces': 'cash', 'Carte bancaire': 'carte', 'Virement': 'virement' };
    const modeSQL = modeMap[mode] || mode || 'cash';

    db.query(
      'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement, statut) VALUES (?, ?, ?, ?, ?)',
      [abonnement_id, montant, date, modeSQL, 'Payé'],
      (err, result) => {
        if (err) return reject(err);
        // Marquer l'abonnement comme payé
        db.query(
          "UPDATE Abonnement SET statutPaiement = 'payé' WHERE idAbonnement = ?",
          [abonnement_id],
          (err2) => {
            if (err2) return reject(err2);
            resolve({ success: true, insertId: result.insertId });
          }
        );
      }
    );
  });
});
// ══════════════════════════════════════════════
//  SÉANCES
// ══════════════════════════════════════════════

ipcMain.handle('getSeancesSemaine', async (event, { dateDebut, dateFin }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT s.*, 
        a.nom AS activiteNom, a.couleur AS activiteCouleur,
        u.nom AS coachNom, u.prenom AS coachPrenom,
        COUNT(p.idPresence) AS presents
       FROM Seance s
       LEFT JOIN Activite a ON s.activite_id = a.idActivite
       LEFT JOIN Utilisateur u ON s.coach_id = u.idUtilisateur
       LEFT JOIN Presence p ON p.seance_id = s.idSeance
       WHERE s.date BETWEEN ? AND ?
       GROUP BY s.idSeance
       ORDER BY s.date ASC, s.heureDebut ASC`,
      [dateDebut, dateFin],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('addSeance', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { date, heureDebut, heureFin, participantsMax, coach_id, activite_id } = data;
    db.query(
      'INSERT INTO Seance (date, heureDebut, heureFin, participantsMax, coach_id, activite_id) VALUES (?, ?, ?, ?, ?, ?)',
      [date, heureDebut, heureFin, participantsMax || 15, coach_id || null, activite_id || null],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('addPresence', async (event, { adherent_id, seance_id, date }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT IGNORE INTO Presence (adherent_id, seance_id, date, heureEntree)
       VALUES (?, ?, ?, CURTIME())`,
      [adherent_id, seance_id, date],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('getActivites', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Activite ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
ipcMain.handle('addTransaction', async (event, data) => {
  const { produit_id, type, quantite, prix } = data;

  if (type === 'achat') {
    await db.query(
      "UPDATE Produit SET stock = stock + ? WHERE idProduit = ?",
      [quantite, produit_id]
    );

    await db.query(
      "INSERT INTO HistoriqueAchat (date, utilisateur_id, produit_id, quantite, prix_achat) VALUES (NOW(), 1, ?, ?, ?)",
      [produit_id, quantite, prix]
    );
  }

  if (type === 'vente') {
    await db.query(
      "UPDATE Produit SET stock = stock - ? WHERE idProduit = ?",
      [quantite, produit_id]
    );

    await db.query(
      "INSERT INTO HistoriqueVente (date, utilisateur_id, produit_id, quantite) VALUES (NOW(), 1, ?, ?)",
      [produit_id, quantite]
    );
  }

  return { success: true };
});
ipcMain.handle('addRole', async (event, { nom }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO Role (nom) VALUES (?)',
      [nom.trim()],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});
ipcMain.handle('deleteRole', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Role WHERE id=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
