document.addEventListener('DOMContentLoaded', async () => {
  // TODO(segurança): validar JWT no servidor em vez de checar sessionStorage
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id) {
    window.location.href = 'dashboard.html';
    return;
  }

  await carregarPedido(id);
});

async function carregarPedido(id) {
  const pedido = await buscarPedido(id);

  if (!pedido) {
    document.querySelector('.main').innerHTML =
      '<p class="pedido-nao-encontrado">Pedido não encontrado.</p>';
    return;
  }

  renderCabecalho(pedido);
  renderInfos(pedido);
  renderPecas(pedido);
  document.getElementById('timeline-container').innerHTML = renderTimeline(pedido);
  renderEtapaCard(pedido);
  iniciarBotoesConcluir(pedido);
  iniciarExcluirPedido(pedido);
}

function renderCabecalho(pedido) {
  document.getElementById('pedido-id').textContent = '#' + pedido.id;
  const badge = document.getElementById('pedido-badge');
  badge.textContent = pedido.status === 'concluido' ? 'Concluído' : 'Em produção';
  badge.className   = 'badge ' + (pedido.status === 'concluido' ? 'badge-concluido' : 'badge-producao');
}

function renderInfos(pedido) {
  const proxima     = pedido.etapas?.find(e => !e.concluida);
  const etapaTexto  = pedido.status === 'concluido'
    ? 'Concluído'
    : proxima ? proxima.nome : 'Concluído';

  document.getElementById('info-cliente').textContent  = pedido.cliente;
  document.getElementById('info-telefone').textContent = pedido.telefone;
  document.getElementById('info-entrada').textContent  = pedido.dataEntrada;
  document.getElementById('info-prazo').textContent    = pedido.prazo;
  document.getElementById('info-etapa').textContent    = etapaTexto;
}

function renderPecas(pedido) {
  document.getElementById('pecas-container').innerHTML =
    pedido.pecas.map(p => p.tipo ? renderProdutoNovo(p) : renderProdutoLegado(p)).join('');

  document.getElementById('total-count').textContent = totalPecas(pedido);
  document.getElementById('total-valor').textContent = formatarMoeda(totalPedido(pedido));

  renderBotaoImagens(pedido);
}

function renderBotaoImagens(pedido) {
  const produtos = pedido.pecas.filter(p => p.imagemLink);
  const btnEl    = document.getElementById('btn-imagens');
  if (!btnEl) return;

  if (produtos.length === 0) {
    btnEl.hidden = true;
    return;
  }

  btnEl.hidden      = false;
  btnEl.textContent = `🖼 Imagens (${produtos.length})`;
  btnEl.onclick     = () => abrirGaleria(produtos);

  document.getElementById('btn-fechar-galeria').onclick = fecharGaleria;
  document.getElementById('modal-imagens').addEventListener('click', e => {
    if (e.target.id === 'modal-imagens') fecharGaleria();
  });
}

function abrirGaleria(produtos) {
  const lista = document.getElementById('galeria-lista');

  lista.innerHTML = produtos.map(p => `
    <div class="galeria-item">
      <div class="galeria-item-label">${p.tipo || 'Produto'}</div>
      <img
        class="galeria-img"
        src="${p.imagemLink}"
        alt="Referência: ${p.tipo || ''}"
        onerror="this.replaceWith(erroImagem('${p.imagemLink}'))"
      />
      <a class="galeria-link-externo" href="${p.imagemLink}" target="_blank" rel="noopener">
        Abrir original ↗
      </a>
    </div>`).join('');

  document.getElementById('modal-imagens').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function fecharGaleria() {
  document.getElementById('modal-imagens').classList.remove('visible');
  document.body.style.overflow = '';
}

function erroImagem(url) {
  const div = document.createElement('div');
  div.className = 'galeria-img-erro';
  div.innerHTML = `
    <div>🔗 Link externo — não pode ser exibido aqui</div>
    <a href="${url}" target="_blank" rel="noopener">Abrir no navegador ↗</a>`;
  return div;
}

function renderProdutoLegado(p) {
  return `
    <div class="peca-row">
      <span class="peca-label">${p.descricao || ''}</span>
      <span class="peca-detail">${p.detalhe || ''}</span>
      <span class="peca-detail">${p.estampa || ''}</span>
      <span class="peca-valor">${formatarMoeda(p.valor || 0)}</span>
    </div>`;
}

function renderProdutoNovo(p) {
  const qtd = p.tamanhos
    ? Object.values(p.tamanhos).reduce((s, v) => s + v, 0)
    : (p.quantidade || 1);

  const detalhes = [
    p.material,
    p.modelo,
    p.gola    ? `Gola ${p.gola}` : null,
    p.punho   ? `Punho ${p.punho}` : null,
    p.dedao   ? 'Com dedão' : null,
    p.capuz && p.capuz !== 'Sem capuz' ? p.capuz : null,
    p.bolsoZiper ? 'Bolso c/ zíper' : null,
    p.faces,
    p.medidas,
  ].filter(Boolean).join(' · ');

  const tamanhoHtml = p.tamanhos && Object.keys(p.tamanhos).length
    ? `<div class="produto-tamanhos">${
        Object.entries(p.tamanhos).map(([tam, qty]) =>
          `<span class="tam-item"><span class="tam-label">${tam}</span><span class="tam-qty">×${qty}</span></span>`
        ).join('')
      }</div>`
    : '';

  const estampaPartes = [
    p.estampaTipo,
    p.estampaCor       ? `Cor: ${p.estampaCor}` : null,
    p.estampaDescricao || null,
    // compatibilidade com pedidos no formato antigo
    p.estampaModelo || null,
    p.estampaObs    || null,
  ].filter(Boolean);
  const estampaHtml = estampaPartes.length
    ? `<div class="produto-estampa">Estampa: ${estampaPartes.join(' · ')}</div>`
    : '';

  const obsHtml = p.observacoes
    ? `<div class="produto-obs">${p.observacoes}</div>`
    : '';

  // TODO(imagens — Cloudinary): quando o upload estiver ativo, imagemLink será
  // uma URL gerada pelo Cloudinary (secure_url). O botão abaixo já funciona com
  // qualquer URL válida — nenhuma mudança necessária aqui na migração.
  const imagemHtml = p.imagemLink
    ? `<a class="btn-ver-imagem" href="${p.imagemLink}" target="_blank" rel="noopener">
         🖼 Ver imagem de referência
       </a>`
    : '';

  return `
    <div class="produto-row">
      <div class="produto-row-header">
        <span class="produto-tipo">${p.tipo}</span>
        <span class="produto-subtotal">${formatarMoeda((p.valorUnitario || 0) * qtd)}</span>
      </div>
      ${detalhes ? `<div class="produto-detalhes">${detalhes}</div>` : ''}
      ${estampaHtml}
      ${tamanhoHtml}
      ${obsHtml}
      ${imagemHtml}
      <div class="produto-meta">${qtd} ${qtd === 1 ? 'peça' : 'peças'} · ${formatarMoeda(p.valorUnitario || 0)} cada</div>
    </div>`;
}

function renderEtapaCard(pedido) {
  const card = document.getElementById('etapa-card');

  if (pedido.status === 'concluido') {
    card.innerHTML = `
      <div class="card-title">Status do pedido</div>
      <div class="etapa-atual-nome etapa-concluida">✓ Concluído</div>
      <div class="etapa-numero">Todas as etapas finalizadas</div>`;
    return;
  }

  const concluidas = pedido.etapas.filter(e => e.concluida).length;
  const total      = pedido.etapas.length;
  const pct        = Math.round((concluidas / total) * 100);

  card.innerHTML = `
    <div class="card-title">Status do pedido</div>
    <div class="etapa-atual-nome">Em produção</div>
    <div class="etapa-numero">${concluidas} de ${total} etapas concluídas</div>
    <div class="etapa-progress-bar">
      <div class="etapa-progress-fill" style="width:${pct}%"></div>
    </div>`;
}

function iniciarExcluirPedido(pedido) {
  document.getElementById('btn-excluir-pedido').addEventListener('click', async () => {
    if (!confirm(`Excluir o pedido #${pedido.id} (${pedido.cliente})?\n\nEsta ação não pode ser desfeita.`)) return;
    await excluirPedido(pedido.id);
    window.location.href = 'dashboard.html';
  });

  document.getElementById('btn-editar-pedido').addEventListener('click', () => {
    window.location.href = `editar-pedido.html?id=${pedido.id}`;
  });
}

function iniciarBotoesConcluir(pedido) {
  const modal     = document.getElementById('modal');
  const modalNome = document.getElementById('modal-etapa-atual');
  const btnConf   = document.getElementById('btn-confirmar');

  document.getElementById('timeline-container').addEventListener('click', e => {
    const btn = e.target.closest('.step-btn-concluir');
    if (!btn) return;
    const ordem = parseInt(btn.dataset.ordem);
    const etapa = pedido.etapas.find(et => et.ordem === ordem);
    modalNome.textContent          = etapa.nome;
    btnConf.dataset.ordemPendente  = ordem;
    modal.classList.add('visible');
  });

  btnConf.onclick = async () => {
    const ordem = parseInt(btnConf.dataset.ordemPendente);
    if (!ordem) return;
    await concluirEtapa(pedido.id, ordem);
    modal.classList.remove('visible');
    await carregarPedido(pedido.id);
  };
}
