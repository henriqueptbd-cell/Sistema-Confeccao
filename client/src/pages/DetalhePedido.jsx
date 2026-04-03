import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { buscarPedido, concluirEtapa, desfazerEtapa, excluirPedido, entregarPedido } from '../api'
import { totalPecas, totalPedido, formatarMoeda } from '../utils/config'

function Timeline({ pedido, onConcluir, onDesfazer }) {
  const ordemAtual    = pedido.etapas.find(e => !e.concluida)?.ordem
  const ultimaConcluidaOrdem = pedido.etapas
    .filter(e => e.concluida && e.ordem > 1)
    .at(-1)?.ordem

  return (
    <div className="timeline">
      {pedido.etapas.map(etapa => {
        const isCurrent  = etapa.ordem === ordemAtual
        const isDesfazer = etapa.ordem === ultimaConcluidaOrdem
        const classe = etapa.concluida ? 'step-done' : isCurrent ? 'step-current' : 'step-pending'
        return (
          <div key={etapa.ordem} className={`step ${classe}`}>
            {etapa.ordem < pedido.etapas.length && <div className="step-line" />}
            <div className="step-icon">{etapa.concluida ? '✓' : isCurrent ? '●' : '○'}</div>
            <div className="step-body">
              <div className="step-name">{etapa.nome}</div>
              {isCurrent && <div className="step-current-label">Em andamento</div>}
              {etapa.concluida && etapa.concluidaEm && (
                <div className="step-date">{etapa.concluidaEm}</div>
              )}
            </div>
            {!etapa.concluida && pedido.status !== 'concluido' && (
              <button className="step-btn-concluir" onClick={() => onConcluir(etapa.ordem)}>
                ✓ Concluir
              </button>
            )}
            {isDesfazer && (
              <button className="step-btn-desfazer" onClick={() => onDesfazer(etapa.ordem)}>
                ↩ Desfazer
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DetalhePedido() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [pedido,   setPedido]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // { tipo: 'concluir'|'excluir'|'entregar', ordem? }

  useEffect(() => {
    buscarPedido(parseInt(id)).then(p => {
      if (!p) navigate('/dashboard')
      else setPedido(p)
      setLoading(false)
    })
  }, [id])

  async function handleConcluir(ordem) {
    const atualizado = await concluirEtapa(pedido.id, ordem)
    setPedido(atualizado)
  }

  async function handleDesfazer(ordem) {
    const atualizado = await desfazerEtapa(pedido.id, ordem)
    setPedido(atualizado)
  }

  async function handleExcluir() {
    if (!confirm(`Excluir o pedido #${pedido.id}?\n\nEsta ação não pode ser desfeita.`)) return
    await excluirPedido(pedido.id)
    navigate('/dashboard')
  }

  async function handleEntregar() {
    const atualizado = await entregarPedido(pedido.id)
    setPedido(atualizado)
  }

  if (loading) return <div className="page-sub" style={{ padding: 40 }}>Carregando...</div>
  if (!pedido) return null

  const proxima     = pedido.etapas?.find(e => !e.concluida)
  const etapaTexto  = pedido.status === 'concluido' ? 'Concluído' : (proxima?.nome ?? 'Concluído')
  const badgeClass  = pedido.status === 'entregue' ? 'badge badge-entregue'
                    : pedido.status === 'concluido' ? 'badge badge-concluido'
                    : 'badge badge-producao'
  const badgeLabel  = pedido.status === 'entregue' ? 'Entregue'
                    : pedido.status === 'concluido' ? 'Pronto para retirada'
                    : 'Em produção'

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" className="btn-ver">← Voltar</Link>
          <div>
            <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              #{pedido.id}
              <span className={badgeClass}>{badgeLabel}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {pedido.status === 'concluido' && (
            <button className="btn-new" style={{ background: '#27ae60' }} onClick={handleEntregar}>
              Marcar como entregue
            </button>
          )}
          <button className="btn-acao btn-excluir" style={{ padding: '11px 18px', borderRadius: 10 }} onClick={handleExcluir}>
            Excluir pedido
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="pedido-infos-grid">
        <div className="info-card">
          <div className="info-label">Cliente</div>
          <div className="info-valor" id="info-cliente">{pedido.cliente}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Telefone</div>
          <div className="info-valor">{pedido.telefone}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Data de entrada</div>
          <div className="info-valor">{pedido.dataEntrada}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Previsão de entrega</div>
          <div className="info-valor">{pedido.prazo}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Etapa atual</div>
          <div className="info-valor">{etapaTexto}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-title">Linha do Tempo</div>
        <Timeline pedido={pedido} onConcluir={handleConcluir} onDesfazer={handleDesfazer} />
      </div>

      {/* Peças */}
      <div className="section-card">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Peças</span>
          <div>
            <span style={{ fontWeight: 400, fontSize: 13, marginRight: 16 }}>
              {totalPecas(pedido)} peças
            </span>
            <span style={{ fontWeight: 700 }}>
              Total: {formatarMoeda(totalPedido(pedido))}
            </span>
          </div>
        </div>
        <div className="pecas-lista">
          {pedido.pecas.map((p, i) => (
            <div key={i} className="peca-item">
              <div className="peca-tipo">{p.tipo || 'Camiseta'}</div>
              <div className="peca-detalhes">
                {p.modelo && <span>{p.modelo}</span>}
                {p.material && <span>{p.material}</span>}
                {p.estampa && <span>Estampa: {p.estampa}</span>}
                {p.gola && <span>Gola: {p.gola}</span>}
              </div>
              {p.tamanhos && (
                <div className="peca-tamanhos">
                  {Object.entries(p.tamanhos)
                    .filter(([, v]) => v > 0)
                    .map(([tam, qtd]) => (
                      <span key={tam} className="tamanho-badge">{tam}×{qtd}</span>
                    ))}
                </div>
              )}
              {p.valorUnitario > 0 && (
                <div className="peca-valor">{formatarMoeda(p.valorUnitario)} / un.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
