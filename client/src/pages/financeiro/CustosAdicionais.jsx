import { useState, useEffect } from 'react'
import { listarCustosPessoal, criarCustoPessoal, atualizarCustoPessoal, excluirCustoPessoal } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

export default function CustosAdicionais({ mes, ano, funcionarios, onDados }) {
  const [custosPessoal,  setCustosPessoal]  = useState([])
  const [formCusto,      setFormCusto]      = useState(null)
  const [salvandoCusto,  setSalvandoCusto]  = useState(false)

  useEffect(() => {
    listarCustosPessoal(mes, ano).then(lista => {
      const dados = lista || []
      setCustosPessoal(dados)
      onDados({ totalCustosPessoal: dados.reduce((s, c) => s + c.valor, 0) })
    })
  }, [mes, ano])

  async function salvarCusto() {
    setSalvandoCusto(true)
    try {
      const dados = { ...formCusto, valor: parseFloat(formCusto.valor) }
      if (formCusto.id) await atualizarCustoPessoal(formCusto.id, dados)
      else              await criarCustoPessoal(dados)
      setFormCusto(null)
      const lista = await listarCustosPessoal(mes, ano)
      const atualizado = lista || []
      setCustosPessoal(atualizado)
      onDados({ totalCustosPessoal: atualizado.reduce((s, c) => s + c.valor, 0) })
    } finally {
      setSalvandoCusto(false)
    }
  }

  async function handleExcluirCusto(id) {
    if (!confirm('Excluir este custo adicional?')) return
    await excluirCustoPessoal(id)
    const lista = await listarCustosPessoal(mes, ano)
    const atualizado = lista || []
    setCustosPessoal(atualizado)
    onDados({ totalCustosPessoal: atualizado.reduce((s, c) => s + c.valor, 0) })
  }

  const totalCustosPessoal = custosPessoal.reduce((s, c) => s + c.valor, 0)

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Custos Adicionais de Pessoal
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-new" onClick={() => setFormCusto({ data: hoje() })}>+ Adicionar custo</button>
        <div style={{ color: '#444' }}>Total: {formatarMoeda(totalCustosPessoal)}</div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionária</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {custosPessoal.length === 0 ? (
              <tr><td colSpan={5} className="tabela-vazia">Nenhum custo adicional registrado neste período.</td></tr>
            ) : custosPessoal.map(c => (
              <tr key={c.id}>
                <td>{formatarData(c.data)}</td>
                <td>{c.funcionarioNome || '—'}</td>
                <td>{c.descricao}</td>
                <td style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(c.valor)}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => setFormCusto({ ...c })}>Editar</button>
                    <button className="btn-acao btn-excluir" onClick={() => handleExcluirCusto(c.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formCusto !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormCusto(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{formCusto.id ? 'Editar Custo Adicional' : 'Novo Custo Adicional'}</div>
              <button className="modal-form-close" onClick={() => setFormCusto(null)}>✕</button>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Funcionária *</label>
                <select className="field-input campo-select" value={formCusto.funcionarioId || ''} onChange={e => setFormCusto(f => ({ ...f, funcionarioId: Number(e.target.value) }))}>
                  <option value="">Selecione...</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Data *</label>
                <input type="date" className="field-input" value={formCusto.data || ''} onChange={e => setFormCusto(f => ({ ...f, data: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Descrição *</label>
              <input type="text" className="field-input" placeholder="Ex: Ajuda de custo, bônus..." value={formCusto.descricao || ''} onChange={e => setFormCusto(f => ({ ...f, descricao: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Valor (R$) *</label>
              <input type="number" className="field-input" min="0" step="0.01" value={formCusto.valor || ''} onChange={e => setFormCusto(f => ({ ...f, valor: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormCusto(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarCusto} disabled={salvandoCusto}>
                {salvandoCusto ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
