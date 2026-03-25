const express = require("express");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, "levels.db");

// ==================================================
//  BASE DE DONNÉES
// ==================================================
let db = null;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS levels (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      author     TEXT NOT NULL DEFAULT 'Anonyme',
      data       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  saveDB();
  console.log("Base de données initialisée !");
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Middleware : attend que la DB soit prête
function dbReady(req, res, next) {
  if (!db) {
    return res.status(503).json({ error: "Base de données non prête, réessaie dans un instant." });
  }
  next();
}

// ==================================================
//  ROUTES
// ==================================================

app.get("/levels", dbReady, (req, res) => {
  const result = db.exec("SELECT id, name, author, created_at FROM levels ORDER BY created_at DESC");
  if (result.length === 0) return res.json([]);
  const [{ columns, values }] = result;
  const rows = values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
  res.json(rows);
});

app.get("/levels/:id", dbReady, (req, res) => {
  const result = db.exec("SELECT * FROM levels WHERE id = ?", [req.params.id]);
  if (result.length === 0) return res.status(404).json({ error: "Level introuvable" });
  const [{ columns, values }] = result;
  const row = Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
  row.data = JSON.parse(row.data);
  res.json(row);
});

app.post("/levels", dbReady, (req, res) => {
  const { name, author, data } = req.body;
  if (!name || !data) {
    return res.status(400).json({ error: "Champs 'name' et 'data' obligatoires" });
  }
  const required = ["width", "height", "entry_pos", "exit_pos"];
  for (const field of required) {
    if (data[field] === undefined) {
      return res.status(400).json({ error: `Champ manquant dans data : ${field}` });
    }
  }
  db.run(
    "INSERT INTO levels (name, author, data) VALUES (?, ?, ?)",
    [name, author ?? "Anonyme", JSON.stringify(data)]
  );
  saveDB();
  const result = db.exec("SELECT last_insert_rowid() as id");
  const id = result[0].values[0][0];
  res.status(201).json({ id, message: "Level sauvegardé !" });
});

app.delete("/levels/:id", dbReady, (req, res) => {
  db.run("DELETE FROM levels WHERE id = ?", [req.params.id]);
  saveDB();
  res.json({ message: "Level supprimé" });
});

// ==================================================
//  DÉMARRAGE
// ==================================================
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
});