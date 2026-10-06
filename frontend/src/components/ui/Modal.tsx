import { X } from "lucide-react"
import { type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  widthClassName?: string
}

const modalRoot = typeof document !== "undefined" ? document.body : null

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "max-w-xl"
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen || !modalRoot) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full ${widthClassName} mx-4 rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-2xl shadow-black/30 dark:border-white/10 dark:bg-[#1F1643] dark:text-white dark:shadow-black/50 flex max-h-[90vh] flex-col`}
      >
        <div className="flex items-start justify-between gap-6 border-b border-black/10 px-6 py-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold tracking-wide">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-gray-600 dark:text-white/60">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-black/5 p-2 text-gray-700 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {children}
        </div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-black/10 bg-black/5 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    modalRoot
  )
}
