// Camada de acesso à API REST do backend.
// Todas as funções retornam o JSON parseado ou lançam um Error.

function getToken() {
  return sessionStorage.getItem('token')
}

async function req(url, opts = {}) {
  const token = getToken()
  const headers = { ...(opts.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...opts, headers })

  if (res.status === 401) {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.mensagem || `Erro HTTP ${res.status}`)
  }
  return res.json()
}

function json(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

// ── Pedidos ──────────────────────────────────────────────────────────────────

export const listarPedidos      = ()         => req('/api/pedidos')
export const buscarPedido       = (id)       => fetch(`/api/pedidos/${id}`).then(r => r.status === 404 ? null : r.json())
export const criarPedido        = (dados)    => req('/api/pedidos', json('POST', dados))
export const atualizarPedido    = (id, dados) => req(`/api/pedidos/${id}`, json('PUT', dados))
export const excluirPedido      = (id)       => req(`/api/pedidos/${id}`, { method: 'DELETE' })
export const entregarPedido     = (id)       => req(`/api/pedidos/${id}/entregar`, { method: 'PATCH' })
export const concluirEtapa      = (id, ordem) => req(`/api/pedidos/${id}/etapas/${ordem}`, { method: 'PATCH' })
export const desfazerEtapa      = (id, ordem) => req(`/api/pedidos/${id}/etapas/${ordem}/desfazer`, { method: 'PATCH' })

// ── Clientes ─────────────────────────────────────────────────────────────────

export const buscarClientes     = (q)        => req(`/api/clientes?q=${encodeURIComponent(q)}`)
export const listarClientes     = ()         => req('/api/clientes')
export const criarCliente       = (dados)    => req('/api/clientes', json('POST', dados))
export const atualizarCliente   = (id, dados) => req(`/api/clientes/${id}`, json('PUT', dados))
export const excluirCliente     = (id)       => req(`/api/clientes/${id}`, { method: 'DELETE' })

// ── Configuração de preços ───────────────────────────────────────────────────

export const buscarConfigPrecos = ()         => req('/api/config/precos')
export const salvarConfigPrecos = (dados)    => req('/api/config/precos', json('PUT', dados))

// ── Funcionários ─────────────────────────────────────────────────────────────

export const listarFuncionarios   = ()         => req('/api/funcionarios')
export const criarFuncionario     = (dados)    => req('/api/funcionarios', json('POST', dados))
export const atualizarFuncionario = (id, dados) => req(`/api/funcionarios/${id}`, json('PUT', dados))
export const excluirFuncionario   = (id)       => req(`/api/funcionarios/${id}`, { method: 'DELETE' })

// ── Compras ──────────────────────────────────────────────────────────────────

export const listarCompras    = (mes, ano)   => req(`/api/compras${mes && ano ? `?mes=${mes}&ano=${ano}` : ''}`)
export const criarCompra      = (dados)      => req('/api/compras', json('POST', dados))
export const atualizarCompra  = (id, dados)  => req(`/api/compras/${id}`, json('PUT', dados))
export const excluirCompra    = (id)         => req(`/api/compras/${id}`, { method: 'DELETE' })

// ── Usuários ─────────────────────────────────────────────────────────────────

export const listarUsuarios     = ()         => req('/api/usuarios')
export const criarUsuario       = (dados)    => req('/api/usuarios', json('POST', dados))
export const atualizarUsuario   = (id, dados) => req(`/api/usuarios/${id}`, json('PUT', dados))
export const excluirUsuario     = (id)       => req(`/api/usuarios/${id}`, { method: 'DELETE' })

// ── Categorias de despesa ────────────────────────────────────────────────────

export const listarCategoriasDespesa = ()      => req('/api/usuarios/categorias-despesa')
export const salvarCategoriasDespesa = (lista) => req('/api/usuarios/categorias-despesa', json('PUT', lista))

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, senha) {
  const res = await fetch('/api/auth/login', json('POST', { email, senha }))
  return res.json()
}
