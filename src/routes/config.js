const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/precos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT dados FROM config_precos WHERE id = 1');
    res.json(rows[0]?.dados || {});
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/precos', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO config_precos (id, dados) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET dados = $1',
      [req.body]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
