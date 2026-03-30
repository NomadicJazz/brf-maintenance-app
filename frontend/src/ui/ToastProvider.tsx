import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ToastContext, type ToastContextValue, type ToastKind } from './ToastContext'

type Toast = {
  id: number
  message: string
  kind: ToastKind
  createdAt: number
  durationMs: number
  leaving?: boolean
}

export default function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const EXIT_MS = 220

  const pushToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const durationMs = 3200
    setToasts((prev) => [...prev, { id, message, kind, createdAt: Date.now(), durationMs }])
    window.setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, EXIT_MS)
    }, durationMs)
  }, [])

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    pushToast(message, kind)
  }, [pushToast])

  const value = useMemo<ToastContextValue>(
    () => ({ pushToast, showToast }),
    [pushToast, showToast],
  )

  function renderIcon(kind: ToastKind) {
    if (kind === 'success') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    }
    if (kind === 'error') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path d="M10.3 3.9 1.8 18.4A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.8-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <circle cx="12" cy="16.8" r=".8" fill="currentColor" stroke="none" />
        </svg>
      )
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <circle cx="12" cy="7.2" r=".8" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast toast-end toast-bottom z-[9999] gap-2 p-4" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'relative flex w-[26rem] max-w-[92vw] items-start gap-3 overflow-hidden rounded-2xl',
              'border-2 border-base-300 bg-base-100 text-base-content shadow-xl backdrop-blur font-sans',
              t.kind === 'success'
                ? 'border-success/80'
                : t.kind === 'error'
                  ? 'border-error/80'
                  : 'border-info/80',
              t.leaving ? 'toast-exit' : 'toast-enter',
            ].join(' ')}
          >
            <div className={t.kind === 'success' ? 'text-success' : t.kind === 'error' ? 'text-error' : 'text-info'}>
              {renderIcon(t.kind)}
            </div>
            <span className="pr-3 py-1 break-words text-base-content text-base sm:text-lg leading-relaxed font-semibold">
              {t.message}
            </span>
            <div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
              style={{
                width: '100%',
                animation: `toast-progress ${t.durationMs}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

