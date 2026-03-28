document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('numeroPedido').addEventListener('keydown', e => {
    if (e.key === 'Enter') consultarPedido();
  });
});

async function consultarPedido() {
  const input         = document.getElementById('numeroPedido');
  const resultado     = document.getElementById('resultado');
  const naoEncontrado = document.getElementById('nao-encontrado');
  const num           = parseInt(input.value.trim());

  resultado.classList.remove('visible');
  naoEncontrado.classList.remove('visible');

  if (!num) {
    input.focus();
    return;
  }

  const pedido = await buscarPedido(num);

  if (!pedido) {
    naoEncontrado.classList.add('visible');
    naoEncontrado.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  renderResultado(pedido);
  resultado.classList.add('visible');
  resultado.scrollIntoView({ behavior: 'smooth' });
}

function renderResultado(pedido) {
  document.getElementById('res-numero').textContent = '#' + pedido.id;

  const badge = document.getElementById('res-badge');
  badge.textContent = pedido.status === 'concluido' ? 'Pronto para retirada' : 'Em produção';
  badge.className   = 'badge ' + (pedido.status === 'concluido' ? 'badge-pronto' : 'badge-producao');

  const proxima    = pedido.etapas?.find(e => !e.concluida);
  const etapaTexto = pedido.status === 'concluido' ? 'Concluído' : proxima?.nome ?? 'Concluído';

  document.getElementById('res-cliente').textContent = pedido.cliente;
  document.getElementById('res-entrada').textContent = pedido.dataEntrada;
  document.getElementById('res-prazo').textContent   = pedido.prazo;
  document.getElementById('res-etapa').textContent   = etapaTexto;

  document.getElementById('res-timeline').innerHTML = renderTimeline(pedido, true);
}
