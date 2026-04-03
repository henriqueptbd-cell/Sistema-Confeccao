const express   = require('express');
const router    = express.Router();
const pool      = require('../db');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcrypt');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // janela de 15 minutos
  max:              10,              // máximo 10 tentativas por IP
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { ok: false, mensagem: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

router.use('/login', loginLimiter);

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ ok: false, mensagem: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    const u = rows[0];
    const senhaValida = u && await bcrypt.compare(senha, u.senha);

    if (!senhaValida) {
      return res.status(401).json({ ok: false, mensagem: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: u.id, nome: u.nome, email: u.email, role: u.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ ok: true, token, usuario: { id: u.id, nome: u.nome, email: u.email, role: u.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensagem: 'Erro interno.' });
  }
});

module.exports = router;
