import { Navigate, Outlet } from 'react-router-dom'

export default function RotaProtegida() {
  const usuario = sessionStorage.getItem('usuario')
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}
