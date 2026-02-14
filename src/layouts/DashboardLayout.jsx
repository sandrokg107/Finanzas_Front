import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Wallet,
  X,
  Receipt,
  FileText,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={20} className="mr-3" />
    {label}
  </Link>
)

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Wallet className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white">
              Lumina
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active={location.pathname === '/'}
          />
          <SidebarItem
            to="/transactions"
            icon={CreditCard}
            label="Transacciones"
            active={location.pathname === '/transactions'}
          />
          <SidebarItem
            to="/debts"
            icon={Receipt}
            label="Deudas"
            active={location.pathname === '/debts'}
          />
          <SidebarItem
            to="/credit-cards"
            icon={CreditCard}
            label="Tarjetas"
            active={location.pathname === '/credit-cards'}
          />
          <SidebarItem
            to="/reports"
            icon={FileText}
            label="Reportes"
            active={location.pathname === '/reports'}
          />
          <SidebarItem
            to="/budget"
            icon={PieChart}
            label="Presupuesto"
            active={location.pathname === '/budget'}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-2" /> Cerrar Sesion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 dark:text-slate-300"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800 dark:text-white">
            Lumina Finance
          </span>
          <div className="w-6" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
