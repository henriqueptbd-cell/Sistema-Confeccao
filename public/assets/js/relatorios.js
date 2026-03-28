document.addEventListener('DOMContentLoaded', async () => {
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  const pedidos = await listarPedidos();
  const hoje    = new Date();
  const mes     = hoje.getMonth() + 1;
  const ano     = hoje.getFullYear();

  const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  document.getElementById('periodo-label').textContent = 'Referência: ' + nomeMes;

  renderResumo(pedidos, mes, ano);
  renderGargalo(pedidos);
  renderRanking(pedidos);
  renderPrazos(pedidos);
});

function renderResumo(pedidos, mes, ano) {
  const emProducao = pedidos.filter(p => p.status !== 'concluido');
  const atrasados  = pedidos.filter(isAtrasado);

  const concluidosNoMes = pedidos.filter(p => {
    const d = p.etapas?.find(e => e.ordem === 9)?.concluidaEm;
    if (!d) return false;
    const partes = d.split('/');
    return parseInt(partes[1]) === mes && parseInt(partes[2]) === ano;
  });

  const faturamentoMes = concluidosNoMes.reduce((s, p) => s + totalPedido(p), 0);

  document.getElementById('stat-producao').textContent    = emProducao.length;
  document.getElementById('stat-concluidos').textContent  = concluidosNoMes.length;
  document.getElementById('stat-faturamento').textContent = formatarMoeda(faturamentoMes);
  document.getElementById('stat-atrasados').textContent   = atrasados.length;
}

function renderGargalo(pedidos) {
  const emProducao = pedidos.filter(p => p.status !== 'concluido');
  const contEtapa  = {};

  emProducao.forEach(p => {
    const etapa = p.etapas?.find(e => !e.concluida);
    if (etapa) contEtapa[etapa.nome] = (contEtapa[etapa.nome] || 0) + 1;
  });

  const container = document.getElementById('gargalo-container');

  if (Object.keys(contEtapa).length === 0) {
    container.innerHTML = '<div class="gargalo-vazio">Nenhum pedido em produção no momento.</div>';
    return;
  }

  const maxCount = Math.max(...Object.values(contEtapa));

  container.innerHTML = ETAPAS
    .filter(nome => contEtapa[nome])
    .map(nome => {
      const count = contEtapa[nome];
      const pct   = Math.round((count / maxCount) * 100);
      return `
        <div class="gargalo-row">
          <span class="gargalo-nome">${nome}</span>
          <div class="gargalo-bar-wrap">
            <div class="gargalo-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="gargalo-count">${count}</span>
        </div>`;
    }).join('');
}

function renderRanking(pedidos) {
  const contProduto = {};

  pedidos.forEach(p => p.pecas.forEach(peca => {
    if (!peca.tipo) return;
    const qtd = peca.tamanhos
      ? Object.values(peca.tamanhos).reduce((s, v) => s + v, 0)
      : (peca.quantidade || 1);
    contProduto[peca.tipo] = (contProduto[peca.tipo] || 0) + qtd;
  }));

  const ranking    = Object.entries(contProduto).sort((a, b) => b[1] - a[1]);
  const container  = document.getElementById('ranking-container');

  if (ranking.length === 0) {
    container.innerHTML = '<div class="ranking-vazio">Nenhum produto cadastrado ainda.</div>';
    return;
  }

  container.innerHTML = ranking.slice(0, 8).map(([tipo, qtd], i) => `
    <div class="ranking-row">
      <span class="ranking-pos">${i + 1}.</span>
      <span class="ranking-nome">${tipo}</span>
      <span class="ranking-qtd">${qtd} ${qtd === 1 ? 'peça' : 'peças'}</span>
    </div>`).join('');
}

function renderPrazos(pedidos) {
  const emProducao = pedidos
    .filter(p => p.status !== 'concluido')
    .sort((a, b) => {
      if (!a.prazoISO) return 1;
      if (!b.prazoISO) return -1;
      return a.prazoISO.localeCompare(b.prazoISO);
    });

  const container = document.getElementById('prazos-container');

  if (emProducao.length === 0) {
    container.innerHTML = '<div class="prazos-vazio">Nenhum pedido em produção no momento.</div>';
    return;
  }

  container.innerHTML = `
    <table class="prazos-table">
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Etapa atual</th>
          <th>Prazo</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${emProducao.map(p => {
          const etapaAtual = p.etapas?.find(e => !e.concluida)?.nome || '—';
          const classe  = isAtrasado(p) ? 'atrasado' : isProximoPrazo(p) ? 'proximo' : 'ok';
          const texto   = isAtrasado(p) ? 'Atrasado' : isProximoPrazo(p) ? 'Próximo' : 'No prazo';
          return `
            <tr>
              <td><a class="pedido-link" href="pedido.html?id=${p.id}">#${p.id}</a></td>
              <td>${p.cliente}</td>
              <td>${etapaAtual}</td>
              <td>${p.prazo || '—'}</td>
              <td><span class="badge-prazo ${classe}">${texto}</span></td>
              <td>${formatarMoeda(totalPedido(p))}</td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}
