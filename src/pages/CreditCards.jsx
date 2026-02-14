import { useEffect, useState } from 'react'
import { CreditCard as CreditCardIcon, Edit2, Plus, Trash2, TrendingDown } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'

export default function CreditCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [formState, setFormState] = useState({
    name: '',
    credit_limit: '',
    closing_day: '12',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setLoading(true)
      const response = await api.get('/credit-cards')
      setCards(response.data)
    } catch {
      setError('Error al cargar tarjetas')
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

  const openCreateModal = () => {
    setEditingCard(null)
    setFormState({ name: '', credit_limit: '', closing_day: '12' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (card) => {
    setEditingCard(card)
    setFormState({
      name: card.name,
      credit_limit: card.credit_limit,
      closing_day: card.closing_day,
    })
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
      const payload = {
        name: formState.name,
        credit_limit: parseFloat(formState.credit_limit),
        closing_day: parseInt(formState.closing_day),
      }

      if (editingCard) {
        await api.patch(`/credit-cards/${editingCard.id}`, payload)
      } else {
        await api.post('/credit-cards', payload)
      }

      await loadCards()
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al guardar tarjeta')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (cardId) => {
    if (!confirm('¿Eliminar esta tarjeta?')) return

    try {
      await api.delete(`/credit-cards/${cardId}`)
      await loadCards()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar tarjeta')
    }
  }

  const getUsagePercentage = (card) => {
    return (parseFloat(card.used_amount) / parseFloat(card.credit_limit)) * 100
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-amber-500'
    if (percentage >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const totalLimit = cards.reduce((sum, c) => sum + parseFloat(c.credit_limit), 0)
  const totalUsed = cards.reduce((sum, c) => sum + parseFloat(c.used_amount), 0)
  const totalAvailable = totalLimit - totalUsed

  if (loading) {
    return <div className="text-slate-500">Cargando tarjetas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Tarjetas de Crédito
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestiona tus tarjetas y saldos
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Nueva Tarjeta
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Límite Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalLimit)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Usado</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalUsed)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Disponible</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalAvailable)}
          </p>
        </Card>
      </div>

      {/* Lista de tarjetas */}
      {cards.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No tienes tarjetas registradas
            </p>
            <Button onClick={openCreateModal}>Agregar Primera Tarjeta</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const percentage = getUsagePercentage(card)
            return (
              <Card key={card.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon size={20} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {card.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(card)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Límite</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(card.credit_limit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Usado</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(card.used_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Disponible</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(card.available_amount)}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {percentage.toFixed(1)}% usado
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Cierre día {card.closing_day}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-md">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
                {editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre"
                  type="text"
                  placeholder="Visa, MasterCard, etc."
                  value={formState.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />

                <Input
                  label="Límite de Crédito"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formState.credit_limit}
                  onChange={(e) => handleChange('credit_limit', e.target.value)}
                  required
                />

                <Input
                  label="Día de Cierre"
                  type="number"
                  min="1"
                  max="31"
                  value={formState.closing_day}
                  onChange={(e) => handleChange('closing_day', e.target.value)}
                  required
                />

                {formError && (
                  <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                    {formError}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? 'Guardando...' : editingCard ? 'Actualizar' : 'Crear'}
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
