import { useState, useEffect } from 'react'
import { listarCompras, criarCompra, atualizarCompra, excluirCompra } from '../api'
import { formatarMoeda } from '../utils/config'

const hoje = () => new Date().toISOString().slice(0, 10)
const mesAtual = () => new Date().getMonth() + 1
const anoAtual = () => new Date().getFullYear()

const COMPRA_VAZIA = { dataCompra: hoje(), material: '', quantidade: '', unidade: 'kg', valorTotal: '', fornecedor: '', observacoes: '' }

export default function Financeiro() {
  const [compras,     setCompras]     = useState([])
  const [mes,         setMes]         = useState(mesAtual())
  const [ano,         setAno]         = useState(anoAtual())
  const [form,        setForm]        = useState(null)   // null = fechado, {} = novo, {id,...} = editar
  const [salvando,    setSalvando]    = useState(false)

  async function carregar() {
    const lista = await listarCompras(mes, ano)
    setCompras(lista)
  }

  useEffect(() => { carregar() }, [mes, ano])

  async function salvar() {
    setSalvando(true)
    try {
      const dados = {
        ...form,
        quantidade:  parseFloat(form.quantidade),
        valorTotal:  parseFloat(form.valorTotal),
      }
      if (form.id) await atualizarCompra(form.id, dados)
      else         await criarCompra(dados)
      setForm(null)
      carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir esta compra?')) return
    await excluirCompra(id)
    carregar()
  }

  const totalMes = compras.reduce((s, c) => s + c.valorTotal, 0)

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <>
      <div className="page-header">
        <div className="page-title">Financeiro</div>
        <button className="btn-new" onClick={() => setForm({ ...COMPRA_VAZIA })}>+ Nova compra</button>
      </div>

      {/* Filtro de período */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <label className="field-label" style={{ marginBottom: 0 }}>Período:</label>
        <select className="field-input campo-select" style={{ width: 120 }} value={mes} onChange={e => setMes(Number(e.target.value))}>
          {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="field-input campo-select" style={{ width: 100 }} value={ano} onChange={e => setAno(Number(e.target.value))}>
          {[anoAtual() - 1, anoAtual(), anoAtual() + 1].map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Resumo */}
      <div className="stats" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Compras no período</div>
          <div className="stat-value blue">{compras.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total gasto</div>
          <div className="stat-value red">{formatarMoeda(totalMes)}</div>
        </div>
      </div>

      {/* Tabela de compras */}
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Compras de Material
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Material</th>
              <th>Qtd.</th>
              <th>Fornecedor</th>
              <th>Valor total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr><td colSpan={6} className="tabela-vazia">Nenhuma compra registrada neste período.</td></tr>
            ) : compras.map(c => (
              <tr key={c.id}>
                <td>{new Date(c.dataCompra + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                <td style={{ fontWeight: 600 }}>{c.material}</td>
                <td>{c.quantidade} {c.unidade}</td>
                <td>{c.fornecedor || <span style={{ color: '#ccc' }}>—</span>}</td>
                <td style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(c.valorTotal)}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => setForm({ ...c })}>Editar</button>
                    <button className="btn-acao btn-excluir" onClick={() => handleExcluir(c.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal compra */}
      {form !== null && (
        <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setForm(null)}>
          <div className="modal-form-container">
            <div className="modal-form-header">
              <div className="modal-form-title">{form.id ? 'Editar Compra' : 'Nova Compra'}</div>
              <button className="modal-form-close" onClick={() => setForm(null)}>✕</button>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Data *</label>
                <input type="date" className="field-input" value={form.dataCompra || ''} onChange={e => setForm(f => ({ ...f, dataCompra: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Material *</label>
                <input type="text" className="field-input" placeholder="Ex: Dry, Crepe..." value={form.material || ''} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Quantidade *</label>
                <input type="number" className="field-input" min="0" step="0.001" value={form.quantidade || ''} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Unidade *</label>
                <select className="field-input campo-select" value={form.unidade || 'kg'} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}>
                  <option>kg</option>
                  <option>metros</option>
                  <option>unid.</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Valor total (R$) *</label>
                <input type="number" className="field-input" min="0" step="0.01" value={form.valorTotal || ''} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Fornecedor</label>
                <input type="text" className="field-input" value={form.fornecedor || ''} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Observações</label>
              <textarea className="field-input campo-textarea" value={form.observacoes || ''} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="modal-form-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setForm(null)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
