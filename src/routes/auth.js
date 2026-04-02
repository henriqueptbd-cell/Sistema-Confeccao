const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ ok: false, mensagem: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
      [email, senha]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensagem: 'Credenciais inválidas.' });
    }

    const u = rows[0];
    res.json({ ok: true, usuario: { id: u.id, nome: u.nome, email: u.email, role: u.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensagem: 'Erro interno.' });
  }
});

module.exports = router;
