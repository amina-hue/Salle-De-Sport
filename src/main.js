

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
    webPreferences: { preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, nodeIntegration: true,       // ✅
  contextIsolation: false,   },
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
//  AUTO-EXPIRE HELPER
//  Gère 2 cas :
//   1. Abonnement suspendu dont dateFinSuspension < CURDATE()
//      → la dateFin a DÉJÀ été décalée lors de la suspension
//      → on remet juste le statut à 'actif' (ou 'expiré' si dateFin aussi dépassée)
//        et on efface les champs suspension
//   2. Abonnement actif dont dateFin < CURDATE() → expiré
// ══════════════════════════════════════════════
const autoExpire = (cb) => {
  // Étape 1 : reprendre automatiquement les suspensions dont la période est terminée.
  //           dateFin a déjà été décalée lors de la suspension → on ne retouche pas dateFin.
  //           On remet juste actif/expiré selon si dateFin est encore dans le futur ou non.
  db.query(
    `UPDATE Abonnement
     SET
       statut            = CASE
                             WHEN dateFin < CURDATE() THEN 'expiré'
                             ELSE 'actif'
                           END,
       dureeSuspension   = NULL,
       causeSuspension   = NULL,
       dateFinSuspension = NULL
     WHERE statut = 'suspendu'
       AND dateFinSuspension IS NOT NULL
       AND dateFinSuspension < CURDATE()`,
    (errSuspend) => {
      if (errSuspend) console.error('Auto-reprise suspension error:', errSuspend);

      // Étape 2 : expirer les abonnements actifs dont la dateFin est dépassée
      db.query(
        `UPDATE Abonnement
         SET statut = 'expiré'
         WHERE statut = 'actif'
           AND dateFin < CURDATE()`,
        (errExpire) => {
          if (errExpire) console.error('Auto-expire error:', errExpire);
          if (cb) cb();
        }
      );
    }
  );
};

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

// ✅ CORRIGÉ : si statut = 'suspendu', dateFin est décalée de dureeSuspension jours immédiatement
ipcMain.handle('updateAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const {
      idAbonnement, type_id, dateDebut, dateFin, statut, montantDu,
      dureeSuspension, causeSuspension, dateFinSuspension,
    } = data;

    const isSuspension = statut === 'suspendu' && dureeSuspension;

    // Si on suspend : on décale dateFin de dureeSuspension jours directement en SQL.
    // La dateFin passée par le frontend est la dateFin ORIGINALE — on la décale ici.
    const sql = isSuspension
      ? `UPDATE Abonnement
         SET type_id           = ?,
             dateDebut         = ?,
             dateFin           = DATE_ADD(?, INTERVAL ? DAY),
             statut            = ?,
             montantDu         = ?,
             dureeSuspension   = ?,
             causeSuspension   = ?,
             dateFinSuspension = ?
         WHERE idAbonnement = ?`
      : `UPDATE Abonnement
         SET type_id           = ?,
             dateDebut         = ?,
             dateFin           = ?,
             statut            = ?,
             montantDu         = ?,
             dureeSuspension   = ?,
             causeSuspension   = ?,
             dateFinSuspension = ?
         WHERE idAbonnement = ?`;

    const params = isSuspension
      ? [
          type_id,
          dateDebut,
          dateFin,             // DATE_ADD(dateFin, INTERVAL dureeSuspension DAY)
          dureeSuspension,
          statut,
          montantDu ?? null,
          dureeSuspension,
          causeSuspension   ?? null,
          dateFinSuspension ?? null,
          idAbonnement,
        ]
      : [
          type_id,
          dateDebut,
          dateFin,
          statut,
          montantDu ?? null,
          dureeSuspension   ?? null,
          causeSuspension   ?? null,
          dateFinSuspension ?? null,
          idAbonnement,
        ];

    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle('deleteAdherent', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Adherent WHERE idAdherent=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ✅ CORRIGÉ : Auto-expire/reprise + récupère dureeSuspension, causeSuspension, dateFinSuspension
ipcMain.handle('getAdherentDetail', async (event, id) => {
  return new Promise((resolve, reject) => {
    autoExpire(() => {
      db.query(
        `SELECT ad.*, ab.idAbonnement, ab.type_id, ab.dateDebut, ab.dateFin,
            ab.statut AS abonnementStatut,
            ab.dureeSuspension, ab.causeSuspension, ab.dateFinSuspension,
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
    });
  });
});

// ✅ CORRIGÉ : Auto-expire/reprise + récupère les champs suspension
ipcMain.handle('getAdherentsAvecAbonnement', async () => {
  return new Promise((resolve, reject) => {
    autoExpire(() => {
      db.query(
        `SELECT ad.*,
            ab.idAbonnement, ab.type_id, ab.dateDebut, ab.dateFin,
            ab.statut AS abonnementStatut,
            ab.dureeSuspension, ab.causeSuspension, ab.dateFinSuspension,
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
    });
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
      `SELECT ad.*, ab.statut AS abonnementStatut,
              ab.dureeSuspension, ab.causeSuspension, ab.dateFinSuspension,
              t.nom AS typeNom
       FROM Adherent ad
       LEFT JOIN Abonnement ab ON ab.idAbonnement = (
         SELECT idAbonnement FROM Abonnement
         WHERE adherent_id = ad.idAdherent
         ORDER BY dateDebut DESC LIMIT 1
       )
       LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
       WHERE (ad.nom LIKE ? OR ad.prenom LIKE ? OR ad.email LIKE ? OR ad.numTelephone LIKE ?)AND ab.statut = 'actif'
       ORDER BY ad.nom ASC`,
      [q, q, q, q],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('getStatsAdherents', async () => {
  return new Promise((resolve, reject) => {
    autoExpire(() => {
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
    });
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

// ✅ CORRIGÉ : inclut dureeSuspension, causeSuspension, dateFinSuspension
ipcMain.handle('addAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const {
      adherent_id, type_id, dateDebut, dateFin, statut,
      dureeSuspension, causeSuspension, dateFinSuspension,
    } = data;
    db.query(
      `INSERT INTO Abonnement
         (adherent_id, type_id, dateDebut, dateFin, statut,
          dureeSuspension, causeSuspension, dateFinSuspension)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adherent_id, type_id, dateDebut, dateFin, statut,
        dureeSuspension   ?? null,
        causeSuspension   ?? null,
        dateFinSuspension ?? null,
      ],
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
        CONCAT(a.prenom, ' ', a.nom) AS nom,
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
    
    let modeSQL = 'cash'; 
    if (mode === 'Carte bancaire') modeSQL = 'carte';
    if (mode === 'Virement') modeSQL = 'virement';
    if (mode === 'Espèces') modeSQL = 'cash';

    const sql = 'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement) VALUES (?, ?, ?, ?)';
    
    db.query(
      sql,
      [abonnement_id, montant, date, modeSQL],
      (err, result) => {
        if (err) {
          console.error("❌ ERREUR SQL addPaiement:", err);
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
        ab.dureeSuspension, ab.causeSuspension, ab.dateFinSuspension,
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

ipcMain.handle('getProduits', async () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Produit ORDER BY nom ASC';
    db.query(sql, (err, result) => {
      if (err) { console.error("Erreur SQL (getProduits):", err); reject(err); }
      else resolve(result);
    });
  });
});

ipcMain.handle('addProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, reference, stock, prix, categorie } = data;
    const sql = 'INSERT INTO Produit (nom, reference, stock, prix, categorie) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nom, reference, stock, prix, categorie], (err, result) => {
      if (err) { console.error("Erreur SQL (addProduit):", err); reject(err); }
      else resolve({ idProduit: result.insertId, status: 'success' });
    });
  });
});

ipcMain.handle('updateProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idProduit, nom, reference, stock, prix, categorie } = data;
    const sql = `UPDATE Produit SET nom = ?, reference = ?, stock = ?, prix = ?, categorie = ? WHERE idProduit = ?`;
    db.query(sql, [nom, reference, stock, prix, categorie, idProduit], (err, result) => {
      if (err) { console.error("Erreur SQL (updateProduit):", err); reject(err); }
      else resolve({ status: 'updated', affectedRows: result.affectedRows });
    });
  });
});

ipcMain.handle('deleteProduit', async (event, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Produit WHERE idProduit = ?';
    db.query(sql, [id], (err, result) => {
      if (err) { console.error("Erreur SQL (deleteProduit):", err); reject(err); }
      else resolve({ status: 'deleted' });
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
      if (err) { console.error("Erreur SQL (getStatsMagasin):", err); reject(err); }
      else resolve(result[0]);
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

ipcMain.handle('getPermissions', async (event, role_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT page_key, statut FROM Permissions WHERE role_id = ?',
      [role_id],
      (err, result) => {
        if (err) reject(err);
        else {
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

ipcMain.handle('savePermissions', async (event, { role_id, permissions }) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Permissions WHERE role_id = ?', [role_id], (err) => {
      if (err) return reject(err);
      const entries = Object.entries(permissions);
      if (!entries.length) return resolve({ success: true });
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
        const jours = [
          { jourNum: 1, day: "Dim" },
          { jourNum: 2, day: "Lun" },
          { jourNum: 3, day: "Mar" },
          { jourNum: 4, day: "Mer" },
          { jourNum: 5, day: "Jeu" },
          { jourNum: 6, day: "Ven" },
          { jourNum: 7, day: "Sam" },
        ];
        const data = jours.map(j => {
          const found = result.find(r => r.jourNum === j.jourNum);
          return { day: j.day, value: found ? found.total : 0 };
        });
        resolve(data);
      }
    );
  });
});

ipcMain.handle('vendreProduit', async (event, { produit_id, utilisateur_id, quantite }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE Produit SET stock = stock - ? WHERE idProduit = ? AND stock >= ?',
      [quantite, produit_id, quantite],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return resolve({ success: false, message: "Stock insuffisant ou produit inexistant" });
        }
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

    db.query(
      'INSERT INTO Adherent (nom, prenom, dateNaissance, numTelephone, email, sexe, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, dateNaissance || null, numTelephone, email || null, sexe, photo || null],
      (err, resAdherent) => {
        if (err) return reject(err);
        const adherent_id = resAdherent.insertId;

        db.query(
          'INSERT INTO Abonnement (adherent_id, type_id, dateDebut, dateFin, statut, montantDu) VALUES (?, ?, ?, ?, ?, ?)',
          [adherent_id, type_id, dateDebut, dateFin || null, 'actif', montantDu || null],
          (err2, resAbo) => {
            if (err2) return reject(err2);
            const abonnement_id = resAbo.insertId;

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

ipcMain.handle('ajouterPaiement', async (event, { abonnement_id, montant, mode, date }) => {
  return new Promise((resolve, reject) => {
    const modeMap = { 'Espèces': 'cash', 'Carte bancaire': 'carte', 'Virement': 'virement' };
    const modeSQL = modeMap[mode] || mode || 'cash';

    db.query(
      'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement, statut) VALUES (?, ?, ?, ?, ?)',
      [abonnement_id, montant, date, modeSQL, 'Payé'],
      (err, result) => {
        if (err) return reject(err);
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
ipcMain.handle('getPresencesSeance', async (event, seance_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT adherent_id FROM Presence WHERE seance_id = ?',
      [seance_id],
      (err, result) => { if (err) reject(err); else resolve(result.map(r => r.adherent_id)); }
    );
  });
});
ipcMain.handle('addPresence', async (event, { adherent_id, seance_id, date }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT IGNORE INTO Presence (adherent_id, seance_id, date, heureEntree)
       VALUES (?, ?, CURDATE(), CURTIME())`,
      [adherent_id, seance_id, date],
      (err, result) => {
        if (err) return reject(err);
        // affectedRows = 0 → déjà inscrit (IGNORE), 1 → ajouté
        resolve({ insertId: result.insertId, alreadyExists: result.affectedRows === 0 });
      }
    );
  });
});

ipcMain.handle('getActivites', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Activite ORDER BY nom', (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle('addActivite', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, couleur } = data;
    db.query(
      'INSERT INTO Activite (nom, couleur) VALUES (?, ?)',
      [nom, couleur],
      (err, result) => {
        if (err) reject(err);
        else resolve({ insertId: result.insertId });
      }
    );
  });
});

ipcMain.handle('deleteActivite', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Activite WHERE idActivite=?', [id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});
// ══════════════════════════════════════════════
//  REMPLACER l'ancien addTransaction dans main.js
//  par ce handler corrigé
// ══════════════════════════════════════════════

ipcMain.handle('addTransaction', async (event, data) => {
  const { produit_id, type, quantite, prix } = data;

  return new Promise((resolve, reject) => {

    if (type === 'achat') {
      // 1. Mettre à jour le stock
      db.query(
        'UPDATE Produit SET stock = stock + ? WHERE idProduit = ?',
        [quantite, produit_id],
        (err) => {
          if (err) return reject(err);

          // 2. Insérer dans HistoriqueAchat
          db.query(
            'INSERT INTO HistoriqueAchat (date, utilisateur_id, produit_id, quantite, prix_achat) VALUES (NOW(), 1, ?, ?, ?)',
            [produit_id, quantite, prix || 0],
            (err2) => {
              if (err2) return reject(err2);
              resolve({ success: true });
            }
          );
        }
      );
    }

    else if (type === 'vente') {
      // 1. Vérifier le stock avant de vendre
      db.query(
        'SELECT stock FROM Produit WHERE idProduit = ?',
        [produit_id],
        (err, rows) => {
          if (err) return reject(err);
          if (!rows || rows.length === 0) return reject(new Error('Produit introuvable'));
          if (rows[0].stock < quantite) return reject(new Error('Stock insuffisant'));

          // 2. Déduire le stock
          db.query(
            'UPDATE Produit SET stock = stock - ? WHERE idProduit = ?',
            [quantite, produit_id],
            (err2) => {
              if (err2) return reject(err2);

              // 3. Insérer dans HistoriqueVente
              db.query(
                'INSERT INTO HistoriqueVente (date, utilisateur_id, produit_id, quantite) VALUES (NOW(), 1, ?, ?)',
                [produit_id, quantite],
                (err3) => {
                  if (err3) return reject(err3);
                  resolve({ success: true });
                }
              );
            }
          );
        }
      );
    }

    else {
      reject(new Error(`Type de transaction inconnu : ${type}`));
    }
  });
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

ipcMain.handle('deleteSeance', async (event, id) => {
  return new Promise((resolve, reject) => {
    // Supprimer d'abord les présences liées
    db.query('DELETE FROM Presence WHERE seance_id = ?', [id], (err) => {
      if (err) return reject(err);
      db.query('DELETE FROM Seance WHERE idSeance = ?', [id],
        (err2, result) => { if (err2) reject(err2); else resolve({ success: true }); }
      );
    });
  });
});
// ══════════════════════════════════════════════
//  HISTORIQUE TRANSACTIONS (à ajouter dans main.js)
// ══════════════════════════════════════════════

// Récupérer l'historique des ventes
ipcMain.handle('getHistoriqueVentes', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        hv.id,
        hv.date,
        hv.produit_id,
        hv.quantite,
        hv.utilisateur_id,
        p.prix AS prix_vente,
        p.nom AS produit_nom,
        CONCAT(u.prenom, ' ', u.nom) AS utilisateur_nom
      FROM HistoriqueVente hv
      LEFT JOIN Produit p ON hv.produit_id = p.idProduit
      LEFT JOIN Utilisateur u ON hv.utilisateur_id = u.idUtilisateur
      ORDER BY hv.date DESC
    `;
    db.query(sql, (err, result) => {
      if (err) { console.error('Erreur getHistoriqueVentes:', err); reject(err); }
      else resolve(result);
    });
  });
});

// Récupérer l'historique des achats
ipcMain.handle('getHistoriqueAchats', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        ha.id,
        ha.date,
        ha.produit_id,
        ha.quantite,
        ha.prix_achat,
        ha.utilisateur_id,
        p.nom AS produit_nom,
        CONCAT(u.prenom, ' ', u.nom) AS utilisateur_nom
      FROM HistoriqueAchat ha
      LEFT JOIN Produit p ON ha.produit_id = p.idProduit
      LEFT JOIN Utilisateur u ON ha.utilisateur_id = u.idUtilisateur
      ORDER BY ha.date DESC
    `;
    db.query(sql, (err, result) => {
      if (err) { console.error('Erreur getHistoriqueAchats:', err); reject(err); }
      else resolve(result);
    });
  });
});