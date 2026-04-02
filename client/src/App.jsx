import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RotaProtegida from './components/RotaProtegida'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DetalhePedido from './pages/DetalhePedido'
import ConsultaPublica from './pages/ConsultaPublica'
import Clientes from './pages/Clientes'
import Configuracoes from './pages/Configuracoes'
import Financeiro from './pages/Financeiro'
import Relatorios from './pages/Relatorios'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/consulta" element={<ConsultaPublica />} />

        {/* Rotas protegidas (exigem login) */}
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pedido/:id" element={<DetalhePedido />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
