// ============================================================
// Modal Novo/Editar Cliente — compartilhado entre páginas
// Requer: api.js (criarCliente, atualizarCliente)
// ============================================================

let _modalClienteCallback = null;
let _modalClienteEditId   = null;

function abrirModalCliente(onSalvar, clienteParaEditar = null) {
  _modalClienteCallback = onSalvar;
  _modalClienteEditId   = clienteParaEditar?.id || null;

  resetarFormCliente();

  if (clienteParaEditar) {
    preencherFormCliente(clienteParaEditar);
    document.getElementById('modal-cliente-titulo').textContent  = 'Editar Cliente';
    document.getElementById('btn-salvar-cliente').textContent    = 'Salvar alterações';
  } else {
    document.getElementById('modal-cliente-titulo').textContent  = 'Novo Cliente';
    document.getElementById('btn-salvar-cliente').textContent    = 'Salvar cliente';
  }

  document.getElementById('modal-novo-cliente').classList.add('visible');
}

function fecharModalCliente() {
  document.getElementById('modal-novo-cliente').classList.remove('visible');
  _modalClienteCallback = null;
  _modalClienteEditId   = null;
}

function resetarFormCliente() {
  ['fc-nome','fc-cpf','fc-razao-social','fc-cnpj','fc-nome-fantasia',
   'fc-inscricao-estadual','fc-telefone','fc-email','fc-cep','fc-logradouro',
   'fc-numero','fc-complemento','fc-bairro','fc-municipio'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('field-error'); }
  });
  const uf = document.getElementById('fc-uf');
  if (uf) { uf.value = ''; uf.classList.remove('field-error'); }

  document.getElementById('tipo-pf').classList.add('active');
  document.getElementById('tipo-pj').classList.remove('active');
  document.getElementById('campos-pf').hidden = false;
  document.getElementById('campos-pj').hidden = true;
}

function preencherFormCliente(c) {
  if (c.tipoPessoa === 'juridica') {
    document.getElementById('tipo-pf').classList.remove('active');
    document.getElementById('tipo-pj').classList.add('active');
    document.getElementById('campos-pf').hidden = true;
    document.getElementById('campos-pj').hidden = false;
  }
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  set('fc-nome',               c.nome);
  set('fc-cpf',                c.cpf  ? formatarCpf(c.cpf)   : '');
  set('fc-razao-social',       c.razaoSocial);
  set('fc-cnpj',               c.cnpj ? formatarCnpj(c.cnpj) : '');
  set('fc-nome-fantasia',      c.nomeFantasia);
  set('fc-inscricao-estadual', c.inscricaoEstadual);
  set('fc-telefone',           c.telefone);
  set('fc-email',              c.email);
  set('fc-cep',                c.cep  ? formatarCep(c.cep)   : '');
  set('fc-logradouro',         c.logradouro);
  set('fc-numero',             c.numero);
  set('fc-complemento',        c.complemento);
  set('fc-bairro',             c.bairro);
  set('fc-municipio',          c.municipio);
  set('fc-uf',                 c.uf);
}

// Retorna o nome de exibição do cliente conforme tipo de pessoa
function nomeDisplayCliente(c) {
  if (!c) return '';
  if (c.tipoPessoa === 'juridica') return c.nomeFantasia || c.razaoSocial || '';
  return c.nome || '';
}

// ---- Formatadores ----

function formatarCpf(v) {
  return (v || '').replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCnpj(v) {
  return (v || '').replace(/\D/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatarCep(v) {
  return (v || '').replace(/\D/g, '')
    .replace(/(\d{5})(\d{3})/, '$1-$2');
}

// ---- Máscaras de entrada ----

function _aplicarMascara(el, fn) {
  el.addEventListener('input', () => { el.value = fn(el.value); });
}

function mascaraCpf(el) {
  _aplicarMascara(el, v => {
    let d = v.replace(/\D/g, '').substring(0, 11);
    if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    if (d.length > 3) return d.replace(/(\d{3})(\d+)/, '$1.$2');
    return d;
  });
}

function mascaraCnpj(el) {
  _aplicarMascara(el, v => {
    let d = v.replace(/\D/g, '').substring(0, 14);
    if (d.length > 12) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    if (d.length > 8)  return d.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    if (d.length > 5)  return d.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (d.length > 2)  return d.replace(/(\d{2})(\d+)/, '$1.$2');
    return d;
  });
}

function mascaraCep(el) {
  _aplicarMascara(el, v => {
    let d = v.replace(/\D/g, '').substring(0, 8);
    if (d.length > 5) return d.replace(/(\d{5})(\d+)/, '$1-$2');
    return d;
  });
}

// ---- ViaCEP ----

async function buscarCep(cep) {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) return;
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    const data = await res.json();
    if (data.erro) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('fc-logradouro', data.logradouro);
    set('fc-bairro',     data.bairro);
    set('fc-municipio',  data.localidade);
    set('fc-uf',         data.uf);
    document.getElementById('fc-numero')?.focus();
  } catch (_) { /* ViaCEP indisponível — usuário preenche manualmente */ }
}

// ---- Coleta dos dados do formulário ----

function coletarDadosCliente() {
  const isPj = document.getElementById('tipo-pj').classList.contains('active');

  const campos = isPj
    ? ['fc-razao-social', 'fc-cnpj', 'fc-telefone', 'fc-cep',
       'fc-logradouro', 'fc-numero', 'fc-bairro', 'fc-municipio', 'fc-uf']
    : ['fc-nome', 'fc-cpf', 'fc-telefone', 'fc-cep',
       'fc-logradouro', 'fc-numero', 'fc-bairro', 'fc-municipio', 'fc-uf'];

  let valido = true;
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) { el?.classList.add('field-error'); valido = false; }
    else                          { el.classList.remove('field-error'); }
  });
  if (!valido) return null;

  const dados = {
    tipoPessoa:  isPj ? 'juridica' : 'fisica',
    telefone:    document.getElementById('fc-telefone').value.trim(),
    email:       document.getElementById('fc-email').value.trim() || null,
    cep:         document.getElementById('fc-cep').value.replace(/\D/g, ''),
    logradouro:  document.getElementById('fc-logradouro').value.trim(),
    numero:      document.getElementById('fc-numero').value.trim(),
    complemento: document.getElementById('fc-complemento').value.trim() || null,
    bairro:      document.getElementById('fc-bairro').value.trim(),
    municipio:   document.getElementById('fc-municipio').value.trim(),
    uf:          document.getElementById('fc-uf').value,
  };

  if (isPj) {
    dados.razaoSocial       = document.getElementById('fc-razao-social').value.trim();
    dados.cnpj              = document.getElementById('fc-cnpj').value.replace(/\D/g, '');
    dados.nomeFantasia      = document.getElementById('fc-nome-fantasia').value.trim() || null;
    dados.inscricaoEstadual = document.getElementById('fc-inscricao-estadual').value.trim() || null;
  } else {
    dados.nome = document.getElementById('fc-nome').value.trim();
    dados.cpf  = document.getElementById('fc-cpf').value.replace(/\D/g, '');
  }

  return dados;
}

// ---- Inicialização (chamada uma vez por página) ----

function iniciarModalCliente() {
  const modal = document.getElementById('modal-novo-cliente');

  document.getElementById('tipo-pf').addEventListener('click', () => {
    document.getElementById('tipo-pf').classList.add('active');
    document.getElementById('tipo-pj').classList.remove('active');
    document.getElementById('campos-pf').hidden = false;
    document.getElementById('campos-pj').hidden = true;
  });

  document.getElementById('tipo-pj').addEventListener('click', () => {
    document.getElementById('tipo-pj').classList.add('active');
    document.getElementById('tipo-pf').classList.remove('active');
    document.getElementById('campos-pj').hidden = false;
    document.getElementById('campos-pf').hidden = true;
  });

  mascaraCpf(document.getElementById('fc-cpf'));
  mascaraCnpj(document.getElementById('fc-cnpj'));
  mascaraCep(document.getElementById('fc-cep'));

  document.getElementById('fc-cep').addEventListener('blur', e => buscarCep(e.target.value));

  document.getElementById('btn-fechar-modal-cliente').addEventListener('click', fecharModalCliente);
  document.getElementById('btn-cancelar-cliente').addEventListener('click',     fecharModalCliente);
  modal.addEventListener('click', e => { if (e.target === modal) fecharModalCliente(); });

  document.getElementById('btn-salvar-cliente').addEventListener('click', async () => {
    const dados = coletarDadosCliente();
    if (!dados) return;

    const btn = document.getElementById('btn-salvar-cliente');
    btn.disabled    = true;
    btn.textContent = 'Salvando...';

    try {
      const cliente = _modalClienteEditId
        ? await atualizarCliente(_modalClienteEditId, dados)
        : await criarCliente(dados);

      fecharModalCliente();
      if (_modalClienteCallback) _modalClienteCallback(cliente);
    } catch (e) {
      console.error('Erro ao salvar cliente:', e);
    } finally {
      btn.disabled    = false;
      btn.textContent = _modalClienteEditId ? 'Salvar alterações' : 'Salvar cliente';
    }
  });
}
