import { useEffect, useState } from 'react'
import api from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value)

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [debts, setDebts] = useState([])
  const [categories, setCategories] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formState, setFormState] = useState({
    type: 'income',
    amount: '',
    date: '',
    category_id: '',
    description: '',
    debt_id: '',
    payment_method: 'cash',
    credit_card_id: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const loadTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/transactions?page=1&page_size=200')
      setTransactions(response.data)
    } catch {
      setError('No se pudo cargar las transacciones')
    } finally {
      setLoading(false)
    }
  }

  const loadDebts = async () => {
    try {
      const response = await api.get('/debts?include_paid=false')
      setDebts(response.data)
    } catch {
      // Silencioso, no es crítico
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch {
      // Silencioso, no es crítico
    }
  }

  const loadCreditCards = async () => {
    try {
      const response = await api.get('/credit-cards')
      setCreditCards(response.data)
    } catch {
      // Silencioso, no es crítico
    }
  }

  useEffect(() => {
    loadTransactions()
    loadDebts()
    loadCategories()
    loadCreditCards()
  }, [])

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : `#${categoryId}`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      if (!formState.amount || Number(formState.amount) <= 0) {
        setFormError('El monto debe ser mayor a 0')
        setFormLoading(false)
        return
      }
      if (formState.type === 'expense' && (!formState.category_id || Number(formState.category_id) <= 0)) {
        setFormError('La categoria es obligatoria')
        setFormLoading(false)
        return
      }

      const resolvedCategoryId = formState.type === 'income' ? 1 : Number(formState.category_id)

      const payload = {
        ...formState,
        amount: Number(formState.amount),
        category_id: resolvedCategoryId,
        debt_id: formState.debt_id ? Number(formState.debt_id) : null,
        credit_card_id: formState.credit_card_id ? Number(formState.credit_card_id) : null,
      }

      await api.post('/transactions', payload)
      setShowModal(false)
      setFormState({
        type: 'income',
        amount: '',
        date: '',
        category_id: '',
        description: '',
        debt_id: '',
        payment_method: 'cash',
        credit_card_id: '',
      })
      await loadTransactions()
      await loadDebts()
    } catch {
      setFormError('No se pudo crear la transaccion')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transacciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Todas las operaciones registradas.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Agregar Transaccion</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Cargando...</div>
        ) : error ? (
          <div className="p-6 text-rose-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Descripcion
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {getCategoryName(item.category_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {item.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <Card className="w-full max-w-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nueva transaccion
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tipo
                </span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={formState.type}
                  onChange={(event) => {
                    const nextType = event.target.value
                    handleChange('type', nextType)
                    if (nextType === 'income') {
                      handleChange('debt_id', '')
                      handleChange('category_id', '')
                    }
                  }}
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formState.amount}
                  onChange={(event) => handleChange('amount', event.target.value)}
                  required
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={formState.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                  required
                />
              </div>

              {formState.type === 'expense' ? (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Categoría
                  </span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={formState.category_id}
                    onChange={(event) => handleChange('category_id', event.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar categoría --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Categoría automática: Salario
                </div>
              )}

              <Input
                label="Descripcion"
                type="text"
                value={formState.description}
                onChange={(event) => handleChange('description', event.target.value)}
              />

              {formState.type === 'expense' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Método de Pago
                  </span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={formState.payment_method}
                    onChange={(event) => {
                      handleChange('payment_method', event.target.value)
                      if (event.target.value === 'cash') {
                        handleChange('credit_card_id', '')
                      }
                    }}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="credit_card">Tarjeta de Crédito</option>
                  </select>
                </label>
              )}

              {formState.type === 'expense' && formState.payment_method === 'credit_card' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Tarjeta
                  </span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={formState.credit_card_id}
                    onChange={(event) => handleChange('credit_card_id', event.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar tarjeta --</option>
                    {creditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} - Disponible: {formatCurrency(card.available_amount)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {formState.type === 'expense' && debts.length > 0 && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Vincular con Deuda (Opcional)
                  </span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={formState.debt_id}
                    onChange={(event) => handleChange('debt_id', event.target.value)}
                  >
                    <option value="">-- Ninguna --</option>
                    {debts.map((debt) => {
                      const remaining = parseFloat(debt.total_amount) - parseFloat(debt.paid_amount)
                      return (
                        <option key={debt.id} value={debt.id}>
                          {debt.creditor} - Resta: {formatCurrency(remaining)}
                        </option>
                      )
                    })}
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Si vinculas este gasto con una deuda, se actualizará el monto pagado automáticamente
                  </p>
                </label>
              )}

              {formError && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Guardando...' : 'Guardar'}
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
