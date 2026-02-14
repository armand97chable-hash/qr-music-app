const express = require("express");
const app = express();
const db = require("./database");
const path = require("path");

const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); //


app.get("/qr/:id", (req, res) => {
  const qrCode = req.params.id;

  db.get(
    "SELECT spotifyUrl, activated FROM qr_codes WHERE code = ?",
    [qrCode],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error de base de datos");
      }

      if (!row) {
        return res.sendFile(path.join(__dirname, "public/index.html"));
      }
if (row.activated === 1) {
        return res.sendFile(path.join(__dirname, "public/used.html"));
      }
       return res.sendFile(path.join(__dirname, "public/index.html"));
    }
  );
});


app.post("/qr/:id", (req, res) => {
  const qrCode = req.params.id;
  const spotifyUrl = req.body.song_url;

  db.run(
    "UPDATE qr_codes SET spotifyUrl = ?, activated = 1 WHERE code = ?",
    [spotifyUrl, qrCode],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error al activar QR");
      }

      return res.sendFile(path.join(__dirname, "public/success.html"));
    }
  );
});




app.post("/qr/:id", (req, res) => {
  const qrId = req.params.id;
  const songUrl = req.body.song_url;

  db.run(
    "INSERT INTO qr_codes (id, spotifyUrl) VALUES (?, ?)",
    [qrId, songUrl],
    (err) => {
      if (err) {
        return res.sendFile(path.join(__dirname, "public/used.html"));
      }

      res.sendFile(path.join(__dirname, "public/success.html"));
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




app.get("/p/:code", (req, res) => {
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
        return res.sendFile(__dirname + "/public/index.html");
      }

      res.redirect(row.spotifyUrl);
    }
  );
});

app.get('/crear/:codigo', (req, res) => {
  const { codigo } = req.params;

  db.run(
    "INSERT INTO qr_codes (code) VALUES (?)",
    [codigo],
    (err) => {
      if (err) {
        return res.send("❌ El QR ya existe");
      }
      res.send("✅ QR creado correctamente");
    }
  );
});


app.get("/p/:code", (req, res) => {
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
        return res.sendFile(__dirname + "/public/index.html");
      }

      res.redirect(row.spotifyUrl);
    }
  );
});


app.post("/guardar/:code", (req, res) => {
  const { code } = req.params;
  const { spotifyUrl } = req.body;

  db.get(
    "SELECT * FROM qr_codes WHERE code = ?",
    [code],
    (err, row) => {
      if (err) return res.send("❌ Error DB");

      if (!row) {
        db.run(
          "INSERT INTO qr_codes (code, spotifyUrl, activated) VALUES (?, ?, 1)",
          [code, spotifyUrl],
          () => {
            res.send(`
              <h2>✅ Camiseta activada</h2>
              <p>Este QR ya quedó vinculado para siempre 🎶</p>
              <a href="/p/${code}">Probar QR</a>
            `);
          }
        );
      } else if (row.activated) {
        res.send("🔒 Este código ya fue activado");
      }
    }
  );
});

app.get("/activar/:code", (req, res) => {
res.sendFile(__dirname + "/public/success.html");

});

function generarCodigo(longitud = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

app.get("/admin/generar", (req, res) => {
  const codigo = generarCodigo();

  db.run(
    "INSERT INTO qr_codes (code) VALUES (?)",
    [codigo],
    (err) => {
      if (err) {
        return res.send("❌ Error al crear QR");
      }

      const link = `https://qr-music-app-armando.onrender.com/${codigo}`;

      res.send(`
        <h1>✅ QR generado</h1>
        <p><strong>Código:</strong> ${codigo}</p>
        <p>
          <a href="${link}" target="_blank">${link}</a>
        </p>
      `);
    }
  );
});



app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});