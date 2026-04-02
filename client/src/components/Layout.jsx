import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate  = useNavigate()
  const usuario   = JSON.parse(sessionStorage.getItem('usuario') || '{}')
  const isAdmin   = usuario.role === 'admin'
  const [menuAberto, setMenuAberto] = useState(false)

  function sair() {
    sessionStorage.removeItem('usuario')
    navigate('/login')
  }

  const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`

  const NavLinks = () => (
    <>
      <NavLink to="/dashboard"    className={navClass} onClick={() => setMenuAberto(false)}>
        <span className="nav-icon">📋</span> Pedidos
      </NavLink>
      <NavLink to="/clientes"     className={navClass} onClick={() => setMenuAberto(false)}>
        <span className="nav-icon">👥</span> Clientes
      </NavLink>
      <NavLink to="/relatorios"   className={navClass} onClick={() => setMenuAberto(false)}>
        <span className="nav-icon">📊</span> Relatórios
      </NavLink>
      {isAdmin && (
        <NavLink to="/financeiro" className={navClass} onClick={() => setMenuAberto(false)}>
          <span className="nav-icon">💰</span> Financeiro
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/configuracoes" className={navClass} onClick={() => setMenuAberto(false)}>
          <span className="nav-icon">⚙️</span> Configurações
        </NavLink>
      )}
      <div className="sidebar-bottom">
        <button onClick={sair} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span className="nav-icon">🚪</span> Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="color-bar" />

      {/* Header mobile */}
      <div className="mobile-header">
        <div className="mobile-logo">FCamargo</div>
        <button className="hamburger" onClick={() => setMenuAberto(v => !v)}>
          {menuAberto ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay mobile */}
      {menuAberto && (
        <div className="mobile-overlay" onClick={() => setMenuAberto(false)} />
      )}

      <div className="layout">
        <div className="content-wrapper">
          {/* Sidebar desktop */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <div className="sidebar-logo-name">FCamargo</div>
              <div className="sidebar-logo-sub">Confecção e Estamparia</div>
            </div>
            <NavLinks />
          </aside>

          {/* Drawer mobile */}
          <aside className={`sidebar-mobile${menuAberto ? ' aberto' : ''}`}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-name">FCamargo</div>
              <div className="sidebar-logo-sub">Confecção e Estamparia</div>
            </div>
            <NavLinks />
          </aside>

          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
