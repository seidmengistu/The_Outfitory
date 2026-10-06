import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useWardrobe } from "../hooks/useWardrobe"
import { useAuth } from "../hooks/useAuth"
import ClothingGrid from "../components/features/wardrobe/ClothingGrid"
import ClothingFilters from "../components/features/wardrobe/ClothingFilters"
import ClothingFormModal from "../components/features/wardrobe/ClothingFormModal"
import AuthImage from "../components/common/AuthImage"
import Loader from "../components/ui/Loader"
import Modal from "../components/ui/Modal"
import { ToastContainer, type ToastMessage } from "../components/ui/Toast"
import type { ClothingFormValues, ClothingItem, WardrobeFilters } from "../types"

interface WardrobeContentProps {}

export default function Wardrobe() {
  const { user, getToken, isLoading } = useAuth()
  const token = getToken()

  const getUserIdFromToken = (jwt: string | null): string | null => {
    if (!jwt) return null
    try {
      const [, payload] = jwt.split(".")
      const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
      const sub = json?.sub ?? json?.user_id
      return sub ? String(sub) : null
    } catch {
      return null
    }
  }

  const tokenUserId = useMemo(() => getUserIdFromToken(token), [token])
  const userId = tokenUserId || user?.id

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-[#0F0A2C]/60 py-20">
        <Loader label="Loading..." />
      </div>
    )
  }

  if (!token || !userId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-black/70 dark:text-white/80">
          <p className="text-sm">Please sign in to view your wardrobe.</p>
        </div>
      </div>
    )
  }

  return (
      <WardrobeContent />

  )
}

function WardrobeContent({}: WardrobeContentProps) {
  const {
    clothes,
    loading,
    error,
    activeFilters,
    addClothing,
    updateClothing,
    deleteClothing,
    filterClothes,
    clearFilters
  } = useWardrobe()

  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [viewItem, setViewItem] = useState<ClothingItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClothingItem | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const timeoutsRef = useRef<Record<string, number>>({})

  const showToast = useCallback((message: string, type: ToastMessage["type"]) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    const timeoutId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      if (timeoutsRef.current[id]) {
        clearTimeout(timeoutsRef.current[id])
        delete timeoutsRef.current[id]
      }
    }, 4000)

    timeoutsRef.current[id] = timeoutId
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [])

  useEffect(() => {
    if (error) {
      showToast(error, "error")
    }
  }, [error, showToast])

  const filteredClothes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return clothes
    }

    return clothes.filter((item) => {
      const values: Array<string | undefined> = [
        item.name,
        item.category,
        item.color,
        item.season,
        item.occasion,
        item.notes,
        item.type,
        item.fit,
        item.material,
        item.pattern,
        item.primary_color,
        item.secondary_color
      ]

      return values.some((value) => value?.toLowerCase().includes(query))
    })
  }, [clothes, searchTerm])

  const openCreateModal = () => {
    setFormMode("create")
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const openEditModal = (item: ClothingItem) => {
    setFormMode("edit")
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const closeFormModal = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const closeViewModal = () => {
    setViewItem(null)
  }

  const extractMessage = (response: any, fallback: string) => {
    if (!response) {
      return fallback
    }
    if (typeof response === "string") {
      return response
    }
    if (typeof response.message === "string") {
      return response.message
    }
    if (typeof response.detail === "string") {
      return response.detail
    }
    return fallback
  }

  const handleSubmit = async (values: ClothingFormValues) => {
    setIsSubmitting(true)
    try {
      if (formMode === "create") {
        const ok = await addClothing(values)
        if (ok) {
          showToast("Clothing item added successfully.", "success")
        } else {
          showToast("Failed to add clothing.", "error")
        }
      } else if (editingItem) {
        const response = await updateClothing(editingItem.id, values)
        showToast(extractMessage(response, "Clothing item updated successfully."), "success")
      }
      closeFormModal()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      showToast(message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (item: ClothingItem) => {
    setDeleteTarget(item)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await deleteClothing(deleteTarget.id)
      showToast(extractMessage(response, "Clothing item deleted."), "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete the item."
      showToast(message, "error")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleFilterApply = async (filters: WardrobeFilters) => {
    try {
      if (!Object.values(filters).some(Boolean)) {
        await clearFilters()
        return
      }

      await filterClothes(filters)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to apply filters."
      showToast(message, "error")
    }
  }

  const handleFilterClear = async () => {
    try {
      await clearFilters()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to clear filters."
      showToast(message, "error")
    }
  }

  return (
    <div className="relative space-y-6 text-black dark:text-white">
      <div className="sticky top-16 z-20 -mt-2 rounded-2xl bg-white/80 px-4 py-3 backdrop-blur-sm dark:bg-[#0C0A2A]/40">
        <div className="flex w-full items-center gap-3">
          <div className="relative flex-1 sm:min-w-[260px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-white/40" />
            <input
              type="search"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/40 dark:focus:ring-white/20"
            />
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#6C4DFD] shadow-lg shadow-gray-200/50 border border-gray-200 transition hover:scale-[1.03] hover:shadow-xl hover:shadow-gray-300/60 dark:bg-gradient-to-br dark:from-[#6C4DFD] dark:to-[#8D6BFE] dark:text-white dark:shadow-[#6C4DFD]/50 dark:border-transparent dark:hover:shadow-[#6C4DFD]/60"
            aria-label="Add clothing item"
          >
            <Plus size={22} />
          </button>
          <ClothingFilters
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            activeFilters={activeFilters}
            disabled={loading}
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[#0F0A2C]/60 py-20">
          <Loader label="Loading wardrobe..." />
        </div>
      ) : (
        <ClothingGrid
          items={filteredClothes}
          onEdit={openEditModal}
          onDelete={confirmDelete}
          onView={setViewItem}
          emptyMessage={searchTerm ? "No clothes match your search." : "You haven't added any clothes yet."}
        />
      )}

      <ClothingFormModal
        isOpen={isFormOpen}
        mode={formMode}
        initialValues={editingItem ?? undefined}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onUploadSuccess={(message) => showToast(message || "Image uploaded and classified", "success")}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Modal
        isOpen={!!viewItem}
        onClose={closeViewModal}
        title={viewItem?.name || "Clothing details"}
        description={viewItem?.category ? `Category: ${viewItem.category}` : undefined}
        widthClassName="max-w-2xl"
      >
        {viewItem ? (
          <div className="space-y-4 text-sm text-black/80 dark:text-white/80">
            <div className="flex flex-col gap-4 sm:flex-row">
              {viewItem.image_url ? (
                <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 sm:w-1/2 lg:w-[45%]">
                  <AuthImage srcPath={viewItem.image_url} alt={viewItem.name} className="w-full max-h-[320px] object-cover" />
                </div>
              ) : null}
              <div className="flex-1 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="Name" value={viewItem.name} />
                  <DetailRow label="Category" value={viewItem.category} />
                  <DetailRow label="Type" value={viewItem.type} />
                  <DetailRow label="Fit" value={viewItem.fit} />
                  <DetailRow label="Material" value={viewItem.material} />
                  <DetailRow label="Occasion" value={viewItem.occasion} />
                </div>
                {viewItem.notes ? (
                  <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                    {viewItem.notes}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ModalConfirmDelete
        item={deleteTarget}
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
      <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

interface ModalConfirmDeleteProps {
  item: ClothingItem | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ModalConfirmDelete({ item, isDeleting, onCancel, onConfirm }: ModalConfirmDeleteProps) {
  if (!item) {
    return null
  }

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        disabled={isDeleting}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-rose-500/90 hover:to-rose-600/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Delete item?"
      description="This action cannot be undone."
      footer={footer}
      widthClassName="max-w-md"
    >
      <p className="text-sm text-black/70 dark:text-white">
        Are you sure you want to remove <span className="text-black dark:text-white">{item.name}</span> from your wardrobe?
      </p>
    </Modal>
  )
}


