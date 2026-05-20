const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Chemin du fichier de config (dans le dossier utilisateur)
const CONFIG_PATH = path.join(os.homedir(), '.fitmanager', 'config.json');

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {}
  return null;
}

function saveConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

let db = null;

function initDatabase(config) {
  return new Promise((resolve, reject) => {
    const { host, user, password } = config;

    // Connexion initiale SANS base de données
    const rootConnection = mysql.createConnection({
      host, user, password,
      multipleStatements: true,
    });

    rootConnection.connect((err) => {
      if (err) {
        reject({ type: 'CONNECTION_FAILED', message: err.message });
        return;
      }

      // Créer la base si elle n'existe pas
      rootConnection.query(
        'CREATE DATABASE IF NOT EXISTS fitmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
        (err2) => {
          if (err2) {
            rootConnection.end();
            reject({ type: 'CREATE_DB_FAILED', message: err2.message });
            return;
          }

          rootConnection.end();

          // Lire le fichier SQL de structure
          const { app } = require('electron');
          const sqlPath = app
            ? path.join(path.dirname(process.execPath), 'resources', 'fitmanager_structure.sql')
            : path.join(__dirname, 'fitmanager_structure.sql');

          let sqlContent = '';
          try {
            sqlContent = fs.readFileSync(sqlPath, 'utf8');
          } catch (e) {
            console.warn('fitmanager_structure.sql non trouvé');
          }

          // Connexion avec la base fitmanager
          const connection = mysql.createConnection({
            host, user, password,
            database: 'fitmanager',
            multipleStatements: true,
          });

          connection.connect((err3) => {
            if (err3) {
              reject({ type: 'CONNECTION_FAILED', message: err3.message });
              return;
            }

            const afterStructure = () => {
              // Créer le rôle admin si inexistant
              connection.query(
                `INSERT IGNORE INTO Role (id, nom) VALUES (1, 'admin')`,
                () => {}
              );

              // Sauvegarder la config
              saveConfig(config);
              console.log('✅ Base de données fitmanager prête !');
              db = connection;
              resolve(connection);
            };

            if (sqlContent) {
              connection.query(sqlContent, (err4) => {
                if (err4) console.error('Erreur création tables:', err4.message);
                afterStructure();
              });
            } else {
              afterStructure();
            }
          });
        }
      );
    });
  });
}

module.exports = { initDatabase, getConfig, saveConfig, getDb: () => db };