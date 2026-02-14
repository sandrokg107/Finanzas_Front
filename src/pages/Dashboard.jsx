import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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

        const [summaryResponse, transactionsResponse] = await Promise.all([
          api.get(`/dashboard/summary?month=${month}&year=${year}`),
          api.get(`/transactions?month=${month}&year=${year}&page=1&page_size=200`),
        ])

        setSummary(summaryResponse.data)
        setTransactions(transactionsResponse.data)
      } catch {
        setError('No se pudo cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Resumen financiero del mes actual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            Ingresos
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(summary?.total_income || 0)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500">
            Gastos
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(summary?.total_expense || 0)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500">
            Balance
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(summary?.balance || 0)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Evolucion mensual
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Balance acumulado por fecha.
            </p>
          </div>
        </div>

        <div className="mt-6 h-72">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No hay movimientos para graficar.
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
