const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "..", "data");
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const METIERS_PATH = path.join(DATA_DIR, "metiers.json");
const FORMATIONS_PATH = path.join(DATA_DIR, "formations.json");
const SUBMISSIONS_PATH = path.join(DATA_DIR, "contact-submissions.json");

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

async function readJSON(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

app.get("/api/metiers", async (req, res, next) => {
  try {
    const metiers = await readJSON(METIERS_PATH, []);
    res.json(metiers);
  } catch (err) {
    next(err);
  }
});

app.get("/api/metiers/:id", async (req, res, next) => {
  try {
    const metiers = await readJSON(METIERS_PATH, []);
    const metier = metiers.find((m) => m.id === req.params.id);
    if (!metier) return res.status(404).json({ error: "Métier introuvable" });
    res.json(metier);
  } catch (err) {
    next(err);
  }
});

app.get("/api/formations", async (req, res, next) => {
  try {
    const formations = await readJSON(FORMATIONS_PATH, []);
    res.json(formations);
  } catch (err) {
    next(err);
  }
});

app.post("/api/contact", async (req, res, next) => {
  try {
    const { nom, email, profil, message } = req.body || {};

    if (!nom || !email || !message) {
      return res.status(400).json({ error: "Les champs nom, email et message sont requis." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Adresse e-mail invalide." });
    }

    const submissions = await readJSON(SUBMISSIONS_PATH, []);
    submissions.push({
      nom: String(nom).slice(0, 200),
      email: String(email).slice(0, 200),
      profil: String(profil || "Non précisé").slice(0, 100),
      message: String(message).slice(0, 5000),
      receivedAt: new Date().toISOString(),
    });

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`Portail Métiers & Formations du Tourisme — serveur démarré sur http://localhost:${PORT}`);
});
