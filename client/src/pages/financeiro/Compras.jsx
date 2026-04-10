import { useState, useEffect } from 'react'
import { listarCompras, criarCompra, atualizarCompra, excluirCompra, darBaixaCompra } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { hoje, formatarData } from '../../utils/financeiro'

const COMPRA_VAZIA = {
  dataCompra: hoje(), material: '', quantidade: '', unidade: 'kg',
  valorTotal: '', fornecedor: '', observacoes: '',
  formaPagamento: 'a_vista', dataVencimento: '',
}

function statusPagamento(c) {
  if (c.formaPagamento === 'a_vista' || c.dataPagamento) return 'pago'
  if (c.dataVencimento) {
    const venc = new Date(c.dataVencimento + 'T00:00:00')
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))
    if (diff < 0)  return 'vencido'
    if (diff <= 5) return 'vence_em_breve'
  }
  return 'pendente'
}

function BadgeStatus({ compra }) {
  const st = statusPagamento(compra)
  const map = {
    pago:          { label: 'Pago',           color: '#16a34a', bg: '#dcfce7' },
    pendente:      { label: 'Pendente',        color: '#92400e', bg: '#fef3c7' },
    vence_em_breve:{ label: `Vence em breve`,  color: '#b45309', bg: '#fef3c7' },
    vencido:       { label: 'Vencido',         color: '#dc2626', bg: '#fee2e2' },
  }
  const { label, color, bg } = map[st]
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: bg, color, fontWeight: 600 }}>
      {label}
    </span>
  )
}

export default function Compras({ mes, ano, onDados }) {
  const [compras,     setCompras]     = useState([])
  const [form,        setForm]        = useState(null)
  const [salvando,    setSalvando]    = useState(false)
  const [filterTipo,  setFilterTipo]  = useState('')
  const [filterPgto,  setFilterPgto]  = useState('')
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
      const dados = {
        ...form,
        quantidade:      parseFloat(form.quantidade),
        valorTotal:      parseFloat(form.valorTotal),
        dataVencimento:  form.formaPagamento === 'faturado' ? (form.dataVencimento || null) : null,
      }
      if (form.id) await atualizarCompra(form.id, dados)
      else         await criarCompra(dados)
      setForm(null)
      await recarregar()
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir esta compra?')) return
    await excluirCompra(id)
    await recarregar()
  }

  async function handleBaixa(id) {
    if (!confirm('Confirmar pagamento desta compra hoje?')) return
    await darBaixaCompra(id)
    await recarregar()
  }

  async function recarregar() {
    const lista = await listarCompras(mes, ano)
    const atualizado = lista || []
    setCompras(atualizado)
    onDados({ numCompras: atualizado.length, totalCompras: atualizado.reduce((s, c) => s + c.valorTotal, 0) })
  }

  const comprasFiltradas = compras
    .filter(c => !filterTipo || c.tipo === filterTipo)
    .filter(c => !filterPgto || statusPagamento(c) === filterPgto)
    .filter(c => !buscaCompra ||
      (c.material || '').toLowerCase().includes(buscaCompra.toLowerCase()) ||
      (c.fornecedor || '').toLowerCase().includes(buscaCompra.toLowerCase())
    )

  const totaisPorCategoria = compras.reduce((acc, c) => {
    const tipo = c.tipo || 'Sem tipo'
    acc[tipo] = (acc[tipo] || 0) + c.valorTotal
    return acc
  }, {})

  const totalPendente = compras
    .filter(c => statusPagamento(c) !== 'pago')
    .reduce((s, c) => s + c.valorTotal, 0)

  return (
    <>
      <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
        Compras de Material
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn-new" onClick={() => setForm({ ...COMPRA_VAZIA })}>+ Nova compra</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, fontSize: 12 }}>Tipo:</label>
        <select className="field-input campo-select" style={{ width: 160 }} value={filterTipo || ''} onChange={e => setFilterTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="Matéria-prima">Matéria-prima</option>
          <option value="Embalagem">Embalagem</option>
          <option value="Ferramentas">Ferramentas</option>
          <option value="Outros">Outros</option>
        </select>
        <label style={{ fontWeight: 600, fontSize: 12 }}>Pagamento:</label>
        <select className="field-input campo-select" style={{ width: 160 }} value={filterPgto || ''} onChange={e => setFilterPgto(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendente">Pendentes</option>
          <option value="vencido">Vencidas</option>
          <option value="pago">Pagas</option>
        </select>
        <input
          type="text"
          className="field-input"
          style={{ width: 200 }}
          placeholder="Buscar material ou fornecedor..."
          value={buscaCompra}
          onChange={e => setBuscaCompra(e.target.value)}
        />
      </div>

      {/* Totais por categoria */}
      {compras.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(totaisPorCategoria).map(([tipo, total]) => (
            <div key={tipo} style={{ backgroundColor: '#f5f5f5', borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>
              <span style={{ color: '#8a8a8e' }}>{tipo}: </span>
              <span style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(total)}</span>
            </div>
          ))}
          {totalPendente > 0 && (
            <div style={{ backgroundColor: '#fef3c7', borderRadius: 6, padding: '6px 12px', fontSize: 12, marginLeft: 'auto' }}>
              <span style={{ color: '#92400e' }}>A pagar: </span>
              <span style={{ fontWeight: 700, color: '#b45309' }}>{formatarMoeda(totalPendente)}</span>
            </div>
          )}
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
              <th>Vencimento</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {comprasFiltradas.length === 0 ? (
              <tr><td colSpan={9} className="tabela-vazia">{filterTipo || filterPgto || buscaCompra ? 'Nenhuma compra encontrada com esses filtros.' : 'Nenhuma compra registrada neste período.'}</td></tr>
            ) : comprasFiltradas.map(c => (
              <tr key={c.id}>
                <td>{formatarData(c.dataCompra)}</td>
                <td style={{ fontWeight: 600 }}>{c.material}</td>
                <td><span style={{ fontSize: 11, backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>{c.tipo || '—'}</span></td>
                <td><span style={{ fontWeight: 600 }}>{c.quantidade}</span> <span style={{ fontSize: 11, color: '#8a8a8e' }}>{c.unidade}</span></td>
                <td>{c.fornecedor || <span style={{ color: '#ccc' }}>—</span>}</td>
                <td style={{ fontWeight: 700, color: '#e84c3d' }}>{formatarMoeda(c.valorTotal)}</td>
                <td style={{ fontSize: 12, color: '#666' }}>
                  {c.formaPagamento === 'faturado' && c.dataVencimento
                    ? formatarData(c.dataVencimento)
                    : <span style={{ color: '#ccc' }}>—</span>}
                </td>
                <td><BadgeStatus compra={c} /></td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => setForm({ ...c })}>Editar</button>
                  {c.formaPagamento === 'faturado' && !c.dataPagamento && (
                    <button className="btn-acao" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }} onClick={() => handleBaixa(c.id)}>Dar baixa</button>
                  )}
                  <button className="btn-acao btn-excluir" onClick={() => handleExcluir(c.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de formulário */}
      {form !== null && (
        <div className="modal-overlay visible">
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
              <div>
                <label className="field-label">Pagamento</label>
                <select className="field-input campo-select" value={form.formaPagamento || 'a_vista'} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))}>
                  <option value="a_vista">À vista</option>
                  <option value="faturado">Faturado (a prazo)</option>
                </select>
              </div>
            </div>

            {form.formaPagamento === 'faturado' && (
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Vencimento</label>
                <input type="date" className="field-input" style={{ maxWidth: 220 }} value={form.dataVencimento || ''} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} />
              </div>
            )}

            {form.id && form.dataPagamento && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#16a34a' }}>
                  Baixa dada em: <strong>{form.dataPagamento}</strong>
                </span>
                <button
                  type="button"
                  style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setForm(f => ({ ...f, dataPagamento: null }))}
                >
                  Desfazer baixa
                </button>
              </div>
            )}

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
