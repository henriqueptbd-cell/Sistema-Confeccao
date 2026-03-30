document.addEventListener('DOMContentLoaded', async () => {
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  const [pedidos, compras] = await Promise.all([
    listarPedidos(),
    listarCompras(null, null).catch(() => []),
  ]);
  const hoje = new Date();
  const mes  = hoje.getMonth() + 1;
  const ano  = hoje.getFullYear();

  const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  document.getElementById('periodo-label').textContent = 'Referência: ' + nomeMes;

  renderResumo(pedidos, mes, ano);
  renderGargalo(pedidos);
  renderRanking(pedidos);
  renderMateriais(compras, mes, ano);
  renderPrazos(pedidos);
});

function renderResumo(pedidos, mes, ano) {
  const emProducao = pedidos.filter(p => p.status !== 'concluido' && p.status !== 'entregue');
  const atrasados  = pedidos.filter(p => p.status !== 'entregue' && isAtrasado(p));

  const entreguesNoMes = pedidos.filter(p => {
    if (p.status !== 'entregue' || !p.entregueEmISO) return false;
    const [a, m] = p.entregueEmISO.split('-');
    return parseInt(m) === mes && parseInt(a) === ano;
  });

  const faturamentoMes = entreguesNoMes.reduce((s, p) => s + totalPedido(p), 0);

  document.getElementById('stat-producao').textContent    = emProducao.length;
  document.getElementById('stat-concluidos').textContent  = entreguesNoMes.length;
  document.getElementById('stat-faturamento').textContent = formatarMoeda(faturamentoMes);
  document.getElementById('stat-atrasados').textContent   = atrasados.length;
}

function renderGargalo(pedidos) {
  const emProducao = pedidos.filter(p => p.status !== 'concluido' && p.status !== 'entregue');
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

function renderMateriais(compras, mes, ano) {
  const doMes = compras.filter(c => {
    if (c.tipo !== 'Material' || !c.dataISO) return false;
    const [a, m] = c.dataISO.split('-');
    return parseInt(m) === mes && parseInt(a) === ano;
  });

  const custosPorMat = {};
  const qtdPorMat    = {};

  doMes.forEach(c => {
    const mat = c.material || '—';
    custosPorMat[mat] = (custosPorMat[mat] || 0) + (c.valorTotal || 0);
    if (c.quantidade && c.unidade) {
      if (!qtdPorMat[mat]) qtdPorMat[mat] = {};
      qtdPorMat[mat][c.unidade] = (qtdPorMat[mat][c.unidade] || 0) + c.quantidade;
    }
  });

  const custoEl = document.getElementById('materiais-custo-container');
  const qtdEl   = document.getElementById('materiais-qtd-container');

  if (!Object.keys(custosPorMat).length) {
    const vazio = '<div style="font-size:13px;color:var(--gray)">Nenhum material comprado neste mês.</div>';
    custoEl.innerHTML = vazio;
    qtdEl.innerHTML   = vazio;
    return;
  }

  const maxCusto = Math.max(...Object.values(custosPorMat));
  custoEl.innerHTML = Object.entries(custosPorMat)
    .sort((a, b) => b[1] - a[1])
    .map(([mat, valor]) => {
      const pct = Math.round((valor / maxCusto) * 100);
      return `
        <div class="gargalo-row">
          <span class="gargalo-nome">${mat}</span>
          <div class="gargalo-bar-wrap">
            <div class="gargalo-bar-fill" style="width:${pct}%;background:var(--accent2)"></div>
          </div>
          <span class="gargalo-count" style="width:80px">${formatarMoeda(valor)}</span>
        </div>`;
    }).join('');

  qtdEl.innerHTML = Object.entries(qtdPorMat)
    .sort((a, b) => {
      const totalA = Object.values(a[1]).reduce((s, v) => s + v, 0);
      const totalB = Object.values(b[1]).reduce((s, v) => s + v, 0);
      return totalB - totalA;
    })
    .map(([mat, unidades]) => {
      const linhas = Object.entries(unidades)
        .map(([un, qtd]) => `${qtd} ${un}`)
        .join(', ');
      return `
        <div class="ranking-row">
          <span class="ranking-nome">${mat}</span>
          <span class="ranking-qtd">${linhas}</span>
        </div>`;
    }).join('');
}

function renderPrazos(pedidos) {
  const emProducao = pedidos
    .filter(p => p.status !== 'concluido' && p.status !== 'entregue')
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
