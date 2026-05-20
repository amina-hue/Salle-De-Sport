// require('dotenv').config();


// const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
// const path = require('node:path');
// const fs   = require('fs');
// const os   = require('os');
// const db = require('./db');
// if (require('electron-squirrel-startup')) app.quit();

// // ══════════════════════════════════════════════
// //  FENÊTRE PRINCIPALE
// // ══════════════════════════════════════════════

// const createWindow = () => {
//   const mainWindow = new BrowserWindow({
//     width: 1280, height: 800, minWidth: 1024, minHeight: 650, show: false,
//     webPreferences: { preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY },
//   });
//  const { shell } = require('electron');
//   mainWindow.webContents.setWindowOpenHandler(({ url }) => {
//     if (url.startsWith('https://wa.me')) {
//       shell.openExternal(url);
//       return { action: 'deny' };
//     }
//     return { action: 'allow' };
//   });
//   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
//           "img-src 'self' data: https: http:; " +
//           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//           "font-src 'self' https://fonts.gstatic.com data:; " +
//           "connect-src 'self' https: http:;"
//         ]
//       }
//     });
//   });

//   mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
//   mainWindow.webContents.on('did-finish-load', () => { mainWindow.show(); });
// };

// app.whenReady().then(() => {
//   createWindow();
//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// // ── Helper : transforme un db.query callback en Promise ──────────────────────
// const query = (sql, params = []) =>
//   new Promise((resolve, reject) =>
//     db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
//   );

// // ══════════════════════════════════════════════
// //  AUTO-EXPIRE HELPER
// //  Gère 2 cas :
// //   1. Abonnement suspendu dont dateFinSuspension < CURDATE()
// //      → la dateFin a DÉJÀ été décalée lors de la suspension
// //      → on remet juste le statut à 'actif' (ou 'expiré' si dateFin aussi dépassée)
// //        et on efface les champs suspension
// //   2. Abonnement actif dont dateFin < CURDATE() → expiré
// // ══════════════════════════════════════════════
// const autoExpire = (cb) => {
//   // Étape 1 : reprendre automatiquement les suspensions dont la période est terminée.
//   //           dateFin a déjà été décalée lors de la suspension → on ne retouche pas dateFin.
//   //           On remet juste actif/expiré selon si dateFin est encore dans le futur ou non.
//   db.query(
//     `UPDATE Abonnement
//      SET
//        statut            = CASE
//                              WHEN dateFin < CURDATE() THEN 'expiré'
//                              ELSE 'actif'
//                            END,
//        dureeSuspension   = NULL,
//        causeSuspension   = NULL,
//        dateFinSuspension = NULL
//      WHERE statut = 'suspendu'
//        AND dateFinSuspension IS NOT NULL
//        AND dateFinSuspension < CURDATE()`,
//     (errSuspend) => {
//       if (errSuspend) console.error('Auto-reprise suspension error:', errSuspend);

//       // Étape 2 : expirer les abonnements actifs dont la dateFin est dépassée
//       db.query(
//         `UPDATE Abonnement
//          SET statut = 'expiré'
//          WHERE statut = 'actif'
//            AND dateFin < CURDATE()`,
//         (errExpire) => {
//           if (errExpire) console.error('Auto-expire error:', errExpire);
//           if (cb) cb();
//         }
//       );
//     }
//   );
// };
require('dotenv').config();
 
const { app, BrowserWindow, session, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs   = require('fs');
const os   = require('os');
const { initDatabase, getDb } = require('./db');
 
if (require('electron-squirrel-startup')) app.quit();
 
// ── Raccourci db.query utilisable partout dans le fichier ────────────────────
const db = {
  query: (...args) => getDb().query(...args),
};
 
// ── Helper : transforme un db.query callback en Promise ──────────────────────
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
  );
 
// ══════════════════════════════════════════════
//  FENÊTRE PRINCIPALE
// ══════════════════════════════════════════════
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 650, show: false,
    webPreferences: { preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY },
  });
 
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://wa.me')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
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
 
// ══════════════════════════════════════════════
//  FENÊTRE D'ERREUR MySQL (si MySQL non détecté)
// ══════════════════════════════════════════════
const createMysqlErrorWindow = () => {
  const platform = process.platform; // 'win32', 'darwin', 'linux'
 
  const instructions = {
    win32: {
      title: 'MySQL requis — Windows',
      steps: `
        <ol>
          <li>Télécharge MySQL : <a href="https://dev.mysql.com/downloads/installer/" target="_blank">dev.mysql.com/downloads/installer</a></li>
          <li>Lance l'installeur et choisis <b>MySQL Server</b></li>
          <li>Lors de la config, définis le mot de passe root : <code>Fitmanager@2026</code></li>
          <li>Assure-toi que MySQL démarre automatiquement avec Windows</li>
          <li>Relance FitManager ✅</li>
        </ol>
      `,
    },
    darwin: {
      title: 'MySQL requis — macOS',
      steps: `
        <ol>
          <li>Installe Homebrew si besoin : <a href="https://brew.sh" target="_blank">brew.sh</a></li>
          <li>Dans le Terminal : <code>brew install mysql</code></li>
          <li>Démarre MySQL : <code>brew services start mysql</code></li>
          <li>Définis le mot de passe root : <code>mysql_secure_installation</code></li>
          <li>Mot de passe à utiliser : <code>Fitmanager@2026</code></li>
          <li>Relance FitManager ✅</li>
        </ol>
      `,
    },
    linux: {
      title: 'MySQL requis — Linux',
      steps: `
        <ol>
          <li>Dans le Terminal : <code>sudo apt install mysql-server</code></li>
          <li>Démarre MySQL : <code>sudo systemctl start mysql</code></li>
          <li>Configure le mot de passe root :<br><code>sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Fitmanager@2026'; FLUSH PRIVILEGES;"</code></li>
          <li>Relance FitManager ✅</li>
        </ol>
      `,
    },
  };
 
  const info = instructions[platform] || instructions.linux;
 
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>FitManager — Configuration requise</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0f172a;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 32px;
        }
        .card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 40px;
          max-width: 560px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 22px; color: #f8fafc; margin-bottom: 8px; }
        .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 28px; }
        .steps-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        ol { padding-left: 20px; }
        li { margin-bottom: 12px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        code {
          background: #0f172a;
          border: 1px solid #334155;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
          color: #38bdf8;
        }
        a { color: #38bdf8; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .btn {
          margin-top: 32px;
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: #2563eb; }
        .error-box {
          background: #450a0a;
          border: 1px solid #991b1b;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #fca5a5;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">⚙️</div>
        <h1>${info.title}</h1>
        <p class="subtitle">FitManager nécessite MySQL pour fonctionner. Suis ces étapes pour l'installer :</p>
        <div class="error-box">
          ❌ Impossible de se connecter à MySQL sur localhost
        </div>
        <p class="steps-title">Étapes d'installation</p>
        ${info.steps}
        <button class="btn" onclick="window.close()">J'ai installé MySQL — Relancer FitManager</button>
      </div>
      <script>
        document.querySelector('.btn').addEventListener('click', () => {
          require('electron').ipcRenderer.send('retry-mysql');
        });
        // Ouvrir les liens dans le navigateur
        document.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            require('electron').shell.openExternal(a.href);
          });
        });
      </script>
    </body>
    </html>
  `;
 
  const tmpPath = path.join(os.tmpdir(), 'fitmanager-mysql-error.html');
  fs.writeFileSync(tmpPath, html);
 
  const errorWindow = new BrowserWindow({
    width: 640,
    height: 580,
    resizable: false,
    title: 'FitManager — Configuration requise',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
 
  errorWindow.setMenuBarVisibility(false);
  errorWindow.loadFile(tmpPath);
  return errorWindow;
};
 
// ══════════════════════════════════════════════
//  DÉMARRAGE DE L'APP
// ══════════════════════════════════════════════
app.whenReady().then(async () => {
  // Si lancé par Squirrel pendant l'installation, on quitte proprement
  if (process.argv.some(arg =>
    arg.includes('--squirrel-install') ||
    arg.includes('--squirrel-updated') ||
    arg.includes('--squirrel-uninstall') ||
    arg.includes('--squirrel-obsolete')
  )) {
    app.quit();
    return;
  }

  try {
    await initDatabase();
    createWindow();
  } catch (err) {
    console.error('❌ MySQL non disponible:', err.message);
    const errWin = createMysqlErrorWindow();
 
    // Si l'utilisateur clique "Relancer", on réessaie
    ipcMain.on('retry-mysql', async () => {
      try {
        await initDatabase();
        errWin.close();
        createWindow();
      } catch (e) {
        // La fenêtre d'erreur reste ouverte
        console.error('MySQL toujours indisponible:', e.message);
      }
    });
  }
 
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
 
// ══════════════════════════════════════════════
//  AUTO-EXPIRE HELPER
// ══════════════════════════════════════════════
const autoExpire = (cb) => {
  db.query(
    `UPDATE Abonnement
     SET statut = CASE WHEN dateFin < CURDATE() THEN 'expiré' ELSE 'actif' END,
         dureeSuspension = NULL, causeSuspension = NULL, dateFinSuspension = NULL
     WHERE statut = 'suspendu'
       AND dateFinSuspension IS NOT NULL AND dateFinSuspension < CURDATE()`,
    (errSuspend) => {
      if (errSuspend) console.error('Auto-reprise suspension error:', errSuspend);
      db.query(
        `UPDATE Abonnement SET statut = 'expiré'
         WHERE statut = 'actif' AND dateFin < CURDATE()`,
        (errExpire) => {
          if (errExpire) console.error('Auto-expire error:', errExpire);
          if (cb) cb();
        }
      );
    }
  );
};
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',        // adapte selon ton fournisseur
  port: 587,
  secure: false,
  auth: {
    user: 'tinhinanethequeen@gmail.com',
    pass: 'gjgw vqfa qzkp wbfa', // mot de passe d'application recommandé
  },
});

ipcMain.handle('sendEmail', async (event, { to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"FitManager" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Erreur sendEmail :', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('getEmailsAdherentsActifs', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT ad.email, ad.prenom, ad.nom
       FROM Adherent ad
       JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent
       WHERE ab.statut = 'actif'
         AND ad.email IS NOT NULL AND ad.email != ''`,
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
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
ipcMain.handle('getHistoriqueAbonnements', async (event, adherent_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT
         ab.idAbonnement,
         t.nom        AS typeNom,
         ab.dateDebut,
         ab.dateFin,
         ab.statut,
         ab.montantDu,
         COALESCE(SUM(p.montant), 0) AS totalPaye
       FROM Abonnement ab
       LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
       LEFT JOIN Paiement p ON p.abonnement_id = ab.idAbonnement
       WHERE ab.adherent_id = ?
       GROUP BY ab.idAbonnement, t.nom, ab.dateDebut, ab.dateFin, ab.statut, ab.montantDu
       ORDER BY ab.dateDebut DESC`,
      [adherent_id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
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
// REMPLACER le handler 'addAbonnement' par celui-ci :
ipcMain.handle('addAbonnement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const {
      adherent_id, type_id, dateDebut, dateFin, statut,
      montantDu,
      dureeSuspension, causeSuspension, dateFinSuspension,
    } = data;

    db.query(
      `INSERT INTO Abonnement
         (adherent_id, type_id, dateDebut, dateFin, statut, montantDu,
          dureeSuspension, causeSuspension, dateFinSuspension)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adherent_id, type_id, dateDebut, dateFin, statut,
        montantDu        ?? null,
        dureeSuspension  ?? null,
        causeSuspension  ?? null,
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


//  getPaiements 


ipcMain.handle('getPaiements', async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        p.idPaiement                          AS id,
        p.montant                             AS montant,
        ab.montantDu                          AS montantDu,
        p.datePaiement                        AS datePaiementRaw,
        p.modePaiement                        AS mode,
        CONCAT(a.prenom, ' ', a.nom)          AS nom,
        'Payé'                                AS statut
      FROM Paiement p
      JOIN Abonnement ab ON p.abonnement_id = ab.idAbonnement
      JOIN Adherent a    ON ab.adherent_id  = a.idAdherent

      UNION ALL

      SELECT
        ab.idAbonnement                       AS id,
        0                                     AS montant,
        ab.montantDu                          AS montantDu,
        ab.dateDebut                          AS datePaiementRaw,
        NULL                                  AS mode,
        CONCAT(a.prenom, ' ', a.nom)          AS nom,
        'En attente'                          AS statut
      FROM Abonnement ab
      JOIN Adherent a ON ab.adherent_id = a.idAdherent
      WHERE ab.montantDu > 0
        AND NOT EXISTS (
          SELECT 1 FROM Paiement p WHERE p.abonnement_id = ab.idAbonnement
        )

      ORDER BY datePaiementRaw DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erreur getPaiements:', err);
        reject(err);
      } else {
        console.log('>>> getPaiements résultats:', results.length, 'lignes');
        console.log('>>> En attente:', results.filter(r => r.statut === 'En attente').length);
        resolve(results);
      }
    });
  });
});
 

// REMPLACER ipcMain.handle('addPaiement') dans main.js par ceci :

ipcMain.handle('addPaiement', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { abonnement_id, montant, date, mode } = data;

    const modeMap = {
      'carte':          'carte',
      'virement':       'virement',
      'cash':           'cash',
      'Carte bancaire': 'carte',
      'Virement':       'virement',
      'Espèces':        'cash',
    };
    const modeSQL = modeMap[mode] || 'cash';

    db.query(
      'INSERT INTO Paiement (abonnement_id, montant, datePaiement, modePaiement, statut) VALUES (?, ?, ?, ?, ?)',
      [abonnement_id, montant, date, modeSQL, 'Payé'],
      (err, result) => {
        if (err) {
          console.error('❌ ERREUR SQL addPaiement:', err);
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
//  PAIEMENTS + ABONNEMENTS EN ATTENTE DE PAIEMENT
// ══════════════════════════════════════════════
ipcMain.handle('getPaiementsEtAttentes', async () => {
  return new Promise((resolve, reject) => {
    // 1. Paiements réels déjà enregistrés
    const sqlPaiements = `
      SELECT 
        CONCAT('P-', p.idPaiement) AS id,
        p.idPaiement,
        NULL AS idAbonnement,
        p.montant,
        DATE_FORMAT(p.datePaiement, '%d/%m/%Y') AS date,
        p.modePaiement AS mode,
        CONCAT(a.prenom, ' ', a.nom) AS nom,
        a.idAdherent,
        ab.idAbonnement AS abonnement_id,
        'Payé' AS statut,
        t.nom AS typeNom
      FROM Paiement p
      JOIN Abonnement ab ON p.abonnement_id = ab.idAbonnement
      JOIN Adherent a ON ab.adherent_id = a.idAdherent
      LEFT JOIN TypeAbonnement t ON ab.type_id = t.id
      ORDER BY p.datePaiement DESC
    `;

    // 2. Abonnements avec solde restant (montantDu > totalPaye)
    const sqlAttentes = `
      SELECT 
        CONCAT('A-', ab.idAbonnement) AS id,
        NULL AS idPaiement,
        ab.idAbonnement,
        (COALESCE(ab.montantDu, t.prix) - COALESCE(SUM(p.montant), 0)) AS montant,
        DATE_FORMAT(ab.dateDebut, '%d/%m/%Y') AS date,
        NULL AS mode,
        CONCAT(ad.prenom, ' ', ad.nom) AS nom,
        ad.idAdherent,
        ab.idAbonnement AS abonnement_id,
        'En attente' AS statut,
        t.nom AS typeNom
      FROM Abonnement ab
      JOIN Adherent ad ON ab.adherent_id = ad.idAdherent
      JOIN TypeAbonnement t ON ab.type_id = t.id
      LEFT JOIN Paiement p ON p.abonnement_id = ab.idAbonnement
      GROUP BY ab.idAbonnement, ad.idAdherent, ad.prenom, ad.nom, 
               ab.montantDu, t.prix, ab.dateDebut, t.nom
      HAVING (COALESCE(ab.montantDu, t.prix) - COALESCE(SUM(p.montant), 0)) > 0
      ORDER BY ab.dateDebut DESC
    `;

    db.query(sqlPaiements, (err1, paiements) => {
      if (err1) return reject(err1);
      db.query(sqlAttentes, (err2, attentes) => {
        if (err2) return reject(err2);
        resolve([...paiements, ...attentes]);
      });
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
//  SYSTÈME FIDÉLITÉ AVEC EXPIRATION
// ══════════════════════════════════════════════

const NIVEAUX_CONFIG = {
  Bronze:  { min: 0,    remise: 0,  achatsMois: 0, depenseMois: 0    },
  Silver:  { min: 500,  remise: 5,  achatsMois: 2, depenseMois: 1500 },
  Gold:    { min: 1500, remise: 10, achatsMois: 3, depenseMois: 3000 },
  Platine: { min: 3000, remise: 15, achatsMois: 3, depenseMois: 5000 },
};

// Vérifie et met à jour les niveaux expirés
const checkNiveauxExpires = (cb) => {
  db.query(
    `SELECT 
       a.idAdherent,
       a.niveau,
       a.niveau_expire,
       COUNT(hv.id) AS achats_3mois,
       COALESCE(SUM(hv.quantite * COALESCE(hv.prix_vente, p.prix)), 0) AS depense_3mois
     FROM Adherent a
     LEFT JOIN HistoriqueVente hv ON hv.adherent_id = a.idAdherent
       AND hv.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
     LEFT JOIN Produit p ON p.idProduit = hv.produit_id
     WHERE a.niveau_expire IS NOT NULL
       AND a.niveau_expire <= CURDATE()
       AND a.niveau != 'Bronze'
     GROUP BY a.idAdherent`,
    (err, adherents) => {
      if (err) { console.error('checkNiveauxExpires error:', err); if (cb) cb(); return; }

      if (!adherents.length) { if (cb) cb(); return; }

      const ORDRE = ['Bronze', 'Silver', 'Gold', 'Platine'];

      const updates = adherents.map(ad => {
        const niveauActuel = ad.niveau;
        const config = NIVEAUX_CONFIG[niveauActuel];
        const idx = ORDRE.indexOf(niveauActuel);

        // Vérifie si le client a été assez actif pour renouveler
        const aRenouvele = 
          ad.achats_3mois >= config.achatsMois &&
          ad.depense_3mois >= config.depenseMois;

        let nouveauNiveau;
        if (aRenouvele) {
          // Renouvelle le même niveau
          nouveauNiveau = niveauActuel;
        } else {
          // Descend d'un niveau
          nouveauNiveau = ORDRE[Math.max(0, idx - 1)];
        }

        const nouveauExpire = nouveauNiveau === 'Bronze' 
          ? null 
          : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        return new Promise((resolve) => {
          db.query(
            `UPDATE Adherent 
             SET niveau = ?, niveau_depuis = CURDATE(), niveau_expire = ?
             WHERE idAdherent = ?`,
            [nouveauNiveau, nouveauExpire, ad.idAdherent],
            (err2) => { resolve(); }
          );
        });
      });

      Promise.all(updates).then(() => { if (cb) cb(); });
    }
  );
};

// Met à jour les points ET le niveau d'un adhérent après un achat
const updatePointsEtNiveau = (adherentId, cb) => {
  db.query(
    `SELECT 
       FLOOR(COALESCE(SUM(hv.quantite * COALESCE(hv.prix_vente, p.prix)), 0) / 100) AS points
     FROM HistoriqueVente hv
     LEFT JOIN Produit p ON p.idProduit = hv.produit_id
     WHERE hv.adherent_id = ?`,
    [adherentId],
    (err, rows) => {
      if (err) { if (cb) cb(err); return; }

      const points = rows[0]?.points ?? 0;
      const ORDRE = ['Bronze', 'Silver', 'Gold', 'Platine'];

      // Détermine le niveau selon les points
      let nouveauNiveau = 'Bronze';
      if (points >= 3000) nouveauNiveau = 'Platine';
      else if (points >= 1500) nouveauNiveau = 'Gold';
      else if (points >= 500)  nouveauNiveau = 'Silver';

      // Récupère le niveau actuel
      db.query(
        'SELECT niveau, niveau_expire FROM Adherent WHERE idAdherent = ?',
        [adherentId],
        (err2, adRows) => {
          if (err2) { if (cb) cb(err2); return; }

          const niveauActuel = adRows[0]?.niveau ?? 'Bronze';
          const expireActuel = adRows[0]?.niveau_expire;
          const ORDRE_IDX = ORDRE.indexOf(nouveauNiveau);
          const ACTUEL_IDX = ORDRE.indexOf(niveauActuel);

          // Monte de niveau → nouveau timer 3 mois
          // Même niveau avec expire null → set le timer
          // Descente → géré par checkNiveauxExpires
          const doitMonter = ORDRE_IDX > ACTUEL_IDX;
          const naPasDeTimer = !expireActuel && nouveauNiveau !== 'Bronze';

          if (doitMonter || naPasDeTimer) {
            const expire = nouveauNiveau === 'Bronze'
              ? null
              : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            db.query(
              `UPDATE Adherent 
               SET points = ?, niveau = ?, niveau_depuis = CURDATE(), niveau_expire = ?
               WHERE idAdherent = ?`,
              [points, nouveauNiveau, expire, adherentId],
              (err3) => { if (cb) cb(err3); }
            );
          } else {
            // Juste mettre à jour les points
            db.query(
              'UPDATE Adherent SET points = ? WHERE idAdherent = ?',
              [points, adherentId],
              (err3) => { if (cb) cb(err3); }
            );
          }
        }
      );
    }
  );
};

// Handler pour récupérer les points fidélité avec expiration
ipcMain.handle('getPointsFidelite', async () => {
  return new Promise((resolve, reject) => {
    checkNiveauxExpires(() => {
      console.log('checkNiveauxExpires terminé, lancement requête...');  // ← AJOUTER
      db.query(
        `SELECT 
           a.idAdherent,
           a.nom,
           a.prenom,
           a.niveau,
           a.niveau_depuis,
           a.niveau_expire,
           COALESCE(SUM(hv.quantite * COALESCE(hv.prix_vente, p.prix)), 0) AS total_depense,
           FLOOR(COALESCE(SUM(hv.quantite * COALESCE(hv.prix_vente, p.prix)), 0) / 100) AS points,
           COUNT(hv.id) AS nb_achats,
           MAX(hv.date) AS dernier_achat
         FROM Adherent a
         LEFT JOIN HistoriqueVente hv ON hv.adherent_id = a.idAdherent
         LEFT JOIN Produit p ON p.idProduit = hv.produit_id
         GROUP BY a.idAdherent, a.nom, a.prenom, a.niveau, a.niveau_depuis, a.niveau_expire
         ORDER BY points DESC`,
        (err, rows) => {
          console.log('résultat:', err, rows?.length);  // ← AJOUTER
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  });
});

// Appeler après chaque vente pour mettre à jour le niveau
ipcMain.handle('updateFideliteApresVente', async (event, adherentId) => {
  return new Promise((resolve, reject) => {
    if (!adherentId) return resolve({ success: true });
    updatePointsEtNiveau(adherentId, (err) => {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});
ipcMain.handle('get-historique-adherent', async (_, adherentId) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT 
        hv.id,
        hv.date,
        hv.quantite,
        COALESCE(hv.prix_vente, p.prix) AS prix,
        p.nom AS produit_nom
      FROM HistoriqueVente hv
      JOIN Produit p ON p.idProduit = hv.produit_id
      WHERE hv.adherent_id = ?
      ORDER BY hv.date DESC
    `, [adherentId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});


// ══════════════════════════════════════════════
//  UTILISATEURS
// ══════════════════════════════════════════════

ipcMain.handle('getUtilisateurs', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.*, r.nom AS roleNom
       FROM Utilisateur u
       LEFT JOIN Role r ON u.role_id = r.id
       WHERE u.deleted_at IS NULL`,
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
    db.query(
      'UPDATE Utilisateur SET deleted_at = NOW() WHERE idUtilisateur = ?',
      [id],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
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
        DAYOFWEEK(dateCreation) AS jourNum,
        COUNT(*) AS total
       FROM Adherent
       GROUP BY DAYOFWEEK(dateCreation)
       ORDER BY DAYOFWEEK(dateCreation)`,
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
// ══════════════════════════════════════════════
//  AJOUTER CE BLOC dans main.js
//  juste après le handler getFrequentationSemaine
// ══════════════════════════════════════════════
ipcMain.handle('addSeanceLibre', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { montant, date, modePaiement, note } = data;
    db.query(
      'INSERT INTO SeanceLibre (montant, date, modePaiement, note) VALUES (?, ?, ?, ?)',
      [montant, date, modePaiement || 'cash', note || null],
      (err, result) => {
        if (err) reject(err);
        else resolve({ success: true, insertId: result.insertId });
      }
    );
  });
});
ipcMain.handle('getSeancesLibres', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM SeanceLibre ORDER BY date DESC',
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
});
ipcMain.handle('getSeancesParJour', async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        DAYOFWEEK(date) AS jourNum,
        COUNT(*)        AS total
       FROM Seance
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



ipcMain.handle('addSeance', async (event, data) => {
  return new Promise((resolve, reject) => {
    const { date, heureDebut, heureFin, participantsMax, coach_id, activite_id, publicCible } = data;

    console.log('publicCible reçu :', publicCible); // temporaire pour vérifier

    db.query(
      'INSERT INTO Seance (date, heureDebut, heureFin, participantsMax, coach_id, activite_id, publicCible) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, heureDebut, heureFin, participantsMax || 15, coach_id || null, activite_id || null, publicCible || 'Homme'],
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
    db.query(
      'SELECT * FROM Activite WHERE deleted_at IS NULL ORDER BY nom',
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
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
    db.query(
      'UPDATE Activite SET deleted_at = NOW() WHERE idActivite = ?',
      [id],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
// ══════════════════════════════════════════════
//  REMPLACER l'ancien addTransaction dans main.js
//  par ce handler corrigé
// ══════════════════════════════════════════════

ipcMain.handle('addTransaction', async (event, data) => {
  const { produit_id, type, quantite, prix, adherent_id, client_externe } = data;

  return new Promise((resolve, reject) => {

    if (type === 'achat') {
      db.query(
        'UPDATE Produit SET stock = stock + ? WHERE idProduit = ?',
        [quantite, produit_id],
        (err) => {
          if (err) return reject(err);
          db.query(
            'INSERT INTO HistoriqueAchat (date, utilisateur_id, produit_id, quantite, prix_achat) VALUES (NOW(), 1, ?, ?, ?)',
            [produit_id, quantite, prix || 0],
            (err2) => { if (err2) reject(err2); else resolve({ success: true }); }
          );
        }
      );
    }

    else if (type === 'vente') {
      db.query('SELECT stock, prix FROM Produit WHERE idProduit = ?', [produit_id], (err, rows) => {
        if (err) return reject(err);
        if (!rows?.length) return reject(new Error('Produit introuvable'));
        if (rows[0].stock < quantite) return reject(new Error('Stock insuffisant'));

      const prixVente = (data.prix_vente != null && data.prix_vente > 0)
  ? data.prix_vente          // prix après remise envoyé par le frontend
  : rows[0].prix;            // fallback : prix catalogue // toujours le prix catalogue

        db.query(
          'UPDATE Produit SET stock = stock - ? WHERE idProduit = ?',
          [quantite, produit_id],
          (err2) => {
            if (err2) return reject(err2);

            // adherent_id peut être null (client externe ou anonyme)
            const adhId = adherent_id || null;
            const clientExt = (!adherent_id && client_externe) ? client_externe.trim() : null;

            db.query(
              `INSERT INTO HistoriqueVente 
                (date, utilisateur_id, produit_id, quantite, prix_vente, adherent_id, client_externe) 
               VALUES (NOW(), 1, ?, ?, ?, ?, ?)`,
              [produit_id, quantite, prixVente, adhId, clientExt],
              (err3) => {
  if (err3) return reject(err3);
  // Met à jour points et niveau si c'est un adhérent
  if (adhId) {
    updatePointsEtNiveau(adhId, () => resolve({ success: true }));
  } else {
    resolve({ success: true });
  }
}
            );
          }
        );
      });
    }

    else {
      reject(new Error(`Type inconnu : ${type}`));
    }
  });
});
ipcMain.handle('getAdherentNiveau', async (event, adherentId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT niveau FROM Adherent WHERE idAdherent = ?',
      [adherentId],
      (err, rows) => {
        if (err) return reject(err);
        const niveau = rows[0]?.niveau ?? 'Bronze';
        const REMISES = { Bronze: 0, Silver: 5, Gold: 10, Platine: 15 };
        resolve({ niveau, remise: REMISES[niveau] ?? 0 });
      }
    );
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
        hv.adherent_id,
        hv.prix_vente,
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


ipcMain.handle('exportPlanningPDF', async (event, { html, filename }) => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    landscape: true,
    pageSize: 'A4',
  });
  win.destroy();

  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename || 'planning.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  }
  return { success: false, cancelled: true };
});

ipcMain.handle('sendSpecialMessage', async (event, { type, customText, customSubject }) => {
  const templates = {
    aidkoum: {
      subject: '🎉 Saha Aidkoum — FitManager',
      html: `<div style="font-family:sans-serif;padding:24px">
               <h2>🌙 Saha Aidkoum wa Saha Ftourkoum !</h2>
               <p>Toute l'équipe FitManager vous souhaite une excellente fête de l'Aïd,
                  pleine de joie et de bonheur.</p>
               <p>À très bientôt au club !</p>
             </div>`,
    },
    fermeture: {
      subject: '⚠️ Fermeture exceptionnelle — FitManager',
      html: `<div style="font-family:sans-serif;padding:24px">
               <h2>⚠️ Fermeture exceptionnelle</h2>
               <p>${customText || 'Le club sera fermé exceptionnellement. Merci de votre compréhension.'}</p>
             </div>`,
    },
    custom: {
      subject: customSubject || 'Message de FitManager',
      html: `<div style="font-family:sans-serif;padding:24px"><p>${customText || ''}</p></div>`,
    },
  };

  const tpl = templates[type] || templates.custom;

  const adherents = await query(
    `SELECT ad.email FROM Adherent ad
     JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent
     WHERE ab.statut = 'actif' AND ad.email IS NOT NULL AND ad.email != ''`
  );
  const emails = adherents.map(a => a.email);
  if (!emails.length) return { success: false, message: 'Aucun email actif trouvé' };

  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: `"FitManager" <${process.env.EMAIL_USER}>`,
      to: emails.join(', '),
      ...tpl,
    });
    return { success: true, count: emails.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
ipcMain.handle('getSeancesSemaine', async (event, { dateDebut, dateFin }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT s.*,
        a.nom AS activiteNom, a.couleur AS activiteCouleur,
        u.nom AS coachNom, u.prenom AS coachPrenom,
        COUNT(p.idPresence) AS presents,
        SUM(CASE WHEN ad.sexe = 'Homme'  THEN 1 ELSE 0 END) AS nbHommes,
        SUM(CASE WHEN ad.sexe = 'Femme'  THEN 1 ELSE 0 END) AS nbFemmes,
        SUM(CASE WHEN ad.sexe = 'Enfant' THEN 1 ELSE 0 END) AS nbEnfants
       FROM Seance s
       LEFT JOIN Activite a  ON s.activite_id   = a.idActivite
       LEFT JOIN Utilisateur u ON s.coach_id    = u.idUtilisateur
       LEFT JOIN Presence p  ON p.seance_id     = s.idSeance
       LEFT JOIN Adherent ad ON p.adherent_id   = ad.idAdherent
       WHERE s.date BETWEEN ? AND ?
       GROUP BY s.idSeance
       ORDER BY s.date ASC, s.heureDebut ASC`,
      [dateDebut, dateFin],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
});
ipcMain.handle('exportEtEnvoyerPlanningPDF', async (event, { html, filename, dateDebut, dateFin }) => {
  // 1. Générer le PDF
  const win = new BrowserWindow({ show: false });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    landscape: true,
    pageSize: 'A4',
  });
  win.destroy();

  // 2. Récupérer les emails des adhérents actifs
  const adherents = await query(
    `SELECT ad.email, ad.prenom FROM Adherent ad
     JOIN Abonnement ab ON ab.adherent_id = ad.idAdherent
     WHERE ab.statut = 'actif'
       AND ad.email IS NOT NULL
       AND ad.email != ''`
  );
  const emails = adherents.map(a => a.email);
  if (!emails.length) return { success: false, message: 'Aucun email actif trouvé' };

  // 3. Envoyer avec le PDF en pièce jointe
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: `"FitManager" <${process.env.EMAIL_USER}>`,
      to: emails.join(', '),
      subject: `📅 Planning mis à jour — ${dateDebut} au ${dateFin}`,
      html: `
        <div style="font-family:sans-serif;padding:24px">
          <h2>📅 Le planning a été mis à jour</h2>
          <p>Bonjour,</p>
          <p>Le planning de la salle de sport vient d'être modifié.</p>
          <p>Vous trouverez le nouveau planning en pièce jointe.</p>
          <p>À bientôt !</p>
          <p><em>L'équipe FitManager</em></p>
        </div>
      `,
      attachments: [
        {
          filename: filename || 'planning.pdf',
          content:  pdfData,
          contentType: 'application/pdf',
        },
      ],
    });
    return { success: true, count: emails.length };
  } catch (err) {
    console.error('Erreur envoi PDF planning:', err);
    return { success: false, error: err.message };
  }
});
// ipcMain handler
ipcMain.handle('sendRenewalEmail', async (_, data) => {
  const { prenom, nom, email, jours, type } = data;
  const expireLabel = jours === 0 ? "aujourd'hui" : jours === 1 ? "demain" : `dans ${jours} jours`;
  
  await transporter.sendMail({
    from: '"FitManager" <tonemail@gmail.com>',
    to: email,
    subject: `⚠️ Votre abonnement expire ${expireLabel}`,
    html: `
      <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
      <p>Votre abonnement <strong>${type}</strong> expire <strong>${expireLabel}</strong>.</p>
      <p>Souhaitez-vous le renouveler ? Contactez-nous directement.</p>
      <p>Merci de votre fidélité 🏋️</p>
    `
  });
  return { success: true };
});