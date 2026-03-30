const express = require('express');

const router = express.Router();
const { lerDb, salvarDb } = require('../db');

router.get('/', (req, res) => {
  const db  = lerDb();
  let lista = db.compras || [];

  const mes = parseInt(req.query.mes);
  const ano = parseInt(req.query.ano);

  if (mes && ano) {
    lista = lista.filter(c => {
      if (!c.dataISO) return false;
      const [a, m] = c.dataISO.split('-');
      return parseInt(m) === mes && parseInt(a) === ano;
    });
  }

  lista = lista.sort((a, b) => (b.dataISO || '').localeCompare(a.dataISO || ''));
  res.json(lista);
});

router.post('/', (req, res) => {
  const db = lerDb();
  if (!db.compras) db.compras = [];
  if (!db.meta.proximoCompraId) db.meta.proximoCompraId = 1;

  const nova = {
    id: db.meta.proximoCompraId++,
    criadoEm: new Date().toLocaleDateString('pt-BR'),
    ...req.body,
  };

  db.compras.unshift(nova);
  salvarDb(db);
  res.status(201).json(nova);
});

router.put('/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = lerDb();
  const idx = (db.compras || []).findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Compra não encontrada.' });

  db.compras[idx] = { ...db.compras[idx], ...req.body, id };
  salvarDb(db);
  res.json(db.compras[idx]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const idx = (db.compras || []).findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Compra não encontrada.' });

  db.compras.splice(idx, 1);
  salvarDb(db);
  res.json({ ok: true });
});

module.exports = router;
