// Camada de acesso a dados.
// Para migrar ao banco real: substitua o corpo de cada função
// por uma chamada equivalente à sua API REST (fetch com JWT no header).

async function listarPedidos() {
  const res = await fetch('/api/pedidos');
  if (!res.ok) throw new Error('Erro ao carregar pedidos.');
  return res.json();
}

async function buscarPedido(id) {
  const res = await fetch(`/api/pedidos/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erro ao buscar pedido.');
  return res.json();
}

async function criarPedido(dados) {
  const res = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  if (!res.ok) throw new Error('Erro ao criar pedido.');
  return res.json();
}

async function atualizarPedido(id, dados) {
  const res = await fetch(`/api/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar pedido.');
  return res.json();
}

async function excluirPedido(id) {
  const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
  return res.json();
}

async function entregarPedido(id) {
  const res = await fetch(`/api/pedidos/${id}/entregar`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Erro ao marcar como entregue.');
  return res.json();
}

async function concluirEtapa(id, ordem) {
  const res = await fetch(`/api/pedidos/${id}/etapas/${ordem}`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Erro ao concluir etapa.');
  return res.json();
}

async function buscarClientes(q) {
  const res = await fetch(`/api/clientes?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Erro ao buscar clientes.');
  return res.json();
}

async function listarClientes() {
  const res = await fetch('/api/clientes');
  if (!res.ok) throw new Error('Erro ao listar clientes.');
  return res.json();
}

async function criarCliente(dados) {
  const res = await fetch('/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao criar cliente.');
  return res.json();
}

async function atualizarCliente(id, dados) {
  const res = await fetch(`/api/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar cliente.');
  return res.json();
}

async function excluirCliente(id) {
  const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
  return res.json();
}

async function buscarConfigPrecos() {
  const res = await fetch('/api/config/precos');
  if (!res.ok) throw new Error('Erro ao carregar configuração de preços.');
  return res.json();
}

async function salvarConfigPrecos(dados) {
  const res = await fetch('/api/config/precos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao salvar configuração de preços.');
  return res.json();
}

// Funcionários
async function listarFuncionarios() {
  const res = await fetch('/api/funcionarios');
  if (!res.ok) throw new Error('Erro ao listar funcionários.');
  return res.json();
}

async function criarFuncionario(dados) {
  const res = await fetch('/api/funcionarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao criar funcionário.');
  return res.json();
}

async function atualizarFuncionario(id, dados) {
  const res = await fetch(`/api/funcionarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar funcionário.');
  return res.json();
}

async function excluirFuncionario(id) {
  const res = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir funcionário.');
  return res.json();
}

// Compras
async function listarCompras(mes, ano) {
  const params = mes && ano ? `?mes=${mes}&ano=${ano}` : '';
  const res = await fetch(`/api/compras${params}`);
  if (!res.ok) throw new Error('Erro ao listar compras.');
  return res.json();
}

async function criarCompra(dados) {
  const res = await fetch('/api/compras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao criar compra.');
  return res.json();
}

async function atualizarCompra(id, dados) {
  const res = await fetch(`/api/compras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar compra.');
  return res.json();
}

async function excluirCompra(id) {
  const res = await fetch(`/api/compras/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir compra.');
  return res.json();
}

// Usuários (acessos)
async function listarUsuarios() {
  const res = await fetch('/api/usuarios');
  if (!res.ok) throw new Error('Erro ao listar usuários.');
  return res.json();
}

async function criarUsuario(dados) {
  const res = await fetch('/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.mensagem || 'Erro ao criar usuário.');
  }
  return res.json();
}

async function verSenhaUsuario(id) {
  const res = await fetch(`/api/usuarios/${id}/senha`);
  if (!res.ok) throw new Error('Erro ao buscar senha.');
  return res.json();
}

async function atualizarUsuario(id, dados) {
  const res = await fetch(`/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar usuário.');
  return res.json();
}

async function excluirUsuario(id) {
  const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir usuário.');
  return res.json();
}

// Categorias de despesa
async function listarCategoriasDespesa() {
  const res = await fetch('/api/usuarios/categorias-despesa');
  if (!res.ok) throw new Error('Erro ao carregar categorias.');
  return res.json();
}

async function salvarCategoriasDespesa(lista) {
  const res = await fetch('/api/usuarios/categorias-despesa', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lista),
  });
  if (!res.ok) throw new Error('Erro ao salvar categorias.');
  return res.json();
}

async function login(email, senha) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  return res.json();
}
