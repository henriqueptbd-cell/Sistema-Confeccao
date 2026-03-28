document.addEventListener('DOMContentLoaded', async () => {
  if (!sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
    return;
  }

  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Carrega config de preços antes de renderizar os cards
  try { configPrecosAtual = await buscarConfigPrecos(); } catch (_) {}

  const pedido = await buscarPedido(id);
  if (!pedido) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Cabeçalho
  document.getElementById('edit-pedido-id').textContent   = '#' + pedido.id;
  document.getElementById('edit-cliente-nome').textContent = pedido.cliente;
  document.getElementById('back-btn').href                 = `pedido.html?id=${id}`;

  // Prazo (converte dd/mm/yyyy → yyyy-mm-dd para o input date)
  if (pedido.prazoISO) {
    document.getElementById('edit-prazo').value = pedido.prazoISO;
  } else if (pedido.prazo) {
    const [d, m, a] = pedido.prazo.split('/');
    document.getElementById('edit-prazo').value = `${a}-${m}-${d}`;
  }

  // Preenche os cards com as peças existentes
  const lista = document.getElementById('produtos-form-list');
  lista.innerHTML = '';

  pedido.pecas.forEach(peca => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = produtoCardHTML();
    lista.appendChild(card);
    iniciarProdutoCard(card);
    preencherProdutoCard(card, peca);
  });

  // Botão adicionar
  document.getElementById('btn-add-produto').addEventListener('click', adicionarProdutoCard);

  // Cancelar → volta para o pedido
  document.getElementById('btn-cancelar-edicao').addEventListener('click', () => {
    window.location.href = `pedido.html?id=${id}`;
  });

  // Salvar
  document.getElementById('btn-salvar-edicao').addEventListener('click', () => salvarEdicao(id, pedido));
});

async function salvarEdicao(id, pedidoOriginal) {
  const prazoISO = document.getElementById('edit-prazo').value;
  if (!prazoISO) {
    document.getElementById('edit-prazo').classList.add('field-error');
    document.getElementById('edit-prazo').focus();
    return;
  }
  document.getElementById('edit-prazo').classList.remove('field-error');

  const [ano, mes, dia] = prazoISO.split('-');
  const prazo           = `${dia}/${mes}/${ano}`;

  const pecas = Array.from(
    document.querySelectorAll('#produtos-form-list .produto-card')
  ).map(coletarProduto);

  const btn = document.getElementById('btn-salvar-edicao');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';

  try {
    await atualizarPedido(id, { prazo, prazoISO, pecas });
    window.location.href = `pedido.html?id=${id}`;
  } catch (e) {
    console.error('Erro ao salvar pedido:', e);
    btn.disabled    = false;
    btn.textContent = 'Salvar alterações';
  }
}
