/* ========================================
   FCamargo — Dashboard
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderTabela('todos');
  iniciarFiltros();
});

/* ---- Estatísticas ---- */
function renderStats() {
  const emProducao  = pedidos.filter(p => p.status === 'producao').length;
  const proxPrazo   = pedidos.filter(p => isAtrasado(p) || isProximoPrazo(p)).length;
  const concluidos  = pedidos.filter(p => p.status === 'concluido').length;

  animarContador(document.getElementById('stat-producao'), emProducao);
  animarContador(document.getElementById('stat-prazo'),    proxPrazo);
  animarContador(document.getElementById('stat-concluidos'), concluidos);
}

function animarContador(el, destino, duracao = 900) {
  if (!el) return;
  let atual = 0;
  const passo = destino / (duracao / 16);
  const timer = setInterval(() => {
    atual += passo;
    if (atual >= destino) {
      el.textContent = destino;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(atual);
    }
  }, 16);
}

/* ---- Tabela de pedidos ---- */
function renderTabela(filtro) {
  const tbody = document.getElementById('tabela-body');
  if (!tbody) return;

  const lista = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.status === filtro);

  tbody.innerHTML = lista.map(p => {
    const etapaNome  = ETAPAS[p.etapaAtual - 1];
    const pill       = ETAPA_PILL[etapaNome];
    const atrasado   = isAtrasado(p) || isProximoPrazo(p);
    const prazoLabel = atrasado && p.status === 'producao'
      ? `<span class="prazo late">${p.prazo} ⚠️</span>`
      : `<span class="prazo">${p.prazo}</span>`;

    const dotClass   = p.status === 'concluido' ? 'dot-done' : atrasado ? 'dot-late' : 'dot-active';
    const statusLabel = p.status === 'concluido' ? 'Concluído' : 'Em produção';

    return `
      <tr onclick="window.location.href='pedido.html?id=${p.id}'">
        <td><span class="pedido-id">#${p.id}</span></td>
        <td><span class="cliente-nome">${p.cliente}</span></td>
        <td><span class="etapa-pill ${pill}">${etapaNome}</span></td>
        <td>${prazoLabel}</td>
        <td><span class="status-dot ${dotClass}"></span>${statusLabel}</td>
        <td><button class="btn-ver" onclick="event.stopPropagation(); window.location.href='pedido.html?id=${p.id}'">Ver</button></td>
      </tr>`;
  }).join('');
}

/* ---- Filtros ---- */
function iniciarFiltros() {
  const mapa = { 'Todos': 'todos', 'Em produção': 'producao', 'Concluídos': 'concluido' };

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderTabela(mapa[this.textContent.trim()] || 'todos');
    });
  });
}
