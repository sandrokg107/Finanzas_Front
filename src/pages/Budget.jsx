import { useEffect, useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2, TrendingDown } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'

export default function Budget() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [formState, setFormState] = useState({
    category_id: '',
    amount: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadBudgets()
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`)
      setBudgets(response.data)
    } catch {
      setError('Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch {
      // Silencioso
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const openCreateModal = () => {
    setEditingBudget(null)
    setFormState({ category_id: '', amount: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (budget) => {
    setEditingBudget(budget)
    setFormState({ category_id: budget.category_id, amount: budget.amount })
    setFormError('')
    setShowModal(true)
  }

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      if (editingBudget) {
        // Actualizar
        await api.patch(`/budgets/${editingBudget.id}`, {
          amount: parseFloat(formState.amount),
        })
      } else {
        // Crear
        await api.post('/budgets', {
          category_id: parseInt(formState.category_id),
          amount: parseFloat(formState.amount),
          month: selectedMonth,
          year: selectedYear,
        })
      }

      await loadBudgets()
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al guardar presupuesto')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (budgetId) => {
    if (!confirm('¿Eliminar este presupuesto?')) return

    try {
      await api.delete(`/budgets/${budgetId}`)
      await loadBudgets()
    } catch {
      alert('Error al eliminar presupuesto')
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-amber-500'
    if (percentage >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-amber-600 dark:text-amber-400'
    if (percentage >= 80) return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0)
  const totalRemaining = totalBudget - totalSpent

  if (loading) {
    return <div className="text-slate-500">Cargando presupuestos...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600/80 dark:text-amber-400">
            Gestion de gastos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Presupuestos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            Controla limites por categoria y detecta rapidamente cuando un presupuesto se acerca al tope.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <select
              className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:text-slate-100"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <span className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <select
              className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:text-slate-100"
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
          <Button
            onClick={openCreateModal}
            className="px-5 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
          >
            <Plus size={16} />
            Nuevo presupuesto
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/80 bg-linear-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Presupuesto total
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalBudget)}
          </p>
        </Card>
        <Card className="border-slate-200/80 bg-linear-to-br from-amber-50 to-white dark:border-slate-800 dark:from-amber-900/20 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Gastado
          </p>
          <p className="text-3xl font-semibold text-amber-600 dark:text-amber-400 mt-3">
            {formatCurrency(totalSpent)}
          </p>
        </Card>
        <Card className="border-slate-200/80 bg-linear-to-br from-emerald-50 to-white dark:border-slate-800 dark:from-emerald-900/20 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Disponible
          </p>
          <p
            className={`text-3xl font-semibold mt-3 ${
              totalRemaining >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatCurrency(totalRemaining)}
          </p>
        </Card>
      </div>

      {/* Lista de presupuestos */}
      {budgets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <TrendingDown className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No hay presupuestos para {monthNames[selectedMonth - 1]} {selectedYear}
            </p>
            <Button onClick={openCreateModal}>Crear Primer Presupuesto</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="group border-slate-200/80 transition-shadow hover:shadow-md dark:border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {budget.category_name}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">
                    {formatCurrency(budget.amount)} presupuestado
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(budget)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Gastado</span>
                  <span className={`font-semibold ${getStatusColor(budget.percentage)}`}>
                    {formatCurrency(budget.spent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Disponible</span>
                  <span className={`font-semibold ${getStatusColor(budget.percentage)}`}>
                    {formatCurrency(budget.remaining)}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {budget.percentage.toFixed(1)}%
                    </span>
                    {budget.percentage >= 80 && (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getProgressColor(budget.percentage)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {budget.percentage >= 100 && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    ¡Presupuesto excedido!
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-md p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Presupuesto
              </p>
              <h2 className="mb-5 mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingBudget && (
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Categoría
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formState.category_id}
                      onChange={(e) => handleChange('category_id', e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar categoría --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <Input
                  label="Monto presupuestado"
                  className="focus:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-900"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formState.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  required
                />

                {!editingBudget && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Para {monthNames[selectedMonth - 1]} {selectedYear}
                  </p>
                )}

                {formError && (
                  <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                    {formError}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  >
                    {formLoading ? 'Guardando...' : editingBudget ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
