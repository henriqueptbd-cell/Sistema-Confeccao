import { useState, useEffect } from 'react'
import { listarCompras, criarCompra, atualizarCompra, excluirCompra, listarFuncionarios, criarFuncionario, atualizarFuncionario, excluirFuncionario, listarPagamentosSalario, registrarPagamentoSalario, atualizarPagamentoSalario, excluirPagamentoSalario, listarCustosPessoal, criarCustoPessoal, atualizarCustoPessoal, excluirCustoPessoal, listarCustosFixosTipos, criarCustosFixosTipo, atualizarCustosFixosTipo, excluirCustosFixosTipo, listarCustosFixosRegistros, pagarCustosFixosRegistro, atualizarCustosFixosRegistro, listarParcelamentos, criarParcelamento, atualizarParcelamento, excluirParcelamento, listarParcelas, pagarParcela, atualizarParcela } from '../api'
import { formatarMoeda } from '../utils/config'

const hoje = () => new Date().toISOString().slice(0, 10)
const mesAtual = () => new Date().getMonth() + 1
const anoAtual = () => new Date().getFullYear()

// Função helper para formatar datas de forma segura
const formatarData = (data) => {
  if (!data) return '—'
  try {
    // Se for string YYYY-MM-DD, converte para Date
    if (typeof data === 'string' && !data.includes('T')) {
      const [year, month, day] = data.split('-')
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
    }
    // Se for ISO string ou Date, parseia normalmente
    return new Date(data).toLocaleDateString('pt-BR')
  } catch (e) {
    return '—'
  }
}

const COMPRA_VAZIA = { dataCompra: hoje(), material: '', quantidade: '', unidade: 'kg', valorTotal: '', fornecedor: '', observacoes: '' }

export default function Financeiro() {
  const [compras,     setCompras]     = useState([])
  const [mes,         setMes]         = useState(mesAtual())
  const [ano,         setAno]         = useState(anoAtual())
  const [form,        setForm]        = useState(null)   // null = fechado, {} = novo, {id,...} = editar
  const [salvando,    setSalvando]    = useState(false)
  const [filterTipo,  setFilterTipo]  = useState('')     // filtro por tipo de compra
  const [buscaCompra, setBuscaCompra] = useState('')     // busca por material ou fornecedor

  // Novos estados para salários
  const [funcionarios, setFuncionarios] = useState([])
  const [pagamentos,   setPagamentos]   = useState([])
  const [custosPessoal, setCustosPessoal] = useState([])
  const [formPagamento, setFormPagamento] = useState(null)
  const [formCusto,     setFormCusto]     = useState(null)
  const [formFuncionario, setFormFuncionario] = useState(null)
  const [custosFixosTipos, setCustosFixosTipos] = useState([])
  const [custosFixosRegistros, setCustosFixosRegistros] = useState([])
  const [formTipo, setFormTipo] = useState(null)
  const [formRegistro, setFormRegistro] = useState(null)
  const [salvandoPagamento, setSalvandoPagamento] = useState(false)
  const [salvandoCusto,     setSalvandoCusto]     = useState(false)
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false)
  const [salvandoTipo, setSalvandoTipo] = useState(false)
  const [salvandoRegistro, setSalvandoRegistro] = useState(false)
  const [abaFinanceiro, setAbaFinanceiro] = useState('compras')
  const [parcelamentos, setParcelamentos] = useState([])
  const [parcelasDetalhadas, setParcelasDetalhadas] = useState({})
  const [formParcelamento, setFormParcelamento] = useState(null)
  const [formPagoParcela, setFormPagoParcela] = useState(null)
  const [salvandoParcelamento, setSalvandoParcelamento] = useState(false)
  const [expandidoParcelamento, setExpandidoParcelamento] = useState(null)

  async function carregar() {
    const [listaCompras, listaFuncionarios, listaPagamentos, listaCustos, listaTipos, listaRegistros, listaParcelamentos] = await Promise.all([
      listarCompras(mes, ano),
      listarFuncionarios(),
      listarPagamentosSalario(mes, ano),
      listarCustosPessoal(mes, ano),
      listarCustosFixosTipos(),
      listarCustosFixosRegistros(mes, ano),
      listarParcelamentos().catch(() => [])
    ])
    setCompras(listaCompras || [])
    setFuncionarios(listaFuncionarios || [])
    setPagamentos(listaPagamentos || [])
    setCustosPessoal(listaCustos || [])
    setCustosFixosTipos(listaTipos || [])
    setCustosFixosRegistros(listaRegistros || [])
    setParcelamentos(listaParcelamentos || [])
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

  // Funções para pagamentos de salário
  async function salvarPagamento() {
    setSalvandoPagamento(true)
    try {
      const dados = {
        ...formPagamento,
        mes,
        ano,
        valorPago: parseFloat(formPagamento.valorPago),
      }
      if (formPagamento.id) await atualizarPagamentoSalario(formPagamento.id, dados)
      else                  await registrarPagamentoSalario(dados)
      setFormPagamento(null)
      carregar()
    } finally {
      setSalvandoPagamento(false)
    }
  }

  async function handleExcluirPagamento(id) {
    if (!confirm('Excluir este pagamento?')) return
    await excluirPagamentoSalario(id)
    carregar()
  }

  // Funções para custos adicionais de pessoal
  async function salvarCusto() {
    setSalvandoCusto(true)
    try {
      const dados = {
        ...formCusto,
        valor: parseFloat(formCusto.valor),
      }
      if (formCusto.id) await atualizarCustoPessoal(formCusto.id, dados)
      else              await criarCustoPessoal(dados)
      setFormCusto(null)
      carregar()
    } finally {
      setSalvandoCusto(false)
    }
  }

  async function handleExcluirCusto(id) {
    if (!confirm('Excluir este custo adicional?')) return
    await excluirCustoPessoal(id)
    carregar()
  }

  async function salvarTipo() {
    if (!formTipo.nome || !formTipo.categoria) {
      alert('Nome e categoria são obrigatórios.')
      return
    }
    setSalvandoTipo(true)
    try {
      const dados = {
        ...formTipo,
        diaVenc: formTipo.diaVenc ? parseInt(formTipo.diaVenc) : null
      }
      if (dados.id) await atualizarCustosFixosTipo(dados.id, dados)
      else         await criarCustosFixosTipo(dados)
      setFormTipo(null)
      carregar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoTipo(false)
    }
  }

  async function handleExcluirTipo(id) {
    if (!confirm('Desativar este tipo de custo fixo?')) return
    await excluirCustosFixosTipo(id)
    carregar()
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
        valorPago: parseFloat(formRegistro.valorPago),
        observacoes: formRegistro.observacoes || ''
      })
      setFormRegistro(null)
      carregar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoRegistro(false)
    }
  }

  async function handlePagarRegistro(registro) {
    setFormRegistro({
      id: registro.id,
      dataPagamento: registro.dataPagamento || hoje(),
      valorPago: registro.valorPago || 0,
      observacoes: registro.observacoes || ''
    })
  }

  const totalFixosPago = custosFixosRegistros.reduce((s, r) => s + (r.valorPago || 0), 0)

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
          descricao: formParcelamento.descricao,
          valorTotal: parseFloat(formParcelamento.valorTotal),
          numParcelas: parseInt(formParcelamento.numParcelas, 10),
          valorParcela: parseFloat(formParcelamento.valorParcela) || (parseFloat(formParcelamento.valorTotal) / parseInt(formParcelamento.numParcelas, 10)),
          dataPrimeira: formParcelamento.dataPrimeira,
          observacoes: formParcelamento.observacoes || ''
        }
        console.log('[parcelamentos] salvarParcelamento create payload', payload)
        await criarParcelamento(payload)
      }
      setFormParcelamento(null)
      carregar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvandoParcelamento(false)
    }
  }

  async function handleExcluirParcelamento(id) {
    if (!confirm('Excluir este parcelamento?')) return
    await excluirParcelamento(id)
    carregar()
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

  async function handlePagarParcela(parcelamentoId, numeroParcela) {
    setFormPagoParcela({
      parcelamentoId,
      numeroParcela,
      dataPagamento: hoje(),
      valorPago: 0,
      observacoes: ''
    })
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
          valorPago: parseFloat(formPagoParcela.valorPago),
          observacoes: formPagoParcela.observacoes || ''
        }
      )
      setFormPagoParcela(null)
      carregar()
      // Atualizar parcelas detalhadas se o parcelamento estiver expandido
      if (expandidoParcelamento === formPagoParcela.parcelamentoId) {
        const parcelas = await listarParcelas(formPagoParcela.parcelamentoId)
        setParcelasDetalhadas(prev => ({ ...prev, [formPagoParcela.parcelamentoId]: parcelas }))
      }
    } catch (e) {
      alert('Erro ao registrar pagamento: ' + e.message)
    }
  }

  const totalParcelamentosPago = (parcelamentos || []).reduce((s, p) => s + (p.totalPago || 0), 0)

  async function salvarFuncionario() {
    setSalvandoFuncionario(true)
    try {
      if (formFuncionario.id) {
        await atualizarFuncionario(formFuncionario.id, formFuncionario)
      } else {
        await criarFuncionario(formFuncionario)
      }
      setFormFuncionario(null)
      carregar()
    } finally {
      setSalvandoFuncionario(false)
    }
  }

  async function handleExcluirFuncionario(id) {
    if (!confirm('Excluir funcionário?')) return
    await excluirFuncionario(id)
    carregar()
  }

  const totalMes = compras.reduce((s, c) => s + c.valorTotal, 0)
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
  const totalSalarios = pagamentos.reduce((s, p) => s + p.valorPago, 0)
  const totalCustosPessoal = custosPessoal.reduce((s, c) => s + c.valor, 0)

  // Status de pagamento por funcionário
  const statusPagamentos = {}
  pagamentos.forEach(p => {
    statusPagamentos[p.funcionarioId] = { pago: true, data: p.dataPagamento, valor: p.valorPago, observacoes: p.observacoes, id: p.id }
  })
  funcionarios.forEach(f => {
    if (!statusPagamentos[f.id]) {
      statusPagamentos[f.id] = { pago: false }
    }
  })

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <>
      <div className="page-header">
        <div className="page-title">Financeiro</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-new" onClick={() => setFormPagamento({})}>+ Registrar pagamento</button>
          <button className="btn-new" onClick={() => setFormCusto({ data: hoje() })}>+ Custo adicional</button>
          <button className="btn-new" onClick={() => setForm({ ...COMPRA_VAZIA })}>+ Nova compra</button>
        </div>
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

      <div className="filters" style={{ marginBottom: 24 }}>
        <button className={`filter-btn${abaFinanceiro === 'compras' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('compras')}>Compras</button>
        <button className={`filter-btn${abaFinanceiro === 'folha' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('folha')}>Folha do mês</button>
        <button className={`filter-btn${abaFinanceiro === 'custos' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('custos')}>Custos adicionais</button>
        <button className={`filter-btn${abaFinanceiro === 'custosfixos' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('custosfixos')}>Custos fixos</button>
        <button className={`filter-btn${abaFinanceiro === 'parcelamentos' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('parcelamentos')}>Parcelamentos</button>
        <button className={`filter-btn${abaFinanceiro === 'funcionarios' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('funcionarios')}>Funcionárias</button>
      </div>

      {abaFinanceiro === 'funcionarios' ? (
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
        </>
      ) : (
        <>
          {/* Resumo */}
          <div className="stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Compras no período</div>
              <div className="stat-value blue">{compras.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total compras</div>
              <div className="stat-value red">{formatarMoeda(totalMes)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total salários + custos</div>
              <div className="stat-value red">{formatarMoeda(totalSalarios + totalCustosPessoal)}</div>
            </div>
          </div>

          {abaFinanceiro === 'compras' && (
            <>
              <div className="section-title" style={{ marginBottom: 12, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#8a8a8e', textTransform: 'uppercase' }}>
                Compras de Material
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 600, fontSize: 12 }}>Tipo:</label>
                <select
                  className="field-input campo-select"
                  style={{ width: 180 }}
                  value={filterTipo || ''}
                  onChange={e => setFilterTipo(e.target.value)}
                >
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
            </>
          )}

          {abaFinanceiro === 'folha' && (
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
            </>
          )}

          {abaFinanceiro === 'custos' && (
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
            </>
          )}

          {abaFinanceiro === 'custosfixos' && (
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
            </>
          )}

          {abaFinanceiro === 'parcelamentos' && (
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
            </>
          )}

        </>
      )}

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

      {/* Modal pagamento de salário */}
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

      {/* Modal custo adicional */}
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

      {/* Modal funcionário */}
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

      {/* Modal custo fixo tipo */}
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

      {/* Modal registro custo fixo */}
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

      {/* Modal novo parcelamento */}
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

      {/* Modal pagar parcela */}
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

