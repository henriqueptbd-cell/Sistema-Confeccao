import { useState, useEffect } from 'react'
import {
  listarCustosFixosTipos, criarCustosFixosTipo, atualizarCustosFixosTipo, excluirCustosFixosTipo,
  listarCustosFixosRegistros, pagarCustosFixosRegistro,
} from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

export default function CustosFixos({ mes, ano }) {
  const [custosFixosTipos,     setCustosFixosTipos]     = useState([])
  const [custosFixosRegistros, setCustosFixosRegistros] = useState([])
  const [formTipo,             setFormTipo]             = useState(null)
  const [formRegistro,         setFormRegistro]         = useState(null)
  const [salvandoTipo,         setSalvandoTipo]         = useState(false)
  const [salvandoRegistro,     setSalvandoRegistro]     = useState(false)

  useEffect(() => {
    Promise.all([
      listarCustosFixosTipos(),
      listarCustosFixosRegistros(mes, ano),
    ]).then(([tipos, registros]) => {
      setCustosFixosTipos(tipos || [])
      setCustosFixosRegistros(registros || [])
    })
  }, [mes, ano])

  async function recarregarTipos() {
    const tipos = await listarCustosFixosTipos()
    setCustosFixosTipos(tipos || [])
  }

  async function recarregarRegistros() {
    const registros = await listarCustosFixosRegistros(mes, ano)
    setCustosFixosRegistros(registros || [])
  }

  async function salvarTipo() {
    if (!formTipo.nome || !formTipo.categoria) {
      alert('Nome e categoria são obrigatórios.')
      return
    }
    setSalvandoTipo(true)
    try {
      const dados = { ...formTipo, diaVenc: formTipo.diaVenc ? parseInt(formTipo.diaVenc) : null }
      if (dados.id) await atualizarCustosFixosTipo(dados.id, dados)
      else          await criarCustosFixosTipo(dados)
      setFormTipo(null)
      recarregarTipos()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoTipo(false)
    }
  }

  async function handleExcluirTipo(id) {
    if (!confirm('Desativar este tipo de custo fixo?')) return
    await excluirCustosFixosTipo(id)
    recarregarTipos()
  }

  async function salvarRegistro() {
    if (!formRegistro.dataPagamento || formRegistro.valorPago == null) {
      alert('Data de pagamento e valor pago são obrigatórios.')
      return
    }
    setSalvandoRegistro(true)
    try {
      await pagarCustosFixosRegistro(formRegistro.id, {
        dataPagamento: formRegistro.dataPagamento,
        valorPago:     parseFloat(formRegistro.valorPago),
        observacoes:   formRegistro.observacoes || '',
      })
      setFormRegistro(null)
      recarregarRegistros()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoRegistro(false)
    }
  }

  function handlePagarRegistro(registro) {
    setFormRegistro({
      id:            registro.id,
      dataPagamento: registro.dataPagamento || hoje(),
      valorPago:     registro.valorPago || 0,
      observacoes:   registro.observacoes || '',
    })
  }

  const totalFixosPago = custosFixosRegistros.reduce((s, r) => s + (r.valorPago || 0), 0)

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Custos Fixos Mensais
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-new" onClick={() => setFormTipo({ nome: '', categoria: '', diaVenc: '' })}>+ Novo tipo</button>
        <div style={{ color: '#444' }}>Total pago: {formatarMoeda(totalFixosPago)}</div>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Ativo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {custosFixosTipos.length === 0 ? (
              <tr><td colSpan={5} className="tabela-vazia">Nenhum tipo de custo fixo cadastrado.</td></tr>
            ) : custosFixosTipos.map(tipo => (
              <tr key={tipo.id}>
                <td>{tipo.nome}</td>
                <td>{tipo.categoria}</td>
                <td>{tipo.diaVenc || '—'}</td>
                <td>{tipo.ativo ? 'Sim' : 'Não'}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => setFormTipo({ ...tipo })}>Editar</button>
                    <button className="btn-acao btn-excluir" onClick={() => handleExcluirTipo(tipo.id)}>Desativar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Mês/Ano</th>
              <th>Valor pago</th>
              <th>Data pagamento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {custosFixosRegistros.length === 0 ? (
              <tr><td colSpan={5} className="tabela-vazia">Nenhum registro de custo fixo para este período.</td></tr>
            ) : custosFixosRegistros.map(reg => (
              <tr key={reg.id}>
                <td>{reg.tipoNome}</td>
                <td>{String(reg.mes).padStart(2, '0')}/{reg.ano}</td>
                <td>{reg.valorPago ? formatarMoeda(reg.valorPago) : '—'}</td>
                <td>{formatarData(reg.dataPagamento)}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => handlePagarRegistro(reg)}>Dar baixa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formTipo !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormTipo(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{formTipo.id ? 'Editar Tipo de Custo Fixo' : 'Novo Tipo de Custo Fixo'}</div>
              <button className="modal-form-close" onClick={() => setFormTipo(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Nome *</label>
              <input type="text" className="field-input" value={formTipo.nome || ''} onChange={e => setFormTipo(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Categoria *</label>
              <input type="text" className="field-input" value={formTipo.categoria || ''} onChange={e => setFormTipo(f => ({ ...f, categoria: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Dia de vencimento</label>
              <input type="number" min="1" max="31" className="field-input" value={formTipo.diaVenc || ''} onChange={e => setFormTipo(f => ({ ...f, diaVenc: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormTipo(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarTipo} disabled={salvandoTipo}>
                {salvandoTipo ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formRegistro !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormRegistro(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">Dar baixa - registro de custo fixo</div>
              <button className="modal-form-close" onClick={() => setFormRegistro(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Data de pagamento *</label>
              <input type="date" className="field-input" value={formRegistro.dataPagamento || ''} onChange={e => setFormRegistro(f => ({ ...f, dataPagamento: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Valor pago (R$) *</label>
              <input type="number" className="field-input" min="0" step="0.01" value={formRegistro.valorPago || ''} onChange={e => setFormRegistro(f => ({ ...f, valorPago: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Observações</label>
              <textarea className="field-input campo-textarea" value={formRegistro.observacoes || ''} onChange={e => setFormRegistro(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormRegistro(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarRegistro} disabled={salvandoRegistro}>
                {salvandoRegistro ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
