import { useState, useEffect } from 'react'
import { listarClientes, excluirCliente } from '../api'
import { nomeDisplayCliente } from '../utils/config'
import ModalCliente from '../components/ModalCliente'

export default function Clientes() {
  const [clientes,     setClientes]     = useState([])
  const [busca,        setBusca]        = useState('')
  const [modalAberto,  setModalAberto]  = useState(false)
  const [editando,     setEditando]     = useState(null)

  async function carregar() {
    const lista = await listarClientes()
    setClientes(lista)
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir(c) {
    if (!confirm(`Excluir o cliente "${nomeDisplayCliente(c)}"?\nSó é permitido se não houver pedidos vinculados.`)) return
    try {
      await excluirCliente(c.id)
      carregar()
    } catch (e) {
      alert(e.message)
    }
  }

  function handleEditar(c) {
    setEditando(c)
    setModalAberto(true)
  }

  function handleNovoCliente() {
    setEditando(null)
    setModalAberto(true)
  }

  function handleSalvo() {
    setModalAberto(false)
    setEditando(null)
    carregar()
  }

  const filtrados = clientes.filter(c => {
    const q = busca.toLowerCase()
    return (
      (c.nome || '').toLowerCase().includes(q) ||
      (c.razaoSocial || '').toLowerCase().includes(q) ||
      (c.nomeFantasia || '').toLowerCase().includes(q) ||
      (c.cpf || '').includes(q.replace(/\D/g, '')) ||
      (c.cnpj || '').includes(q.replace(/\D/g, ''))
    )
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">Clientes</div>
        <button className="btn-new" onClick={handleNovoCliente}>+ Novo cliente</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="field-input"
          placeholder="Buscar por nome, CPF ou CNPJ..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ maxWidth: 420 }}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nome / Razão Social</th>
              <th>Tipo</th>
              <th>CPF / CNPJ</th>
              <th>Telefone</th>
              <th>Município</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="tabela-vazia">Nenhum cliente encontrado.</td>
              </tr>
            ) : filtrados.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{nomeDisplayCliente(c)}</div>
                  {c.tipoPessoa === 'juridica' && c.nomeFantasia && (
                    <div style={{ fontSize: 12, color: '#8a8a8e' }}>{c.razaoSocial}</div>
                  )}
                </td>
                <td>
                  <span className={`tipo-badge ${c.tipoPessoa === 'juridica' ? 'tipo-juridica' : 'tipo-fisica'}`}>
                    {c.tipoPessoa === 'juridica' ? 'Jurídica' : 'Física'}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: '#8a8a8e' }}>
                  {c.tipoPessoa === 'juridica' ? c.cnpj : c.cpf}
                </td>
                <td>{c.telefone}</td>
                <td>{c.municipio} — {c.uf}</td>
                <td>
                  <div className="acoes">
                    <button className="btn-acao btn-editar" onClick={() => handleEditar(c)}>Editar</button>
                    <button className="btn-acao btn-excluir" onClick={() => handleExcluir(c)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <ModalCliente
          clienteInicial={editando}
          onSalvo={handleSalvo}
          onFechar={() => { setModalAberto(false); setEditando(null) }}
        />
      )}
    </>
  )
}
