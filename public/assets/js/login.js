document.getElementById('btn-entrar').addEventListener('click', async function () {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!email || !senha) {
    agitarBotao(this);
    return;
  }

  this.disabled = true;
  this.innerHTML = '<span class="spinner"></span>';

  const resultado = await login(email, senha);

  if (resultado.ok) {
    // TODO(segurança): armazenar JWT em httpOnly cookie em vez de sessionStorage
    sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario));
    window.location.href = 'dashboard.html';
  } else {
    this.disabled = false;
    this.innerHTML = 'Entrar';
    agitarBotao(this);
  }
});

function agitarBotao(btn) {
  btn.classList.add('shake');
  setTimeout(() => btn.classList.remove('shake'), 500);
}
