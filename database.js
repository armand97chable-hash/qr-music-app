const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./qr-music.db", (err) => {
  if (err) {
    console.error("❌ Error al abrir la DB", err);
  } else {
    console.log("✅ Base de datos conectada");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      code TEXT PRIMARY KEY,
      spotifyUrl TEXT,
      activated INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;