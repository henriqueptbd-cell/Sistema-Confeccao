const express = require('express');

const router  = express.Router();
const { lerDb, salvarDb } = require('../db');

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
