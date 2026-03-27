/* ========================================
   FCamargo — Detalhe do Pedido
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || pedidos[0].id;
  renderPedido(id);
});

function renderPedido(id) {
  const pedido = getPedidoComEstado(id);
  if (!pedido) {
    document.querySelector('.main').innerHTML = '<p style="padding:32px;color:#999">Pedido não encontrado.</p>';
    return;
  }

  /* Título e badge */
  document.getElementById('pedido-id').textContent = '#' + pedido.id;
  document.getElementById('pedido-badge').textContent =
    pedido.status === 'concluido' ? 'Concluído' : 'Em produção';
  document.getElementById('pedido-badge').className =
    'badge ' + (pedido.status === 'concluido' ? 'badge-concluido' : 'badge-producao');

  /* Informações */
  document.getElementById('info-cliente').textContent    = pedido.cliente;
  document.getElementById('info-telefone').textContent   = pedido.telefone;
  document.getElementById('info-entrada').textContent    = pedido.dataEntrada;
  document.getElementById('info-prazo').textContent      = pedido.prazo;
  document.getElementById('info-etapa').textContent      =
    `${ETAPAS[pedido.etapaAtual - 1]} (${pedido.etapaAtual}/${ETAPAS.length})`;

  /* Peças */
  renderPecas(pedido);

  /* Timeline */
  renderTimeline(pedido);

  /* Card de etapa atual */
  renderEtapaCard(pedido);
}

/* ---- Peças ---- */
function renderPecas(pedido) {
  const container = document.getElementById('pecas-container');
  const total = totalPedido(pedido);

  container.innerHTML = pedido.pecas.map(p => `
    <div class="peca-row">
      <span class="peca-label">${p.descricao}</span>
      <span class="peca-detail">${p.detalhe}</span>
      <span class="peca-detail">${p.estampa}</span>
      <span class="peca-valor">R$ ${p.valor.toFixed(2).replace('.', ',')}</span>
    </div>`).join('');

  document.getElementById('total-count').textContent = pedido.pecas.length;
  document.getElementById('total-valor').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');
}

/* ---- Timeline ---- */
function renderTimeline(pedido) {
  const container = document.getElementById('timeline-container');

  container.innerHTML = ETAPAS.map((nome, i) => {
    const num = i + 1;
    let classe, icone, dataEl;

    if (num < pedido.etapaAtual) {
      classe = 'step-done';
      icone  = '✓';
      dataEl = `<div class="step-date">${pedido.datas[num] || ''}</div>`;
    } else if (num === pedido.etapaAtual) {
      classe = pedido.status === 'concluido' ? 'step-done' : 'step-current';
      icone  = pedido.status === 'concluido' ? '✓' : '⏳';
      dataEl = pedido.status === 'concluido'
        ? `<div class="step-date">${pedido.datas[num] || ''}</div>`
        : `<div class="step-date">Em andamento</div>`;
    } else {
      classe = 'step-pending';
      icone  = '○';
      dataEl = '';
    }

    const linha = num < ETAPAS.length ? '<div class="step-line"></div>' : '';

    return `
      <div class="step ${classe}">
        ${linha}
        <div class="step-icon">${icone}</div>
        <div class="step-body">
          <div class="step-name">${nome}</div>
          ${dataEl}
        </div>
      </div>`;
  }).join('');
}

/* ---- Card de etapa atual ---- */
function renderEtapaCard(pedido) {
  const card = document.getElementById('etapa-card');

  if (pedido.status === 'concluido') {
    card.innerHTML = `
      <div class="card-title">Status do pedido</div>
      <div class="etapa-atual-nome" style="color:var(--accent3)">✓ Concluído</div>
      <div class="etapa-numero">Todas as etapas finalizadas</div>`;
    return;
  }

  const etapaNome   = ETAPAS[pedido.etapaAtual - 1];
  const proximaNome = ETAPAS[pedido.etapaAtual] || null;

  card.innerHTML = `
    <div class="card-title">Etapa atual</div>
    <div class="etapa-atual-nome">${etapaNome}</div>
    <div class="etapa-numero">Etapa ${pedido.etapaAtual} de ${ETAPAS.length}</div>
    <button class="btn-concluir" id="btn-concluir">✓ Concluir etapa</button>
    <div class="proxima-etapa">
      Próxima: <span>${proximaNome || '—'}</span>
    </div>`;

  document.getElementById('btn-concluir').addEventListener('click', () => {
    document.getElementById('modal-etapa-atual').textContent  = etapaNome;
    document.getElementById('modal-proxima-etapa').textContent = proximaNome || 'conclusão';
    document.getElementById('modal').classList.add('visible');
  });

  /* Confirmar no modal */
  document.getElementById('btn-confirmar').onclick = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    salvarEstado(pedido.id, pedido.etapaAtual + 1, hoje);
    document.getElementById('modal').classList.remove('visible');
    renderPedido(pedido.id);
  };
}
