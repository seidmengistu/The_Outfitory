import { useEffect, useMemo, useState } from "react"
import { Plus, X, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTravel } from "../hooks/useTravel"
import { TravelProvider } from "../contexts/TravelContext"
import Modal from "../components/ui/Modal"
import { ToastContainer, type ToastMessage } from "../components/ui/Toast"
import { travelService } from "../services/travel.service"

function TravelListsInner() {
  const { travels, loadTravels, createTravel, deleteTravel, loading } = useTravel()
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({})
  const navigate = useNavigate()

  useEffect(() => {
    void loadTravels()
  }, [loadTravels])

  const canCreate = useMemo(
    () => name.trim().length > 0 && !!startDate && !!endDate,
    [name, startDate, endDate]
  )

  const todayYmd = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }, [])

  const showToast = (message: string, type: ToastMessage["type"]) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const onCreate = async () => {
    if (!canCreate) return
    const created = await createTravel({
      name: name.trim(),
      start_date: startDate,
      end_date: endDate
    })
    setName("")
    setStartDate("")
    setEndDate("")
    showToast("Travel list created successfully.", "success")
    if (created?.travel_id) {
      // brief delay so the user can see the toast
      setTimeout(() => navigate(`/travels`), 600)
      loadTravels()
    }
  }

  // Format YYYY-MM-DD from possible ISO strings
  const formatDate = (value?: string) => {
    if (!value) return ""
    // keep only date portion
    const m = String(value).match(/^\d{4}-\d{2}-\d{2}/)
    return m ? m[0] : String(value)
  }

  // Pretty date: Sat, 29 Nov 2025 (no time)
  const formatPrettyDate = (value?: string) => {
    if (!value) return ""
    let date: Date | null = null
    // If it's already YYYY-MM-DD, construct Date safely
    const ymd = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    try {
      date = new Date(ymd || value)
      if (isNaN(date.getTime())) {
        return formatDate(value)
      }
    } catch {
      return formatDate(value)
    }
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Load item counts for each travel (defensive: ignore errors)
  useEffect(() => {
    if (!travels || travels.length === 0) {
      setItemCounts({})
      return
    }
    let cancelled = false
    const loadCounts = async () => {
      const next: Record<number, number> = {}
      for (const t of travels) {
        try {
          const detail = await travelService.getTravel(t.travel_id)
          next[t.travel_id] = Array.isArray(detail?.clothes) ? detail.clothes.length : 0
        } catch {
          next[t.travel_id] = 0
        }
      }
      if (!cancelled) {
        setItemCounts(next)
      }
    }
    void loadCounts()
    return () => {
      cancelled = true
    }
  }, [travels])

  return (
    <div className="p-6 space-y-8 text-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold">Travel Lists</h1>

      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Create New Travel List</h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            placeholder="e.g., Japan Trip, Weekend Getaway"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl px-4 py-3 border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/50 outline-none"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl px-4 py-3 border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/50 outline-none"
            aria-label="Start date"
            min={todayYmd}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl px-4 py-3 border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/50 outline-none"
            aria-label="End date"
            min={startDate || todayYmd}
          />
          <button
            onClick={onCreate}
            disabled={!canCreate || loading}
            className="inline-flex items-center justify-center rounded-xl bg-pink-500 px-4 py-3 text-white hover:bg-pink-600 disabled:opacity-50"
          >
            <Plus size={16} className="mr-2" /> Create List
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Existing Lists</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {travels.map((t) => (
            <div
              key={t.travel_id}
              className="relative rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-sm"
            >
              <button
                className="absolute right-4 top-4 rounded-full bg-slate-100 dark:bg-white/10 p-2 text-slate-600 dark:text-white/70 hover:bg-rose-600/20 dark:hover:bg-rose-600/40 hover:text-rose-700 dark:hover:text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmId(t.travel_id)
                }}
                aria-label="Delete travel"
              >
                <X size={16} />
              </button>

              <div
                className="flex items-center justify-between"
                onClick={() => navigate(`/travels/${t.travel_id}`)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    {t.start_date ? `${formatPrettyDate(t.start_date)}` : ""}
                    {t.end_date ? ` – ${formatPrettyDate(t.end_date)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
                    {itemCounts[t.travel_id] ?? 0} {((itemCounts[t.travel_id] ?? 0) === 1) ? "Item" : "Items"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {travels.length === 0 && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-10 text-center text-slate-600 dark:text-white/60 shadow-sm">
              No travel lists yet. Create your first trip above.
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={confirmId !== null} onClose={() => setConfirmId(null)} title="Delete travel?">
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-white/80">This will permanently remove the travel list.</p>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl bg-slate-100 dark:bg-white/10 px-4 py-2 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
              onClick={() => setConfirmId(null)}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
              onClick={async () => {
                if (confirmId) {
                  await deleteTravel(confirmId)
                  setConfirmId(null)
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  )
}

export default function TravelLists() {
  return (
    <TravelProvider>
      <TravelListsInner />
    </TravelProvider>
  )
}


