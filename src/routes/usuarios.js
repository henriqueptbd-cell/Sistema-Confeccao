const express = require('express');

const router = express.Router();
const { lerDb, salvarDb } = require('../db');

// Lista todos os usuários (sem expor senha)
router.get('/', (req, res) => {
  const db = lerDb();
  const lista = (db.usuarios || []).map(({ senha, ...u }) => u);
  res.json(lista);
});

// Cria novo usuário
router.post('/', (req, res) => {
  const db = lerDb();
  if (!db.meta.proximoUsuarioId) db.meta.proximoUsuarioId = db.usuarios.length + 1;

  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
  }

  const existe = (db.usuarios || []).find(u => u.email === email);
  if (existe) {
    return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
  }

  const novo = {
    id: db.meta.proximoUsuarioId++,
    nome,
    email,
    senha,
    role: role || 'funcionario',
  };

  db.usuarios.push(novo);
  salvarDb(db);
  const { senha: _, ...semSenha } = novo;
  res.status(201).json(semSenha);
});

// Revela senha de um usuário (uso exclusivo do admin)
router.get('/:id/senha', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const u  = (db.usuarios || []).find(u => u.id === id);
  if (!u) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  res.json({ senha: u.senha });
});

// Atualiza usuário
router.put('/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = lerDb();
  const idx = (db.usuarios || []).findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

  const { nome, email, senha, role } = req.body;
  if (nome)  db.usuarios[idx].nome  = nome;
  if (email) db.usuarios[idx].email = email;
  if (senha) db.usuarios[idx].senha = senha;
  if (role)  db.usuarios[idx].role  = role;

  salvarDb(db);
  const { senha: _, ...semSenha } = db.usuarios[idx];
  res.json(semSenha);
});

// Exclui usuário
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const idx = (db.usuarios || []).findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

  db.usuarios.splice(idx, 1);
  salvarDb(db);
  res.json({ ok: true });
});

// GET/PUT categorias de despesa
router.get('/categorias-despesa', (req, res) => {
  const db = lerDb();
  res.json(db.categoriasDespesa || []);
});

router.put('/categorias-despesa', (req, res) => {
  const db = lerDb();
  db.categoriasDespesa = req.body;
  salvarDb(db);
  res.json({ ok: true });
});

module.exports = router;
