const express = require('express');
const fs      = require('fs');
const path    = require('path');

const router  = express.Router();
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

function lerDb()      { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
function salvarDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8'); }

router.get('/precos', (req, res) => {
  const db = lerDb();
  res.json(db.configPrecos || {});
});

router.put('/precos', (req, res) => {
  const db = lerDb();
  db.configPrecos = req.body;
  salvarDb(db);
  res.json({ ok: true });
});

module.exports = router;
