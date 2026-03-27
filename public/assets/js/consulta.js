/* ========================================
   FCamargo — Consulta Pública de Pedido
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('numeroPedido').addEventListener('keydown', e => {
    if (e.key === 'Enter') consultarPedido();
  });
});

function consultarPedido() {
  const input = document.getElementById('numeroPedido');
  const num   = parseInt(input.value.trim());
  const resultado = document.getElementById('resultado');
  const naoEncontrado = document.getElementById('nao-encontrado');

  resultado.classList.remove('visible');
  naoEncontrado.classList.remove('visible');

  if (!num) {
    input.focus();
    return;
  }

  const pedido = getPedidoComEstado(num);

  if (!pedido) {
    naoEncontrado.classList.add('visible');
    naoEncontrado.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  renderResultado(pedido);
  resultado.classList.add('visible');
  resultado.scrollIntoView({ behavior: 'smooth' });
}

function renderResultado(pedido) {
  const etapaNome = ETAPAS[pedido.etapaAtual - 1];

  /* Cabeçalho */
  document.getElementById('res-numero').textContent = '#' + pedido.id;
  const badge = document.getElementById('res-badge');
  badge.textContent  = pedido.status === 'concluido' ? 'Pronto para retirada' : 'Em produção';
  badge.className    = 'badge ' + (pedido.status === 'concluido' ? 'badge-pronto' : 'badge-producao');

  /* Infos */
  document.getElementById('res-cliente').textContent  = pedido.cliente;
  document.getElementById('res-entrada').textContent  = pedido.dataEntrada;
  document.getElementById('res-prazo').textContent    = pedido.prazo;
  document.getElementById('res-etapa').textContent    = etapaNome;

  /* Timeline */
  const timeline = document.getElementById('res-timeline');
  timeline.innerHTML = ETAPAS.map((nome, i) => {
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
