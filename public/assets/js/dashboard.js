let pedidosCache       = [];
let filtroAtual        = 'todos';
let clienteSelecionado = null;
let _buscaTimer        = null;

document.addEventListener('DOMContentLoaded', async () => {
  // TODO(segurança): validar JWT no servidor em vez de checar sessionStorage
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  renderDataAtual();
  iniciarFiltros();
  iniciarNovoPedido();
  buscarConfigPrecos().then(c => { configPrecosAtual = c; }).catch(() => {});
  await carregarPedidos();
});

// ========================================
// Dashboard
// ========================================

async function carregarPedidos() {
  try {
    pedidosCache = await listarPedidos();
    renderStats(pedidosCache);
    renderTabela(pedidosCache, filtroAtual);
  } catch (e) {
    console.error('Falha ao carregar pedidos:', e);
  }
}

function renderDataAtual() {
  const el = document.getElementById('data-atual');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function renderStats(pedidos) {
  const emProducao = pedidos.filter(p => p.status === 'producao').length;
  const proxPrazo  = pedidos.filter(p => isAtrasado(p) || isProximoPrazo(p)).length;
  const concluidos = pedidos.filter(p => p.status === 'concluido').length;

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

function renderTabela(pedidos, filtro) {
  const tbody = document.getElementById('tabela-body');
  if (!tbody) return;

  const lista = filtro === 'todos' ? pedidos : pedidos.filter(p => p.status === filtro);

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="tabela-vazia">Nenhum pedido cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(criarLinhaPedido).join('');
}

function etapaAtualNome(p) {
  if (p.status === 'concluido') return 'Pronto para retirada';
  if (p.etapas) {
    const proxima = p.etapas.find(e => !e.concluida);
    return proxima ? proxima.nome : 'Pronto para retirada';
  }
  return ETAPAS[p.etapaAtual - 1] || '';
}

function criarLinhaPedido(p) {
  const etapaNome   = etapaAtualNome(p);
  const pill        = ETAPA_PILL[etapaNome] || 'pill-blue';
  const atrasado    = isAtrasado(p) || isProximoPrazo(p);
  const prazoLabel  = atrasado && p.status === 'producao'
    ? `<span class="prazo late">${p.prazo} ⚠️</span>`
    : `<span class="prazo">${p.prazo}</span>`;
  const dotClass    = p.status === 'concluido' ? 'dot-done' : atrasado ? 'dot-late' : 'dot-active';
  const statusLabel = p.status === 'concluido' ? 'Concluído' : 'Em produção';

  return `
    <tr onclick="window.location.href='pedido.html?id=${p.id}'">
      <td><span class="pedido-id">#${p.id}</span></td>
      <td><span class="cliente-nome">${p.cliente}</span></td>
      <td><span class="etapa-pill ${pill}">${etapaNome}</span></td>
      <td>${prazoLabel}</td>
      <td><span class="status-dot ${dotClass}"></span>${statusLabel}</td>
      <td>
        <div class="acoes">
          <button class="btn-ver"
            onclick="event.stopPropagation(); window.location.href='pedido.html?id=${p.id}'">
            Ver
          </button>
          <button class="btn-acao btn-excluir"
            onclick="event.stopPropagation(); excluirPedidoDashboard(${p.id}, '${p.cliente.replace(/'/g, "\\'")}')">
            Excluir
          </button>
        </div>
      </td>
    </tr>`;
}

async function excluirPedidoDashboard(id, cliente) {
  if (!confirm(`Excluir o pedido #${id} (${cliente})?\n\nEsta ação não pode ser desfeita.`)) return;
  await excluirPedido(id);
  await carregarPedidos();
}

function iniciarFiltros() {
  const mapa = { 'Todos': 'todos', 'Em produção': 'producao', 'Concluídos': 'concluido' };

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filtroAtual = mapa[this.textContent.trim()] || 'todos';
      renderTabela(pedidosCache, filtroAtual);
    });
  });
}

// ========================================
// Novo Pedido — Inicialização
// ========================================

function iniciarNovoPedido() {
  const modal = document.getElementById('modal-novo-pedido');

  document.querySelector('.btn-new').addEventListener('click', async () => {
    if (!configPrecosAtual) {
      try { configPrecosAtual = await buscarConfigPrecos(); } catch (_) {}
    }
    resetarForm();
    modal.classList.add('visible');
  });

  document.getElementById('btn-fechar-modal').addEventListener('click',  () => modal.classList.remove('visible'));
  document.getElementById('btn-cancelar-novo').addEventListener('click', () => modal.classList.remove('visible'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('visible'); });

  document.getElementById('btn-add-produto').addEventListener('click', adicionarProdutoCard);
  document.getElementById('btn-salvar-pedido').addEventListener('click', salvarNovoPedido);

  iniciarBuscaCliente();
  iniciarModalCliente();
}

// ========================================
// Busca de Cliente (Novo Pedido)
// ========================================

function iniciarBuscaCliente() {
  const inputBusca  = document.getElementById('f-cliente-busca');
  const dropdown    = document.getElementById('cliente-dropdown');
  const btnTrocar   = document.getElementById('btn-trocar-cliente');

  inputBusca.addEventListener('input', () => {
    clearTimeout(_buscaTimer);
    const q = inputBusca.value.trim();
    if (q.length < 2) { dropdown.hidden = true; return; }
    _buscaTimer = setTimeout(() => executarBuscaCliente(q), 300);
  });

  inputBusca.addEventListener('focus', () => {
    if (inputBusca.value.trim().length >= 2) executarBuscaCliente(inputBusca.value.trim());
  });

  inputBusca.addEventListener('blur', () => {
    setTimeout(() => { dropdown.hidden = true; }, 200);
  });

  btnTrocar.addEventListener('click', () => {
    clienteSelecionado = null;
    document.getElementById('f-clienteId').value              = '';
    document.getElementById('cliente-selecionado').hidden      = true;
    document.getElementById('cliente-search-wrap').hidden      = false;
    inputBusca.value = '';
    inputBusca.classList.remove('field-error');
    inputBusca.focus();
  });
}

async function executarBuscaCliente(q) {
  const dropdown = document.getElementById('cliente-dropdown');
  let clientes   = [];
  try { clientes = await buscarClientes(q); } catch (_) { return; }

  const itensHtml = clientes.map(c => {
    const nome    = nomeDisplayCliente(c);
    const detalhe = c.tipoPessoa === 'juridica'
      ? `CNPJ: ${formatarCnpj(c.cnpj || '')}`
      : `CPF: ${formatarCpf(c.cpf || '')}`;
    return `
      <div class="cliente-option" data-id="${c.id}">
        <div class="cliente-option-nome">${nome}</div>
        <div class="cliente-option-detalhe">${detalhe} · ${c.telefone || ''}</div>
      </div>`;
  }).join('');

  dropdown.innerHTML = itensHtml + `
    <div class="cliente-option-novo" id="btn-novo-cliente-inline">
      + Cadastrar novo cliente
    </div>`;
  dropdown.hidden = false;

  dropdown.querySelectorAll('.cliente-option[data-id]').forEach(el => {
    el.addEventListener('mousedown', () => {
      const id = parseInt(el.dataset.id);
      selecionarCliente(clientes.find(c => c.id === id));
    });
  });

  document.getElementById('btn-novo-cliente-inline')?.addEventListener('mousedown', () => {
    dropdown.hidden = true;
    abrirModalCliente(selecionarCliente);
  });
}

function selecionarCliente(c) {
  clienteSelecionado = c;
  const nome = nomeDisplayCliente(c);

  document.getElementById('f-clienteId').value              = c.id;
  document.getElementById('cliente-sel-nome').textContent   = nome;
  document.getElementById('cliente-selecionado').hidden      = false;
  document.getElementById('cliente-search-wrap').hidden      = true;
  document.getElementById('cliente-dropdown').hidden         = true;
  document.getElementById('f-cliente-busca').value          = '';
  document.getElementById('f-cliente-busca').classList.remove('field-error');
}

function resetarForm() {
  clienteSelecionado = null;
  document.getElementById('f-clienteId').value              = '';
  document.getElementById('f-cliente-busca').value          = '';
  document.getElementById('f-prazo').value                  = '';
  document.getElementById('cliente-selecionado').hidden      = true;
  document.getElementById('cliente-search-wrap').hidden      = false;
  document.getElementById('cliente-dropdown').hidden         = true;
  document.getElementById('produtos-form-list').innerHTML   = '';
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  adicionarProdutoCard();
}

// ========================================
// Novo Pedido — Coleta e Envio
// ========================================

async function salvarNovoPedido() {
  const fBusca    = document.getElementById('f-cliente-busca');
  const fPrazo    = document.getElementById('f-prazo');
  const clienteId = parseInt(document.getElementById('f-clienteId').value) || null;

  fBusca.classList.remove('field-error');
  fPrazo.classList.remove('field-error');

  let valido = true;
  if (!clienteId)    { fBusca.classList.add('field-error'); fBusca.focus(); valido = false; }
  if (!fPrazo.value) { fPrazo.classList.add('field-error'); valido = false; }
  if (!valido) return;

  const prazoISO        = fPrazo.value;
  const [ano, mes, dia] = prazoISO.split('-');

  const produtos = Array.from(
    document.querySelectorAll('#produtos-form-list .produto-card')
  ).map(coletarProduto);

  const btn = document.getElementById('btn-salvar-pedido');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';

  try {
    await criarPedido({
      clienteId,
      cliente:  nomeDisplayCliente(clienteSelecionado),
      telefone: clienteSelecionado?.telefone || '',
      prazo:    `${dia}/${mes}/${ano}`,
      prazoISO,
      pecas: produtos,
    });
    document.getElementById('modal-novo-pedido').classList.remove('visible');
    await carregarPedidos();
  } catch (e) {
    console.error('Erro ao criar pedido:', e);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salvar pedido';
  }
}
