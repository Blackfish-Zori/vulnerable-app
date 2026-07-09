/**
 * ⚠️ INTENTIONALLY VULNERABLE SERVER — for DAST tool evaluation only.
 * Do NOT deploy this publicly or reuse these patterns in real projects.
 *
 * Run with: npm install && npm start   (from the backend/ directory)
 * Serves on http://localhost:4000 and is meant to sit alongside the
 * React frontend (npm start in the project root, port 3000) so a
 * DAST scanner has real server-side logic to probe, not just static files.
 */
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// Vulnerable: wide-open CORS — reflects any origin, allows credentials.
app.use(cors({ origin: true, credentials: true }));

// Vulnerable: verbose error responses leak stack traces (info disclosure).
app.use((req, res, next) => {
  res.locals.debug = true;
  next();
});

const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
  db.run("INSERT INTO users (username, password) VALUES ('alice', 'password1')");
});

const JWT_SECRET = "my-super-secret-jwt-key-do-not-use-in-prod"; // hardcoded secret

// --- Vulnerable: SQL Injection (string concatenation into query) ---
app.get("/api/users/search", (req, res) => {
  const q = req.query.username || "";
  const sql = `SELECT id, username, password FROM users WHERE username = '${q}'`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).send("DB error: " + err.message); // leaks internals
    res.json(rows);
  });
});

// --- Vulnerable: Command Injection ---
app.get("/api/ping", (req, res) => {
  const host = req.query.host || "127.0.0.1";
  exec(`ping -c 1 ${host}`, (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr || err.message);
    res.send(stdout);
  });
});

// --- Vulnerable: Path Traversal ---
app.get("/api/files", (req, res) => {
  const file = req.query.name || "readme.txt";
  const filePath = path.join(__dirname, "public", file); // no sanitization of ../
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("Not found: " + err.message);
    res.send(data);
  });
});

// --- Vulnerable: Server-Side Request Forgery (SSRF) ---
app.get("/api/fetch-url", (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing url param");
  http.get(target, (upstream) => {
    let body = "";
    upstream.on("data", (chunk) => (body += chunk));
    upstream.on("end", () => res.send(body));
  }).on("error", (err) => res.status(500).send(err.message));
});

// --- Vulnerable: Insecure Direct Object Reference (IDOR) ---
app.get("/api/users/:id", (req, res) => {
  // No auth/ownership check — any id returns any user's record including password.
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    res.json(row);
  });
});

// --- Vulnerable: Broken authentication (weak JWT, alg confusion possible) ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (!row) return res.status(401).send("Invalid credentials");
      const token = jwt.sign({ username, role: "user" }, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
      });
      res.json({ token });
    }
  );
});

// --- Vulnerable: Reflected XSS via server-rendered response ---
app.get("/api/greet", (req, res) => {
  const name = req.query.name || "guest";
  res.send(`<h1>Hello, ${name}!</h1>`); // no escaping, no CSP
});

// Missing security headers on purpose (no helmet, no CSP/HSTS/X-Frame-Options).
app.listen(4000, () => {
  console.log("Vulnerable backend listening on http://localhost:4000");
});
