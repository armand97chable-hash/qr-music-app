const express = require("express");
const app = express();
const db = require("./database");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/admin/generar", (req, res) => {
  const codigo = generarCodigo();

  db.run(
    "INSERT INTO qr_codes (code, activated) VALUES (?, 0)",
    [codigo],
    (err) => {
      if (err) {
        return res.send("❌ Error al crear QR");
      }

      const link = `https://qr-music-app-armando.onrender.com/qr/${codigo}`;

      res.send(`
        <h1>✅ QR generado</h1>
        <p><strong>Código:</strong> ${codigo}</p>
        <p><a href="${link}" target="_blank">${link}</a></p>
      `);
    }
  );
});

app.get("/qr/:code", (req, res) => {
  const { code } = req.params;

  db.get(
    "SELECT * FROM qr_codes WHERE code = ?",
    [code],
    (err, row) => {
      if (err) return res.send("❌ Error DB");

      if (!row) {
        return res.send("❌ QR no existe");
      }

      if (!row.activated) {
        return res.sendFile(path.join(__dirname, "public/index.html"));
      }

      
      return res.redirect(row.spotifyUrl);
    }
  );
});



app.post("/qr/:code", (req, res) => {
  const { code } = req.params;
  const spotifyUrl = req.body.song_url;

  db.run(
    "UPDATE qr_codes SET spotifyUrl = ?, activated = 1 WHERE code = ?",
    [spotifyUrl, code],
    function (err) {
      if (err) return res.send("❌ Error al activar");

      return res.sendFile(path.join(__dirname, "public/success.html"));
    }
  );
});


function generarCodigo(longitud = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});
