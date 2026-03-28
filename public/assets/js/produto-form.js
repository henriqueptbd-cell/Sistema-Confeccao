// ============================================================
// produto-form.js — Formulário de produto compartilhado
// Usado por: dashboard.js (Novo Pedido) e editar-pedido.js
// ============================================================

let configPrecosAtual = null;

// ---- Helpers de HTML ----

function pills(field, opts, defaultIdx = 0) {
  return `<div class="opcao-pills" data-field="${field}">
    ${opts.map((o, i) => `<button type="button" class="opcao-pill${i === defaultIdx ? ' active' : ''}">${o}</button>`).join('')}
  </div>`;
}

function sizeRow(sizes) {
  return sizes.map(s => `
    <div class="size-item">
      <div class="size-label">${s}</div>
      <input type="number" class="size-input" data-size="${s}" min="0" placeholder="0"/>
    </div>`).join('');
}

function produtoCardHTML() {
  return `
    <div class="produto-card-header">
      <div class="tipo-pills">
        <button type="button" class="tipo-pill active" data-tipo="Camiseta">Camiseta</button>
        <button type="button" class="tipo-pill" data-tipo="Short">Short</button>
        <button type="button" class="tipo-pill" data-tipo="Corta-vento">Corta-vento</button>
        <button type="button" class="tipo-pill" data-tipo="Bandeira">Bandeira</button>
      </div>
      <button type="button" class="btn-remove-produto">× Remover</button>
    </div>

    <!-- Camiseta -->
    <div class="tipo-section" data-show-for="Camiseta">
      <div class="opcao-group">
        <label class="field-label">Material</label>
        ${pills('material', MATERIAIS_CAMISETA)}
      </div>
      <div class="opcao-group">
        <label class="field-label">Modelo</label>
        ${pills('modelo-camiseta', ['Manga curta', 'Manga longa', 'Regata'])}
      </div>
      <div class="opcao-group">
        <label class="field-label">Gola</label>
        ${pills('gola', ['Gola redonda', 'Gola V', 'Polo', 'Polo esportiva'])}
        <div class="polo-esp-aviso" hidden>⚠️ Polo esportiva disponível apenas no material Dry</div>
      </div>
      <div class="camiseta-manga-longa" hidden>
        <div class="opcao-group" style="margin-top:14px">
          <label class="field-label">Punho</label>
          ${pills('punho', ['Com', 'Sem'])}
        </div>
        <div class="opcao-group">
          <label class="field-label">Capuz / Balaclava</label>
          ${pills('capuz', ['Sem capuz', 'Capuz normal', 'Capuz ninja', 'Balaclava'])}
        </div>
        <div class="opcao-group">
          <label class="field-label field-checkbox">
            <input type="checkbox" data-field="dedao"/> Encaixe de dedão
          </label>
        </div>
      </div>
    </div>

    <!-- Short -->
    <div class="tipo-section" data-show-for="Short" hidden>
      <div class="opcao-group">
        <label class="field-label">Modelo</label>
        ${pills('modelo-short', ['Jet masculino', 'Jet feminino', 'Futebol'])}
      </div>
      <div class="opcao-group">
        <label class="field-label field-checkbox">
          <input type="checkbox" data-field="bolso-ziper"/> Bolso com zíper
        </label>
      </div>
    </div>

    <!-- Corta-vento -->
    <div class="tipo-section" data-show-for="Corta-vento" hidden>
      <div class="opcao-group">
        <label class="field-label">Modelo</label>
        ${pills('modelo-cortavento', ['Com toca', 'Sem toca'])}
      </div>
    </div>

    <!-- Bandeira -->
    <div class="tipo-section" data-show-for="Bandeira" hidden>
      <div class="opcao-group">
        <label class="field-label">Material</label>
        ${pills('material-bandeira', MATERIAIS_CAMISETA)}
      </div>
      <div class="opcao-row-2">
        <div>
          <label class="field-label">Medidas (máx. 90×70cm)</label>
          <input type="text" class="field-input" data-field="medidas" placeholder="ex: 90cm x 70cm"/>
        </div>
        <div>
          <label class="field-label">Faces</label>
          ${pills('faces', ['1 face', '2 faces'])}
        </div>
      </div>
      <div class="opcao-group">
        <label class="field-label">Observações</label>
        <textarea class="field-input campo-textarea" data-field="obs-bandeira" rows="2" placeholder="Detalhes específicos..."></textarea>
      </div>
    </div>

    <!-- Estampa -->
    <div class="estampa-section">
      <label class="field-label">Estampa</label>
      ${pills('estampa-tipo', ESTAMPA_TIPOS)}
      <div class="estampa-cond" data-estampa-for="Personalizado">
        <label class="field-label">Descrição e posicionamento</label>
        <textarea class="field-input campo-textarea" data-field="estampa-descricao" rows="2"
          placeholder="ex: Frente e costas, estampa no braço esquerdo…"></textarea>
      </div>
      <div class="estampa-cond" data-estampa-for="cor" hidden>
        <label class="field-label">Cor personalizada</label>
        <input type="text" class="field-input" data-field="estampa-cor"
          placeholder="ex: Azul royal, vermelho…"/>
      </div>
    </div>

    <!-- Tamanhos -->
    <div class="tamanhos-section">
      <label class="field-label">Tamanhos e quantidades</label>
      <div class="size-group" data-group="masculino">
        <div class="size-group-label">Masculino</div>
        <div class="size-row">${sizeRow(TAM_ADULTO_MASC)}</div>
      </div>
      <div class="size-group" data-group="feminino">
        <div class="size-group-label">Feminino / Babylook</div>
        <div class="size-row">${sizeRow(TAM_ADULTO_FEM)}</div>
      </div>
      <div class="size-group" data-group="infantil">
        <div class="size-group-label">Infantil</div>
        <div class="size-row">${sizeRow(TAM_INFANTIL)}</div>
      </div>
      <div class="size-group" data-group="bandeira-qty" hidden>
        <label class="field-label">Quantidade</label>
        <input type="number" class="field-input" data-field="quantidade" min="1" value="1"
          style="max-width:120px"/>
      </div>
    </div>

    <!-- Preço calculado -->
    <div class="preco-section">
      <div class="preco-display" data-preco-display>
        <div class="preco-linha preco-vazio">Selecione tipo e modelo para calcular o preço</div>
      </div>
      <div class="produto-desconto-wrap">
        <label class="field-label">Desconto (%)</label>
        <input type="number" class="field-input preco-desconto-input" data-field="desconto"
          min="0" max="100" step="1" placeholder="0"/>
      </div>
    </div>

    <!-- Link de imagem -->
    <div class="produto-footer">
      <label class="field-label">Link de referência (imagem)</label>
      <input type="url" class="field-input" data-field="imagemLink"
        placeholder="Cole aqui o link da imagem (ex: OneDrive, Google Fotos…)"/>
    </div>`;
}

// ---- Adicionar / Preencher cards ----

function adicionarProdutoCard() {
  const card = document.createElement('div');
  card.className = 'produto-card';
  card.innerHTML = produtoCardHTML();
  document.getElementById('produtos-form-list').appendChild(card);
  iniciarProdutoCard(card);
  if (configPrecosAtual) atualizarPrecoCard(card);
}

function preencherProdutoCard(card, peca) {
  const setPill = (field, valor) => {
    const group = card.querySelector(`.opcao-pills[data-field="${field}"]`);
    if (!group || !valor) return;
    group.querySelectorAll('.opcao-pill').forEach(p => {
      p.classList.toggle('active', p.textContent.trim() === valor);
    });
  };

  // Tipo
  card.querySelectorAll('.tipo-pill').forEach(b => b.classList.remove('active'));
  const tipoPill = card.querySelector(`.tipo-pill[data-tipo="${peca.tipo}"]`);
  if (tipoPill) tipoPill.classList.add('active');
  atualizarSecoesTipo(card, peca.tipo);

  if (peca.tipo === 'Camiseta') {
    setPill('material', peca.material);
    if (peca.material) atualizarMaterialCamiseta(card, peca.material);
    setPill('modelo-camiseta', peca.modelo);
    if (peca.modelo) atualizarDetalhesCamiseta(card, peca.modelo);
    setPill('gola', peca.gola);
    setPill('punho', peca.punho);
    setPill('capuz', peca.capuz);
    const dedao = card.querySelector('[data-field="dedao"]');
    if (dedao) dedao.checked = !!peca.dedao;

  } else if (peca.tipo === 'Short') {
    setPill('modelo-short', peca.modelo);
    const bolso = card.querySelector('[data-field="bolso-ziper"]');
    if (bolso) bolso.checked = !!peca.bolsoZiper;

  } else if (peca.tipo === 'Corta-vento') {
    setPill('modelo-cortavento', peca.modelo);

  } else if (peca.tipo === 'Bandeira') {
    setPill('material-bandeira', peca.material);
    setPill('faces', peca.faces);
    const medidas = card.querySelector('[data-field="medidas"]');
    if (medidas && peca.medidas) medidas.value = peca.medidas;
    const obs = card.querySelector('[data-field="obs-bandeira"]');
    if (obs && peca.observacoes) obs.value = peca.observacoes;
    const qty = card.querySelector('[data-field="quantidade"]');
    if (qty && peca.quantidade) qty.value = peca.quantidade;
  }

  // Estampa
  setPill('estampa-tipo', peca.estampaTipo);
  if (peca.estampaTipo) atualizarEstampa(card, peca.estampaTipo);
  const estDesc = card.querySelector('[data-field="estampa-descricao"]');
  if (estDesc && peca.estampaDescricao) estDesc.value = peca.estampaDescricao;
  const estCor = card.querySelector('[data-field="estampa-cor"]');
  if (estCor && peca.estampaCor) estCor.value = peca.estampaCor;

  // Tamanhos
  if (peca.tamanhos) {
    Object.entries(peca.tamanhos).forEach(([tam, qtd]) => {
      const input = card.querySelector(`.size-input[data-size="${tam}"]`);
      if (input) input.value = qtd;
    });
  }

  // Desconto
  const descontoInput = card.querySelector('[data-field="desconto"]');
  if (descontoInput && peca.descontoPercentual) descontoInput.value = peca.descontoPercentual;

  // ImagemLink
  const imagemInput = card.querySelector('[data-field="imagemLink"]');
  if (imagemInput && peca.imagemLink) imagemInput.value = peca.imagemLink;

  atualizarPrecoCard(card);
}

// ---- Inicializar listeners de um card ----

function iniciarProdutoCard(card) {
  card.querySelectorAll('.tipo-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      card.querySelectorAll('.tipo-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      atualizarSecoesTipo(card, btn.dataset.tipo);
      requestAnimationFrame(() => atualizarPrecoCard(card));
    });
  });

  card.querySelectorAll('.opcao-pills').forEach(group => {
    group.querySelectorAll('.opcao-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.disabled) return;
        group.querySelectorAll('.opcao-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const campo = group.dataset.field;
        if (campo === 'modelo-camiseta') atualizarDetalhesCamiseta(card, pill.textContent.trim());
        if (campo === 'material')         atualizarMaterialCamiseta(card, pill.textContent.trim());
        if (campo === 'estampa-tipo')     atualizarEstampa(card, pill.textContent.trim());
        requestAnimationFrame(() => atualizarPrecoCard(card));
      });
    });
  });

  card.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => atualizarPrecoCard(card));
  });

  card.querySelector('[data-field="desconto"]').addEventListener('input', () => atualizarPrecoCard(card));

  card.querySelectorAll('.size-input').forEach(input => {
    input.addEventListener('input', () => atualizarPrecoCard(card));
  });

  card.querySelector('[data-field="quantidade"]')?.addEventListener('input', () => atualizarPrecoCard(card));

  card.querySelector('.btn-remove-produto').addEventListener('click', () => {
    card.remove();
    atualizarTotalPedido();
  });

  atualizarPrecoCard(card);
}

// ---- Preço em tempo real ----

function atualizarPrecoCard(card) {
  const display = card.querySelector('[data-preco-display]');
  if (!display || !configPrecosAtual) return;

  const tipo = card.querySelector('.tipo-pill.active')?.dataset.tipo;
  if (!tipo) return;

  const getPill  = f => card.querySelector(`.opcao-pills[data-field="${f}"] .opcao-pill.active`)?.textContent?.trim() || '';
  const getCheck = f => card.querySelector(`[data-field="${f}"]`)?.checked || false;

  const peca = { tipo };
  if (tipo === 'Camiseta') {
    peca.modelo = getPill('modelo-camiseta');
    peca.punho  = getPill('punho');
    peca.dedao  = getCheck('dedao');
    peca.capuz  = getPill('capuz');
  } else if (tipo === 'Short') {
    peca.modelo     = getPill('modelo-short');
    peca.bolsoZiper = getCheck('bolso-ziper');
  } else if (tipo === 'Corta-vento') {
    peca.modelo = getPill('modelo-cortavento');
  } else if (tipo === 'Bandeira') {
    peca.faces = getPill('faces');
  }

  const { precoCalculado, detalhes } = calcularPrecoPeca(peca, configPrecosAtual);

  const descontoInput  = card.querySelector('[data-field="desconto"]');
  const descontoMaximo = configPrecosAtual.descontoMaximo || 0;
  const descontoRaw    = parseFloat(descontoInput?.value) || 0;
  const excedeu        = descontoRaw > descontoMaximo;
  const desconto       = Math.min(descontoRaw, descontoMaximo);

  if (descontoInput) descontoInput.classList.toggle('campo-erro', excedeu);

  const precoFinal    = precoCalculado * (1 - desconto / 100);
  const descontoValor = precoCalculado - precoFinal;

  let qtd = 0;
  card.querySelectorAll('.size-input').forEach(el => { qtd += parseInt(el.value) || 0; });
  if (tipo === 'Bandeira') qtd = parseInt(card.querySelector('[data-field="quantidade"]')?.value) || 1;

  const totalCard = precoFinal * qtd;

  card.dataset.precoCalculado   = precoCalculado;
  card.dataset.descontoAplicado = desconto;
  card.dataset.precoFinal       = precoFinal;
  card.dataset.totalCard        = totalCard;

  if (!detalhes.length) {
    display.innerHTML = '<div class="preco-linha preco-vazio">Selecione tipo e modelo para calcular o preço</div>';
    atualizarTotalPedido();
    return;
  }

  const linhasDetalhes = detalhes.map(d => `
    <div class="preco-linha${d.isExtra ? ' preco-extra' : ''}">
      <span>${d.label}</span><span>${formatarMoeda(d.valor)}</span>
    </div>`).join('');

  const linhaDesconto = desconto > 0 ? `
    <div class="preco-linha preco-desconto">
      <span>− ${desconto}% desconto</span><span>− ${formatarMoeda(descontoValor)}</span>
    </div>` : '';

  const avisoExcedeu = excedeu ? `
    <div class="preco-aviso">⚠ Máximo permitido: ${descontoMaximo}%</div>` : '';

  const linhaQtd = qtd > 0 ? `
    <div class="preco-linha preco-card-total">
      <span>${qtd} ${qtd === 1 ? 'peça' : 'peças'}</span>
      <span>${formatarMoeda(totalCard)}</span>
    </div>` : '';

  display.innerHTML = `
    <div class="preco-breakdown">
      ${linhasDetalhes}
      <div class="preco-linha preco-subtotal">
        <span>Subtotal</span><span>${formatarMoeda(precoCalculado)}</span>
      </div>
      ${linhaDesconto}
      ${avisoExcedeu}
      <div class="preco-linha preco-total">
        <span>Valor por peça</span><span>${formatarMoeda(precoFinal)}</span>
      </div>
      ${linhaQtd}
    </div>`;

  atualizarTotalPedido();
}

function atualizarTotalPedido() {
  let total = 0;
  document.querySelectorAll('#produtos-form-list .produto-card').forEach(card => {
    total += parseFloat(card.dataset.totalCard) || 0;
  });

  const footerEl = document.getElementById('pedido-total-footer');
  const valorEl  = document.getElementById('pedido-total-valor');
  if (!footerEl || !valorEl) return;

  footerEl.hidden     = total === 0;
  valorEl.textContent = formatarMoeda(total);
}

// ---- Lógica visual das seções ----

function atualizarSecoesTipo(card, tipo) {
  card.querySelectorAll('.tipo-section').forEach(s => {
    s.hidden = s.dataset.showFor !== tipo;
  });

  const grMasc = card.querySelector('.size-group[data-group="masculino"]');
  const grFem  = card.querySelector('.size-group[data-group="feminino"]');
  const grInf  = card.querySelector('.size-group[data-group="infantil"]');
  const grBand = card.querySelector('.size-group[data-group="bandeira-qty"]');

  if (tipo === 'Bandeira') {
    grMasc.hidden = grFem.hidden = grInf.hidden = true;
    grBand.hidden = false;
  } else {
    grMasc.hidden = grInf.hidden = grBand.hidden = false;
    grFem.hidden  = tipo === 'Corta-vento';
    grMasc.querySelector('.size-group-label').textContent =
      tipo === 'Corta-vento' ? 'Adulto' : 'Masculino';
  }
}

function atualizarDetalhesCamiseta(card, modelo) {
  card.querySelector('.camiseta-manga-longa').hidden = modelo !== 'Manga longa';
}

function atualizarMaterialCamiseta(card, material) {
  const isDry   = material === 'Dry';
  const poloEsp = Array.from(card.querySelectorAll('.opcao-pills[data-field="gola"] .opcao-pill'))
                    .find(p => p.textContent.trim() === 'Polo esportiva');
  const aviso   = card.querySelector('.polo-esp-aviso');

  if (!poloEsp) return;
  poloEsp.disabled = !isDry;
  aviso.hidden     = isDry;

  if (!isDry && poloEsp.classList.contains('active')) {
    poloEsp.classList.remove('active');
    card.querySelector('.opcao-pills[data-field="gola"] .opcao-pill').classList.add('active');
  }
}

function atualizarEstampa(card, tipo) {
  const condPersonalizado = card.querySelector('.estampa-cond[data-estampa-for="Personalizado"]');
  const condCor           = card.querySelector('.estampa-cond[data-estampa-for="cor"]');
  condPersonalizado.hidden = tipo !== 'Personalizado';
  condCor.hidden           = tipo === 'Personalizado';
}

// ---- Coleta dos dados do card ----

function coletarProduto(card) {
  const tipo     = card.querySelector('.tipo-pill.active').dataset.tipo;
  const getPill  = f => card.querySelector(`.opcao-pills[data-field="${f}"] .opcao-pill.active`)?.textContent?.trim() || '';
  const getInput = f => card.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
  const getCheck = f => card.querySelector(`[data-field="${f}"]`)?.checked || false;

  const tamanhos = {};
  card.querySelectorAll('.size-input').forEach(el => {
    const v = parseInt(el.value) || 0;
    if (v > 0) tamanhos[el.dataset.size] = v;
  });

  const precoCalculado     = parseFloat(card.dataset.precoCalculado)   || 0;
  const descontoPercentual = parseFloat(card.dataset.descontoAplicado) || 0;
  const precoFinal         = parseFloat(card.dataset.precoFinal)       || 0;

  const base = {
    tipo,
    estampaTipo:      getPill('estampa-tipo'),
    estampaDescricao: getInput('estampa-descricao') || null,
    estampaCor:       getInput('estampa-cor') || null,
    precoCalculado,
    descontoPercentual,
    precoFinal,
    valorUnitario: precoFinal,
    imagemLink:    getInput('imagemLink') || null,
  };

  if (tipo === 'Camiseta') {
    const modelo = getPill('modelo-camiseta');
    return {
      ...base, tamanhos,
      material: getPill('material'),
      modelo,
      gola:  getPill('gola'),
      punho: modelo !== 'Regata'      ? getPill('punho') : null,
      dedao: modelo === 'Manga longa' ? getCheck('dedao') : false,
      capuz: modelo === 'Manga longa' ? getPill('capuz')  : null,
    };
  }
  if (tipo === 'Short') {
    return { ...base, tamanhos, modelo: getPill('modelo-short'), bolsoZiper: getCheck('bolso-ziper') };
  }
  if (tipo === 'Corta-vento') {
    return { ...base, tamanhos, modelo: getPill('modelo-cortavento') };
  }
  // Bandeira
  return {
    ...base,
    material:    getPill('material-bandeira'),
    medidas:     getInput('medidas'),
    faces:       getPill('faces'),
    observacoes: getInput('obs-bandeira'),
    quantidade:  parseInt(getInput('quantidade')) || 1,
  };
}
