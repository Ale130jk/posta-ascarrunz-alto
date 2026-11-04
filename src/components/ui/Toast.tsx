import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { createContext, useContext } from 'react'
import clsx from 'clsx'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

type ToastFn = (message: string, variant?: ToastVariant) => void

const ToastContext = createContext<ToastFn | null>(null)

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
}

const styles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-red-200 bg-red-50 text-red-950',
  info: 'border-brand-200 bg-brand-50 text-brand-950',
}

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-brand-600',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback<ToastFn>(
    (message, variant = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setItems((current) => [...current.slice(-2), { id, message, variant }])
      const timer = window.setTimeout(() => {
        dismiss(id)
      }, 4600)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      currentTimers.forEach((timer) => window.clearTimeout(timer))
      currentTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 right-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 sm:bottom-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((item) => {
          const Icon = icons[item.variant]
          return (
            <div
              key={item.id}
              className={clsx(
                'toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-ink/5',
                styles[item.variant],
              )}
            >
              <Icon
                className={clsx('mt-0.5 h-5 w-5 shrink-0', iconStyles[item.variant])}
                aria-hidden="true"
              />
              <p className="flex-1 text-sm font-medium leading-5">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-full p-1 text-ink/50 transition hover:bg-black/5 hover:text-ink"
                aria-label="Cerrar aviso"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastFn {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
