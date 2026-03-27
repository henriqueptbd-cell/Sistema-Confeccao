/* ========================================
   FCamargo — Dados de demonstração
   Substitua por chamadas à API quando
   o banco de dados estiver pronto.
   ======================================== */

const ETAPAS = [
  "Entrada do pedido",
  "Montagem da estampa",
  "Impressão",
  "Corte",
  "Estampa",
  "Triagem para costura",
  "Costura",
  "Arremate",
  "Conferência",
  "Pronto para retirada"
];

const ETAPA_PILL = {
  "Entrada do pedido":    "pill-blue",
  "Montagem da estampa":  "pill-purple",
  "Impressão":            "pill-orange",
  "Corte":                "pill-red",
  "Estampa":              "pill-orange",
  "Triagem para costura": "pill-blue",
  "Costura":              "pill-blue",
  "Arremate":             "pill-purple",
  "Conferência":          "pill-blue",
  "Pronto para retirada": "pill-green"
};

const pedidos = [
  {
    id: 1023,
    cliente: "João Silva",
    telefone: "(12) 99999-0000",
    dataEntrada: "10/03/2026",
    prazo: "28/03/2026",
    prazoISO: "2026-03-28",
    etapaAtual: 7,
    status: "producao",
    pecas: [
      { descricao: "Camiseta G",  detalhe: "Manga curta · João",  estampa: "Estampa A", valor: 45.00 },
      { descricao: "Camiseta M",  detalhe: "Manga longa · Maria", estampa: "Estampa A", valor: 48.00 },
      { descricao: "Camiseta GG", detalhe: "Manga curta · Pedro", estampa: "Estampa B", valor: 45.00 },
      { descricao: "Camiseta P",  detalhe: "Regata · Ana",        estampa: "Estampa A", valor: 40.00 }
    ],
    datas: { 1:"10/03/2026", 2:"12/03/2026", 3:"14/03/2026", 4:"16/03/2026", 5:"18/03/2026", 6:"20/03/2026" }
  },
  {
    id: 1022,
    cliente: "Empresa XYZ",
    telefone: "(11) 3333-4444",
    dataEntrada: "18/03/2026",
    prazo: "27/03/2026",
    prazoISO: "2026-03-27",
    etapaAtual: 3,
    status: "producao",
    pecas: [
      { descricao: "Camiseta P",  detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 },
      { descricao: "Camiseta M",  detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 },
      { descricao: "Camiseta G",  detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 },
      { descricao: "Camiseta GG", detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 },
      { descricao: "Camiseta G",  detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 },
      { descricao: "Camiseta M",  detalhe: "Polo · Uniforme",   estampa: "Logo XYZ", valor: 52.00 }
    ],
    datas: { 1:"18/03/2026", 2:"20/03/2026" }
  },
  {
    id: 1021,
    cliente: "Maria Oliveira",
    telefone: "(12) 98888-1234",
    dataEntrada: "08/03/2026",
    prazo: "30/03/2026",
    prazoISO: "2026-03-30",
    etapaAtual: 8,
    status: "producao",
    pecas: [
      { descricao: "Camiseta P",  detalhe: "Manga curta · Maria",  estampa: "Floral",  valor: 45.00 },
      { descricao: "Camiseta M",  detalhe: "Manga curta · Maria",  estampa: "Floral",  valor: 45.00 },
      { descricao: "Regata G",    detalhe: "Sem manga · Maria",    estampa: "Floral",  valor: 38.00 }
    ],
    datas: { 1:"08/03/2026", 2:"10/03/2026", 3:"12/03/2026", 4:"14/03/2026", 5:"16/03/2026", 6:"18/03/2026", 7:"22/03/2026" }
  },
  {
    id: 1020,
    cliente: "Grupo Atletismo",
    telefone: "(12) 97777-5678",
    dataEntrada: "01/03/2026",
    prazo: "25/03/2026",
    prazoISO: "2026-03-25",
    etapaAtual: 10,
    status: "concluido",
    pecas: [
      { descricao: "Camiseta P",   detalhe: "Regata · Time A", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta M",   detalhe: "Regata · Time A", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta G",   detalhe: "Regata · Time A", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta GG",  detalhe: "Regata · Time A", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta G",   detalhe: "Regata · Time B", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta M",   detalhe: "Regata · Time B", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta P",   detalhe: "Regata · Time B", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta GGG", detalhe: "Regata · Time B", estampa: "Atletismo", valor: 48.00 },
      { descricao: "Camiseta M",   detalhe: "Regata · Time C", estampa: "Atletismo", valor: 42.00 },
      { descricao: "Camiseta G",   detalhe: "Regata · Time C", estampa: "Atletismo", valor: 42.00 }
    ],
    datas: { 1:"01/03/2026", 2:"03/03/2026", 3:"05/03/2026", 4:"08/03/2026", 5:"10/03/2026", 6:"13/03/2026", 7:"16/03/2026", 8:"19/03/2026", 9:"22/03/2026", 10:"24/03/2026" }
  },
  {
    id: 1019,
    cliente: "Carlos Mendes",
    telefone: "(12) 96666-9012",
    dataEntrada: "15/03/2026",
    prazo: "26/03/2026",
    prazoISO: "2026-03-26",
    etapaAtual: 4,
    status: "producao",
    pecas: [
      { descricao: "Camiseta G",   detalhe: "Manga longa · Carlos", estampa: "Estampa C", valor: 48.00 },
      { descricao: "Camiseta GG",  detalhe: "Manga longa · Carlos", estampa: "Estampa C", valor: 48.00 },
      { descricao: "Camiseta M",   detalhe: "Manga curta · Ana",    estampa: "Estampa C", valor: 45.00 },
      { descricao: "Regata P",     detalhe: "Sem manga · Bia",      estampa: "Estampa C", valor: 38.00 },
      { descricao: "Camiseta P",   detalhe: "Manga curta · Tom",    estampa: "Estampa D", valor: 45.00 }
    ],
    datas: { 1:"15/03/2026", 2:"18/03/2026", 3:"21/03/2026" }
  },
  {
    id: 1018,
    cliente: "Loja Prime",
    telefone: "(11) 4444-5555",
    dataEntrada: "12/03/2026",
    prazo: "01/04/2026",
    prazoISO: "2026-04-01",
    etapaAtual: 9,
    status: "producao",
    pecas: [
      { descricao: "Camiseta P",  detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta M",  detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta G",  detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta GG", detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta M",  detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta G",  detalhe: "Estilo social · Loja", estampa: "Prime Logo", valor: 55.00 },
      { descricao: "Camiseta P",  detalhe: "Estilo casual · Loja", estampa: "Prime Mini", valor: 48.00 },
      { descricao: "Camiseta M",  detalhe: "Estilo casual · Loja", estampa: "Prime Mini", valor: 48.00 }
    ],
    datas: { 1:"12/03/2026", 2:"14/03/2026", 3:"17/03/2026", 4:"19/03/2026", 5:"21/03/2026", 6:"23/03/2026", 7:"24/03/2026", 8:"25/03/2026" }
  },
  {
    id: 1017,
    cliente: "Ana Costa",
    telefone: "(12) 95555-3456",
    dataEntrada: "20/03/2026",
    prazo: "03/04/2026",
    prazoISO: "2026-04-03",
    etapaAtual: 5,
    status: "producao",
    pecas: [
      { descricao: "Camiseta M", detalhe: "Manga curta · Ana",  estampa: "Aquarela", valor: 50.00 },
      { descricao: "Regata M",   detalhe: "Sem manga · Ana",    estampa: "Aquarela", valor: 42.00 }
    ],
    datas: { 1:"20/03/2026", 2:"22/03/2026", 3:"24/03/2026", 4:"25/03/2026" }
  },
  {
    id: 1016,
    cliente: "Escola Municipal",
    telefone: "(12) 3211-0000",
    dataEntrada: "01/02/2026",
    prazo: "20/03/2026",
    prazoISO: "2026-03-20",
    etapaAtual: 10,
    status: "concluido",
    pecas: [
      { descricao: "Camiseta P",   detalhe: "Uniforme · Turma A", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta M",   detalhe: "Uniforme · Turma A", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta G",   detalhe: "Uniforme · Turma A", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta P",   detalhe: "Uniforme · Turma B", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta M",   detalhe: "Uniforme · Turma B", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta G",   detalhe: "Uniforme · Turma B", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta GG",  detalhe: "Uniforme · Turma B", estampa: "Escola",  valor: 42.00 },
      { descricao: "Camiseta P",   detalhe: "Uniforme · Turma C", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta M",   detalhe: "Uniforme · Turma C", estampa: "Escola",  valor: 38.00 },
      { descricao: "Camiseta G",   detalhe: "Uniforme · Turma C", estampa: "Escola",  valor: 38.00 },
      { descricao: "Regata G",     detalhe: "Ed. Física · Todos", estampa: "Escola",  valor: 32.00 },
      { descricao: "Regata M",     detalhe: "Ed. Física · Todos", estampa: "Escola",  valor: 32.00 },
      { descricao: "Regata P",     detalhe: "Ed. Física · Todos", estampa: "Escola",  valor: 32.00 }
    ],
    datas: { 1:"01/02/2026", 2:"05/02/2026", 3:"10/02/2026", 4:"15/02/2026", 5:"20/02/2026", 6:"25/02/2026", 7:"02/03/2026", 8:"08/03/2026", 9:"13/03/2026", 10:"18/03/2026" }
  },
  {
    id: 1015,
    cliente: "Pedro Alves",
    telefone: "(12) 94444-7890",
    dataEntrada: "24/03/2026",
    prazo: "05/04/2026",
    prazoISO: "2026-04-05",
    etapaAtual: 2,
    status: "producao",
    pecas: [
      { descricao: "Camiseta G",  detalhe: "Manga longa · Pedro", estampa: "Estampa E", valor: 48.00 },
      { descricao: "Camiseta M",  detalhe: "Manga longa · Pedro", estampa: "Estampa E", valor: 48.00 },
      { descricao: "Camiseta GG", detalhe: "Manga longa · Pedro", estampa: "Estampa F", valor: 48.00 }
    ],
    datas: { 1:"24/03/2026" }
  },
  {
    id: 1014,
    cliente: "Clube FC",
    telefone: "(12) 93333-2345",
    dataEntrada: "01/02/2026",
    prazo: "15/03/2026",
    prazoISO: "2026-03-15",
    etapaAtual: 10,
    status: "concluido",
    pecas: [
      { descricao: "Camiseta M",   detalhe: "Jogo 1 · Titulares",  estampa: "Clube FC",  valor: 65.00 },
      { descricao: "Camiseta M",   detalhe: "Jogo 1 · Titulares",  estampa: "Clube FC",  valor: 65.00 },
      { descricao: "Camiseta G",   detalhe: "Jogo 1 · Titulares",  estampa: "Clube FC",  valor: 65.00 },
      { descricao: "Camiseta G",   detalhe: "Jogo 1 · Titulares",  estampa: "Clube FC",  valor: 65.00 },
      { descricao: "Camiseta GG",  detalhe: "Jogo 1 · Reservas",   estampa: "Clube FC",  valor: 65.00 },
      { descricao: "Camiseta M",   detalhe: "Jogo 2 · Titulares",  estampa: "Clube FC 2",valor: 65.00 },
      { descricao: "Camiseta G",   detalhe: "Jogo 2 · Titulares",  estampa: "Clube FC 2",valor: 65.00 },
      { descricao: "Camiseta G",   detalhe: "Jogo 2 · Reservas",   estampa: "Clube FC 2",valor: 65.00 }
    ],
    datas: { 1:"01/02/2026", 2:"05/02/2026", 3:"10/02/2026", 4:"18/02/2026", 5:"22/02/2026", 6:"26/02/2026", 7:"02/03/2026", 8:"07/03/2026", 9:"11/03/2026", 10:"14/03/2026" }
  }
];

/* Helpers */
function parsePrazo(iso) {
  return new Date(iso + 'T00:00:00');
}

function isAtrasado(pedido) {
  if (pedido.status === 'concluido') return false;
  return parsePrazo(pedido.prazoISO) <= new Date();
}

function isProximoPrazo(pedido) {
  if (pedido.status === 'concluido') return false;
  const diff = (parsePrazo(pedido.prazoISO) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function totalPedido(pedido) {
  return pedido.pecas.reduce((acc, p) => acc + p.valor, 0);
}

function getPedidoComEstado(id) {
  const base = pedidos.find(p => p.id === id);
  if (!base) return null;
  const estado = JSON.parse(localStorage.getItem('pedidosEstado') || '{}');
  if (!estado[id]) return { ...base };
  return { ...base, ...estado[id], datas: { ...base.datas, ...estado[id].datas } };
}

function salvarEstado(id, novaEtapa, dataConclusao) {
  const estado = JSON.parse(localStorage.getItem('pedidosEstado') || '{}');
  const base = pedidos.find(p => p.id === id);
  const etapaAnterior = (estado[id] ? estado[id].etapaAtual : base.etapaAtual);
  estado[id] = {
    etapaAtual: novaEtapa,
    datas: {
      ...(estado[id] ? estado[id].datas : {}),
      [etapaAnterior]: dataConclusao
    }
  };
  localStorage.setItem('pedidosEstado', JSON.stringify(estado));
}
