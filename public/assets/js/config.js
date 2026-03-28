const ETAPAS = [
  'Entrada do pedido',
  'Montagem da estampa',
  'Impressão',
  'Corte',
  'Estampa',
  'Triagem para costura',
  'Costura',
  'Arremate',
  'Conferência',
  'Pronto para retirada'
];

// ---- Catálogo de produtos ----
const MATERIAIS_CAMISETA = ['Dry', 'Confort UV50', 'Crepe', 'PV'];
const ESTAMPA_TIPOS      = ['Personalizado', 'Olívia', 'Amaury'];
const TAM_ADULTO_MASC    = ['P', 'M', 'G', 'GG', 'XG', 'EXG'];
const TAM_ADULTO_FEM     = ['BLP', 'BLM', 'BLG', 'BLGG', 'BLXG'];
const TAM_INFANTIL       = ['2', '4', '6', '8', '10', '12', '14', '16'];

const ETAPA_PILL = {
  'Entrada do pedido':    'pill-blue',
  'Montagem da estampa':  'pill-purple',
  'Impressão':            'pill-orange',
  'Corte':                'pill-red',
  'Estampa':              'pill-orange',
  'Triagem para costura': 'pill-blue',
  'Costura':              'pill-blue',
  'Arremate':             'pill-purple',
  'Conferência':          'pill-blue',
  'Pronto para retirada': 'pill-green'
};

function isAtrasado(pedido) {
  if (pedido.status === 'concluido') return false;
  return new Date(pedido.prazoISO + 'T00:00:00') <= new Date();
}

function isProximoPrazo(pedido) {
  if (pedido.status === 'concluido') return false;
  const diff = (new Date(pedido.prazoISO + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function totalPedido(pedido) {
  return pedido.pecas.reduce((acc, p) => {
    if (p.tipo) {
      const qtd = p.tamanhos
        ? Object.values(p.tamanhos).reduce((s, v) => s + v, 0)
        : (p.quantidade || 1);
      return acc + (p.valorUnitario || 0) * qtd;
    }
    return acc + (p.valor || 0);
  }, 0);
}

function totalPecas(pedido) {
  return pedido.pecas.reduce((acc, p) => {
    if (p.tipo) {
      return acc + (p.tamanhos
        ? Object.values(p.tamanhos).reduce((s, v) => s + v, 0)
        : (p.quantidade || 1));
    }
    return acc + 1;
  }, 0);
}

function formatarMoeda(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// ---- Precificação dinâmica ----

function calcularPrecoPeca(peca, config) {
  const pb = config.precoBase  || {};
  const ad = config.adicionais || {};
  const detalhes = [];
  let precoBase = 0;

  if (peca.tipo === 'Bandeira') {
    precoBase = typeof pb.Bandeira === 'number' ? pb.Bandeira : 0;
    if (precoBase) detalhes.push({ label: 'Bandeira', valor: precoBase });
  } else if (pb[peca.tipo] && peca.modelo) {
    precoBase = pb[peca.tipo][peca.modelo] || 0;
    if (precoBase) detalhes.push({ label: `${peca.tipo} · ${peca.modelo}`, valor: precoBase });
  }

  const extra = (cond, label, chave) => {
    if (cond && ad[chave]) {
      detalhes.push({ label: `+ ${label}`, valor: ad[chave], isExtra: true });
      return ad[chave];
    }
    return 0;
  };

  let extras = 0;
  extras += extra(peca.tipo === 'Camiseta' && peca.modelo === 'Manga longa' && peca.punho === 'Com', 'Punho', 'punho');
  extras += extra(peca.dedao,                             'Dedão',          'dedao');
  extras += extra(peca.capuz === 'Capuz normal',          'Capuz normal',   'capuzNormal');
  extras += extra(peca.capuz === 'Capuz ninja',           'Capuz ninja',    'capuzNinja');
  extras += extra(peca.capuz === 'Balaclava',             'Balaclava',      'balaclava');
  extras += extra(peca.bolsoZiper,                        'Bolso c/ zíper', 'bolsoZiper');
  extras += extra(peca.faces === '2 faces',               '2ª face',        'segundaFace');

  return { precoCalculado: precoBase + extras, detalhes };
}

// ---- Sidebar: mostrar Configurações para admin ----

document.addEventListener('DOMContentLoaded', () => {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    if (usuario.role === 'admin') {
      const navConfig = document.getElementById('nav-config');
      if (navConfig) navConfig.hidden = false;
    }
  } catch (_) {}
});

function renderTimeline(pedido, soLeitura = false) {
  return pedido.etapas.map(etapa => {
    const classe = etapa.concluida ? 'step-done' : 'step-pending';
    const icone  = etapa.concluida ? '✓' : '○';
    const dataEl = etapa.concluida
      ? `<div class="step-date">${etapa.concluidaEm || ''}</div>`
      : '';
    const linha = etapa.ordem < pedido.etapas.length
      ? '<div class="step-line"></div>'
      : '';
    const btnConcluir = !soLeitura && !etapa.concluida && pedido.status !== 'concluido'
      ? `<button class="step-btn-concluir" data-ordem="${etapa.ordem}">✓ Concluir</button>`
      : '';

    return `
      <div class="step ${classe}">
        ${linha}
        <div class="step-icon">${icone}</div>
        <div class="step-body">
          <div class="step-name">${etapa.nome}</div>
          ${dataEl}
        </div>
        ${btnConcluir}
      </div>`;
  }).join('');
}
