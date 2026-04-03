import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarPedidos, excluirPedido, criarPedido,
  buscarClientes, criarCliente, buscarConfigPrecos,
} from '../api'
import {
  isAtrasado, isProximoPrazo, ETAPA_PILL, nomeDisplayCliente,
} from '../utils/config'
import ModalCliente from '../components/ModalCliente'
import ModalNovoPedido from '../components/ModalNovoPedido'

function calcularValorPedido(p) {
  return (p.pecas || []).reduce((s, peca) => {
    const qtd = peca.tipo === 'Bandeira'
      ? (peca.quantidade || 1)
      : Object.values(peca.tamanhos || {}).reduce((a, v) => a + v, 0)
    return s + (peca.valorUnitario || 0) * qtd
  }, 0)
}

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const [pedidos,        setPedidos]        = useState([])
  const [aba,            setAba]            = useState('ativos')
  const [filtro,         setFiltro]         = useState('todos')
  const [buscaFinalizado, setBuscaFinalizado] = useState('')
  const [modalPedido,    setModalPedido]    = useState(false)
  const [configPrecos,   setConfigPrecos]   = useState(null)
  const navigate = useNavigate()

  const carregar = useCallback(async () => {
    const todos = await listarPedidos()
    setPedidos(todos)
  }, [])

  useEffect(() => {
    carregar()
    buscarConfigPrecos().then(setConfigPrecos).catch(() => {})
  }, [carregar])

  async function handleExcluir(e, id, cliente) {
    e.stopPropagation()
    if (!confirm(`Excluir o pedido #${id} (${cliente})?\n\nEsta ação não pode ser desfeita.`)) return
    await excluirPedido(id)
    carregar()
  }

  async function handleSalvarPedido(dados) {
    await criarPedido(dados)
    setModalPedido(false)
    carregar()
  }

  const ativos     = pedidos.filter(p => p.status !== 'entregue')
  const finalizados = pedidos.filter(p => p.status === 'entregue')

  const lista      = filtro === 'todos' ? ativos : ativos.filter(p => p.status === filtro)
  const emProducao = ativos.filter(p => p.status === 'producao').length
  const proxPrazo  = ativos.filter(p => isAtrasado(p) || isProximoPrazo(p)).length
  const concluidos = ativos.filter(p => p.status === 'concluido').length

  const finalizadosFiltrados = buscaFinalizado.trim()
    ? finalizados.filter(p =>
        p.cliente.toLowerCase().includes(buscaFinalizado.toLowerCase()) ||
        String(p.id).includes(buscaFinalizado)
      )
    : finalizados

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  function etapaAtualNome(p) {
    if (p.status === 'concluido') return 'Pronto para retirada'
    const proxima = p.etapas?.find(e => !e.concluida)
    return proxima ? proxima.nome : 'Pronto para retirada'
  }

  const FILTROS = [
    { label: 'Todos',       valor: 'todos' },
    { label: 'Em produção', valor: 'producao' },
    { label: 'Concluídos',  valor: 'concluido' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Pedidos</div>
          <div className="page-sub">{dataAtual}</div>
        </div>
        {aba === 'ativos' && (
          <button className="btn-new" onClick={() => setModalPedido(true)}>+ Novo pedido</button>
        )}
      </div>

      {/* Abas */}
      <div className="filters" style={{ marginBottom: 16 }}>
        <button
          className={`filter-btn${aba === 'ativos' ? ' active' : ''}`}
          onClick={() => setAba('ativos')}
        >
          Pedidos ativos
        </button>
        <button
          className={`filter-btn${aba === 'finalizados' ? ' active' : ''}`}
          onClick={() => setAba('finalizados')}
        >
          Finalizados {finalizados.length > 0 && `(${finalizados.length})`}
        </button>
      </div>

      {aba === 'ativos' ? (
        <>
          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">Em produção</div>
              <div className="stat-value blue">{emProducao}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Próximos do prazo</div>
              <div className="stat-value red">{proxPrazo}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Concluídos</div>
              <div className="stat-value green">{concluidos}</div>
            </div>
          </div>

          <div className="filters">
            {FILTROS.map(f => (
              <button
                key={f.valor}
                className={`filter-btn${filtro === f.valor ? ' active' : ''}`}
                onClick={() => setFiltro(f.valor)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Etapa atual</th>
                  <th>Previsão</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tabela-vazia">Nenhum pedido cadastrado.</td>
                  </tr>
                ) : lista.map(p => {
                  const etapaNome = etapaAtualNome(p)
                  const pill      = ETAPA_PILL[etapaNome] || 'pill-blue'
                  const atrasado  = isAtrasado(p) || isProximoPrazo(p)
                  const dotClass  = p.status === 'concluido' ? 'dot-done' : atrasado ? 'dot-late' : 'dot-active'

                  return (
                    <tr key={p.id} onClick={() => navigate(`/pedido/${p.id}`)}>
                      <td><span className="pedido-id">#{p.id}</span></td>
                      <td><span className="cliente-nome">{p.cliente}</span></td>
                      <td><span className={`etapa-pill ${pill}`}>{etapaNome}</span></td>
                      <td>
                        <span className={`prazo${atrasado && p.status === 'producao' ? ' late' : ''}`}>
                          {p.prazo}{atrasado && p.status === 'producao' ? ' ⚠️' : ''}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${dotClass}`} />
                        {p.status === 'concluido' ? 'Concluído' : 'Em produção'}
                      </td>
                      <td>
                        <div className="acoes">
                          <button className="btn-ver" onClick={e => { e.stopPropagation(); navigate(`/pedido/${p.id}`) }}>
                            Ver
                          </button>
                          <button className="btn-acao btn-excluir" onClick={e => handleExcluir(e, p.id, p.cliente)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Buscar por cliente ou nº do pedido..."
              value={buscaFinalizado}
              onChange={e => setBuscaFinalizado(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, width: 280, background: '#f9fafb' }}
            />
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Prazo</th>
                  <th>Entregue em</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {finalizadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tabela-vazia">
                      {buscaFinalizado ? 'Nenhum resultado encontrado.' : 'Nenhum pedido finalizado ainda.'}
                    </td>
                  </tr>
                ) : finalizadosFiltrados.map(p => (
                  <tr key={p.id} onClick={() => navigate(`/pedido/${p.id}`)}>
                    <td><span className="pedido-id">#{p.id}</span></td>
                    <td><span className="cliente-nome">{p.cliente}</span></td>
                    <td><span className="prazo">{p.prazo}</span></td>
                    <td>{p.entregueEm || '—'}</td>
                    <td><strong>{fmt(calcularValorPedido(p))}</strong></td>
                    <td>
                      <button className="btn-ver" onClick={e => { e.stopPropagation(); navigate(`/pedido/${p.id}`) }}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalPedido && (
        <ModalNovoPedido
          configPrecos={configPrecos}
          onSalvar={handleSalvarPedido}
          onFechar={() => setModalPedido(false)}
        />
      )}
    </>
  )
}
