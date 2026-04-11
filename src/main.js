const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');
const db = require('./db');

if (require('electron-squirrel-startup')) {
  app.quit();
}

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

ipcMain.handle('updateAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idAbonnement, type_id, dateDebut, dateFin, statut } = data;
    db.query(
      'UPDATE Abonnement SET type_id=?, dateDebut=?, dateFin=?, statut=? WHERE idAbonnement=?',
      [type_id, dateDebut, dateFin, statut, idAbonnement],
      (err, result) => { if (err) reject(err); else resolve(result); }
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
    db.query(
      `SELECT p.*, CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom
       FROM Paiement p
       JOIN Abonnement a ON p.abonnement_id = a.idAbonnement
       JOIN Adherent ad ON a.adherent_id = ad.idAdherent
       ORDER BY p.datePaiement DESC`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('addPaiement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { abonnement_id, montant, datePaiement, modePaiement } = data;
    db.query(
      'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement) VALUES (?, ?, ?, ?)',
      [abonnement_id, montant, datePaiement, modePaiement],
      (err, result) => {
        if (err) { console.error("❌ addPaiement error:", err); reject(err); }
        else resolve(result);
      }
    );
  });
});

// ══════════════════════════════════════════════
//  PRODUITS
// ══════════════════════════════════════════════

ipcMain.handle('getProduits', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Produit ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('addProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, reference, stock, prix, categorie } = data;
    db.query('INSERT INTO Produit (nom, reference, stock, prix, categorie) VALUES (?, ?, ?, ?, ?)',
      [nom, reference, stock, prix, categorie],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('updateProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idProduit, nom, reference, stock, prix, categorie } = data;
    db.query('UPDATE Produit SET nom=?, reference=?, stock=?, prix=?, categorie=? WHERE idProduit=?',
      [nom, reference, stock, prix, categorie, idProduit],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('deleteProduit', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Produit WHERE idProduit=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ══════════════════════════════════════════════
//  ACTIVITES
// ══════════════════════════════════════════════

ipcMain.handle('getActivites', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Activite ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

ipcMain.handle('addActivite', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, couleur } = data;
    db.query('INSERT INTO Activite (nom, couleur) VALUES (?, ?)', [nom, couleur],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('deleteActivite', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Activite WHERE idActivite=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ══════════════════════════════════════════════
//  SÉANCES
// ══════════════════════════════════════════════

ipcMain.handle('getSeancesPlanning', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT s.*, CONCAT(u.nom, ' ', u.prenom) AS coachNom,
        a.nom AS activiteNom, a.couleur AS activiteCouleur
       FROM Seance s
       LEFT JOIN Utilisateur u ON s.coach_id = u.idUtilisateur
       LEFT JOIN Activite a ON s.activite_id = a.idActivite
       ORDER BY s.date, s.heureDebut`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});

ipcMain.handle('addSeance', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { date, heureDebut, heureFin, participantsMax, coach_id, activite_id } = data;
    db.query(
      `INSERT INTO Seance (date, heureDebut, heureFin, participantsMax, coach_id, activite_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [date, heureDebut, heureFin, participantsMax, coach_id, activite_id],
      (err, result) => { if (err) reject(err); else resolve({ insertId: result.insertId }); }
    );
  });
});

ipcMain.handle('deleteSeance', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Seance WHERE idSeance=?', [id],
      (err, result) => { if (err) reject(err); else resolve(result); });
  });
});

// ══════════════════════════════════════════════
//  RECETTE
// ══════════════════════════════════════════════

ipcMain.handle('getRecette', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        (SELECT IFNULL(SUM(montant), 0) FROM Paiement) AS recettePaiements,
        (SELECT IFNULL(SUM(p.prix * h.quantite), 0)
         FROM HistoriqueVente h JOIN Produit p ON h.produit_id = p.idProduit) AS recetteVentes`,
      (err, result) => {
        if (err) reject(err);
        else {
          const r = result[0];
          resolve({
            recettePaiements: r.recettePaiements,
            recetteVentes:    r.recetteVentes,
            total: parseFloat(r.recettePaiements) + parseFloat(r.recetteVentes),
          });
        }
      }
    );
  });
});

ipcMain.handle('getRecetteParMois', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT DATE_FORMAT(datePaiement, '%Y-%m') AS mois, SUM(montant) AS total
       FROM Paiement GROUP BY mois ORDER BY mois DESC LIMIT 12`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
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