const express = require('express');
const router  = express.Router();
const pool    = require('../db');

const NOMES_ETAPAS = [
  'Entrada do pedido', 'Montagem da estampa', 'Impressão', 'Corte', 'Estampa',
  'Triagem para costura', 'Costura', 'Arremate', 'Conferência', 'Pronto para retirada',
];

async function buscarPedidoCompleto(id, client) {
  const db = client || pool;

  const { rows: [p] } = await db.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  if (!p) return null;

  const { rows: pecas }  = await db.query('SELECT * FROM pedido_pecas  WHERE pedido_id = $1 ORDER BY id', [id]);
  const { rows: etapas } = await db.query('SELECT * FROM pedido_etapas WHERE pedido_id = $1 ORDER BY ordem', [id]);

  return {
    id:           p.id,
    clienteId:    p.cliente_id,
    cliente:      p.cliente,
    telefone:     p.telefone,
    prazo:        p.prazo,
    prazoISO:     p.prazo_iso,
    dataEntrada:  p.data_entrada,
    status:       p.status,
    entregueEm:   p.entregue_em,
    pecas: pecas.map(r => ({
      id:                 r.id,
      tipo:               r.tipo,
      modelo:             r.modelo,
      material:           r.material,
      estampaTipo:        r.estampa_tipo,
      estampaDescricao:   r.estampa_descricao,
      gola:               r.gola,
      punho:              r.punho,
      capuz:              r.capuz,
      dedao:              r.dedao,
      bolsoZiper:         r.bolso_ziper,
      faces:              r.faces,
      medidas:            r.medidas,
      observacoes:        r.observacoes,
      desconto:           parseFloat(r.desconto),
      imagemLink:         r.imagem_link,
      tamanhos:           r.tamanhos || {},
      quantidade:         r.quantidade,
      valorUnitario:      parseFloat(r.valor_unitario),
      precoCalculado:     parseFloat(r.preco_calculado),
      descontoPercentual: parseFloat(r.desconto_percentual),
    })),
    etapas: etapas.map(e => ({
      ordem:       e.ordem,
      nome:        e.nome,
      concluida:   e.concluida,
      concluidaEm: e.concluida_em,
    })),
  };
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    const pedidos  = await Promise.all(rows.map(p => buscarPedidoCompleto(p.id)));
    res.json(pedidos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pedido = await buscarPedidoCompleto(parseInt(req.params.id));
    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    res.json(pedido);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const { clienteId, cliente, telefone, prazo, prazoISO, pecas = [] } = req.body;
  const hoje = new Date().toLocaleDateString('pt-BR');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [p] } = await client.query(
      `INSERT INTO pedidos (cliente_id, cliente, telefone, prazo, prazo_iso, data_entrada, status)
       VALUES ($1,$2,$3,$4,$5,$6,'producao') RETURNING id`,
      [clienteId || null, cliente, telefone, prazo, prazoISO, hoje]
    );
    const pedidoId = p.id;

    for (const peca of pecas) {
      await client.query(
        `INSERT INTO pedido_pecas
          (pedido_id, tipo, modelo, material, estampa_tipo, estampa_descricao, gola, punho, capuz,
           dedao, bolso_ziper, faces, medidas, observacoes, desconto, imagem_link,
           tamanhos, quantidade, valor_unitario, preco_calculado, desconto_percentual)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [pedidoId, peca.tipo, peca.modelo, peca.material, peca.estampaTipo, peca.estampaDescricao,
         peca.gola, peca.punho, peca.capuz, !!peca.dedao, !!peca.bolsoZiper, peca.faces,
         peca.medidas, peca.observacoes, peca.desconto || 0, peca.imagemLink,
         JSON.stringify(peca.tamanhos || {}), peca.quantidade || 1,
         peca.valorUnitario || 0, peca.precoCalculado || 0, peca.descontoPercentual || 0]
      );
    }

    const etapas = NOMES_ETAPAS.map((nome, i) => ({
      ordem: i + 1, nome,
      concluida: i === 0,
      concluidaEm: i === 0 ? hoje : null,
    }));

    for (const e of etapas) {
      await client.query(
        `INSERT INTO pedido_etapas (pedido_id, ordem, nome, concluida, concluida_em)
         VALUES ($1,$2,$3,$4,$5)`,
        [pedidoId, e.ordem, e.nome, e.concluida, e.concluidaEm]
      );
    }

    await client.query('COMMIT');
    const pedido = await buscarPedidoCompleto(pedidoId);
    res.status(201).json(pedido);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pedidos WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.patch('/:id/entregar', async (req, res) => {
  const hoje    = new Date().toLocaleDateString('pt-BR');
  const hojeISO = new Date().toISOString().slice(0, 10);
  try {
    const { rowCount } = await pool.query(
      `UPDATE pedidos SET status='entregue', entregue_em=$1, entregue_em_iso=$2
       WHERE id=$3 AND status='concluido'`,
      [hoje, hojeISO, req.params.id]
    );
    if (rowCount === 0) return res.status(400).json({ mensagem: 'Pedido não encontrado ou não está concluído.' });
    res.json(await buscarPedidoCompleto(parseInt(req.params.id)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.patch('/:id/etapas/:ordem', async (req, res) => {
  const pedidoId = parseInt(req.params.id);
  const ordem    = parseInt(req.params.ordem);
  const hoje     = new Date().toLocaleDateString('pt-BR');
  try {
    const { rowCount } = await pool.query(
      `UPDATE pedido_etapas SET concluida=true, concluida_em=$1
       WHERE pedido_id=$2 AND ordem=$3 AND concluida=false`,
      [hoje, pedidoId, ordem]
    );
    if (rowCount === 0) return res.status(400).json({ mensagem: 'Etapa não encontrada ou já concluída.' });

    // Marca como concluído se a etapa de conferência (9) foi concluída
    if (ordem === 9) {
      await pool.query(`UPDATE pedidos SET status='concluido' WHERE id=$1`, [pedidoId]);
    }

    res.json(await buscarPedidoCompleto(pedidoId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
