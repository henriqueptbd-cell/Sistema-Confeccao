// Camada de acesso à API REST do backend.
// Todas as funções retornam o JSON parseado ou lançam um Error.

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function getToken() {
  return sessionStorage.getItem('token')
}

async function req(url, opts = {}) {
  const token = getToken()
  const headers = { ...(opts.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `${API_BASE_URL}${url}`
  const res = await fetch(fullUrl, { ...opts, headers })

  if (res.status === 401) {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const text = await res.text().catch(() => null)
    let err
    try {
      err = JSON.parse(text || '{}')
    } catch {
      err = {}
    }
    console.error('API error', { url, status: res.status, body: text })
    throw new Error(err.mensagem || `Erro HTTP ${res.status}`)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null
  }

  try {
    return await res.json()
  } catch (e) {
    console.warn('API response is not JSON, returning text', { url, status: res.status })
    return res.text().catch(() => null)
  }
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

// ── Pagamentos de Salário ────────────────────────────────────────────────────

export const listarPagamentosSalario = (mes, ano) => req(`/api/pagamentos-salario${mes && ano ? `?mes=${mes}&ano=${ano}` : ''}`)
export const registrarPagamentoSalario = (dados)   => req('/api/pagamentos-salario', json('POST', dados))
export const atualizarPagamentoSalario = (id, dados) => req(`/api/pagamentos-salario/${id}`, json('PUT', dados))
export const excluirPagamentoSalario   = (id)       => req(`/api/pagamentos-salario/${id}`, { method: 'DELETE' })

// ── Custos Adicionais de Pessoal ─────────────────────────────────────────────

export const listarCustosPessoal = (mes, ano) => req(`/api/custos-pessoal${mes && ano ? `?mes=${mes}&ano=${ano}` : ''}`)
export const criarCustoPessoal   = (dados)    => req('/api/custos-pessoal', json('POST', dados))
export const atualizarCustoPessoal = (id, dados) => req(`/api/custos-pessoal/${id}`, json('PUT', dados))
export const excluirCustoPessoal   = (id)       => req(`/api/custos-pessoal/${id}`, { method: 'DELETE' })

// ── Custos Fixos ─────────────────────────────────────────────────────────────

export const listarCustosFixosTipos = () => req('/api/custos-fixos/tipos')
export const criarCustosFixosTipo = (dados) => req('/api/custos-fixos/tipos', json('POST', dados))
export const atualizarCustosFixosTipo = (id, dados) => req(`/api/custos-fixos/tipos/${id}`, json('PUT', dados))
export const excluirCustosFixosTipo = (id) => req(`/api/custos-fixos/tipos/${id}`, { method: 'DELETE' })

export const listarCustosFixosRegistros     = (mes, ano) => req(`/api/custos-fixos/registros?mes=${mes}&ano=${ano}`)
export const listarCustosFixosRegistrosTodos = ()         => req('/api/custos-fixos/registros/todos')
export const pagarCustosFixosRegistro = (id, dados) => req(`/api/custos-fixos/registros/${id}/pagar`, json('POST', dados))
export const atualizarCustosFixosRegistro = (id, dados) => req(`/api/custos-fixos/registros/${id}`, json('PUT', dados))

// ── Parcelamentos ────────────────────────────────────────────────────────────

export const listarParcelamentos    = () => req('/api/parcelamentos')
export const listarTodasParcelas    = () => req('/api/parcelamentos/parcelas/todas')
export const criarParcelamento = (dados) => req('/api/parcelamentos', json('POST', dados))
export const atualizarParcelamento = (id, dados) => req(`/api/parcelamentos/${id}`, json('PUT', dados))
export const excluirParcelamento = (id) => req(`/api/parcelamentos/${id}`, { method: 'DELETE' })

export const listarParcelas = (id) => req(`/api/parcelamentos/${id}/parcelas`)
export const pagarParcela = (parcelamentoId, numeroParcela, dados) => req(`/api/parcelamentos/${parcelamentoId}/parcelas/${numeroParcela}/pagar`, json('POST', dados))
export const atualizarParcela = (parcelamentoId, numeroParcela, dados) => req(`/api/parcelamentos/${parcelamentoId}/parcelas/${numeroParcela}`, json('PUT', dados))

// ── Categorias de despesa ────────────────────────────────────────────────────

export const listarCategoriasDespesa = ()      => req('/api/usuarios/categorias-despesa')
export const salvarCategoriasDespesa = (lista) => req('/api/usuarios/categorias-despesa', json('PUT', lista))

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, senha) {
  const res = await fetch('/api/auth/login', json('POST', { email, senha }))
  return res.json()
}
