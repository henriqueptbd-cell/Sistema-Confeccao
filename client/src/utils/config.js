// Constantes e funções utilitárias do sistema

export const ETAPAS = [
  'Entrada do pedido',
  'Montagem da estampa',
  'Impressão',
  'Corte',
  'Estampa',
  'Triagem para costura',
  'Costura',
  'Arremate',
  'Conferência',
  'Pronto para retirada',
]

export const ETAPA_PILL = {
  'Entrada do pedido':    'pill-blue',
  'Montagem da estampa':  'pill-purple',
  'Impressão':            'pill-orange',
  'Corte':                'pill-red',
  'Estampa':              'pill-orange',
  'Triagem para costura': 'pill-blue',
  'Costura':              'pill-blue',
  'Arremate':             'pill-purple',
  'Conferência':          'pill-blue',
  'Pronto para retirada': 'pill-green',
}

export const MATERIAIS_CAMISETA = ['Dry', 'Confort UV50', 'Crepe', 'PV']
export const ESTAMPA_TIPOS      = ['Personalizado', 'Olívia', 'Amaury']
export const TAM_ADULTO_MASC    = ['P', 'M', 'G', 'GG', 'XG', 'EXG']
export const TAM_ADULTO_FEM     = ['BLP', 'BLM', 'BLG', 'BLGG', 'BLXG']
export const TAM_INFANTIL       = ['2', '4', '6', '8', '10', '12', '14', '16']

export function isAtrasado(pedido) {
  if (pedido.status === 'concluido') return false
  return new Date(pedido.prazoISO + 'T00:00:00') <= new Date()
}

export function isProximoPrazo(pedido) {
  if (pedido.status === 'concluido') return false
  const diff = (new Date(pedido.prazoISO + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 2
}

export function totalPedido(pedido) {
  return pedido.pecas.reduce((acc, p) => {
    if (p.tipo) {
      const qtd = p.tamanhos
        ? Object.values(p.tamanhos).reduce((s, v) => s + v, 0)
        : (p.quantidade || 1)
      return acc + (p.valorUnitario || 0) * qtd
    }
    return acc + (p.valor || 0)
  }, 0)
}

export function totalPecas(pedido) {
  return pedido.pecas.reduce((acc, p) => {
    if (p.tipo) {
      return acc + (p.tamanhos
        ? Object.values(p.tamanhos).reduce((s, v) => s + v, 0)
        : (p.quantidade || 1))
    }
    return acc + 1
  }, 0)
}

export function formatarMoeda(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',')
}

export function nomeDisplayCliente(c) {
  if (!c) return ''
  return c.tipoPessoa === 'juridica'
    ? (c.nomeFantasia || c.razaoSocial || '')
    : (c.nome || '')
}

export function calcularPrecoPeca(peca, config) {
  const pb = config.precoBase  || {}
  const ad = config.adicionais || {}
  const detalhes = []
  let precoBase = 0

  if (peca.tipo === 'Bandeira') {
    precoBase = typeof pb.Bandeira === 'number' ? pb.Bandeira : 0
    if (precoBase) detalhes.push({ label: 'Bandeira', valor: precoBase })
  } else if (pb[peca.tipo] && peca.modelo) {
    precoBase = pb[peca.tipo][peca.modelo] || 0
    if (precoBase) detalhes.push({ label: `${peca.tipo} · ${peca.modelo}`, valor: precoBase })
  }

  const extra = (cond, label, chave) => {
    if (cond && ad[chave]) {
      detalhes.push({ label: `+ ${label}`, valor: ad[chave], isExtra: true })
      return ad[chave]
    }
    return 0
  }

  let extras = 0
  extras += extra(peca.tipo === 'Camiseta' && peca.modelo === 'Manga longa' && peca.punho === 'Com', 'Punho', 'punho')
  extras += extra(peca.dedao,                            'Dedão',          'dedao')
  extras += extra(peca.capuz === 'Capuz normal',         'Capuz normal',   'capuzNormal')
  extras += extra(peca.capuz === 'Capuz ninja',          'Capuz ninja',    'capuzNinja')
  extras += extra(peca.capuz === 'Balaclava',            'Balaclava',      'balaclava')
  extras += extra(peca.bolsoZiper,                       'Bolso c/ zíper', 'bolsoZiper')
  extras += extra(peca.faces === '2 faces',              '2ª face',        'segundaFace')

  return { precoCalculado: precoBase + extras, detalhes }
}
