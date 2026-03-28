const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

// TODO(segurança): proteger estas rotas com middleware de autenticação JWT
// TODO(migração): substituir lerDb/salvarDb por queries PostgreSQL (pool.query)

const NOMES_ETAPAS = [
  'Entrada do pedido',
  'Montagem da estampa',
  'Impressão',
  'Corte',
  'Estampa',
  'Triagem para costura',
  'Costura',
  'Arremate',
  'Conferência',
  'Pronto para retirada',
];

function lerDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function salvarDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function criarEtapas(hoje) {
  return NOMES_ETAPAS.map((nome, i) => ({
    ordem:       i + 1,
    nome,
    concluida:   i === 0,
    concluidaEm: i === 0 ? hoje : null,
  }));
}

function derivarStatus(pedido) {
  const conferencia = pedido.etapas.find(e => e.ordem === 9);
  return conferencia?.concluida ? 'concluido' : 'producao';
}

router.get('/', (req, res) => {
  const db = lerDb();
  res.json(db.pedidos);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const pedido = db.pedidos.find(p => p.id === id);

  if (!pedido) {
    return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
  }

  res.json(pedido);
});

router.post('/', (req, res) => {
  const db = lerDb();
  const hoje = new Date().toLocaleDateString('pt-BR');
  const { cliente, telefone, prazo, prazoISO, pecas = [] } = req.body;

  const novoPedido = {
    id: db.meta.proximoId++,
    cliente,
    telefone,
    prazo,
    prazoISO,
    pecas,
    dataEntrada: hoje,
    status: 'producao',
    etapas: criarEtapas(hoje),
  };

  db.pedidos.unshift(novoPedido);
  salvarDb(db);
  res.status(201).json(novoPedido);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const pedido = db.pedidos.find(p => p.id === id);

  if (!pedido) {
    return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
  }

  const { prazo, prazoISO, pecas } = req.body;

  if (prazo)    pedido.prazo    = prazo;
  if (prazoISO) pedido.prazoISO = prazoISO;
  if (pecas)    pedido.pecas    = pecas;

  salvarDb(db);
  res.json(pedido);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const idx = db.pedidos.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
  }

  db.pedidos.splice(idx, 1);
  salvarDb(db);
  res.json({ ok: true });
});

router.patch('/:id/etapas/:ordem', (req, res) => {
  const id    = parseInt(req.params.id);
  const ordem = parseInt(req.params.ordem);
  const db    = lerDb();
  const pedido = db.pedidos.find(p => p.id === id);

  if (!pedido) {
    return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
  }

  const etapa = pedido.etapas.find(e => e.ordem === ordem);
  if (!etapa) {
    return res.status(404).json({ mensagem: 'Etapa não encontrada.' });
  }
  if (etapa.concluida) {
    return res.status(400).json({ mensagem: 'Etapa já concluída.' });
  }

  const hoje     = new Date().toLocaleDateString('pt-BR');
  etapa.concluida   = true;
  etapa.concluidaEm = hoje;
  pedido.status     = derivarStatus(pedido);

  salvarDb(db);
  res.json(pedido);
});

module.exports = router;
