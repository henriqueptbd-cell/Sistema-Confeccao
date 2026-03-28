let clientesCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  // TODO(segurança): validar JWT no servidor em vez de checar sessionStorage
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  iniciarModalCliente();
  await carregarClientes();
  iniciarBuscaLocal();

  document.querySelector('.btn-new').addEventListener('click', () => {
    abrirModalCliente(cliente => {
      clientesCache.unshift(cliente);
      renderTabela(clientesCache);
      atualizarTotal(clientesCache);
    });
  });
});

async function carregarClientes() {
  try {
    clientesCache = await listarClientes();
    atualizarTotal(clientesCache);
    renderTabela(clientesCache);
  } catch (e) {
    console.error('Falha ao carregar clientes:', e);
  }
}

function atualizarTotal(clientes) {
  const el = document.getElementById('total-clientes');
  if (el) el.textContent = `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`;
}

function renderTabela(clientes) {
  const tbody = document.getElementById('tabela-body');
  if (!tbody) return;

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="tabela-vazia">Nenhum cliente cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = clientes.map(c => {
    const nome     = nomeDisplayCliente(c);
    const tipoBadge = c.tipoPessoa === 'juridica'
      ? '<span class="tipo-badge tipo-juridica">PJ</span>'
      : '<span class="tipo-badge tipo-fisica">PF</span>';
    const doc = c.tipoPessoa === 'juridica'
      ? formatarCnpj(c.cnpj || '')
      : formatarCpf(c.cpf || '');

    return `
      <tr>
        <td><span class="pedido-id">#${c.id}</span></td>
        <td><span class="cliente-nome">${nome}</span></td>
        <td>${tipoBadge}</td>
        <td style="font-size:13px;color:var(--gray)">${doc}</td>
        <td style="font-size:13px">${c.telefone || '—'}</td>
        <td>
          <div class="acoes">
            <button class="btn-acao btn-editar"  onclick="editarCliente(${c.id})">Editar</button>
            <button class="btn-acao btn-excluir" onclick="excluirClienteConfirm(${c.id}, '${nome.replace(/'/g, "\\'")}')">Excluir</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function editarCliente(id) {
  const c = clientesCache.find(c => c.id === id);
  if (!c) return;

  abrirModalCliente(atualizado => {
    const idx = clientesCache.findIndex(c => c.id === atualizado.id);
    if (idx >= 0) clientesCache[idx] = atualizado;
    renderTabela(clientesCache);
  }, c);
}

async function excluirClienteConfirm(id, nome) {
  if (!confirm(`Excluir o cliente "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;

  const resultado = await excluirCliente(id);

  if (resultado.mensagem) {
    alert(resultado.mensagem);
    return;
  }

  clientesCache = clientesCache.filter(c => c.id !== id);
  atualizarTotal(clientesCache);
  renderTabela(clientesCache);
}

function iniciarBuscaLocal() {
  const input = document.getElementById('busca-cliente');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) return renderTabela(clientesCache);

    const sem = q.replace(/[.\-\/]/g, '');
    const filtrado = clientesCache.filter(c => {
      return [c.nome, c.razaoSocial, c.nomeFantasia].filter(Boolean)
               .some(v => v.toLowerCase().includes(q))
        || (c.cpf  || '').includes(sem)
        || (c.cnpj || '').includes(sem);
    });
    renderTabela(filtrado);
  });
}
