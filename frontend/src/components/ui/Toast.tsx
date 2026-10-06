import { XCircle, CheckCircle2, AlertTriangle, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning"

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const typeConfig: Record<ToastType, { icon: JSX.Element; bg: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    bg: "from-emerald-500/90 to-emerald-600/90"
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    bg: "from-rose-500/90 to-rose-600/90"
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bg: "from-amber-500/90 to-amber-600/90"
  }
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-gradient-to-br ${config.bg} p-4 text-white shadow-lg shadow-black/30 transition`}
          >
            <div className="mt-0.5 text-white/90">{config.icon}</div>
            <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/70 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

