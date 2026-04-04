import { useState, useEffect } from 'react'
import { listarPagamentosSalario, registrarPagamentoSalario, atualizarPagamentoSalario, excluirPagamentoSalario } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

export default function Folha({ mes, ano, funcionarios, onDados }) {
  const [pagamentos,       setPagamentos]       = useState([])
  const [formPagamento,    setFormPagamento]    = useState(null)
  const [salvandoPagamento, setSalvandoPagamento] = useState(false)

  useEffect(() => {
    listarPagamentosSalario(mes, ano).then(lista => {
      const dados = lista || []
      setPagamentos(dados)
      onDados({ totalSalarios: dados.reduce((s, p) => s + p.valorPago, 0) })
    })
  }, [mes, ano])

  async function salvarPagamento() {
    setSalvandoPagamento(true)
    try {
      const dados = { ...formPagamento, mes, ano, valorPago: parseFloat(formPagamento.valorPago) }
      if (formPagamento.id) await atualizarPagamentoSalario(formPagamento.id, dados)
      else                  await registrarPagamentoSalario(dados)
      setFormPagamento(null)
      const lista = await listarPagamentosSalario(mes, ano)
      const atualizado = lista || []
      setPagamentos(atualizado)
      onDados({ totalSalarios: atualizado.reduce((s, p) => s + p.valorPago, 0) })
    } finally {
      setSalvandoPagamento(false)
    }
  }

  async function handleExcluirPagamento(id) {
    if (!confirm('Excluir este pagamento?')) return
    await excluirPagamentoSalario(id)
    const lista = await listarPagamentosSalario(mes, ano)
    const atualizado = lista || []
    setPagamentos(atualizado)
    onDados({ totalSalarios: atualizado.reduce((s, p) => s + p.valorPago, 0) })
  }

  const totalSalarios = pagamentos.reduce((s, p) => s + p.valorPago, 0)

  const statusPagamentos = {}
  pagamentos.forEach(p => {
    statusPagamentos[p.funcionarioId] = { pago: true, data: p.dataPagamento, valor: p.valorPago, observacoes: p.observacoes, id: p.id }
  })
  funcionarios.forEach(f => {
    if (!statusPagamentos[f.id]) statusPagamentos[f.id] = { pago: false }
  })

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Folha do Mês
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-new" onClick={() => setFormPagamento({})}>+ Registrar pagamento</button>
        <div style={{ color: '#444' }}>Total pago: {formatarMoeda(totalSalarios)}</div>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Funcionária</th>
              <th>Salário base</th>
              <th>Pago em</th>
              <th>Valor pago</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.length === 0 ? (
              <tr><td colSpan={6} className="tabela-vazia">Nenhuma funcionária cadastrada.</td></tr>
            ) : funcionarios.map(f => {
              const status = statusPagamentos[f.id]
              return (
                <tr key={f.id}>
                  <td>{f.nome}</td>
                  <td>{formatarMoeda(f.salarioBase)}</td>
                  <td>{formatarData(status.data)}</td>
                  <td>{status.pago ? formatarMoeda(status.valor) : '—'}</td>
                  <td>
                    <span style={{ color: status.pago ? '#27ae60' : '#f39c12', fontWeight: 600 }}>
                      {status.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="acoes">
                      {status.pago ? (
                        <>
                          <button className="btn-acao btn-editar" onClick={() => setFormPagamento({ id: status.id, funcionarioId: f.id, mes, ano, dataPagamento: status.data, valorPago: status.valor, observacoes: status.observacoes || '' })}>Editar</button>
                          <button className="btn-acao btn-excluir" onClick={() => handleExcluirPagamento(status.id)}>Excluir</button>
                        </>
                      ) : (
                        <button className="btn-acao btn-editar" onClick={() => setFormPagamento({ funcionarioId: f.id, mes, ano, dataPagamento: hoje(), valorPago: f.salarioBase, observacoes: '' })}>Registrar</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {formPagamento !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormPagamento(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{formPagamento.id ? 'Editar Pagamento' : 'Registrar Pagamento'}</div>
              <button className="modal-form-close" onClick={() => setFormPagamento(null)}>✕</button>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Funcionária *</label>
                <select className="field-input campo-select" value={formPagamento.funcionarioId || ''} onChange={e => setFormPagamento(f => ({ ...f, funcionarioId: Number(e.target.value) }))}>
                  <option value="">Selecione...</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Data de pagamento *</label>
                <input type="date" className="field-input" value={formPagamento.dataPagamento || ''} onChange={e => setFormPagamento(f => ({ ...f, dataPagamento: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Valor pago (R$) *</label>
              <input type="number" className="field-input" min="0" step="0.01" value={formPagamento.valorPago || ''} onChange={e => setFormPagamento(f => ({ ...f, valorPago: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Observações</label>
              <textarea className="field-input campo-textarea" value={formPagamento.observacoes || ''} onChange={e => setFormPagamento(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormPagamento(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarPagamento} disabled={salvandoPagamento}>
                {salvandoPagamento ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
