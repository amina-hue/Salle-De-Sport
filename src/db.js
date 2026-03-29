const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Fitmanager@2026",
  database: "fitmanager"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur MySQL :", err.message);
  } else {
    console.log("✅ MySQL connecté !");
  }
});

module.exports = db;