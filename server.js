const express = require("express");
const app = express();
const db = require("./database");

const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); //

// Base de datos temporal (luego será real)

  ABC123: {
    activated: true,
    spotifyUrl: "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P"
  }
};



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


app.get("/activar/:code", (req, res) => {
  const code = req.params.code;

  if (!qrDB[code]) {
    qrDB[code] = {
      activated: false,
      spotifyUrl: null
    };
  }

  if (!qrDB[code].activated) {
    return res.sendFile(__dirname + "/public/index.html");
  }

  res.redirect(qrDB[code].spotifyUrl);
});
app.get("/p/:code", (req, res) => {
  const code = req.params.code;

  if (!qrDB[code]) {
    qrDB[code] = {
      activated: false,
      spotifyUrl: null,
    };
  }

  if (!qrDB[code].activated) {
    return res.redirect("/activar/" + code);
  }

  res.redirect(qrDB[code].spotifyUrl);
});


aapp.post("/guardar/:code", (req, res) => {
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



app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});