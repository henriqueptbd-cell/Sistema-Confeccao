import { useState, useEffect } from 'react'
import {
  buscarConfigPrecos, salvarConfigPrecos,
  listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario,
} from '../api'
import { formatarMoeda } from '../utils/config'

export default function Configuracoes() {
  const [aba,          setAba]          = useState('precos')
  const [config,       setConfig]       = useState(null)
  const [usuarios,     setUsuarios]     = useState([])
  const [salvando,     setSalvando]     = useState(false)
  const [msgSalvo,     setMsgSalvo]     = useState(false)

  // Form novo usuário
  const [formUser,     setFormUser]     = useState(null)

  useEffect(() => {
    buscarConfigPrecos().then(setConfig)
    listarUsuarios().then(setUsuarios)
  }, [])

  async function salvarPrecos() {
    setSalvando(true)
    try {
      await salvarConfigPrecos(config)
      setMsgSalvo(true)
      setTimeout(() => setMsgSalvo(false), 2000)
    } finally {
      setSalvando(false)
    }
  }

  function setPrecoBase(tipo, modelo, valor) {
    setConfig(c => ({
      ...c,
      precoBase: {
        ...c.precoBase,
        [tipo]: typeof c.precoBase[tipo] === 'object'
          ? { ...c.precoBase[tipo], [modelo]: parseFloat(valor) || 0 }
          : parseFloat(valor) || 0,
      },
    }))
  }

  function setAdicional(chave, valor) {
    setConfig(c => ({
      ...c,
      adicionais: { ...c.adicionais, [chave]: parseFloat(valor) || 0 },
    }))
  }

  async function handleExcluirUser(u) {
    if (!confirm(`Excluir o usuário "${u.nome}"?`)) return
    await excluirUsuario(u.id)
    listarUsuarios().then(setUsuarios)
  }

  async function handleSalvarUser() {
    setSalvando(true)
    try {
      if (formUser.id) await atualizarUsuario(formUser.id, formUser)
      else             await criarUsuario(formUser)
      setFormUser(null)
      listarUsuarios().then(setUsuarios)
    } catch (e) {
      alert(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (!config) return <div className="page-sub" style={{ padding: 40 }}>Carregando...</div>

  return (
    <>
      <div className="page-header">
        <div className="page-title">Configurações</div>
      </div>

      {/* Abas */}
      <div className="filters" style={{ marginBottom: 24 }}>
        <button className={`filter-btn${aba === 'precos' ? ' active' : ''}`}    onClick={() => setAba('precos')}>Tabela de preços</button>
        <button className={`filter-btn${aba === 'usuarios' ? ' active' : ''}`}  onClick={() => setAba('usuarios')}>Usuários</button>
      </div>

      {/* ── Preços ── */}
      {aba === 'precos' && (
        <div className="section-card" style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Preços base</div>
            <button className="btn-new" onClick={salvarPrecos} disabled={salvando}>
              {salvando ? 'Salvando...' : msgSalvo ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>

          {config.precoBase && Object.entries(config.precoBase).map(([tipo, val]) => (
            <div key={tipo} style={{ marginBottom: 20 }}>
              <div className="form-section-title">{tipo}</div>
              {typeof val === 'object'
                ? Object.entries(val).map(([modelo, preco]) => (
                    <div key={modelo} className="form-row-2" style={{ marginBottom: 8 }}>
                      <div>
                        <label className="field-label">{modelo}</label>
                        <input type="number" className="field-input" step="0.01" value={preco} onChange={e => setPrecoBase(tipo, modelo, e.target.value)} />
                      </div>
                    </div>
                  ))
                : (
                  <div style={{ marginBottom: 8, maxWidth: 200 }}>
                    <input type="number" className="field-input" step="0.01" value={val} onChange={e => setPrecoBase(tipo, null, e.target.value)} />
                  </div>
                )
              }
            </div>
          ))}

          {config.adicionais && (
            <>
              <div className="form-section-title" style={{ marginTop: 8 }}>Adicionais</div>
              <div className="form-row-2">
                {Object.entries(config.adicionais).map(([chave, valor]) => (
                  <div key={chave}>
                    <label className="field-label">{chave}</label>
                    <input type="number" className="field-input" step="0.01" value={valor} onChange={e => setAdicional(chave, e.target.value)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {config.descontoMaximo !== undefined && (
            <div style={{ marginTop: 16, maxWidth: 240 }}>
              <label className="field-label">Desconto máximo (%)</label>
              <input
                type="number"
                className="field-input"
                min="0"
                max="100"
                value={config.descontoMaximo}
                onChange={e => setConfig(c => ({ ...c, descontoMaximo: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Usuários ── */}
      {aba === 'usuarios' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-new" onClick={() => setFormUser({ nome: '', email: '', senha: '', role: 'funcionaria_producao' })}>
              + Novo usuário
            </button>
          </div>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`tipo-badge ${u.role === 'admin' ? 'tipo-juridica' : 'tipo-fisica'}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Produção'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <button className="btn-acao btn-editar" onClick={() => setFormUser({ ...u, senha: '' })}>Editar</button>
                        <button className="btn-acao btn-excluir" onClick={() => handleExcluirUser(u)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {formUser && (
            <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && setFormUser(null)}>
              <div className="modal-form-container">
                <div className="modal-form-header">
                  <div className="modal-form-title">{formUser.id ? 'Editar Usuário' : 'Novo Usuário'}</div>
                  <button className="modal-form-close" onClick={() => setFormUser(null)}>✕</button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Nome *</label>
                  <input type="text" className="field-input" value={formUser.nome} onChange={e => setFormUser(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">E-mail *</label>
                  <input type="email" className="field-input" value={formUser.email} onChange={e => setFormUser(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Senha {formUser.id ? '(deixe vazio para não alterar)' : '*'}</label>
                  <input type="password" className="field-input" value={formUser.senha || ''} onChange={e => setFormUser(f => ({ ...f, senha: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Perfil *</label>
                  <select className="field-input campo-select" value={formUser.role} onChange={e => setFormUser(f => ({ ...f, role: e.target.value }))}>
                    <option value="admin">Administrador</option>
                    <option value="funcionaria_producao">Produção</option>
                  </select>
                </div>

                <div className="modal-form-actions">
                  <button className="modal-btn modal-btn-cancel" onClick={() => setFormUser(null)}>Cancelar</button>
                  <button className="modal-btn modal-btn-confirm" onClick={handleSalvarUser} disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
