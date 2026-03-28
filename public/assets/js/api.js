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

async function login(email, senha) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  return res.json();
}
