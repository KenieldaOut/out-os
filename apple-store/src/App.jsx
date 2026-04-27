import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { ProductsProvider } from './context/ProductsContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CRM from './pages/CRM'
import Sales from './pages/Sales'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Financial from './pages/Financial'
import Inventory from './pages/Inventory'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <ProductsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="crm" element={<CRM />} />
                <Route path="vendas" element={<Sales />} />
                <Route path="clientes" element={<Clients />} />
                <Route path="clientes/:id" element={<ClientDetail />} />
                <Route path="financeiro" element={<Financial />} />
                <Route path="estoque" element={<Inventory />} />
                <Route path="configuracoes" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProductsProvider>
      </ToastProvider>
    </AppProvider>
  )
}
