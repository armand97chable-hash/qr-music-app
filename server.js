const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); //

// Base de datos temporal (luego será real)
const qrDB = {
  ABC123: {
    activated: true,
    spotifyUrl: "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P"
  }
};



app.get("/p/:code", (req, res) => {
  const code = req.params.code;
  const record = qrDB[code];

  if (!record) {
    return res.send("❌ Código no existe");
  }

  if (!record.activated) {
    return res.send("🎵 Activar playera");
  }

  res.redirect(record.spotifyUrl);
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

app.post("/guardar/:code", (req, res) => {
  const { code } = req.params;
  const { spotifyUrl } = req.body;

  if (!qrDB[code]) {
    return res.send("❌ Código no existe");
  }

  if (qrDB[code].activated) {
    return res.send("🔒 Este código ya fue activado");
  }

  qrDB[code].spotifyUrl = spotifyUrl;
  qrDB[code].activated = true;

  res.send(`
    <h2>✅ Camiseta activada</h2>
    <p>Este QR ya quedó vinculado para siempre 🎵</p>
    <a href="/p/${code}">Probar QR</a>
  `);
});


app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});