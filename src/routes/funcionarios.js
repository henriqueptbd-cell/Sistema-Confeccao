const express = require('express');

const router = express.Router();
const { lerDb, salvarDb } = require('../db');

router.get('/', (req, res) => {
  const db = lerDb();
  const lista = (db.funcionarios || []).sort((a, b) => {
    if (a.ativo === b.ativo) return a.nome.localeCompare(b.nome);
    return a.ativo ? -1 : 1;
  });
  res.json(lista);
});

router.post('/', (req, res) => {
  const db = lerDb();
  if (!db.funcionarios) db.funcionarios = [];
  if (!db.meta.proximoFuncionarioId) db.meta.proximoFuncionarioId = 1;

  const novo = {
    id: db.meta.proximoFuncionarioId++,
    criadoEm: new Date().toLocaleDateString('pt-BR'),
    ativo: true,
    ...req.body,
  };

  db.funcionarios.push(novo);
  salvarDb(db);
  res.status(201).json(novo);
});

router.put('/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = lerDb();
  const idx = (db.funcionarios || []).findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });

  db.funcionarios[idx] = { ...db.funcionarios[idx], ...req.body, id };
  salvarDb(db);
  res.json(db.funcionarios[idx]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const idx = (db.funcionarios || []).findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });

  db.funcionarios.splice(idx, 1);
  salvarDb(db);
  res.json({ ok: true });
});

module.exports = router;
