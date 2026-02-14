import { useEffect, useState } from 'react'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../components/ui/Card'
import api from '../services/api'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [error, setError] = useState('')

  useEffect(() => {
    loadReports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/reports/monthly?year=${selectedYear}`)
      setReports(response.data)
    } catch {
      setError('Error al cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  // Calcular totales del año
  const yearTotals = reports.reduce(
    (acc, report) => ({
      income: acc.income + parseFloat(report.total_income),
      expense: acc.expense + parseFloat(report.total_expense),
      balance: acc.balance + parseFloat(report.balance),
    }),
    { income: 0, expense: 0, balance: 0 }
  )

  const positiveMonths = reports.filter((r) => r.is_positive).length
  const negativeMonths = reports.filter((r) => !r.is_positive && parseFloat(r.balance) !== 0).length

  // Preparar datos para el gráfico
  const chartData = reports.map((report) => ({
    name: report.month_name.substring(0, 3),
    Ingresos: parseFloat(report.total_income),
    Gastos: parseFloat(report.total_expense),
    Balance: parseFloat(report.balance),
  }))

  if (loading) {
    return <div className="text-slate-500">Cargando reportes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Reportes Mensuales
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Análisis de ingresos y gastos por mes
          </p>
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026, 2027].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumen del año */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Ingresos</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(yearTotals.income)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Gastos</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(yearTotals.expense)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Balance Anual</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  yearTotals.balance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {formatCurrency(yearTotals.balance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Estado Mensual</p>
            <div className="flex gap-4 mt-2">
              <div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {positiveMonths}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Positivos</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {negativeMonths}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Negativos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Comparativa Mensual
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Ingresos" fill="#10b981" />
            <Bar dataKey="Gastos" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabla de reportes */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Detalle Mensual {selectedYear}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Mes
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Ingresos
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Gastos
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const hasActivity = parseFloat(report.total_income) > 0 || parseFloat(report.total_expense) > 0
                
                return (
                  <tr
                    key={report.month}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {report.month_name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(report.total_income)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-amber-600 dark:text-amber-400">
                      {formatCurrency(report.total_expense)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-semibold ${
                        report.is_positive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(report.balance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasActivity ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            report.is_positive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {report.is_positive ? (
                            <>
                              <TrendingUp size={14} /> Positivo
                            </>
                          ) : (
                            <>
                              <TrendingDown size={14} /> Negativo
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Sin actividad</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
