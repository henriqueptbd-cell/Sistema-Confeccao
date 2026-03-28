document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  if (!usuario.email) { window.location.href = 'index.html'; return; }
  if (usuario.role !== 'admin') { window.location.href = 'dashboard.html'; return; }

  const config = await buscarConfigPrecos();
  renderPrecosBase(config.precoBase);
  renderAdicionais(config.adicionais);
  document.getElementById('cfg-desconto-max').value = config.descontoMaximo ?? 15;

  document.getElementById('btn-salvar-config').addEventListener('click', () => salvarConfig(config));
});

// Mapeamento chave → label legível
const LABEL_ADICIONAL = {
  punho:        'Punho (manga longa)',
  dedao:        'Encaixe de dedão',
  capuzNormal:  'Capuz normal',
  capuzNinja:   'Capuz ninja',
  balaclava:    'Balaclava',
  bolsoZiper:   'Bolso com zíper',
  segundaFace:  '2ª face (Bandeira)',
};

function renderPrecosBase(precoBase) {
  const tbody = document.getElementById('tbody-precos-base');
  const linhas = [];

  Object.entries(precoBase).forEach(([produto, valor]) => {
    if (typeof valor === 'number') {
      // Ex: Bandeira sem variação
      linhas.push(`
        <tr>
          <td class="produto-nome">${produto}</td>
          <td class="variacao">—</td>
          <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
            data-produto="${produto}" data-variacao=""
            value="${valor}"/></td>
        </tr>`);
    } else {
      Object.entries(valor).forEach(([variacao, preco]) => {
        linhas.push(`
          <tr>
            <td class="produto-nome">${produto}</td>
            <td class="variacao">${variacao}</td>
            <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
              data-produto="${produto}" data-variacao="${variacao}"
              value="${preco}"/></td>
          </tr>`);
      });
    }
  });

  tbody.innerHTML = linhas.join('');
}

function renderAdicionais(adicionais) {
  const tbody = document.getElementById('tbody-adicionais');
  tbody.innerHTML = Object.entries(adicionais).map(([chave, valor]) => `
    <tr>
      <td>${LABEL_ADICIONAL[chave] || chave}</td>
      <td><input class="cfg-preco-input" type="number" min="0" step="0.01"
        data-adicional="${chave}" value="${valor}"/></td>
    </tr>`).join('');
}

async function salvarConfig(configAtual) {
  const novoConfig = {
    precoBase:      JSON.parse(JSON.stringify(configAtual.precoBase)),
    adicionais:     { ...configAtual.adicionais },
    descontoMaximo: parseFloat(document.getElementById('cfg-desconto-max').value) || 0,
  };

  // Ler preços base editados
  document.querySelectorAll('#tbody-precos-base .cfg-preco-input').forEach(input => {
    const produto  = input.dataset.produto;
    const variacao = input.dataset.variacao;
    const valor    = parseFloat(input.value) || 0;
    if (variacao === '') {
      novoConfig.precoBase[produto] = valor;
    } else {
      novoConfig.precoBase[produto][variacao] = valor;
    }
  });

  // Ler adicionais editados
  document.querySelectorAll('#tbody-adicionais .cfg-preco-input').forEach(input => {
    novoConfig.adicionais[input.dataset.adicional] = parseFloat(input.value) || 0;
  });

  const btn = document.getElementById('btn-salvar-config');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';

  try {
    await salvarConfigPrecos(novoConfig);
    mostrarMsg('Configurações salvas com sucesso.', 'sucesso');
  } catch (e) {
    mostrarMsg('Erro ao salvar. Tente novamente.', 'erro');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salvar alterações';
  }
}

function mostrarMsg(texto, tipo) {
  const el = document.getElementById('cfg-msg');
  el.textContent = texto;
  el.className   = `cfg-msg ${tipo}`;
  el.hidden      = false;
  setTimeout(() => { el.hidden = true; }, 3000);
}
