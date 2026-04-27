import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCircle,
  DollarSign,
  Package,
  Settings2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crm', icon: Users, label: 'CRM' },
  { to: '/vendas', icon: ShoppingCart, label: 'Vendas' },
  { to: '/clientes', icon: UserCircle, label: 'Clientes' },
  { to: '/estoque', icon: Package, label: 'Estoque' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/configuracoes', icon: Settings2, label: 'Configurações' },
]

export default function Sidebar({ open, setOpen, mobileOpen, setMobileOpen }) {
  const expanded = open || mobileOpen

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-gray-950 text-white flex flex-col transition-all duration-300 flex-shrink-0 z-50',
          mobileOpen
            ? 'fixed left-0 top-0 h-full flex w-56'
            : 'hidden md:flex',
          !mobileOpen && (open ? 'md:w-56' : 'md:w-[60px]'),
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-5 border-b border-white/5',
            !expanded && 'justify-center px-0',
          )}
        >
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-950">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white leading-none">Out OS</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Gestão</p>
            </div>
          )}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={!expanded ? item.label : undefined}
              onClick={() => mobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                  expanded ? 'px-3' : 'px-0 justify-center',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {expanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {!mobileOpen && (
          <div className={cn('px-2 pb-4', !open && 'flex justify-center')}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              {open ? (
                <>
                  <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                  <span>Recolher</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
