import { useRef, useState } from 'react'
import { formatarMoeda, totalPedido, totalPecas } from '../utils/config'

// ── Formatação do texto para WhatsApp ────────────────────────────────────────

function gerarTextoWhatsApp(dados) {
  const { cliente, telefone, prazo, pecas } = dados
  const total = totalPedido({ pecas })

  const linhasPecas = pecas.map(p => {
    const linhas = []

    if (p.tipo === 'Serviço avulso') {
      linhas.push(`📦 *${p.modelo || 'Serviço avulso'}*`)
      linhas.push(`Quantidade: ${p.quantidade || 1}`)
      linhas.push(`Valor: ${formatarMoeda(p.valorUnitario || 0)}`)
      const subtotal = (p.valorUnitario || 0) * (p.quantidade || 1)
      linhas.push(`Subtotal: ${formatarMoeda(subtotal)}`)
      return linhas.join('\n')
    }

    const titulo = [p.tipo, p.modelo, p.material].filter(Boolean).join(' · ')
    linhas.push(`📦 *${titulo}*`)

    if (p.tipo === 'Bandeira') {
      if (p.medidas) linhas.push(`Medidas: ${p.medidas}`)
      if (p.faces)   linhas.push(`Faces: ${p.faces}`)
      linhas.push(`Quantidade: ${p.quantidade || 1}`)
      linhas.push(`Valor unitário: ${formatarMoeda(p.valorUnitario || 0)}`)
      const subtotal = (p.valorUnitario || 0) * (p.quantidade || 1)
      linhas.push(`Subtotal: ${formatarMoeda(subtotal)}`)
      return linhas.join('\n')
    }

    const extras = []
    if (p.gola    && p.gola    !== 'Gola redonda') extras.push(p.gola)
    if (p.capuz   && p.capuz   !== 'Sem capuz')    extras.push(p.capuz)
    if (p.punho   === 'Com')                        extras.push('Punho')
    if (p.dedao)                                    extras.push('Dedão')
    if (p.bolsoZiper)                               extras.push('Bolso c/ zíper')
    if (extras.length) linhas.push(`Detalhes: ${extras.join(', ')}`)

    if (p.estampaTipo) {
      const estampa = p.estampaTipo === 'Personalizado' && p.estampaDescricao
        ? `${p.estampaTipo} (${p.estampaDescricao})`
        : p.estampaTipo
      const cor = p.estampaCor ? ` — ${p.estampaCor}` : ''
      linhas.push(`Estampa: ${estampa}${cor}`)
    }

    const tamanhos = Object.entries(p.tamanhos || {}).filter(([, v]) => v > 0)
    if (tamanhos.length) {
      linhas.push(`Tamanhos: ${tamanhos.map(([t, q]) => `${t}×${q}`).join(', ')}`)
    }

    const qtd = Object.values(p.tamanhos || {}).reduce((s, v) => s + v, 0)
    if (qtd > 0) {
      linhas.push(`Valor unitário: ${formatarMoeda(p.valorUnitario || 0)}`)
      linhas.push(`Subtotal: ${formatarMoeda((p.valorUnitario || 0) * qtd)}`)
    }

    if (p.observacoes) linhas.push(`Obs: ${p.observacoes}`)

    return linhas.join('\n')
  })

  return [
    `*ORÇAMENTO — FCamargo Confecção e Estamparia*`,
    ``,
    `Cliente: ${cliente}`,
    telefone ? `Telefone: ${telefone}` : null,
    `Prazo de entrega: ${prazo}`,
    ``,
    linhasPecas.join('\n\n'),
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*TOTAL: ${formatarMoeda(total)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ].filter(l => l !== null).join('\n')
}

// ── Linha de peça no preview ─────────────────────────────────────────────────

function PecaPreview({ peca }) {
  const isAvulso   = peca.tipo === 'Serviço avulso'
  const isBandeira = peca.tipo === 'Bandeira'

  const qtd = isAvulso || isBandeira
    ? (peca.quantidade || 1)
    : Object.values(peca.tamanhos || {}).reduce((s, v) => s + v, 0)

  const subtotal = (peca.valorUnitario || 0) * qtd

  const titulo = isAvulso
    ? (peca.modelo || 'Serviço avulso')
    : [peca.tipo, peca.modelo, peca.material].filter(Boolean).join(' · ')

  const tamanhos = Object.entries(peca.tamanhos || {}).filter(([, v]) => v > 0)

  const extras = []
  if (peca.gola      && peca.gola      !== 'Gola redonda') extras.push(peca.gola)
  if (peca.capuz     && peca.capuz     !== 'Sem capuz')    extras.push(peca.capuz)
  if (peca.punho     === 'Com')                             extras.push('Punho')
  if (peca.dedao)                                           extras.push('Dedão')
  if (peca.bolsoZiper)                                      extras.push('Bolso c/ zíper')

  return (
    <div className="orc-peca">
      <div className="orc-peca-titulo">{titulo}</div>

      {!isAvulso && peca.estampaTipo && (
        <div className="orc-peca-detalhe">
          Estampa: {peca.estampaTipo}
          {peca.estampaTipo === 'Personalizado' && peca.estampaDescricao && ` — ${peca.estampaDescricao}`}
          {peca.estampaCor && ` · ${peca.estampaCor}`}
        </div>
      )}

      {extras.length > 0 && (
        <div className="orc-peca-detalhe">{extras.join(' · ')}</div>
      )}

      {isBandeira && peca.medidas && (
        <div className="orc-peca-detalhe">Medidas: {peca.medidas} · {peca.faces || '1 face'}</div>
      )}

      {tamanhos.length > 0 && (
        <div className="orc-peca-tamanhos">
          {tamanhos.map(([t, q]) => (
            <span key={t} className="orc-tam-badge">{t}×{q}</span>
          ))}
          <span className="orc-tam-total">{qtd} {qtd === 1 ? 'peça' : 'peças'}</span>
        </div>
      )}

      {(isAvulso || isBandeira) && (
        <div className="orc-peca-detalhe">Quantidade: {qtd}</div>
      )}

      {peca.observacoes && (
        <div className="orc-peca-obs">{peca.observacoes}</div>
      )}

      <div className="orc-peca-valores">
        <span>{formatarMoeda(peca.valorUnitario || 0)} / un.</span>
        <span className="orc-peca-subtotal">{formatarMoeda(subtotal)}</span>
      </div>
    </div>
  )
}

// ── Modal principal ───────────────────────────────────────────────────────────

export default function ModalOrcamento({ dados, onFechar }) {
  const { cliente, telefone, prazo, pecas } = dados
  const total  = totalPedido({ pecas })
  const nPecas = totalPecas({ pecas })
  const printRef = useRef(null)
  const [copiado, setCopiado] = useState(false)

  function copiarWhatsApp() {
    const texto = gerarTextoWhatsApp(dados)
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  function imprimir() {
    const conteudo = printRef.current.innerHTML
    const janela = window.open('', '_blank', 'width=800,height=700')
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Orçamento — FCamargo</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
          .orc-header { margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 12px; }
          .orc-empresa { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
          .orc-subtitulo { font-size: 11px; color: #555; margin-top: 2px; }
          .orc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin: 16px 0; font-size: 12px; }
          .orc-info-label { color: #666; }
          .orc-info-valor { font-weight: 600; }
          .orc-pecas { border-top: 1px solid #ddd; margin-top: 8px; }
          .orc-peca { padding: 12px 0; border-bottom: 1px solid #eee; }
          .orc-peca-titulo { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
          .orc-peca-detalhe { font-size: 11px; color: #555; margin-top: 2px; }
          .orc-peca-tamanhos { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
          .orc-tam-badge { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 600; }
          .orc-tam-total { font-size: 11px; color: #888; margin-left: 4px; align-self: center; }
          .orc-peca-obs { font-size: 11px; color: #888; font-style: italic; margin-top: 4px; }
          .orc-peca-valores { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: #555; }
          .orc-peca-subtotal { font-weight: 700; color: #111; }
          .orc-total { margin-top: 16px; padding-top: 12px; border-top: 2px solid #111; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
          .orc-rodape { margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
        </style>
      </head>
      <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    janela.focus()
    setTimeout(() => { janela.print(); janela.close() }, 400)
  }

  return (
    <div className="modal-overlay visible">
      <div className="modal-form-container" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>

        <div className="modal-form-header">
          <div className="modal-form-title">Orçamento</div>
          <button className="modal-form-close" onClick={onFechar}>✕</button>
        </div>

        {/* Preview do orçamento */}
        <div ref={printRef} className="orc-preview">
          <div className="orc-header">
            <div className="orc-empresa">FCamargo Confecção e Estamparia</div>
            <div className="orc-subtitulo">Orçamento gerado em {new Date().toLocaleDateString('pt-BR')}</div>
          </div>

          <div className="orc-info-grid">
            <div>
              <div className="orc-info-label">Cliente</div>
              <div className="orc-info-valor">{cliente}</div>
            </div>
            {telefone && (
              <div>
                <div className="orc-info-label">Telefone</div>
                <div className="orc-info-valor">{telefone}</div>
              </div>
            )}
            <div>
              <div className="orc-info-label">Prazo de entrega</div>
              <div className="orc-info-valor">{prazo}</div>
            </div>
            <div>
              <div className="orc-info-label">Total de peças</div>
              <div className="orc-info-valor">{nPecas} {nPecas === 1 ? 'peça' : 'peças'}</div>
            </div>
          </div>

          <div className="orc-pecas">
            {pecas.map((p, i) => <PecaPreview key={i} peca={p} />)}
          </div>

          <div className="orc-total">
            <span>TOTAL</span>
            <span>{formatarMoeda(total)}</span>
          </div>

          <div className="orc-rodape">
            FCamargo Confecção e Estamparia — Este orçamento não constitui pedido confirmado.
          </div>
        </div>

        <div className="modal-form-actions" style={{ marginTop: 20 }}>
          <button className="modal-btn modal-btn-cancel" onClick={onFechar}>Fechar</button>
          <button className="modal-btn modal-btn-secondary" onClick={copiarWhatsApp}>
            {copiado ? '✓ Copiado!' : 'Copiar para WhatsApp'}
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={imprimir}>
            Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  )
}
