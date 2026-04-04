import { useState, useEffect } from 'react'
import {
  listarParcelamentos, criarParcelamento, atualizarParcelamento, excluirParcelamento,
  listarParcelas, pagarParcela,
} from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

export default function Parcelamentos() {
  const [parcelamentos,        setParcelamentos]        = useState([])
  const [parcelasDetalhadas,   setParcelasDetalhadas]   = useState({})
  const [formParcelamento,     setFormParcelamento]     = useState(null)
  const [formPagoParcela,      setFormPagoParcela]      = useState(null)
  const [salvandoParcelamento, setSalvandoParcelamento] = useState(false)
  const [expandidoParcelamento, setExpandidoParcelamento] = useState(null)

  useEffect(() => {
    listarParcelamentos().catch(() => []).then(lista => setParcelamentos(lista || []))
  }, [])

  async function recarregar() {
    const lista = await listarParcelamentos().catch(() => [])
    setParcelamentos(lista || [])
  }

  async function salvarParcelamento() {
    if (!formParcelamento.descricao || !formParcelamento.valorTotal || !formParcelamento.numParcelas || !formParcelamento.dataPrimeira) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }
    setSalvandoParcelamento(true)
    try {
      if (formParcelamento.id) {
        console.log('[parcelamentos] salvarParcelamento update', formParcelamento.id, formParcelamento)
        await atualizarParcelamento(formParcelamento.id, formParcelamento)
      } else {
        const payload = {
          descricao:    formParcelamento.descricao,
          valorTotal:   parseFloat(formParcelamento.valorTotal),
          numParcelas:  parseInt(formParcelamento.numParcelas, 10),
          valorParcela: parseFloat(formParcelamento.valorParcela) || (parseFloat(formParcelamento.valorTotal) / parseInt(formParcelamento.numParcelas, 10)),
          dataPrimeira: formParcelamento.dataPrimeira,
          observacoes:  formParcelamento.observacoes || '',
        }
        console.log('[parcelamentos] salvarParcelamento create payload', payload)
        await criarParcelamento(payload)
      }
      setFormParcelamento(null)
      recarregar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoParcelamento(false)
    }
  }

  async function handleExcluirParcelamento(id) {
    if (!confirm('Excluir este parcelamento?')) return
    await excluirParcelamento(id)
    recarregar()
  }

  async function expandirParcelamento(parcelamentoId) {
    if (expandidoParcelamento === parcelamentoId) {
      setExpandidoParcelamento(null)
    } else {
      const parcelas = await listarParcelas(parcelamentoId)
      setParcelasDetalhadas(prev => ({ ...prev, [parcelamentoId]: parcelas }))
      setExpandidoParcelamento(parcelamentoId)
    }
  }

  function handlePagarParcela(parcelamentoId, numeroParcela) {
    setFormPagoParcela({ parcelamentoId, numeroParcela, dataPagamento: hoje(), valorPago: 0, observacoes: '' })
  }

  async function salvarPagoParcela() {
    if (!formPagoParcela.dataPagamento || formPagoParcela.valorPago == null) {
      alert('Data e valor pagamento são obrigatórios.')
      return
    }
    try {
      await pagarParcela(
        formPagoParcela.parcelamentoId,
        formPagoParcela.numeroParcela,
        {
          dataPagamento: formPagoParcela.dataPagamento,
          valorPago:     parseFloat(formPagoParcela.valorPago),
          observacoes:   formPagoParcela.observacoes || '',
        }
      )
      setFormPagoParcela(null)
      recarregar()
      if (expandidoParcelamento === formPagoParcela.parcelamentoId) {
        const parcelas = await listarParcelas(formPagoParcela.parcelamentoId)
        setParcelasDetalhadas(prev => ({ ...prev, [formPagoParcela.parcelamentoId]: parcelas }))
      }
    } catch (e) {
      alert('Erro ao registrar pagamento: ' + e.message)
    }
  }

  const totalParcelamentosPago = parcelamentos.reduce((s, p) => s + (p.totalPago || 0), 0)

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Custos Parcelados
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-new" onClick={() => setFormParcelamento({ descricao: '', valorTotal: '', numParcelas: '', dataPrimeira: hoje(), observacoes: '' })}>+ Novo parcelamento</button>
        <div style={{ color: '#444' }}>Total pago: {formatarMoeda(totalParcelamentosPago)}</div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor total</th>
              <th>Parcelas</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parcelamentos.length === 0 ? (
              <tr><td colSpan={5} className="tabela-vazia">Nenhum parcelamento cadastrado.</td></tr>
            ) : parcelamentos.map(p => {
              const pagas = p.parcelasPagas
              const todasPagas = pagas === p.numParcelas && pagas > 0
              return (
                <tr key={p.id}>
                  <td>{p.descricao}</td>
                  <td>{formatarMoeda(p.valorTotal)}</td>
                  <td>{pagas}/{p.numParcelas}</td>
                  <td>
                    <span style={{ color: todasPagas ? '#27ae60' : '#f39c12', fontWeight: 600 }}>
                      {todasPagas ? 'Quitado' : `${pagas} paga${pagas !== 1 ? 's' : ''}`}
                    </span>
                  </td>
                  <td>
                    <div className="acoes">
                      <button className="btn-acao btn-editar" onClick={() => expandirParcelamento(p.id)}>
                        {expandidoParcelamento === p.id ? '▼' : '▶'} Detalhes
                      </button>
                      <button className="btn-acao btn-excluir" onClick={() => handleExcluirParcelamento(p.id)}>Remover</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {expandidoParcelamento && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8a8a8e', marginBottom: 12 }}>Detalhes das parcelas</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor</th>
                    <th>Data prevista</th>
                    <th>Data pagamento</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(parcelasDetalhadas[expandidoParcelamento] || []).map(pc => (
                    <tr key={pc.id}>
                      <td>#{pc.numero}</td>
                      <td>{formatarMoeda(pc.valor)}</td>
                      <td>{formatarData(pc.dataPrevista)}</td>
                      <td>{formatarData(pc.dataPagamento)}</td>
                      <td>
                        <span style={{ color: pc.dataPagamento ? '#27ae60' : '#f39c12', fontSize: 12, fontWeight: 600 }}>
                          {pc.dataPagamento ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        {!pc.dataPagamento && (
                          <button className="btn-acao btn-editar" style={{ fontSize: 11, padding: 4 }} onClick={() => handlePagarParcela(expandidoParcelamento, pc.numero)}>
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {formParcelamento !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormParcelamento(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{formParcelamento.id ? 'Editar Parcelamento' : 'Novo Parcelamento'}</div>
              <button className="modal-form-close" onClick={() => setFormParcelamento(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Descrição *</label>
              <input type="text" className="field-input" placeholder="Ex: Máquina de costura, Reforma..." value={formParcelamento.descricao || ''} onChange={e => setFormParcelamento(f => ({ ...f, descricao: e.target.value }))} />
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Valor total (R$) *</label>
                <input type="number" className="field-input" min="0" step="0.01" value={formParcelamento.valorTotal || ''} onChange={e => setFormParcelamento(f => ({ ...f, valorTotal: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Quantas parcelas *</label>
                <input type="number" className="field-input" min="1" value={formParcelamento.numParcelas || ''} onChange={e => setFormParcelamento(f => ({ ...f, numParcelas: e.target.value }))} />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Data da 1ª parcela *</label>
                <input type="date" className="field-input" value={formParcelamento.dataPrimeira || ''} onChange={e => setFormParcelamento(f => ({ ...f, dataPrimeira: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Observações</label>
              <textarea className="field-input campo-textarea" value={formParcelamento.observacoes || ''} onChange={e => setFormParcelamento(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormParcelamento(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarParcelamento} disabled={salvandoParcelamento}>
                {salvandoParcelamento ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formPagoParcela !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormPagoParcela(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">Registrar pagamento da parcela</div>
              <button className="modal-form-close" onClick={() => setFormPagoParcela(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Data de pagamento *</label>
              <input type="date" className="field-input" value={formPagoParcela.dataPagamento || ''} onChange={e => setFormPagoParcela(f => ({ ...f, dataPagamento: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Valor pago (R$) *</label>
              <input type="number" className="field-input" min="0" step="0.01" value={formPagoParcela.valorPago || ''} onChange={e => setFormPagoParcela(f => ({ ...f, valorPago: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Observações</label>
              <textarea className="field-input campo-textarea" value={formPagoParcela.observacoes || ''} onChange={e => setFormPagoParcela(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormPagoParcela(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarPagoParcela}>
                Registrar pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
