const express    = require('express');
const router     = express.Router();
const pool       = require('../db');
const bcrypt     = require('bcrypt');
const auditoria  = require('../auditoria');

router.get('/', async (req, res) => {
  auditoria.registrar(req, 'listar_usuarios', 'usuario');
  try {
    const { rows } = await pool.query('SELECT id, nome, email, role FROM usuarios ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const { nome, email, senha, role } = req.body;
  auditoria.registrar(req, 'criar_usuario', 'usuario');
  try {
    const hash = await bcrypt.hash(senha, 12);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role',
      [nome, email, hash, role || 'funcionaria_producao']
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, senha, role } = req.body;
  auditoria.registrar(req, 'editar_usuario', 'usuario', id);
  try {
    const hash = senha ? await bcrypt.hash(senha, 12) : null;
    const { rows } = await pool.query(
      `UPDATE usuarios SET
        nome  = COALESCE($1, nome),
        email = COALESCE($2, email),
        senha = CASE WHEN $3 IS NOT NULL THEN $3 ELSE senha END,
        role  = COALESCE($4, role)
       WHERE id = $5
       RETURNING id, nome, email, role`,
      [nome, email, hash, role, id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  auditoria.registrar(req, 'excluir_usuario', 'usuario', id);
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
