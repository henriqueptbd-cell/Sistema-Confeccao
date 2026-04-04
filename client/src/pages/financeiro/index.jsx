import { useState, useEffect } from 'react'
import { listarFuncionarios } from '../../api'
import { formatarMoeda } from '../../utils/config'
import { mesAtual, anoAtual } from '../../utils/financeiro'
import Compras          from './Compras'
import Folha            from './Folha'
import CustosAdicionais from './CustosAdicionais'
import CustosFixos      from './CustosFixos'
import Parcelamentos    from './Parcelamentos'
import Funcionarios     from './Funcionarios'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Financeiro() {
  const [mes,            setMes]            = useState(mesAtual())
  const [ano,            setAno]            = useState(anoAtual())
  const [abaFinanceiro,  setAbaFinanceiro]  = useState('compras')
  const [funcionarios,   setFuncionarios]   = useState([])

  // Totais para o resumo no topo — cada sub-componente atualiza o que é seu
  const [resumo, setResumo] = useState({ numCompras: 0, totalCompras: 0, totalSalarios: 0, totalCustosPessoal: 0 })

  function atualizarResumo(parcial) {
    setResumo(r => ({ ...r, ...parcial }))
  }

  async function carregarFuncionarios() {
    const lista = await listarFuncionarios()
    setFuncionarios(lista || [])
  }

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  // Zera o resumo quando o período muda — os sub-componentes vão atualizar
  useEffect(() => {
    setResumo({ numCompras: 0, totalCompras: 0, totalSalarios: 0, totalCustosPessoal: 0 })
  }, [mes, ano])

  return (
    <>
      <div className="page-header">
        <div className="page-title">Financeiro</div>
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

      {/* Abas */}
      <div className="filters" style={{ marginBottom: 24 }}>
        <button className={`filter-btn${abaFinanceiro === 'compras'       ? ' active' : ''}`} onClick={() => setAbaFinanceiro('compras')}>Compras</button>
        <button className={`filter-btn${abaFinanceiro === 'folha'         ? ' active' : ''}`} onClick={() => setAbaFinanceiro('folha')}>Folha do mês</button>
        <button className={`filter-btn${abaFinanceiro === 'custos'        ? ' active' : ''}`} onClick={() => setAbaFinanceiro('custos')}>Custos adicionais</button>
        <button className={`filter-btn${abaFinanceiro === 'custosfixos'   ? ' active' : ''}`} onClick={() => setAbaFinanceiro('custosfixos')}>Custos fixos</button>
        <button className={`filter-btn${abaFinanceiro === 'parcelamentos' ? ' active' : ''}`} onClick={() => setAbaFinanceiro('parcelamentos')}>Parcelamentos</button>
        <button className={`filter-btn${abaFinanceiro === 'funcionarios'  ? ' active' : ''}`} onClick={() => setAbaFinanceiro('funcionarios')}>Funcionárias</button>
      </div>

      {/* Resumo — aparece em todas as abas exceto Funcionárias */}
      {abaFinanceiro !== 'funcionarios' && (
        <div className="stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Compras no período</div>
            <div className="stat-value blue">{resumo.numCompras}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total compras</div>
            <div className="stat-value red">{formatarMoeda(resumo.totalCompras)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total salários + custos</div>
            <div className="stat-value red">{formatarMoeda(resumo.totalSalarios + resumo.totalCustosPessoal)}</div>
          </div>
        </div>
      )}

      {/* Conteúdo da aba ativa */}
      {abaFinanceiro === 'compras' && (
        <Compras
          mes={mes}
          ano={ano}
          onDados={d => atualizarResumo({ numCompras: d.numCompras, totalCompras: d.totalCompras })}
        />
      )}
      {abaFinanceiro === 'folha' && (
        <Folha
          mes={mes}
          ano={ano}
          funcionarios={funcionarios}
          onDados={d => atualizarResumo({ totalSalarios: d.totalSalarios })}
        />
      )}
      {abaFinanceiro === 'custos' && (
        <CustosAdicionais
          mes={mes}
          ano={ano}
          funcionarios={funcionarios}
          onDados={d => atualizarResumo({ totalCustosPessoal: d.totalCustosPessoal })}
        />
      )}
      {abaFinanceiro === 'custosfixos' && (
        <CustosFixos mes={mes} ano={ano} />
      )}
      {abaFinanceiro === 'parcelamentos' && (
        <Parcelamentos />
      )}
      {abaFinanceiro === 'funcionarios' && (
        <Funcionarios
          funcionarios={funcionarios}
          onRecarregar={carregarFuncionarios}
        />
      )}
    </>
  )
}
