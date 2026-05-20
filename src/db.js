// 
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
// Connexion initiale SANS base de données pour pouvoir la créer si besoin
const rootConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Fitmanager@2026',
  multipleStatements: true,
});

let db = null;

/**
 * Initialise la base de données :
 * 1. Crée la base fitmanager si elle n'existe pas
 * 2. Crée les tables si elles n'existent pas
 * 3. Retourne une connexion prête à l'emploi
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
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
            reject({ type: 'CREATE_DB_FAILED', message: err2.message });
            return;
          }

          rootConnection.end();

          // Lire le fichier SQL de structure
          const sqlPath = app
  ? path.join(path.dirname(process.execPath), 'resources', 'fitmanager_structure.sql')
  : path.join(__dirname, 'fitmanager_structure.sql');
          const sqlContent = fs.readFileSync(sqlPath, 'utf8');

          // Connexion avec la base fitmanager
          const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Fitmanager@2026',
            database: 'fitmanager',
            multipleStatements: true,
          });

          connection.connect((err3) => {
            if (err3) {
              reject({ type: 'CONNECTION_FAILED', message: err3.message });
              return;
            }

            // Exécuter le SQL de structure (CREATE TABLE IF NOT EXISTS)
            connection.query(sqlContent, (err4) => {
              if (err4) {
                console.error('Erreur création tables:', err4.message);
                // On continue quand même, les tables existent peut-être déjà
              }

              console.log('✅ Base de données fitmanager prête !');
              db = connection;
              resolve(connection);
            });
          });
        }
      );
    });
  });
}

module.exports = { initDatabase, getDb: () => db };