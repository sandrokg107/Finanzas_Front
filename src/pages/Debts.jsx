import { useEffect, useState } from 'react'
import { AlertCircle, Plus, Trash2, CheckCircle, Circle, Bell, AlertTriangle, CreditCard, Calendar, ChevronDown, ChevronUp, TrendingUp, XCircle, Upload, Eye, X } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'

export default function Debts() {
  const [debts, setDebts] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    creditor: '',
    total_amount: '',
    monthly_payment: '',
    total_installments: '',
    payment_day: '',
    start_date: '',
    due_date: '',
    reminder_days: '3',
    description: '',
    paid_installments_count: '',
  })
  const [expandedDebt, setExpandedDebt] = useState(null)
  const [paymentModal, setPaymentModal] = useState({ show: false, paymentId: null, amount: 0 })
  const [paymentFormData, setPaymentFormData] = useState({
    payment_method: '',
    voucher: null
  })
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [voucherModal, setVoucherModal] = useState({
    show: false,
    amount: 0,
    paymentMethod: '',
    filename: '',
    fileUrl: '',
    fileType: ''
  })
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    debtId: null,
    creditor: ''
  })

  useEffect(() => {
    loadDebts()
    loadReminders()
  }, [])

  // Calcular automáticamente el total de cuotas cuando cambien monto total o pago mensual
  useEffect(() => {
    if (formData.total_amount && formData.monthly_payment) {
      const total = parseFloat(formData.total_amount)
      const monthly = parseFloat(formData.monthly_payment)
      
      if (total > 0 && monthly > 0) {
        const installments = Math.ceil(total / monthly)
        setFormData(prev => ({ ...prev, total_installments: installments.toString() }))
      }
    }
  }, [formData.total_amount, formData.monthly_payment])

  // Calcular automáticamente la fecha de vencimiento cuando cambien fecha inicio y total cuotas
  useEffect(() => {
    if (formData.start_date && formData.total_installments) {
      const installments = parseInt(formData.total_installments)
      
      if (installments > 0) {
        const startDate = new Date(formData.start_date)
        // Sumar el número de meses (cuotas - 1, porque la primera cuota es en la fecha de inicio)
        startDate.setMonth(startDate.getMonth() + installments - 1)
        
        // Formatear como YYYY-MM-DD para el input date
        const dueDate = startDate.toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, due_date: dueDate }))
      }
    }
  }, [formData.start_date, formData.total_installments])

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

  const loadReminders = async () => {
    try {
      const response = await api.get('/debts/reminders/upcoming')
      setReminders(response.data)
    } catch {
      console.error('Error al cargar recordatorios')
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
        total_installments: formData.total_installments ? parseInt(formData.total_installments) : null,
        payment_day: formData.payment_day ? parseInt(formData.payment_day) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        reminder_days: formData.reminder_days ? parseInt(formData.reminder_days) : 3,
        description: formData.description || null,
        paid_installments_count: formData.paid_installments_count ? parseInt(formData.paid_installments_count) : null,
      })

      setFormData({ 
        creditor: '', 
        total_amount: '', 
        monthly_payment: '', 
        total_installments: '',
        payment_day: '',
        start_date: '', 
        due_date: '', 
        reminder_days: '3',
        description: '',
        paid_installments_count: '',
      })
      setShowModal(false)
      loadDebts()
      loadReminders()
    } catch {
      setError('Error al crear la deuda')
    }
  }

  const openDeleteModal = (debtId, creditor) => {
    setDeleteModal({ show: true, debtId, creditor })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, debtId: null, creditor: '' })
  }

  const handleDelete = async () => {
    if (!deleteModal.debtId) return
    try {
      await api.delete(`/debts/${deleteModal.debtId}`)
      closeDeleteModal()
      setSuccess('✅ Deuda eliminada correctamente')
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

  const openPaymentModal = (paymentId, amount) => {
    setPaymentModal({ show: true, paymentId, amount })
    setPaymentFormData({ payment_method: '', voucher: null })
    setVoucherPreview(null)
  }

  const closePaymentModal = () => {
    setPaymentModal({ show: false, paymentId: null, amount: 0 })
    setPaymentFormData({ payment_method: '', voucher: null })
    setVoucherPreview(null)
  }

  const handleVoucherChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar 5MB')
        return
      }
      
      // Validar tipo
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten archivos PDF, PNG o JPG')
        return
      }
      
      setPaymentFormData({ ...paymentFormData, voucher: file })
      
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setVoucherPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setVoucherPreview('pdf')
      }
    }
  }

  const handleMarkPaid = async () => {
    try {
      setError('')
      setSuccess('')
      
      if (!paymentFormData.payment_method) {
        setError('Selecciona un método de pago')
        return
      }
      
      // Marcar como pagado
      const response = await api.post(`/debts/payments/${paymentModal.paymentId}/mark-paid`, {
        payment_method: paymentFormData.payment_method
      })
      
      // Subir comprobante si existe
      if (paymentFormData.voucher) {
        const formData = new FormData()
        formData.append('file', paymentFormData.voucher)
        
        try {
          await api.post(`/debts/payments/${paymentModal.paymentId}/upload-voucher`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } catch (err) {
          console.error('Error al subir comprobante:', err)
          setError('Pago registrado pero hubo un error al subir el comprobante')
        }
      }
      
      // Mostrar mensaje según si fue tarde o no
      if (response.data.was_late) {
        setSuccess('⚠️ Pago registrado (se realizó después de la fecha de vencimiento)')
      } else {
        setSuccess('✅ Pago registrado correctamente')
      }
      
      closePaymentModal()
      loadDebts()
      loadReminders()
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al marcar el pago como realizado')
    }
  }

  const closeVoucherModal = () => {
    if (voucherModal.fileUrl) {
      window.URL.revokeObjectURL(voucherModal.fileUrl)
    }
    setVoucherModal({
      show: false,
      amount: 0,
      paymentMethod: '',
      filename: '',
      fileUrl: '',
      fileType: ''
    })
  }

  const handleViewVoucher = async (payment) => {
    try {
      const response = await api.get(`/debts/payments/${payment.id}/download-voucher`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: response.data.type })
      const fileUrl = window.URL.createObjectURL(blob)
      const contentType = response.headers['content-type'] || blob.type || ''
      const isPdf = contentType.includes('pdf') || (payment.voucher_filename || '').toLowerCase().endsWith('.pdf')

      setVoucherModal({
        show: true,
        amount: payment.amount,
        paymentMethod: payment.payment_method || 'No especificado',
        filename: payment.voucher_filename || `comprobante-${payment.id}`,
        fileUrl,
        fileType: isPdf ? 'pdf' : 'image'
      })
    } catch {
      setError('Error al visualizar el comprobante')
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

  const getRemainingInstallments = (debt) => {
    if (!debt.payments || debt.payments.length === 0) return null
    return debt.payments.filter(p => !p.is_paid).length
  }

  const getTotalInstallments = (debt) => {
    if (!debt.payments || debt.payments.length === 0) return null
    return debt.payments.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Cargando deudas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-500/30 pb-12">
      
      {/* Fondo Decorativo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 mt-8">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Mis Deudas
            </h1>
            <p className="text-slate-400">Control de préstamos y cronogramas de pago</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Deuda
          </button>
        </header>

        {/* Alerta de Error Global */}
        {error && (
          <div className="bg-rose-900/30 border border-rose-500/20 text-rose-200 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 backdrop-blur-sm mb-6 shadow-lg shadow-rose-900/10">
            <XCircle size={20} className="text-rose-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Alerta de Éxito */}
        {success && (
          <div className="bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 backdrop-blur-sm mb-6 shadow-lg shadow-emerald-900/10">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Sección de Recordatorios */}
        {reminders.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <Bell size={20} className="animate-pulse" />
              <h2 className="text-lg font-bold text-white">Recordatorios de Pagos</h2>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/10 text-amber-200 text-sm font-medium">
                Tienes {reminders.length} pago{reminders.length !== 1 ? 's' : ''} próximo{reminders.length !== 1 ? 's' : ''} a vencer o vencido{reminders.length !== 1 ? 's' : ''}
              </div>
              <div className="divide-y divide-slate-700/50">
                {reminders.slice(0, 5).map((reminder) => (
                  <div 
                    key={reminder.payment_id}
                    className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                      reminder.is_overdue 
                        ? 'bg-rose-500/5 hover:bg-rose-500/10' 
                        : 'bg-amber-500/5 hover:bg-amber-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${reminder.is_overdue ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{reminder.debt_creditor}</h4>
                        {reminder.is_overdue ? (
                          <p className="text-rose-400 font-medium text-sm">
                            ¡Vencido hace {Math.abs(reminder.days_until_due)} día{Math.abs(reminder.days_until_due) !== 1 ? 's' : ''}!
                          </p>
                        ) : reminder.days_until_due === 0 ? (
                          <p className="text-amber-400 font-medium text-sm">¡Vence hoy!</p>
                        ) : (
                          <p className="text-amber-400 font-medium text-sm">
                            Vence en {reminder.days_until_due} día{reminder.days_until_due !== 1 ? 's' : ''}
                          </p>
                        )}
                        <p className="text-slate-400 text-xs mt-1">
                          Fecha límite: {new Date(reminder.due_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="block text-xs text-slate-400 uppercase">Monto</span>
                        <span className="font-bold text-white text-lg">{formatCurrency(reminder.payment_amount)}</span>
                      </div>
                      <button 
                        onClick={() => openPaymentModal(reminder.payment_id, reminder.payment_amount)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        Pagar Ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      <div className="grid gap-6 grid-cols-1">
        {debts.map((debt) => {
          const progress = getProgressPercentage(debt.paid_amount, debt.total_amount)
          const remaining = parseFloat(debt.total_amount) - parseFloat(debt.paid_amount)
          const paid = isPaid(debt)

          return (
            <div 
              key={debt.id} 
              className="relative bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                    <CreditCard size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white tracking-tight">
                      {debt.creditor}
                    </h3>
                    {debt.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {debt.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openDeleteModal(debt.id, debt.creditor)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30">
                    <span className="text-xs text-slate-400 uppercase block mb-1 font-semibold">Total</span>
                    <span className="font-bold text-white text-sm wrap-break-word">
                      {formatCurrency(debt.total_amount)}
                    </span>
                  </div>

                  <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/30">
                    <span className="text-xs text-emerald-300 uppercase block mb-1 font-semibold">Pagado</span>
                    <span className="font-bold text-emerald-400 text-sm wrap-break-word">
                      {formatCurrency(debt.paid_amount)}
                    </span>
                  </div>

                  <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30">
                    <span className="text-xs text-amber-300 uppercase block mb-1 font-semibold">Restante</span>
                    <span className="font-bold text-amber-400 text-sm wrap-break-word">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span className="font-medium">Progreso</span>
                    <span className="font-bold text-white">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        paid 
                          ? 'bg-linear-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/50' 
                          : 'bg-linear-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Info adicional */}
                <div className="bg-slate-700/30 rounded-xl p-4 space-y-2 border border-slate-600/30">
                  {debt.start_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Calendar size={14} />
                        Inicio:
                      </span>
                      <span className="font-semibold text-white">{new Date(debt.start_date).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {debt.due_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Calendar size={14} />
                        Vence:
                      </span>
                      <span className="font-semibold text-white">{new Date(debt.due_date).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {debt.payment_day && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Día de pago:</span>
                      <span className="font-semibold text-blue-400">Día {debt.payment_day} de cada mes</span>
                    </div>
                  )}
                  {getTotalInstallments(debt) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Cuotas:</span>
                      <span className="font-semibold text-white">
                        {getRemainingInstallments(debt)} de {getTotalInstallments(debt)} pendientes
                      </span>
                    </div>
                  )}
                  {debt.reminder_days && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Bell size={14} />
                        Recordatorio:
                      </span>
                      <span className="font-semibold text-amber-400">{debt.reminder_days} día{debt.reminder_days !== 1 ? 's' : ''} antes</span>
                    </div>
                  )}
                </div>

                {paid && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold shadow-lg shadow-emerald-900/20">
                    <CheckCircle size={16} />
                    Pagada
                  </div>
                )}

                {/* Cronograma de pagos */}
                {debt.payments && debt.payments.length > 0 && (
                  <div className="border-t border-slate-600/50 pt-4">
                    <button
                      onClick={() => setExpandedDebt(expandedDebt === debt.id ? null : debt.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors w-full"
                    >
                      {expandedDebt === debt.id ? (
                        <ChevronUp size={18} className="text-blue-400" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                      <span>Cronograma de Pagos</span>
                      <span className="ml-auto bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                        {debt.payments.filter(p => !p.is_paid).length} pendientes
                      </span>
                    </button>

                    {expandedDebt === debt.id && (
                      <div className="mt-4">
                        {/* Encabezados de columnas */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 mb-2 rounded-lg bg-slate-700/20 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          <div className="col-span-1">Estado</div>
                          <div className="col-span-3">Fecha de Vencimiento</div>
                          <div className="col-span-3">Fecha de Pago</div>
                          <div className="col-span-2">Monto</div>
                          <div className="col-span-3">Acción</div>
                        </div>

                        {/* Lista de pagos */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                          {debt.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className={`grid md:grid-cols-12 gap-2 p-3 rounded-lg border transition-all ${
                                payment.is_paid
                                  ? payment.was_late
                                    ? 'bg-orange-500/10 border-orange-500/30'
                                    : 'bg-emerald-500/10 border-emerald-500/30'
                                  : isOverdue(payment.due_date)
                                  ? 'bg-rose-500/10 border-rose-500/30 animate-pulse'
                                  : isUpcoming(payment.due_date)
                                  ? 'bg-amber-500/10 border-amber-500/30'
                                  : 'bg-slate-700/30 border-slate-600/30'
                              }`}
                            >
                              {/* Estado (icono) */}
                              <div className="col-span-1 flex items-center justify-center">
                                {payment.is_paid ? (
                                  payment.was_late ? (
                                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                                      <AlertTriangle size={16} className="text-orange-400" />
                                    </div>
                                  ) : (
                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                      <CheckCircle size={16} className="text-emerald-400" />
                                    </div>
                                  )
                                ) : isOverdue(payment.due_date) ? (
                                  <div className="p-1.5 bg-rose-500/20 rounded-lg">
                                    <AlertTriangle size={16} className="text-rose-400" />
                                  </div>
                                ) : (
                                  <div className="p-1.5 bg-slate-600/30 rounded-lg">
                                    <Circle size={16} className="text-slate-400" />
                                  </div>
                                )}
                              </div>

                              {/* Fecha de vencimiento */}
                              <div className="col-span-12 md:col-span-3">
                                <span className="text-xs text-slate-400 md:hidden font-semibold">Vence:</span>
                                <p className="font-semibold text-white text-sm">
                                  {new Date(payment.due_date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>

                              {/* Fecha de pago (si está pagado) */}
                              <div className="col-span-12 md:col-span-3">
                                {payment.is_paid && payment.paid_date ? (
                                  <>
                                    <span className="text-xs text-slate-400 md:hidden font-semibold">Pagado:</span>
                                    <p className={`font-semibold text-sm ${
                                      payment.was_late ? 'text-orange-400' : 'text-emerald-400'
                                    }`}>
                                      {new Date(payment.paid_date).toLocaleDateString('es-ES')}
                                      {payment.was_late && ' ⚠️'}
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-500">Pendiente</span>
                                )}
                              </div>

                              {/* Monto */}
                              <div className="col-span-12 md:col-span-2">
                                <span className="text-xs text-slate-400 md:hidden font-semibold">Monto:</span>
                                <p className="font-bold text-white text-sm">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>

                              {/* Acción */}
                              <div className="col-span-12 md:col-span-3 flex justify-end gap-2">
                                {!payment.is_paid ? (
                                  <button
                                    onClick={() => openPaymentModal(payment.id, payment.amount)}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 w-full md:w-auto"
                                  >
                                    Pagar
                                  </button>
                                ) : payment.voucher_path ? (
                                  <button
                                    onClick={() => handleViewVoucher(payment)}
                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-900/20 hover:scale-105 flex items-center gap-1"
                                    title="Ver comprobante"
                                  >
                                    <Eye size={14} />
                                    Ver
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paid && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold shadow-lg shadow-emerald-900/20">
                    <CheckCircle size={16} />
                    Pagada
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {debts.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl">
            <CreditCard size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tienes deudas registradas</p>
            <p className="text-slate-500 text-sm mt-2">Comienza agregando una nueva deuda</p>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteModal.show && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeDeleteModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Eliminar deuda</h2>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-slate-700/30 border border-slate-600/40 rounded-xl p-3 mb-5">
              <p className="text-sm text-slate-300">
                ¿Seguro que deseas eliminar la deuda de
                <span className="font-semibold text-white"> {deleteModal.creditor}</span>?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/30 transition-all hover:scale-105"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualización de Comprobante */}
      {voucherModal.show && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeVoucherModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Comprobante de Pago</h2>
                <p className="text-slate-400 text-sm mt-1">{voucherModal.filename}</p>
              </div>
              <button
                onClick={closeVoucherModal}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30">
                <span className="text-xs text-slate-400 uppercase block mb-1">Monto del pago</span>
                <span className="font-bold text-emerald-400 text-lg">{formatCurrency(voucherModal.amount)}</span>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30">
                <span className="text-xs text-slate-400 uppercase block mb-1">Método de pago</span>
                <span className="font-bold text-white text-lg">{voucherModal.paymentMethod}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
              {voucherModal.fileType === 'pdf' ? (
                <iframe
                  src={voucherModal.fileUrl}
                  title="Vista previa PDF"
                  className="w-full h-[60vh] rounded-lg bg-white"
                />
              ) : (
                <img
                  src={voucherModal.fileUrl}
                  alt="Comprobante"
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {paymentModal.show && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closePaymentModal}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Registrar Pago
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Monto: <span className="font-bold text-emerald-400">{formatCurrency(paymentModal.amount)}</span>
                </p>
              </div>
              <button
                onClick={closePaymentModal}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Selecciona un método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Comprobante (Opcional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Comprobante (Opcional)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleVoucherChange}
                      className="hidden"
                      id="voucher-upload"
                    />
                    <label
                      htmlFor="voucher-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700/50 border-2 border-dashed border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/70 hover:border-slate-500 transition-all cursor-pointer"
                    >
                      <Upload size={20} />
                      <span>{paymentFormData.voucher ? paymentFormData.voucher.name : 'Subir PDF, PNG o JPG (máx 5MB)'}</span>
                    </label>
                  </div>

                  {/* Preview */}
                  {voucherPreview && (
                    <div className="relative bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      {voucherPreview === 'pdf' ? (
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-rose-500/20 rounded-lg">
                            <AlertCircle size={24} className="text-rose-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Archivo PDF</p>
                            <p className="text-xs text-slate-400">{paymentFormData.voucher?.name}</p>
                          </div>
                          <button
                            onClick={() => {
                              setPaymentFormData({ ...paymentFormData, voucher: null })
                              setVoucherPreview(null)
                            }}
                            className="ml-auto text-slate-400 hover:text-white p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={voucherPreview} 
                            alt="Preview" 
                            className="w-full h-48 object-contain rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setPaymentFormData({ ...paymentFormData, voucher: null })
                              setVoucherPreview(null)
                            }}
                            className="absolute top-2 right-2 bg-slate-800/80 text-white p-2 rounded-lg hover:bg-slate-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Puedes adjuntar una captura o PDF del comprobante de pago
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkPaid}
                  className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear deuda */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Nueva Deuda
                </h2>
                <p className="text-slate-400 text-sm mt-1">Complete la información de la deuda</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <XCircle size={24} />
              </button>
            </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-300 font-semibold flex items-center gap-2">
                  <TrendingUp size={16} />
                  Cálculo automático:
                </p>
                <ul className="text-xs text-blue-200 mt-2 ml-4 space-y-1.5">
                  <li>• Ingresa <strong>Monto Total</strong> + <strong>Pago Mensual</strong> → se calcula <strong>Total de Cuotas</strong></li>
                  <li>• Ingresa <strong>Fecha Inicio</strong> + <strong>Total de Cuotas</strong> → se calcula <strong>Fecha de Vencimiento</strong></li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Acreedor *"
                placeholder="Nombre del acreedor"
                value={formData.creditor}
                onChange={(e) =>
                  setFormData({ ...formData, creditor: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
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
                  placeholder="0.00"
                  value={formData.monthly_payment}
                  onChange={(e) =>
                    setFormData({ ...formData, monthly_payment: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Total de Cuotas"
                    type="number"
                    min="1"
                    placeholder="Auto-calculado"
                    value={formData.total_installments}
                    onChange={(e) =>
                      setFormData({ ...formData, total_installments: e.target.value })
                    }
                    className="bg-emerald-500/5 border-emerald-500/30"
                  />
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    ✨ Se calcula automáticamente
                  </p>
                </div>

                <Input
                  label="Día de Pago"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej: 12"
                  value={formData.payment_day}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_day: e.target.value })
                  }
                />
              </div>

              {/* Mostrar solo si hay fecha de inicio en el pasado */}
              {formData.start_date && new Date(formData.start_date) < new Date() && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-300 mb-2">
                        ¿Ya pagaste algunas cuotas?
                      </h4>
                      <p className="text-xs text-amber-200 mb-3">
                        Detectamos que la fecha de inicio es anterior a hoy. Si ya has pagado algunas cuotas, indícalo aquí para que el sistema las marque automáticamente.
                      </p>
                      <Input
                        label="Cuotas ya Pagadas"
                        type="number"
                        min="0"
                        max={formData.total_installments || undefined}
                        placeholder="0"
                        value={formData.paid_installments_count}
                        onChange={(e) =>
                          setFormData({ ...formData, paid_installments_count: e.target.value })
                        }
                        className="bg-amber-500/5 border-amber-500/30"
                      />
                      <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                        💡 Ejemplo: Si has pagado 3 de {formData.total_installments || '...'} cuotas, ingresa 3
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha Inicio de Pagos"
                  type="date"
                  placeholder="Cuándo empieza a pagar"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />

                <div>
                  <Input
                    label="Fecha de Vencimiento Final"
                    type="date"
                    placeholder="Auto-calculada"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="bg-emerald-500/5 border-emerald-500/30"
                  />
                  <p className="text-xs text-emerald-400 mt-1">
                    ✨ Se calcula automáticamente
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                  <Bell size={16} />
                  Días de Anticipación para Recordatorio
                </label>
                <select
                  value={formData.reminder_days}
                  onChange={(e) =>
                    setFormData({ ...formData, reminder_days: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="1">1 día antes</option>
                  <option value="3">3 días antes</option>
                  <option value="5">5 días antes</option>
                  <option value="7">7 días antes</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Se te recordará con esta anticipación antes de cada pago
                </p>
              </div>

              <Input
                label="Descripción"
                placeholder="Descripción opcional"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
                >
                  Crear Deuda
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
