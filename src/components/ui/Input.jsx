export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <label className="block space-y-1">
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500" role="alert">
          {error}
        </p>
      )}
    </label>
  )
}
