import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarPedido } from '../api'

function Timeline({ pedido }) {
  return (
    <div className="timeline">
      {pedido.etapas.map(etapa => (
        <div key={etapa.ordem} className={`step ${etapa.concluida ? 'step-done' : 'step-pending'}`}>
          {etapa.ordem < pedido.etapas.length && <div className="step-line" />}
          <div className="step-icon">{etapa.concluida ? '✓' : '○'}</div>
          <div className="step-body">
            <div className="step-name">{etapa.nome}</div>
            {etapa.concluida && etapa.concluidaEm && (
              <div className="step-date">{etapa.concluidaEm}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ConsultaPublica() {
  const inputRef = useRef()
  const [pedido,       setPedido]       = useState(null)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [buscando,     setBuscando]     = useState(false)

  async function consultar() {
    const num = parseInt(inputRef.current.value.trim())
    if (!num) { inputRef.current.focus(); return }

    setPedido(null)
    setNaoEncontrado(false)
    setBuscando(true)

    try {
      const resultado = await buscarPedido(num)
      if (!resultado) {
        setNaoEncontrado(true)
      } else {
        setPedido(resultado)
      }
    } finally {
      setBuscando(false)
    }
  }

  const proxima    = pedido?.etapas?.find(e => !e.concluida)
  const etapaTexto = pedido?.status === 'concluido' ? 'Concluído' : (proxima?.nome ?? 'Concluído')
  const badgeClass = pedido?.status === 'concluido' ? 'badge badge-pronto' : 'badge badge-producao'
  const badgeLabel = pedido?.status === 'concluido' ? 'Pronto para retirada' : 'Em produção'

  return (
    <div className="consulta-page">
      <div className="color-bar" />
      <div className="consulta-container">
        <div className="consulta-header">
          <div className="logo-name" style={{ fontSize: 24 }}>FCamargo</div>
          <div className="logo-sub">Confecção e Estamparia</div>
        </div>

        <div className="consulta-card">
          <h2 className="consulta-title">Consultar Pedido</h2>
          <p className="consulta-subtitle">Digite o número do seu pedido para ver o andamento da produção.</p>

          <div className="consulta-form">
            <input
              ref={inputRef}
              type="number"
              className="consulta-input"
              placeholder="Número do pedido"
              onKeyDown={e => e.key === 'Enter' && consultar()}
            />
            <button className="consulta-btn" onClick={consultar} disabled={buscando}>
              {buscando ? 'Buscando...' : 'Consultar'}
            </button>
          </div>
        </div>

        {naoEncontrado && (
          <div className="nao-encontrado">
            Pedido não encontrado. Verifique o número e tente novamente.
          </div>
        )}

        {pedido && (
          <div className="resultado-card">
            <div className="resultado-header">
              <div>
                <span className="resultado-numero">#{pedido.id}</span>
                <span className={badgeClass}>{badgeLabel}</span>
              </div>
            </div>

            <div className="resultado-infos">
              <div className="resultado-info-item">
                <span className="info-label">Cliente</span>
                <span className="info-valor">{pedido.cliente}</span>
              </div>
              <div className="resultado-info-item">
                <span className="info-label">Entrada</span>
                <span className="info-valor">{pedido.dataEntrada}</span>
              </div>
              <div className="resultado-info-item">
                <span className="info-label">Previsão</span>
                <span className="info-valor">{pedido.prazo}</span>
              </div>
              <div className="resultado-info-item">
                <span className="info-label">Etapa atual</span>
                <span className="info-valor">{etapaTexto}</span>
              </div>
            </div>

            {pedido.etapas && <Timeline pedido={pedido} />}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/login" className="back-link">
            Área administrativa <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
