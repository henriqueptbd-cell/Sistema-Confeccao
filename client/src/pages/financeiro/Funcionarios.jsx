import { useState } from 'react'
import { criarFuncionario, atualizarFuncionario, excluirFuncionario } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje } from '../../utils/financeiro'

export default function Funcionarios({ funcionarios, onRecarregar }) {
  const [formFuncionario,    setFormFuncionario]    = useState(null)
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false)

  async function salvarFuncionario() {
    setSalvandoFuncionario(true)
    try {
      if (formFuncionario.id) await atualizarFuncionario(formFuncionario.id, formFuncionario)
      else                    await criarFuncionario(formFuncionario)
      setFormFuncionario(null)
      onRecarregar()
    } finally {
      setSalvandoFuncionario(false)
    }
  }

  async function handleExcluirFuncionario(id) {
    if (!confirm('Excluir funcionário?')) return
    await excluirFuncionario(id)
    onRecarregar()
  }

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Funcionárias
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn-new" onClick={() => setFormFuncionario({ nome: '', cargo: '', telefone: '', salarioBase: '', dataAdmissao: hoje(), ativo: true })}>+ Novo funcionário</button>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Telefone</th>
              <th>Salário base</th>
              <th>Admissão</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.length === 0 ? (
              <tr><td colSpan={7} className="tabela-vazia">Nenhum funcionário cadastrado.</td></tr>
            ) : funcionarios.map(f => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{f.cargo}</td>
                <td>{f.telefone || '—'}</td>
                <td>{formatarMoeda(f.salarioBase)}</td>
                <td>{f.dataAdmissao}</td>
                <td>{f.ativo ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => setFormFuncionario({ ...f })}>Editar</button>
                    <button className="btn-acao btn-excluir" onClick={() => handleExcluirFuncionario(f.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formFuncionario !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormFuncionario(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{formFuncionario.id ? 'Editar Funcionária' : 'Nova Funcionária'}</div>
              <button className="modal-form-close" onClick={() => setFormFuncionario(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Nome *</label>
              <input type="text" className="field-input" value={formFuncionario.nome || ''} onChange={e => setFormFuncionario(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Cargo *</label>
              <input type="text" className="field-input" value={formFuncionario.cargo || ''} onChange={e => setFormFuncionario(f => ({ ...f, cargo: e.target.value }))} />
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Telefone</label>
                <input type="text" className="field-input" value={formFuncionario.telefone || ''} onChange={e => setFormFuncionario(f => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Salário base (R$) *</label>
                <input type="number" className="field-input" min="0" step="0.01" value={formFuncionario.salarioBase || ''} onChange={e => setFormFuncionario(f => ({ ...f, salarioBase: e.target.value }))} />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Data de admissão</label>
                <input type="date" className="field-input" value={formFuncionario.dataAdmissao || ''} onChange={e => setFormFuncionario(f => ({ ...f, dataAdmissao: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Ativo</label>
                <select className="field-input campo-select" value={formFuncionario.ativo ? 'true' : 'false'} onChange={e => setFormFuncionario(f => ({ ...f, ativo: e.target.value === 'true' }))}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setFormFuncionario(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvarFuncionario} disabled={salvandoFuncionario}>
                {salvandoFuncionario ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
