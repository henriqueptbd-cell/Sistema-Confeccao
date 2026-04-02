import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const emailRef = useRef()
  const senhaRef = useRef()
  const [loading, setLoading] = useState(false)
  const [shake,   setShake]   = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    const email = emailRef.current.value.trim()
    const senha = senhaRef.current.value.trim()

    if (!email || !senha) { triggerShake(); return }

    setLoading(true)
    try {
      const resultado = await login(email, senha)
      if (resultado.ok) {
        sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario))
        navigate('/dashboard')
      } else {
        triggerShake()
      }
    } catch {
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="color-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0 }} />
      <div className="login-box">
        <div className="logo-area">
          <div className="logo-name">FCamargo</div>
          <div className="logo-sub">Confecção e Estamparia</div>
          <div className="divider" />
        </div>

        <h2>Acesso ao sistema</h2>
        <p className="subtitle">Entre com suas credenciais para continuar.</p>

        <div className="form-group">
          <input
            type="email"
            id="email"
            ref={emailRef}
            placeholder=" "
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <label htmlFor="email">E-mail</label>
        </div>

        <div className="form-group">
          <input
            type="password"
            id="senha"
            ref={senhaRef}
            placeholder=" "
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <label htmlFor="senha">Senha</label>
        </div>

        <button
          className={`btn${shake ? ' shake' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Entrar'}
        </button>

        <Link to="/consulta" className="back-link">
          Consultar pedido? <span>Clique aqui</span>
        </Link>
      </div>
    </div>
  )
}
