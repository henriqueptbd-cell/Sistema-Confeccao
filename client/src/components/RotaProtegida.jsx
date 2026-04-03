import { Navigate, Outlet } from 'react-router-dom'

export default function RotaProtegida() {
  const token = sessionStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
