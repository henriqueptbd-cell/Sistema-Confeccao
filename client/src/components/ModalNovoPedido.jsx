import { useState, useEffect, useRef } from 'react'
import { buscarClientes } from '../api'
import {
  calcularPrecoPeca, nomeDisplayCliente, formatarMoeda,
  MATERIAIS_CAMISETA, ESTAMPA_TIPOS,
  TAM_ADULTO_MASC, TAM_ADULTO_FEM, TAM_INFANTIL,
} from '../utils/config'
import ModalCliente from './ModalCliente'

const MODELOS_CAMISETA   = ['Manga curta', 'Manga longa', 'Regata']
const MODELOS_SHORT      = ['Jet masculino', 'Jet feminino', 'Futebol']
const MODELOS_CORTAVENTO = ['Com toca', 'Sem toca']
const GOLAS              = ['Gola redonda', 'Gola V', 'Polo', 'Polo esportiva']
const CAPUZ_OPTS         = ['Sem capuz', 'Capuz normal', 'Capuz ninja', 'Balaclava']
const FACES_OPTS         = ['1 face', '2 faces']

function tamanhosVazios() {
  const t = {}
  ;[...TAM_ADULTO_MASC, ...TAM_ADULTO_FEM, ...TAM_INFANTIL].forEach(s => { t[s] = 0 })
  return t
}

function pecaVazia(tipo = 'Camiseta') {
  return {
    tipo,
    modelo:           tipo === 'Camiseta' ? 'Manga curta' : tipo === 'Short' ? 'Jet masculino' : tipo === 'Corta-vento' ? 'Com toca' : '',
    material:         MATERIAIS_CAMISETA[0],
    estampaTipo:      ESTAMPA_TIPOS[0],
    estampaDescricao: '',
    gola:             'Gola redonda',
    punho:            'Sem',
    capuz:            'Sem capuz',
    dedao:            false,
    bolsoZiper:       false,
    faces:            '1 face',
    medidas:          '',
    observacoes:      '',
    desconto:         0,
    imagemLink:       '',
    tamanhos:         tamanhosVazios(),
    quantidade:       1,
    valorUnitario:    0,
  }
}

// ── Pills ────────────────────────────────────────────────────────────────────

function PillGroup({ options, value, onChange, disabledList = [] }) {
  return (
    <div className="opcao-pills">
      {options.map(o => (
        <button
          key={o}
          type="button"
          className={`opcao-pill${value === o ? ' active' : ''}`}
          disabled={disabledList.includes(o)}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

// ── Seletor de tamanhos ──────────────────────────────────────────────────────

function SizeGroup({ label, sizes, tamanhos, onChange }) {
  return (
    <div className="size-group">
      <div className="size-group-label">{label}</div>
      <div className="size-row">
        {sizes.map(s => (
          <div key={s} className="size-item">
            <div className="size-label">{s}</div>
            <input
              type="number"
              className="size-input"
              min="0"
              placeholder="0"
              value={tamanhos[s] || ''}
              onChange={e => onChange(s, parseInt(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Display de preço ─────────────────────────────────────────────────────────

function PrecoDisplay({ peca, config }) {
  if (!config) return null
  const { precoCalculado } = calcularPrecoPeca(peca, config)

  if (!precoCalculado) {
    return (
      <div className="preco-display">
        <div className="preco-linha preco-vazio">Selecione tipo e modelo para calcular o preço</div>
      </div>
    )
  }

  const descontoMaximo = config.descontoMaximo || 0
  const descontoRaw    = peca.desconto || 0
  const excedeu        = descontoRaw > descontoMaximo
  const desconto       = Math.min(descontoRaw, descontoMaximo)
  const precoFinal     = precoCalculado * (1 - desconto / 100)

  const qtd = peca.tipo === 'Bandeira'
    ? (peca.quantidade || 1)
    : Object.values(peca.tamanhos || {}).reduce((s, v) => s + v, 0)

  const descricao = peca.modelo ? `${peca.tipo} · ${peca.modelo}` : peca.tipo

  return (
    <div className="preco-display">
      <div className="preco-breakdown">
        <div className="preco-linha">
          <span>{descricao}</span>
          <span>{formatarMoeda(precoFinal)}</span>
        </div>
        {desconto > 0 && (
          <div className="preco-linha preco-desconto">
            <span>Desconto {desconto}%</span>
            <span>− {formatarMoeda(precoCalculado - precoFinal)}</span>
          </div>
        )}
        {excedeu && (
          <div className="preco-aviso">⚠ Máximo permitido: {descontoMaximo}%</div>
        )}
        {qtd > 0 && (
          <div className="preco-linha preco-card-total">
            <span>{qtd} {qtd === 1 ? 'peça' : 'peças'}</span>
            <span>{formatarMoeda(precoFinal * qtd)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card de produto ──────────────────────────────────────────────────────────

function FormPeca({ peca, index, config, onChange, onRemover }) {
  function set(campo, valor) {
    let nova = { ...peca, [campo]: valor }
    if (campo === 'tipo') nova = pecaVazia(valor)
    // Polo esportiva só disponível em Dry — resetar se necessário
    if (campo === 'material' && valor !== 'Dry' && nova.gola === 'Polo esportiva') {
      nova.gola = 'Gola redonda'
    }
    if (config) {
      const { precoCalculado } = calcularPrecoPeca(nova, config)
      const desc = Math.min(nova.desconto || 0, config.descontoMaximo || 0)
      nova.valorUnitario = precoCalculado * (1 - desc / 100)
    }
    onChange(index, nova)
  }

  function setTamanho(tam, qtd) {
    const nova = { ...peca, tamanhos: { ...peca.tamanhos, [tam]: qtd } }
    onChange(index, nova)
  }

  const isDry       = peca.material === 'Dry'
  const isMangaLonga = peca.tipo === 'Camiseta' && peca.modelo === 'Manga longa'

  return (
    <div className="produto-card">

      {/* Tipo + remover */}
      <div className="produto-card-header">
        <div className="tipo-pills">
          {['Camiseta', 'Short', 'Corta-vento', 'Bandeira'].map(t => (
            <button
              key={t}
              type="button"
              className={`tipo-pill${peca.tipo === t ? ' active' : ''}`}
              onClick={() => set('tipo', t)}
            >
              {t}
            </button>
          ))}
        </div>
        <button type="button" className="btn-remove-produto" onClick={() => onRemover(index)}>
          × Remover
        </button>
      </div>

      {/* ── Camiseta ── */}
      {peca.tipo === 'Camiseta' && (
        <div className="tipo-section">
          <div className="opcao-group">
            <label className="field-label">Material</label>
            <PillGroup options={MATERIAIS_CAMISETA} value={peca.material} onChange={v => set('material', v)} />
          </div>
          <div className="opcao-group">
            <label className="field-label">Modelo</label>
            <PillGroup options={MODELOS_CAMISETA} value={peca.modelo} onChange={v => set('modelo', v)} />
          </div>
          <div className="opcao-group">
            <label className="field-label">Gola</label>
            <PillGroup
              options={GOLAS}
              value={peca.gola}
              onChange={v => set('gola', v)}
              disabledList={isDry ? [] : ['Polo esportiva']}
            />
            {!isDry && <div className="polo-esp-aviso">⚠️ Polo esportiva disponível apenas no material Dry</div>}
          </div>
          {isMangaLonga && (
            <>
              <div className="opcao-group" style={{ marginTop: 14 }}>
                <label className="field-label">Punho</label>
                <PillGroup options={['Com', 'Sem']} value={peca.punho} onChange={v => set('punho', v)} />
              </div>
              <div className="opcao-group">
                <label className="field-label">Capuz / Balaclava</label>
                <PillGroup options={CAPUZ_OPTS} value={peca.capuz} onChange={v => set('capuz', v)} />
              </div>
              <div className="opcao-group">
                <label className="field-label field-checkbox">
                  <input type="checkbox" checked={!!peca.dedao} onChange={e => set('dedao', e.target.checked)} />
                  {' '}Encaixe de dedão
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Short ── */}
      {peca.tipo === 'Short' && (
        <div className="tipo-section">
          <div className="opcao-group">
            <label className="field-label">Modelo</label>
            <PillGroup options={MODELOS_SHORT} value={peca.modelo} onChange={v => set('modelo', v)} />
          </div>
          <div className="opcao-group">
            <label className="field-label field-checkbox">
              <input type="checkbox" checked={!!peca.bolsoZiper} onChange={e => set('bolsoZiper', e.target.checked)} />
              {' '}Bolso com zíper
            </label>
          </div>
        </div>
      )}

      {/* ── Corta-vento ── */}
      {peca.tipo === 'Corta-vento' && (
        <div className="tipo-section">
          <div className="opcao-group">
            <label className="field-label">Modelo</label>
            <PillGroup options={MODELOS_CORTAVENTO} value={peca.modelo} onChange={v => set('modelo', v)} />
          </div>
        </div>
      )}

      {/* ── Bandeira ── */}
      {peca.tipo === 'Bandeira' && (
        <div className="tipo-section">
          <div className="opcao-group">
            <label className="field-label">Material</label>
            <PillGroup options={MATERIAIS_CAMISETA} value={peca.material} onChange={v => set('material', v)} />
          </div>
          <div className="opcao-row-2">
            <div>
              <label className="field-label">Medidas (máx. 90×70cm)</label>
              <input
                type="text"
                className="field-input"
                placeholder="ex: 90cm x 70cm"
                value={peca.medidas || ''}
                onChange={e => set('medidas', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Faces</label>
              <PillGroup options={FACES_OPTS} value={peca.faces} onChange={v => set('faces', v)} />
            </div>
          </div>
          <div className="opcao-group">
            <label className="field-label">Observações</label>
            <textarea
              className="field-input campo-textarea"
              rows="2"
              placeholder="Detalhes específicos..."
              value={peca.observacoes || ''}
              onChange={e => set('observacoes', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Estampa ── */}
      <div className="estampa-section">
        <label className="field-label">Estampa</label>
        <PillGroup options={ESTAMPA_TIPOS} value={peca.estampaTipo} onChange={v => set('estampaTipo', v)} />
        {peca.estampaTipo === 'Personalizado' && (
          <div className="estampa-cond" style={{ marginTop: 10 }}>
            <label className="field-label">Descrição e posicionamento</label>
            <textarea
              className="field-input campo-textarea"
              rows="2"
              placeholder="ex: Frente e costas, estampa no braço esquerdo…"
              value={peca.estampaDescricao || ''}
              onChange={e => set('estampaDescricao', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ── Tamanhos ── */}
      <div className="tamanhos-section">
        <label className="field-label">Tamanhos e quantidades</label>
        {peca.tipo !== 'Bandeira' ? (
          <>
            <SizeGroup
              label={peca.tipo === 'Corta-vento' ? 'Adulto' : 'Masculino'}
              sizes={TAM_ADULTO_MASC}
              tamanhos={peca.tamanhos}
              onChange={setTamanho}
            />
            {peca.tipo !== 'Corta-vento' && (
              <SizeGroup
                label="Feminino / Babylook"
                sizes={TAM_ADULTO_FEM}
                tamanhos={peca.tamanhos}
                onChange={setTamanho}
              />
            )}
            <SizeGroup label="Infantil" sizes={TAM_INFANTIL} tamanhos={peca.tamanhos} onChange={setTamanho} />
          </>
        ) : (
          <div className="size-group">
            <label className="field-label">Quantidade</label>
            <input
              type="number"
              className="field-input"
              min="1"
              value={peca.quantidade || 1}
              style={{ maxWidth: 120 }}
              onChange={e => set('quantidade', parseInt(e.target.value) || 1)}
            />
          </div>
        )}
      </div>

      {/* ── Preço ── */}
      <div className="preco-section">
        <PrecoDisplay peca={peca} config={config} />
        <div className="produto-desconto-wrap" style={{ marginTop: 10 }}>
          <label className="field-label">Desconto (%)</label>
          <input
            type="number"
            className={`field-input preco-desconto-input${(peca.desconto || 0) > (config?.descontoMaximo || 0) ? ' campo-erro' : ''}`}
            min="0"
            max="100"
            step="1"
            placeholder="0"
            value={peca.desconto || ''}
            onChange={e => set('desconto', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* ── Link ── */}
      <div className="produto-footer">
        <label className="field-label">Link de referência (imagem)</label>
        <input
          type="url"
          className="field-input"
          placeholder="Cole aqui o link da imagem (ex: OneDrive, Google Fotos…)"
          value={peca.imagemLink || ''}
          onChange={e => set('imagemLink', e.target.value)}
        />
      </div>
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────

export default function ModalNovoPedido({ configPrecos, onSalvar, onFechar }) {
  const [busca,        setBusca]        = useState('')
  const [sugestoes,    setSugestoes]    = useState([])
  const [clienteSel,   setClienteSel]   = useState(null)
  const [prazoISO,     setPrazoISO]     = useState('')
  const [pecas,        setPecas]        = useState([pecaVazia()])
  const [salvando,     setSalvando]     = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!busca.trim() || clienteSel) { setSugestoes([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try { setSugestoes(await buscarClientes(busca.trim())) }
      catch { setSugestoes([]) }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [busca, clienteSel])

  function selecionarCliente(c) {
    setClienteSel(c)
    setBusca(nomeDisplayCliente(c))
    setSugestoes([])
  }

  function atualizarPeca(index, nova) {
    setPecas(ps => ps.map((p, i) => i === index ? nova : p))
  }

  function removerPeca(index) {
    setPecas(ps => ps.filter((_, i) => i !== index))
  }

  async function salvar() {
    if (!clienteSel)       { alert('Selecione um cliente.'); return }
    if (!prazoISO)         { alert('Informe o prazo de entrega.'); return }
    if (pecas.length === 0) { alert('Adicione ao menos uma peça.'); return }

    const prazoFormatado = new Date(prazoISO + 'T12:00:00').toLocaleDateString('pt-BR')

    const pecasFinais = pecas.map(p => {
      const { precoCalculado } = configPrecos ? calcularPrecoPeca(p, configPrecos) : { precoCalculado: 0 }
      const desc = Math.min(p.desconto || 0, configPrecos?.descontoMaximo || 0)
      const precoFinal = precoCalculado * (1 - desc / 100)
      return { ...p, precoCalculado, descontoPercentual: desc, valorUnitario: precoFinal }
    })

    const dados = {
      clienteId: clienteSel.id,
      cliente:   nomeDisplayCliente(clienteSel),
      telefone:  clienteSel.telefone || '',
      prazo:     prazoFormatado,
      prazoISO,
      pecas:     pecasFinais,
    }

    setSalvando(true)
    try { await onSalvar(dados) }
    finally { setSalvando(false) }
  }

  const totalGeral = pecas.reduce((acc, p) => {
    const { precoCalculado } = configPrecos ? calcularPrecoPeca(p, configPrecos) : { precoCalculado: 0 }
    const desc = Math.min(p.desconto || 0, configPrecos?.descontoMaximo || 0)
    const qtd  = p.tipo === 'Bandeira'
      ? (p.quantidade || 1)
      : Object.values(p.tamanhos || {}).reduce((s, v) => s + v, 0)
    return acc + precoCalculado * (1 - desc / 100) * qtd
  }, 0)

  return (
    <>
      <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && onFechar()}>
        <div className="modal-form-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          <div className="modal-form-header">
            <div className="modal-form-title">Novo Pedido</div>
            <button className="modal-form-close" onClick={onFechar}>✕</button>
          </div>

          {/* ── Dados do pedido ── */}
          <div className="form-section">
            <div className="form-section-title">Dados do pedido</div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Cliente *</label>
              {clienteSel ? (
                <div className="cliente-selecionado">
                  <span className="cliente-sel-nome">{nomeDisplayCliente(clienteSel)}</span>
                  <button
                    type="button"
                    className="btn-trocar-cliente"
                    onClick={() => { setClienteSel(null); setBusca('') }}
                  >
                    × Trocar
                  </button>
                </div>
              ) : (
                <div className="cliente-search-wrap">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Buscar por nome, CPF ou CNPJ..."
                    autoComplete="off"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                  {sugestoes.length > 0 && (
                    <div className="cliente-dropdown">
                      {sugestoes.map(c => (
                        <div key={c.id} className="cliente-option" onClick={() => selecionarCliente(c)}>
                          <div className="cliente-option-nome">{nomeDisplayCliente(c)}</div>
                          {c.telefone && <div className="cliente-option-detalhe">{c.telefone}</div>}
                        </div>
                      ))}
                      <div className="cliente-option-novo" onClick={() => setModalCliente(true)}>
                        + Novo cliente
                      </div>
                    </div>
                  )}
                  {busca.trim() && sugestoes.length === 0 && (
                    <div className="cliente-dropdown">
                      <div className="cliente-option-novo" onClick={() => setModalCliente(true)}>
                        + Cadastrar "{busca}" como novo cliente
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="field-label">Previsão de entrega *</label>
              <input
                type="date"
                className="field-input"
                value={prazoISO}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setPrazoISO(e.target.value)}
                style={{ maxWidth: 220 }}
              />
            </div>
          </div>

          {/* ── Produtos ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-title">Produtos</div>
            </div>

            <div id="produtos-form-list">
              {pecas.map((p, i) => (
                <FormPeca
                  key={i}
                  index={i}
                  peca={p}
                  config={configPrecos}
                  onChange={atualizarPeca}
                  onRemover={removerPeca}
                />
              ))}
            </div>

            <button className="btn-add-peca" onClick={() => setPecas(ps => [...ps, pecaVazia()])}>
              + Adicionar produto
            </button>

            {totalGeral > 0 && (
              <div className="pedido-total-footer">
                <span className="pedido-total-label">Total do pedido</span>
                <span className="pedido-total-valor">{formatarMoeda(totalGeral)}</span>
              </div>
            )}
          </div>

          <div className="modal-form-actions">
            <button className="modal-btn modal-btn-cancel" onClick={onFechar}>Cancelar</button>
            <button className="modal-btn modal-btn-confirm" onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar pedido'}
            </button>
          </div>

        </div>
      </div>

      {modalCliente && (
        <ModalCliente
          clienteInicial={null}
          onSalvo={async () => {
            setModalCliente(false)
            if (busca.trim()) {
              try { setSugestoes(await buscarClientes(busca.trim())) } catch { /* ignore */ }
            }
          }}
          onFechar={() => setModalCliente(false)}
        />
      )}
    </>
  )
}
