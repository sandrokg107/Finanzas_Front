import { useEffect, useState } from 'react'
import { AlertCircle, Plus, Trash2, CheckCircle, Circle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'

export default function Debts() {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    creditor: '',
    total_amount: '',
    monthly_payment: '',
    start_date: '',
    due_date: '',
    description: '',
  })
  const [expandedDebt, setExpandedDebt] = useState(null)

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/debts?include_paid=true')
      setDebts(response.data)
    } catch {
      setError('Error al cargar las deudas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.creditor || !formData.total_amount) {
      setError('Acreedor y monto son requeridos')
      return
    }

    try {
      await api.post('/debts', {
        creditor: formData.creditor,
        total_amount: parseFloat(formData.total_amount),
        monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        description: formData.description || null,
      })

      setFormData({ creditor: '', total_amount: '', monthly_payment: '', start_date: '', due_date: '', description: '' })
      setShowModal(false)
      loadDebts()
    } catch {
      setError('Error al crear la deuda')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta deuda?')) return

    try {
      await api.delete(`/debts/${id}`)
      loadDebts()
    } catch {
      setError('Error al eliminar la deuda')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount)
  }

  const getProgressPercentage = (paid, total) => {
    return (paid / total) * 100
  }

  const isPaid = (debt) => {
    return parseFloat(debt.paid_amount) >= parseFloat(debt.total_amount)
  }

  const handleMarkPaid = async (paymentId) => {
    try {
      await api.post(`/debts/payments/${paymentId}/mark-paid`, {})
      loadDebts()
    } catch {
      setError('Error al marcar el pago como realizado')
    }
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const isUpcoming = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  if (loading) {
    return <div className="text-slate-500">Cargando deudas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Mis Deudas
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          Nueva Deuda
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => {
          const progress = getProgressPercentage(debt.paid_amount, debt.total_amount)
          const remaining = parseFloat(debt.total_amount) - parseFloat(debt.paid_amount)
          const paid = isPaid(debt)

          return (
            <Card key={debt.id} className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                    {debt.creditor}
                  </h3>
                  {debt.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {debt.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(debt.id)}
                  className="text-slate-400 hover:text-amber-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Total</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {formatCurrency(debt.total_amount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Pagado</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(debt.paid_amount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Restante</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(remaining)}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        paid ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {(debt.start_date || debt.due_date) && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    {debt.start_date && (
                      <div>Inicio: {new Date(debt.start_date).toLocaleDateString('es-ES')}</div>
                    )}
                    {debt.due_date && (
                      <div>Vence: {new Date(debt.due_date).toLocaleDateString('es-ES')}</div>
                    )}
                  </div>
                )}

                {paid && (
                  <div className="mt-2 inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                    ✓ Pagada
                  </div>
                )}

                {/* Cronograma de pagos */}
                {debt.payments && debt.payments.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <button
                      onClick={() => setExpandedDebt(expandedDebt === debt.id ? null : debt.id)}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 mb-2"
                    >
                      {expandedDebt === debt.id ? '▼' : '▶'} Cronograma ({debt.payments.filter(p => !p.is_paid).length} pendientes)
                    </button>

                    {expandedDebt === debt.id && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {debt.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className={`flex items-center justify-between p-2 rounded text-xs ${
                              payment.is_paid
                                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                : isOverdue(payment.due_date)
                                ? 'bg-amber-50 dark:bg-amber-900/20'
                                : isUpcoming(payment.due_date)
                                ? 'bg-amber-50 dark:bg-amber-900/20'
                                : 'bg-slate-50 dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {payment.is_paid ? (
                                <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle size={16} className="text-slate-400" />
                              )}
                              <div>
                                <div className="font-medium text-slate-800 dark:text-white">
                                  {new Date(payment.due_date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                {payment.is_paid && payment.paid_date && (
                                  <div className="text-emerald-600 dark:text-emerald-400">
                                    Pagado: {new Date(payment.paid_date).toLocaleDateString('es-ES')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </span>
                              {!payment.is_paid && (
                                <button
                                  onClick={() => handleMarkPaid(payment.id)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors"
                                >
                                  Marcar Pagado
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {paid && (
                  <div className="mt-2 inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                    ✓ Pagada
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {debts.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No tienes deudas registradas
        </div>
      )}

      {/* Modal para crear deuda */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="max-w-md w-full">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Nueva Deuda
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Acreedor *"
                placeholder="Nombre del acreedor"
                value={formData.creditor}
                onChange={(e) =>
                  setFormData({ ...formData, creditor: e.target.value })
                }
                required
              />

              <Input
                label="Monto Total *"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({ ...formData, total_amount: e.target.value })
                }
                required
              />

              <Input
                label="Pago Mensual"
                type="number"
                step="0.01"
                placeholder="0.00 (opcional, para cronograma)"
                value={formData.monthly_payment}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_payment: e.target.value })
                }
              />

              <Input
                label="Fecha Inicio de Pagos"
                type="date"
                placeholder="Cuándo empieza a pagar"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />

              <Input
                label="Fecha de Vencimiento Final"
                type="date"
                placeholder="Hasta cuándo paga"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />

              <Input
                label="Descripción"
                placeholder="Descripción opcional"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Deuda</Button>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}
    </div>
  )
}
