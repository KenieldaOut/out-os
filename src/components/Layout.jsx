import { useState, useRef, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, Menu, Calendar, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/auth'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/crm': 'CRM — Pipeline de Vendas',
  '/vendas': 'Vendas',
  '/clientes': 'Clientes',
  '/financeiro': 'Financeiro',
  '/estoque': 'Estoque',
}

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

function TopBar({ onMobileMenu }) {
  const { darkMode, setDarkMode, followUpAlerts } = useApp()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  const userInitial = user?.email ? user.email[0].toUpperCase() : '?'
  const userEmail = user?.email ?? ''
  const title =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/clientes/') ? 'Detalhe do Cliente' : 'Out OS')

  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (!notifOpen) return
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMobileMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</span>

      {/* Notification bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {followUpAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {followUpAlerts.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Follow-ups</p>
              {followUpAlerts.length > 0 && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                  {followUpAlerts.length}
                </span>
              )}
            </div>

            {followUpAlerts.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-6 h-6 mx-auto text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum follow-up pendente</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
                  {followUpAlerts.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                          {lead.name}
                        </p>
                        {lead.product && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.product}</p>
                        )}
                        {lead.followUpDate && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-orange-500" />
                            <span className="text-[11px] text-orange-500 dark:text-orange-400 font-medium">
                              {fmtDate(lead.followUpDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => { navigate('/crm'); setNotifOpen(false) }}
                    className="w-full text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline py-1"
                  >
                    Ver todos no CRM →
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={darkMode ? 'Modo claro' : 'Modo escuro'}
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* User avatar + dropdown */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userInitial}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none max-w-[120px] truncate">
              {userEmail || 'Usuário'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Conta</p>
          </div>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Logado como</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mt-0.5">{userEmail}</p>
            </div>
            <button
              onClick={async () => { setUserMenuOpen(false); await logout() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMobileMenu={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
