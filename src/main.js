const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');
const db = require('./db');

if (require('electron-squirrel-startup')) {
  app.quit();
}

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

  // ── Fix CSP ──
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

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

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

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
ipcMain.handle('login', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { email, motDePasse } = data;
    db.query(
      'SELECT * FROM Utilisateur WHERE email = ? AND motDePasse = ?',
      [email, motDePasse],
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

// Récupérer tous les adhérents
ipcMain.handle('getAdherents', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Adherent ORDER BY dateCreation DESC', (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

// Ajouter un adhérent
ipcMain.handle('addAdherent', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, prenom, dateNaissance, numTelephone, email, sexe } = data;
    db.query(
      'INSERT INTO Adherent (nom, prenom, dateNaissance, numTelephone, email, sexe) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, dateNaissance, numTelephone, email, sexe],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

// Modifier un adhérent
ipcMain.handle('updateAdherent', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idAdherent, nom, prenom, dateNaissance, numTelephone, email, sexe } = data;
    db.query(
      'UPDATE Adherent SET nom=?, prenom=?, dateNaissance=?, numTelephone=?, email=?, sexe=? WHERE idAdherent=?',
      [nom, prenom, dateNaissance, numTelephone, email, sexe, idAdherent],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

// Supprimer un adhérent
ipcMain.handle('deleteAdherent', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Adherent WHERE idAdherent=?', [id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});


// ══════════════════════════════════════════════
//  ABONNEMENTS
// ══════════════════════════════════════════════
// Récupérer tous les types
ipcMain.handle('getTypeAbonnements', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM TypeAbonnement ORDER BY nom ASC', (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

// Ajouter un type d'abonnement
ipcMain.handle('addTypeAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, duree, prix } = data;
    db.query('INSERT INTO TypeAbonnement (nom, duree, prix) VALUES (?, ?, ?)', [nom, duree, prix], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});


// Récupérer tous les abonnements avec nom adhérent
ipcMain.handle('getAbonnements', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT a.*, 
        CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom,
        t.nom AS typeNom, t.prix AS typePrix
       FROM Abonnement a
      LEFT JOIN Adherent ad ON a.adherent_id = ad.idAdherent
LEFT JOIN TypeAbonnement t ON a.type_id = t.id
       ORDER BY a.dateDebut DESC`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

// Ajouter un abonnement
ipcMain.handle('addAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { adherent_id, type_id, dateDebut, dateFin, statut } = data;
    db.query(
      'INSERT INTO Abonnement (adherent_id, type_id, dateDebut, dateFin, statut) VALUES (?, ?, ?, ?, ?)',
      [adherent_id, type_id, dateDebut, dateFin, statut],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

// Récupérer les types d'abonnement
ipcMain.handle('getTypesAbonnement', async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM TypeAbonnement', (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});


// ══════════════════════════════════════════════
//  PAIEMENTS
// ══════════════════════════════════════════════

// Récupérer tous les paiements
ipcMain.handle('getPaiements', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT p.*, 
        CONCAT(ad.nom, ' ', ad.prenom) AS adherentNom
       FROM Paiement p
       JOIN Abonnement a ON p.abonnement_id = a.idAbonnement
       JOIN Adherent ad ON a.adherent_id = ad.idAdherent
       ORDER BY p.datePaiement DESC`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

// Ajouter un paiement
ipcMain.handle('addPaiement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { abonnement_id, montant, datePaiement, modePaiement, statut } = data;
    db.query(
      'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement, statut) VALUES (?, ?, ?, ?, ?)',
      [abonnement_id, montant, datePaiement, modePaiement, statut],
      (err, result) => {
        if (err) reject(err);
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
    db.query('SELECT * FROM Produit ORDER BY nom', (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle('addProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { nom, reference, stock, prix, categorie } = data;
    db.query(
      'INSERT INTO Produit (nom, reference, stock, prix, categorie) VALUES (?, ?, ?, ?, ?)',
      [nom, reference, stock, prix, categorie],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

ipcMain.handle('updateProduit', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { idProduit, nom, reference, stock, prix, categorie } = data;
    db.query(
      'UPDATE Produit SET nom=?, reference=?, stock=?, prix=?, categorie=? WHERE idProduit=?',
      [nom, reference, stock, prix, categorie, idProduit],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

ipcMain.handle('deleteProduit', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Produit WHERE idProduit=?', [id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});


// ══════════════════════════════════════════════
//  SÉANCES
// ══════════════════════════════════════════════

ipcMain.handle('getSeances', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT s.*, CONCAT(u.nom, ' ', u.prenom) AS coachNom
       FROM Seance s
       LEFT JOIN Utilisateur u ON s.coach_id = u.idUtilisateur
       ORDER BY s.date DESC`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});

ipcMain.handle('addSeance', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { date, heureDebut, heureFin, participantsMax, coach_id } = data;
    db.query(
      'INSERT INTO Seance (date, heureDebut, heureFin, participantsMax, coach_id) VALUES (?, ?, ?, ?, ?)',
      [date, heureDebut, heureFin, participantsMax, coach_id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});


// ══════════════════════════════════════════════
//  RECETTE (dashboard)
// ══════════════════════════════════════════════

ipcMain.handle('getRecette', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        (SELECT IFNULL(SUM(montant), 0) FROM Paiement WHERE statut='validé') AS recettePaiements,
        (SELECT IFNULL(SUM(p.prix * h.quantite), 0)
         FROM HistoriqueVente h
         JOIN Produit p ON h.produit_id = p.idProduit) AS recetteVentes`,
      (err, result) => {
        if (err) reject(err);
        else {
          const r = result[0];
          resolve({
            recettePaiements: r.recettePaiements,
            recetteVentes: r.recetteVentes,
            total: parseFloat(r.recettePaiements) + parseFloat(r.recetteVentes)
          });
        }
      }
    );
  });
});

// Recette par mois (pour graphique)
ipcMain.handle('getRecetteParMois', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        DATE_FORMAT(datePaiement, '%Y-%m') AS mois,
        SUM(montant) AS total
       FROM Paiement
       WHERE statut='validé'
       GROUP BY mois
       ORDER BY mois DESC
       LIMIT 12`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});