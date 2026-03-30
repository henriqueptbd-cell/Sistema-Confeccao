// ============================================================
// financeiro.js — Página Financeiro (Preços | Funcionários | Compras | Acessos)
// ============================================================

let configAtual       = null;
let funcionarioEditId = null;
let compraEditId      = null;
let usuarioEditId     = null;
let categoriasCache   = [];

const LABEL_ADICIONAL = {
  punho:       'Punho (manga longa)',
  dedao:       'Encaixe de dedão',
  capuzNormal: 'Capuz normal',
  capuzNinja:  'Capuz ninja',
  balaclava:   'Balaclava',
  bolsoZiper:  'Bolso com zíper',
  segundaFace: '2ª face (Bandeira)',
};

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  if (!usuario.email)           { window.location.href = 'index.html';    return; }
  if (usuario.role !== 'admin') { window.location.href = 'dashboard.html'; return; }

  iniciarAbas();
  iniciarModalFuncionario();
  iniciarModalCompra();
  iniciarModalCategorias();
  iniciarModalUsuario();
  iniciarFiltroCompras();

  await carregarPrecos();
});

// ===================== ABAS =====================

function iniciarAbas() {
  document.querySelectorAll('.fin-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fin-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.fin-panel').forEach(p => p.hidden = true);
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      panel.hidden = false;

      if (btn.dataset.tab === 'funcionarios') carregarFuncionarios();
      if (btn.dataset.tab === 'compras')      carregarCompras();
      if (btn.dataset.tab === 'acessos')      carregarAcessos();
    });
  });
}

// ===================== ABA PREÇOS =====================

async function carregarPrecos() {
  configAtual = await buscarConfigPrecos();
  renderPrecosBase(configAtual.precoBase);
  renderAdicionais(configAtual.adicionais);
  document.getElementById('cfg-desconto-max').value = configAtual.descontoMaximo ?? 15;
  document.getElementById('btn-salvar-config').addEventListener('click', salvarConfig);
}

function renderPrecosBase(precoBase) {
  const tbody = document.getElementById('tbody-precos-base');
  const linhas = [];
  Object.entries(precoBase).forEach(([produto, valor]) => {
    if (typeof valor === 'number') {
      linhas.push(`<tr>
        <td class="produto-nome">${produto}</td>
        <td class="variacao">—</td>
        <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
          data-produto="${produto}" data-variacao="" value="${valor}"/></td>
      </tr>`);
    } else {
      Object.entries(valor).forEach(([variacao, preco]) => {
        linhas.push(`<tr>
          <td class="produto-nome">${produto}</td>
          <td class="variacao">${variacao}</td>
          <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
            data-produto="${produto}" data-variacao="${variacao}" value="${preco}"/></td>
        </tr>`);
      });
    }
  });
  tbody.innerHTML = linhas.join('');
}

function renderAdicionais(adicionais) {
  const tbody = document.getElementById('tbody-adicionais');
  tbody.innerHTML = Object.entries(adicionais).map(([chave, valor]) => `
    <tr>
      <td>${LABEL_ADICIONAL[chave] || chave}</td>
      <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
        data-adicional="${chave}" value="${valor}"/></td>
    </tr>`).join('');
}

async function salvarConfig() {
  const novoConfig = {
    precoBase:      JSON.parse(JSON.stringify(configAtual.precoBase)),
    adicionais:     { ...configAtual.adicionais },
    descontoMaximo: parseFloat(document.getElementById('cfg-desconto-max').value) || 0,
  };

  document.querySelectorAll('#tbody-precos-base .cfg-preco-input').forEach(input => {
    const produto  = input.dataset.produto;
    const variacao = input.dataset.variacao;
    const valor    = parseFloat(input.value) || 0;
    if (variacao === '') novoConfig.precoBase[produto] = valor;
    else novoConfig.precoBase[produto][variacao] = valor;
  });

  document.querySelectorAll('#tbody-adicionais .cfg-preco-input').forEach(input => {
    novoConfig.adicionais[input.dataset.adicional] = parseFloat(input.value) || 0;
  });

  const btn = document.getElementById('btn-salvar-config');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';
  try {
    await salvarConfigPrecos(novoConfig);
    configAtual = novoConfig;
    mostrarMsg('Configurações salvas com sucesso.', 'sucesso');
  } catch {
    mostrarMsg('Erro ao salvar. Tente novamente.', 'erro');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salvar alterações';
  }
}

function mostrarMsg(texto, tipo) {
  const el = document.getElementById('cfg-msg');
  el.textContent = texto;
  el.className   = `cfg-msg ${tipo}`;
  el.hidden      = false;
  setTimeout(() => { el.hidden = true; }, 3000);
}

// ===================== ABA FUNCIONÁRIOS =====================

async function carregarFuncionarios() {
  const lista  = await listarFuncionarios();
  const tbody  = document.getElementById('tbody-funcionarios');
  const count  = document.getElementById('func-count');
  count.textContent = `${lista.length} funcionário${lista.length !== 1 ? 's' : ''}`;

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Nenhum funcionário cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(f => `
    <tr class="${f.ativo ? '' : 'fin-row-inativo'}">
      <td><strong>${f.nome}</strong></td>
      <td>${f.cargo}</td>
      <td>${f.salarioBase ? formatarMoeda(f.salarioBase) : '—'}</td>
      <td>${f.telefone || '—'}</td>
      <td>${f.dataAdmissao ? formatarDataISO(f.dataAdmissao) : '—'}</td>
      <td><span class="fin-badge ${f.ativo ? 'fin-badge-ativo' : 'fin-badge-inativo'}">${f.ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td class="fin-acoes">
        <button class="btn-ver" onclick="editarFuncionario(${f.id})">Editar</button>
        <button class="btn-acao btn-excluir" onclick="removerFuncionario(${f.id}, '${f.nome.replace(/'/g, "\\'")}')">Excluir</button>
      </td>
    </tr>`).join('');
}

function iniciarModalFuncionario() {
  document.getElementById('btn-novo-funcionario').addEventListener('click', () => {
    funcionarioEditId = null;
    document.getElementById('modal-func-titulo').textContent = 'Novo funcionário';
    limparFormFunc();
    abrirModal('modal-funcionario');
  });
  document.getElementById('btn-cancelar-func').addEventListener('click', () => fecharModal('modal-funcionario'));
  document.getElementById('modal-funcionario').addEventListener('click', e => {
    if (e.target.id === 'modal-funcionario') fecharModal('modal-funcionario');
  });
  document.getElementById('btn-salvar-func').addEventListener('click', salvarFuncionario);
}

function limparFormFunc() {
  ['func-nome', 'func-cargo', 'func-telefone', 'func-salario', 'func-admissao'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('func-ativo').checked = true;
}

async function editarFuncionario(id) {
  const lista = await listarFuncionarios();
  const f = lista.find(x => x.id === id);
  if (!f) return;

  funcionarioEditId = id;
  document.getElementById('modal-func-titulo').textContent = 'Editar funcionário';
  document.getElementById('func-nome').value      = f.nome       || '';
  document.getElementById('func-cargo').value     = f.cargo      || '';
  document.getElementById('func-telefone').value  = f.telefone   || '';
  document.getElementById('func-salario').value   = f.salarioBase || '';
  document.getElementById('func-admissao').value  = f.dataAdmissao || '';
  document.getElementById('func-ativo').checked   = f.ativo !== false;
  abrirModal('modal-funcionario');
}

async function salvarFuncionario() {
  const nome  = document.getElementById('func-nome').value.trim();
  const cargo = document.getElementById('func-cargo').value.trim();
  if (!nome || !cargo) {
    document.getElementById('func-nome').classList.toggle('field-error', !nome);
    document.getElementById('func-cargo').classList.toggle('field-error', !cargo);
    return;
  }
  document.getElementById('func-nome').classList.remove('field-error');
  document.getElementById('func-cargo').classList.remove('field-error');

  const dados = {
    nome,
    cargo,
    telefone:     document.getElementById('func-telefone').value.trim() || null,
    salarioBase:  parseFloat(document.getElementById('func-salario').value) || null,
    dataAdmissao: document.getElementById('func-admissao').value || null,
    ativo:        document.getElementById('func-ativo').checked,
  };

  const btn = document.getElementById('btn-salvar-func');
  btn.disabled = true;
  try {
    if (funcionarioEditId) await atualizarFuncionario(funcionarioEditId, dados);
    else                   await criarFuncionario(dados);
    fecharModal('modal-funcionario');
    await carregarFuncionarios();
  } catch {
    alert('Erro ao salvar funcionário.');
  } finally {
    btn.disabled = false;
  }
}

async function removerFuncionario(id, nome) {
  if (!confirm(`Excluir o funcionário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
  await excluirFuncionario(id);
  await carregarFuncionarios();
}

// ===================== ABA COMPRAS =====================

async function carregarCompras() {
  const mes = document.getElementById('filtro-mes').value;
  const ano = document.getElementById('filtro-ano').value;
  const lista = await listarCompras(mes || null, ano || null);
  renderCompras(lista);
}

function renderCompras(lista) {
  const tbody    = document.getElementById('tbody-compras');
  const totalRow = document.getElementById('compras-total-row');

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="tabela-vazia">Nenhum custo registrado.</td></tr>';
    totalRow.hidden = true;
    return;
  }

  let total = 0;
  tbody.innerHTML = lista.map(c => {
    total += c.valorTotal || 0;
    const tipoLabel = c.tipo === 'Material' && c.material
      ? `Material — ${c.material}`
      : (c.tipo || '—');
    const qtdLabel = c.tipo === 'Material' && c.quantidade
      ? `${c.quantidade} ${c.unidade || ''}`
      : '—';
    return `<tr>
      <td>${c.data || '—'}</td>
      <td>${tipoLabel}</td>
      <td>${c.fornecedor || '—'}</td>
      <td>${qtdLabel}</td>
      <td>${formatarMoeda(c.valorTotal)}</td>
      <td class="fin-acoes">
        <button class="btn-ver" onclick="editarCompra(${c.id})">Editar</button>
        <button class="btn-acao btn-excluir" onclick="removerCompra(${c.id})">Excluir</button>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('compras-total-valor').textContent = formatarMoeda(total);
  totalRow.hidden = false;
}

function iniciarFiltroCompras() {
  const anoAtual  = new Date().getFullYear();
  const selectAno = document.getElementById('filtro-ano');
  selectAno.innerHTML = '<option value="">Todos os anos</option>';
  for (let a = anoAtual + 1; a >= anoAtual - 4; a--) {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    if (a === anoAtual) opt.selected = true;
    selectAno.appendChild(opt);
  }
  document.getElementById('filtro-mes').addEventListener('change', carregarCompras);
  document.getElementById('filtro-ano').addEventListener('change', carregarCompras);
}

async function iniciarModalCompra() {
  await carregarCategorias();

  document.getElementById('btn-nova-compra').addEventListener('click', () => {
    compraEditId = null;
    document.getElementById('modal-compra-titulo').textContent = 'Novo custo';
    limparFormCompra();
    abrirModal('modal-compra');
  });
  document.getElementById('btn-cancelar-compra').addEventListener('click', () => fecharModal('modal-compra'));
  document.getElementById('modal-compra').addEventListener('click', e => {
    if (e.target.id === 'modal-compra') fecharModal('modal-compra');
  });
  document.getElementById('btn-salvar-compra').addEventListener('click', salvarCompra);
  document.getElementById('compra-tipo').addEventListener('change', atualizarVisibilidadeMaterial);
}

async function carregarCategorias() {
  try {
    categoriasCache = await listarCategoriasDespesa();
  } catch {
    categoriasCache = [];
  }
  popularSelectTipo();
}

function popularSelectTipo() {
  const select = document.getElementById('compra-tipo');
  const valorAtual = select.value;
  select.innerHTML = '<option value="Material">Material</option>';
  categoriasCache.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  if (valorAtual) select.value = valorAtual;
  atualizarVisibilidadeMaterial();
}

function atualizarVisibilidadeMaterial() {
  const tipo = document.getElementById('compra-tipo').value;
  document.getElementById('compra-material-wrap').style.display =
    tipo === 'Material' ? '' : 'none';
}

function limparFormCompra() {
  document.getElementById('compra-data').value       = new Date().toISOString().slice(0, 10);
  document.getElementById('compra-tipo').value       = 'Material';
  document.getElementById('compra-material').selectedIndex = 0;
  document.getElementById('compra-quantidade').value = '';
  document.getElementById('compra-unidade').value    = 'metros';
  document.getElementById('compra-fornecedor').value = '';
  document.getElementById('compra-valor').value      = '';
  document.getElementById('compra-obs').value        = '';
  atualizarVisibilidadeMaterial();
}

async function editarCompra(id) {
  const lista = await listarCompras();
  const c = lista.find(x => x.id === id);
  if (!c) return;

  compraEditId = id;
  document.getElementById('modal-compra-titulo').textContent = 'Editar custo';
  document.getElementById('compra-data').value       = c.dataISO    || '';
  document.getElementById('compra-tipo').value       = c.tipo       || 'Material';
  document.getElementById('compra-material').value   = c.material   || '';
  document.getElementById('compra-quantidade').value = c.quantidade || '';
  document.getElementById('compra-unidade').value    = c.unidade    || 'metros';
  document.getElementById('compra-fornecedor').value = c.fornecedor || '';
  document.getElementById('compra-valor').value      = c.valorTotal || '';
  document.getElementById('compra-obs').value        = c.observacoes || '';
  atualizarVisibilidadeMaterial();
  abrirModal('modal-compra');
}

async function salvarCompra() {
  const dataISO    = document.getElementById('compra-data').value;
  const tipo       = document.getElementById('compra-tipo').value;
  const fornecedor = document.getElementById('compra-fornecedor').value.trim();
  const valorTotal = parseFloat(document.getElementById('compra-valor').value);
  const isMaterial = tipo === 'Material';
  const material   = isMaterial ? document.getElementById('compra-material').value : null;
  const quantidade = isMaterial ? parseFloat(document.getElementById('compra-quantidade').value) : null;

  let valido = true;
  const campos = [
    ['compra-data',       !dataISO],
    ['compra-fornecedor', !fornecedor],
    ['compra-valor',      !valorTotal],
  ];
  if (isMaterial) {
    campos.push(['compra-material',   !material]);
    campos.push(['compra-quantidade', !quantidade]);
  }
  campos.forEach(([id, err]) => {
    document.getElementById(id).classList.toggle('field-error', err);
    if (err) valido = false;
  });
  if (!valido) return;

  const [ano, mes, dia] = dataISO.split('-');
  const dados = {
    dataISO,
    data:        `${dia}/${mes}/${ano}`,
    tipo,
    fornecedor,
    material,
    quantidade,
    unidade:     isMaterial ? document.getElementById('compra-unidade').value : null,
    valorTotal,
    observacoes: document.getElementById('compra-obs').value.trim() || null,
  };

  const btn = document.getElementById('btn-salvar-compra');
  btn.disabled = true;
  try {
    if (compraEditId) await atualizarCompra(compraEditId, dados);
    else              await criarCompra(dados);
    fecharModal('modal-compra');
    await carregarCompras();
  } catch {
    alert('Erro ao salvar custo.');
  } finally {
    btn.disabled = false;
  }
}

async function removerCompra(id) {
  if (!confirm('Excluir este custo?\n\nEsta ação não pode ser desfeita.')) return;
  await excluirCompra(id);
  await carregarCompras();
}

// ===================== MODAL CATEGORIAS =====================

function iniciarModalCategorias() {
  document.getElementById('btn-gerenciar-cat').addEventListener('click', async () => {
    await carregarCategorias();
    renderCatLista();
    abrirModal('modal-categorias');
  });
  document.getElementById('btn-fechar-categorias').addEventListener('click', () => fecharModal('modal-categorias'));
  document.getElementById('modal-categorias').addEventListener('click', e => {
    if (e.target.id === 'modal-categorias') fecharModal('modal-categorias');
  });
  document.getElementById('btn-add-categoria').addEventListener('click', adicionarCategoria);
  document.getElementById('nova-categoria').addEventListener('keydown', e => {
    if (e.key === 'Enter') adicionarCategoria();
  });
}

function renderCatLista() {
  const lista = document.getElementById('cat-lista');
  if (!categoriasCache.length) {
    lista.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Nenhuma categoria cadastrada.</div>';
    return;
  }
  lista.innerHTML = categoriasCache.map((cat, i) => `
    <div class="fin-cat-item">
      <span>${cat}</span>
      <button class="fin-cat-remove" onclick="removerCategoria(${i})" title="Remover">×</button>
    </div>`).join('');
}

async function adicionarCategoria() {
  const input = document.getElementById('nova-categoria');
  const nome  = input.value.trim();
  if (!nome) return;
  if (categoriasCache.includes(nome)) { input.value = ''; return; }

  categoriasCache.push(nome);
  await salvarCategoriasDespesa(categoriasCache);
  popularSelectTipo();
  renderCatLista();
  input.value = '';
}

async function removerCategoria(idx) {
  categoriasCache.splice(idx, 1);
  await salvarCategoriasDespesa(categoriasCache);
  popularSelectTipo();
  renderCatLista();
}

// ===================== ABA ACESSOS =====================

async function carregarAcessos() {
  const lista  = await listarUsuarios();
  const tbody  = document.getElementById('tbody-usuarios');
  const count  = document.getElementById('acessos-count');
  count.textContent = `${lista.length} usuário${lista.length !== 1 ? 's' : ''}`;

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="tabela-vazia">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(u => `
    <tr>
      <td><strong>${u.nome}</strong></td>
      <td>${u.email}</td>
      <td><span class="fin-badge ${u.role === 'admin' ? 'fin-badge-admin' : 'fin-badge-func'}">${u.role === 'admin' ? 'Admin' : 'Funcionário'}</span></td>
      <td class="fin-acoes">
        <button class="btn-ver" onclick="mostrarSenha(${u.id}, '${u.nome.replace(/'/g, "\\'")}')">Ver senha</button>
        <button class="btn-ver" onclick="editarUsuario(${u.id})">Editar</button>
        <button class="btn-acao btn-excluir" onclick="removerUsuario(${u.id}, '${u.nome.replace(/'/g, "\\'")}')">Excluir</button>
      </td>
    </tr>`).join('');
}

function iniciarModalUsuario() {
  document.getElementById('btn-novo-usuario').addEventListener('click', () => {
    usuarioEditId = null;
    document.getElementById('modal-usuario-titulo').textContent = 'Novo usuário';
    document.getElementById('usuario-senha-label').textContent  = 'Senha *';
    limparFormUsuario();
    abrirModal('modal-usuario');
  });
  document.getElementById('btn-cancelar-usuario').addEventListener('click', () => fecharModal('modal-usuario'));
  document.getElementById('modal-usuario').addEventListener('click', e => {
    if (e.target.id === 'modal-usuario') fecharModal('modal-usuario');
  });
  document.getElementById('btn-salvar-usuario').addEventListener('click', salvarUsuario);
}

function limparFormUsuario() {
  ['usuario-nome', 'usuario-email', 'usuario-senha'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('field-error');
  });
  document.getElementById('usuario-role').value = 'funcionario';
  document.getElementById('usuario-erro').hidden = true;
}

async function editarUsuario(id) {
  const lista = await listarUsuarios();
  const u = lista.find(x => x.id === id);
  if (!u) return;

  usuarioEditId = id;
  document.getElementById('modal-usuario-titulo').textContent = 'Editar usuário';
  document.getElementById('usuario-senha-label').textContent  = 'Nova senha (deixe em branco para manter)';
  document.getElementById('usuario-nome').value  = u.nome  || '';
  document.getElementById('usuario-email').value = u.email || '';
  document.getElementById('usuario-senha').value = '';
  document.getElementById('usuario-role').value  = u.role  || 'funcionario';
  document.getElementById('usuario-erro').hidden = true;
  abrirModal('modal-usuario');
}

async function salvarUsuario() {
  const nome  = document.getElementById('usuario-nome').value.trim();
  const email = document.getElementById('usuario-email').value.trim();
  const senha = document.getElementById('usuario-senha').value.trim();
  const role  = document.getElementById('usuario-role').value;

  let valido = true;
  document.getElementById('usuario-nome').classList.toggle('field-error', !nome);
  document.getElementById('usuario-email').classList.toggle('field-error', !email);
  const senhaObrig = !usuarioEditId;
  document.getElementById('usuario-senha').classList.toggle('field-error', senhaObrig && !senha);
  if (!nome || !email || (senhaObrig && !senha)) valido = false;
  if (!valido) return;

  const dados = { nome, email, role };
  if (senha) dados.senha = senha;

  const btn = document.getElementById('btn-salvar-usuario');
  const erroEl = document.getElementById('usuario-erro');
  btn.disabled = true;
  erroEl.hidden = true;
  try {
    if (usuarioEditId) await atualizarUsuario(usuarioEditId, dados);
    else               await criarUsuario(dados);
    fecharModal('modal-usuario');
    await carregarAcessos();
  } catch (err) {
    erroEl.textContent = err.message || 'Erro ao salvar usuário.';
    erroEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
}

async function mostrarSenha(id, nome) {
  try {
    const { senha } = await verSenhaUsuario(id);
    alert(`Senha de ${nome}:\n\n${senha}`);
  } catch {
    alert('Erro ao buscar senha.');
  }
}

async function removerUsuario(id, nome) {
  if (!confirm(`Excluir o usuário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
  try {
    await excluirUsuario(id);
    await carregarAcessos();
  } catch {
    alert('Erro ao excluir usuário.');
  }
}

// ===================== HELPERS =====================

function abrirModal(id)  { document.getElementById(id).classList.add('visible'); }
function fecharModal(id) { document.getElementById(id).classList.remove('visible'); }

function formatarDataISO(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}
