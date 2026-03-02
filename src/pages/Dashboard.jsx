import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'
import Card from '../components/ui/Card'

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const now = new Date()
        const month = now.getMonth() + 1
        const year = now.getFullYear()

        const [summaryResponse, transactionsResponse, debtsResponse] = await Promise.all([
          api.get(`/dashboard/summary?month=${month}&year=${year}`),
          api.get(`/transactions?month=${month}&year=${year}&page=1&page_size=200`),
          api.get('/debts?include_paid=true'),
        ])

        setSummary(summaryResponse.data)
        setTransactions(transactionsResponse.data)
        setDebts(debtsResponse.data)
      } catch {
        setError('No se pudo cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Calcular pagos pendientes del mes actual
  const pendingPaymentsThisMonth = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let total = 0
    let count = 0
    
    debts.forEach((debt) => {
      if (debt.payments) {
        debt.payments.forEach((payment) => {
          const dueDate = new Date(payment.due_date)
          if (
            dueDate.getMonth() === currentMonth &&
            dueDate.getFullYear() === currentYear &&
            !payment.is_paid
          ) {
            total += Number(payment.amount)
            count++
          }
        })
      }
    })
    
    return { total, count }
  }, [debts])

  const chartData = useMemo(() => {
    const byDate = {}
    transactions.forEach((item) => {
      const key = item.date
      if (!byDate[key]) {
        byDate[key] = 0
      }
      byDate[key] += item.type === 'income' ? Number(item.amount) : -Number(item.amount)
    })

    const dates = Object.keys(byDate).sort()
    let running = 0
    return dates.map((entry) => {
      running += byDate[entry]
      return {
        date: entry,
        balance: Number(running.toFixed(2)),
      }
    })
  }, [transactions])

  if (loading) {
    return <div className="text-slate-500">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="text-rose-500">{error}</div>
  }

  // Calcular proyección total del mes
  const totalExpense = summary?.total_expense || 0
  const totalIncome = summary?.total_income || 0
  const projectedTotal = totalExpense + pendingPaymentsThisMonth.total
  const remaining = totalIncome - projectedTotal
  const isOverBudget = remaining < 0
  const warningThreshold = totalIncome * 0.2 // 20% del ingreso
  const isLowBudget = remaining > 0 && remaining < warningThreshold

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Resumen financiero del mes actual
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-400">
              Ingresos
            </p>
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {formatCurrency(summary?.total_income || 0)}
          </p>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
              Gastos
            </p>
            <TrendingDown size={20} className="text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {formatCurrency(summary?.total_expense || 0)}
          </p>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-400">
              Balance
            </p>
            <DollarSign size={20} className="text-blue-400" />
          </div>
          <p className={`mt-3 text-3xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(summary?.balance || 0)}
          </p>
        </Card>
      </div>

      {/* Proyección del Mes */}
      <Card className={`bg-linear-to-br p-6 border-2 ${
        isOverBudget 
          ? 'from-rose-900/40 to-red-900/30 border-rose-500/50' 
          : isLowBudget
          ? 'from-amber-900/40 to-orange-900/30 border-amber-500/50'
          : 'from-emerald-900/40 to-green-900/30 border-emerald-500/50'
      } backdrop-blur-xl`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isOverBudget ? (
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <XCircle size={28} className="text-rose-400" />
              </div>
            ) : isLowBudget ? (
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertTriangle size={28} className="text-amber-400" />
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Proyección del Mes
                <Calendar size={20} className="text-slate-400" />
              </h2>
              <p className="text-sm text-slate-300">
                {isOverBudget 
                  ? '⚠️ Te vas a quedar corto de presupuesto' 
                  : isLowBudget
                  ? '⚠️ Presupuesto ajustado, cuidado con gastos extras'
                  : '✅ Vas a sobrevivir el mes sin problemas'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gastos Realizados</p>
            <p className="text-lg font-bold text-white">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Deudas Pendientes</p>
            <p className="text-lg font-bold text-amber-300">{formatCurrency(pendingPaymentsThisMonth.total)}</p>
            <p className="text-xs text-slate-500 mt-1">{pendingPaymentsThisMonth.count} pago{pendingPaymentsThisMonth.count !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Proyectado</p>
            <p className="text-lg font-bold text-rose-300">{formatCurrency(projectedTotal)}</p>
          </div>
          <div className={`bg-slate-900/50 rounded-xl p-4 border-2 ${
            isOverBudget ? 'border-rose-500/50' : isLowBudget ? 'border-amber-500/50' : 'border-emerald-500/50'
          }`}>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Te Queda</p>
            <p className={`text-lg font-bold ${
              isOverBudget ? 'text-rose-400' : isLowBudget ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Uso del presupuesto</span>
            <span>{((projectedTotal / totalIncome) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isOverBudget 
                  ? 'bg-linear-to-r from-rose-500 to-red-600' 
                  : isLowBudget
                  ? 'bg-linear-to-r from-amber-500 to-orange-500'
                  : 'bg-linear-to-r from-emerald-500 to-green-500'
              }`}
              style={{ width: `${Math.min((projectedTotal / totalIncome) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Evolución Mensual
            </h2>
            <p className="text-sm text-slate-400">
              Balance acumulado por fecha
            </p>
          </div>
        </div>

        <div className="mt-6 h-72">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No hay movimientos para graficar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: '#0f172a',
                    borderRadius: 12,
                    border: 'none',
                    color: '#e2e8f0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#balance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}
