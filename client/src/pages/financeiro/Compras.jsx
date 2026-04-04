import { useState, useEffect } from 'react'
import { listarCompras, criarCompra, atualizarCompra, excluirCompra } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

const COMPRA_VAZIA = { dataCompra: hoje(), material: '', quantidade: '', unidade: 'kg', valorTotal: '', fornecedor: '', observacoes: '' }

export default function Compras({ mes, ano, onDados }) {
  const [compras,     setCompras]     = useState([])
  const [form,        setForm]        = useState(null)
  const [salvando,    setSalvando]    = useState(false)
  const [filterTipo,  setFilterTipo]  = useState('')
  const [buscaCompra, setBuscaCompra] = useState('')

  useEffect(() => {
    listarCompras(mes, ano).then(lista => {
      const dados = lista || []
      setCompras(dados)
      onDados({
        numCompras:   dados.length,
        totalCompras: dados.reduce((s, c) => s + c.valorTotal, 0),
      })
    })
  }, [mes, ano])

  async function salvar() {
    setSalvando(true)
    try {
      const dados = { ...form, quantidade: parseFloat(form.quantidade), valorTotal: parseFloat(form.valorTotal) }
      if (form.id) await atualizarCompra(form.id, dados)
      else         await criarCompra(dados)
      setForm(null)
      const lista = await listarCompras(mes, ano)
      const atualizado = lista || []
      setCompras(atualizado)
      onDados({ numCompras: atualizado.length, totalCompras: atualizado.reduce((s, c) => s + c.valorTotal, 0) })
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir esta compra?')) return
    await excluirCompra(id)
    const lista = await listarCompras(mes, ano)
    const atualizado = lista || []
    setCompras(atualizado)
    onDados({ numCompras: atualizado.length, totalCompras: atualizado.reduce((s, c) => s + c.valorTotal, 0) })
  }

  const comprasFiltradas = compras
    .filter(c => !filterTipo || c.tipo === filterTipo)
    .filter(c => !buscaCompra ||
      c.material.toLowerCase().includes(buscaCompra.toLowerCase()) ||
      (c.fornecedor || '').toLowerCase().includes(buscaCompra.toLowerCase())
    )

  const totaisPorCategoria = compras.reduce((acc, c) => {
    const tipo = c.tipo || 'Sem tipo'
    acc[tipo] = (acc[tipo] || 0) + c.valorTotal
    return acc
  }, {})

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Compras de Material
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn-new" onClick={() => setForm({ ...COMPRA_VAZIA })}>+ Nova compra</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, fontSize: 12 }}>Tipo:</label>
        <select className="field-input campo-select" style={{ width: 180 }} value={filterTipo || ''} onChange={e => setFilterTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="Matéria-prima">Matéria-prima</option>
          <option value="Embalagem">Embalagem</option>
          <option value="Ferramentas">Ferramentas</option>
          <option value="Outros">Outros</option>
        </select>
        <input
          type="text"
          className="field-input"
          style={{ width: 220 }}
          placeholder="Buscar material ou fornecedor..."
          value={buscaCompra}
          onChange={e => setBuscaCompra(e.target.value)}
        />
      </div>

      {compras.length > 0 && Object.keys(totaisPorCategoria).length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.entries(totaisPorCategoria).map(([tipo, total]) => (
            <div key={tipo} style={{ backgroundColor: '#f5f5f5', borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>
              <span style={{ color: '#8a8a8e' }}>{tipo}: </span>
              <span style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(total)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Material</th>
              <th>Tipo</th>
              <th>Qtd.</th>
              <th>Fornecedor</th>
              <th>Valor total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {comprasFiltradas.length === 0 ? (
              <tr><td colSpan={7} className="tabela-vazia">{filterTipo || buscaCompra ? 'Nenhuma compra encontrada com esses filtros.' : 'Nenhuma compra registrada neste período.'}</td></tr>
            ) : comprasFiltradas.map(c => (
              <tr key={c.id}>
                <td>{formatarData(c.dataCompra)}</td>
                <td style={{ fontWeight: 600 }}>{c.material}</td>
                <td><span style={{ fontSize: 11, backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>{c.tipo || '—'}</span></td>
                <td><span style={{ fontWeight: 600 }}>{c.quantidade}</span> <span style={{ fontSize: 11, color: '#8a8a8e' }}>{c.unidade}</span></td>
                <td>{c.fornecedor || <span style={{ color: '#ccc' }}>—</span>}</td>
                <td style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(c.valorTotal)}</td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => setForm({ ...c })}>Editar</button>
                  <button className="btn-acao btn-excluir" onClick={() => handleExcluir(c.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <label className="field-label">Tipo</label>
                <select className="field-input campo-select" value={form.tipo || ''} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="">Selecione...</option>
                  <option value="Matéria-prima">Matéria-prima</option>
                  <option value="Embalagem">Embalagem</option>
                  <option value="Ferramentas">Ferramentas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="field-label">Unidade *</label>
                <select className="field-input campo-select" value={form.unidade || 'kg'} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}>
                  <option>kg</option>
                  <option>metros</option>
                  <option>unid.</option>
                </select>
              </div>
              <div>
                <label className="field-label">Valor total (R$) *</label>
                <input type="number" className="field-input" min="0" step="0.01" value={form.valorTotal || ''} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} />
              </div>
            </div>

            <div className="form-row-2">
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
