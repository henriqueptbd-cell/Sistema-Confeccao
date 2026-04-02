import { useState, useEffect } from 'react'
import { criarCliente, atualizarCliente } from '../api'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const VAZIO_PF = {
  tipoPessoa: 'fisica',
  nome: '', cpf: '', email: '', telefone: '',
  cep: '', numero: '', logradouro: '', bairro: '', complemento: '', municipio: '', uf: '',
}

const VAZIO_PJ = {
  tipoPessoa: 'juridica',
  razaoSocial: '', nomeFantasia: '', cnpj: '', inscricaoEstadual: '', email: '', telefone: '',
  cep: '', numero: '', logradouro: '', bairro: '', complemento: '', municipio: '', uf: '',
}

export default function ModalCliente({ clienteInicial, onSalvo, onFechar }) {
  const [form,        setForm]        = useState(null)
  const [salvando,    setSalvando]    = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

  useEffect(() => {
    setForm(clienteInicial ? { ...clienteInicial } : { ...VAZIO_PF })
  }, [clienteInicial])

  function setTipo(tipo) {
    setForm(tipo === 'juridica' ? { ...VAZIO_PJ } : { ...VAZIO_PF })
  }

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function buscarCep(cep) {
    const n = cep.replace(/\D/g, '')
    if (n.length !== 8) return
    setBuscandoCep(true)
    try {
      const r = await fetch(`https://viacep.com.br/ws/${n}/json/`)
      const d = await r.json()
      if (!d.erro) {
        setForm(f => ({
          ...f,
          logradouro: d.logradouro || f.logradouro,
          bairro:     d.bairro     || f.bairro,
          municipio:  d.localidade || f.municipio,
          uf:         d.uf         || f.uf,
        }))
      }
    } catch { /* silently ignore */ }
    finally { setBuscandoCep(false) }
  }

  async function salvar() {
    if (!form) return
    setSalvando(true)
    try {
      if (form.id) await atualizarCliente(form.id, form)
      else         await criarCliente(form)
      onSalvo()
    } catch (e) {
      alert(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (!form) return null
  const isPJ = form.tipoPessoa === 'juridica'

  return (
    <div className="modal-overlay visible" style={{ zIndex: 200 }} onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="modal-form-container">

        <div className="modal-form-header">
          <div className="modal-form-title">{form.id ? 'Editar Cliente' : 'Novo Cliente'}</div>
          <button className="modal-form-close" onClick={onFechar}>✕</button>
        </div>

        {/* Tipo de pessoa */}
        {!form.id && (
          <div className="form-section">
            <div className="form-section-title">Tipo de pessoa</div>
            <div className="opcao-pills">
              <button type="button" className={`opcao-pill${!isPJ ? ' active' : ''}`} onClick={() => setTipo('fisica')}>Pessoa Física</button>
              <button type="button" className={`opcao-pill${isPJ ? ' active' : ''}`}  onClick={() => setTipo('juridica')}>Pessoa Jurídica</button>
            </div>
          </div>
        )}

        {/* Dados PF */}
        {!isPJ && (
          <div className="form-row-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="field-label">Nome completo *</label>
              <input className="field-input" placeholder="João da Silva" value={form.nome || ''} onChange={e => set('nome', e.target.value)} />
            </div>
            <div>
              <label className="field-label">CPF</label>
              <input className="field-input" placeholder="000.000.000-00" maxLength={14} value={form.cpf || ''} onChange={e => set('cpf', e.target.value)} />
            </div>
          </div>
        )}

        {/* Dados PJ */}
        {isPJ && (
          <>
            <div className="form-row-2" style={{ marginBottom: 12 }}>
              <div>
                <label className="field-label">Razão Social *</label>
                <input className="field-input" placeholder="Empresa LTDA" value={form.razaoSocial || ''} onChange={e => set('razaoSocial', e.target.value)} />
              </div>
              <div>
                <label className="field-label">CNPJ</label>
                <input className="field-input" placeholder="00.000.000/0000-00" maxLength={18} value={form.cnpj || ''} onChange={e => set('cnpj', e.target.value)} />
              </div>
            </div>
            <div className="form-row-2" style={{ marginBottom: 16 }}>
              <div>
                <label className="field-label">Nome Fantasia</label>
                <input className="field-input" value={form.nomeFantasia || ''} onChange={e => set('nomeFantasia', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Inscrição Estadual</label>
                <input className="field-input" value={form.inscricaoEstadual || ''} onChange={e => set('inscricaoEstadual', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Contato */}
        <div className="form-section">
          <div className="form-section-title">Contato</div>
          <div className="form-row-2">
            <div>
              <label className="field-label">Telefone *</label>
              <input className="field-input" placeholder="(11) 99999-9999" value={form.telefone || ''} onChange={e => set('telefone', e.target.value)} />
            </div>
            <div>
              <label className="field-label">E-mail</label>
              <input type="email" className="field-input" placeholder="email@exemplo.com" value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="form-section">
          <div className="form-section-title">Endereço</div>
          <div className="form-row-2" style={{ marginBottom: 12 }}>
            <div>
              <label className="field-label">CEP</label>
              <input
                className="field-input"
                placeholder="00000-000"
                maxLength={9}
                value={form.cep || ''}
                onChange={e => set('cep', e.target.value)}
                onBlur={e => buscarCep(e.target.value)}
              />
              {buscandoCep && <span style={{ fontSize: 11, color: '#8a8a8e' }}>Buscando...</span>}
            </div>
            <div>
              <label className="field-label">Número</label>
              <input className="field-input" placeholder="123" value={form.numero || ''} onChange={e => set('numero', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Logradouro</label>
            <input className="field-input" value={form.logradouro || ''} onChange={e => set('logradouro', e.target.value)} />
          </div>
          <div className="form-row-2" style={{ marginBottom: 12 }}>
            <div>
              <label className="field-label">Bairro</label>
              <input className="field-input" value={form.bairro || ''} onChange={e => set('bairro', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Complemento</label>
              <input className="field-input" placeholder="Apto, Sala..." value={form.complemento || ''} onChange={e => set('complemento', e.target.value)} />
            </div>
          </div>
          <div className="form-row-2">
            <div>
              <label className="field-label">Município</label>
              <input className="field-input" value={form.municipio || ''} onChange={e => set('municipio', e.target.value)} />
            </div>
            <div>
              <label className="field-label">UF</label>
              <select className="field-input campo-select" value={form.uf || ''} onChange={e => set('uf', e.target.value)}>
                <option value="">Selecione</option>
                {UFS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="modal-form-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onFechar}>Cancelar</button>
          <button className="modal-btn modal-btn-confirm" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </div>

      </div>
    </div>
  )
}
