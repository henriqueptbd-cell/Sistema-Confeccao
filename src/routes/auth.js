const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

function lerDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// TODO(segurança): substituir comparação de senha por bcrypt.compare()
// TODO(segurança): emitir JWT com expiração em vez de sessionStorage no cliente
// TODO(segurança): aplicar rate limiting (ex: express-rate-limit) nesta rota
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ ok: false, mensagem: 'E-mail e senha são obrigatórios.' });
  }

  const db = lerDb();
  const usuario = db.usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ ok: false, mensagem: 'Credenciais inválidas.' });
  }

  res.json({ ok: true, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role || 'user' } });
});

module.exports = router;
