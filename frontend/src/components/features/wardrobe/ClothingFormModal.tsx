import { useEffect, useMemo, useState } from "react"
import Modal from "../../ui/Modal"
import { CLOTHING_CATEGORIES, CLOTHING_OCCASIONS, CLOTHING_SEASONS } from "../../../lib/constants"
import type { ClothingFormValues } from "../../../types"
import { uploadService } from "../../../services"
import AuthImage from "../../common/AuthImage"

interface ClothingFormModalProps {
  isOpen: boolean
  mode: "create" | "edit"
  initialValues?: Partial<ClothingFormValues>
  onClose: () => void
  onSubmit: (values: ClothingFormValues) => Promise<void> | void
  isSubmitting?: boolean
  onUploadSuccess?: (message: string) => void
}

function Chip({ value, onClear }: { value: string; onClear: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/80">
      <span className="truncate max-w-[160px]">{value}</span>
      <button type="button" onClick={onClear} className="text-black/50 transition hover:text-black dark:text-white/60 dark:hover:text-white">
        ✕
      </button>
    </div>
  )
}

function getCategoryLabel(value: string) {
  return CLOTHING_CATEGORIES.find((c) => c.value.toLowerCase() === value.toLowerCase())?.label ?? value
}

function getOccasionLabel(value: string) {
  return CLOTHING_OCCASIONS.find((c) => c.value.toLowerCase() === value.toLowerCase())?.label ?? value
}

function getSeasonLabel(value: string) {
  return CLOTHING_SEASONS.find((s) => s.value.toLowerCase() === value.toLowerCase())?.label ?? value
}

function orderOptions<T extends { value: string }>(options: readonly T[], selected?: string) {
  if (!selected) return [...options]
  const normalized = selected.toLowerCase()
  const selectedOpt = options.find((o) => o.value.toLowerCase() === normalized)
  const rest = options.filter((o) => o.value.toLowerCase() !== normalized)
  return selectedOpt ? [selectedOpt, ...rest] : [...options]
}

type FormState = {
  name: string
  category: string
  color: string
  season: string
  occasion: string
  imageFile: File | null
  image_url?: string
  notes: string
  // Classification fields
  fit?: string
  material?: string
  pattern?: string
  primary_color?: string
  secondary_color?: string
  type?: string
}

const defaultState: FormState = {
  name: "",
  category: "all",
  color: "",
  season: "all_season",
  occasion: "all",
  imageFile: null,
  image_url: undefined,
  notes: "",
  fit: undefined,
  material: undefined,
  pattern: undefined,
  primary_color: undefined,
  secondary_color: undefined,
  type: undefined
}

export default function ClothingFormModal({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting = false,
  onUploadSuccess
}: ClothingFormModalProps) {
  const [formValues, setFormValues] = useState<FormState>(defaultState)
  const [nameFromClassifier, setNameFromClassifier] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({})
  const [step, setStep] = useState<"upload" | "details">(mode === "create" ? "upload" : "details")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const orderedSeasonOptions = useMemo(() => orderOptions(CLOTHING_SEASONS, formValues.season), [formValues.season])
  const orderedOccasionOptions = useMemo(() => orderOptions(CLOTHING_OCCASIONS, formValues.occasion), [formValues.occasion])
  const orderedCategoryOptions = useMemo(() => orderOptions(CLOTHING_CATEGORIES, formValues.category), [formValues.category])

  const modalTitle = useMemo(() => (mode === "create" ? "Add Clothing Item" : "Edit Clothing Item"), [mode])
  const modalDescription = useMemo(
    () =>
      mode === "create"
        ? "Document every piece in your wardrobe to mix and match outfits with ease."
        : "Update the details of your clothing item to keep your wardrobe in sync.",
    [mode]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues({
      name: initialValues?.name ?? "",
      category: initialValues?.category ?? "all",
      color: initialValues?.color ?? "",
      season: initialValues?.season ?? "all_season",
      occasion: initialValues?.occasion ?? "all",
      imageFile: null,
      image_url: initialValues?.image_url,
      notes: initialValues?.notes ?? "",
      fit: (initialValues as any)?.fit,
      material: (initialValues as any)?.material,
      pattern: (initialValues as any)?.pattern,
      primary_color: (initialValues as any)?.primary_color,
      secondary_color: (initialValues as any)?.secondary_color,
      type: (initialValues as any)?.type
    })
    setNameFromClassifier(false)
    setErrors({})
    setUploadError(null)
    setIsUploading(false)
    setStep(mode === "create" ? "upload" : "details")
  }, [initialValues, isOpen])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === "create" && step === "upload") {
      // Prevent submit until upload step is completed
      return
    }
    const validationErrors: { name?: string; category?: string } = {}
    if (!formValues.name.trim()) {
      validationErrors.name = "Name is required"
    }
    if (!formValues.category) {
      validationErrors.category = "Select a category"
    }

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload: ClothingFormValues = {
      name: formValues.name.trim(),
      category: formValues.category,
      color: formValues.color.trim() || undefined,
      season: formValues.season || undefined,
      occasion: formValues.occasion || undefined,
      // avoid re-upload if we already have image_url from upload step
      imageFile: formValues.image_url ? undefined : (formValues.imageFile || undefined),
      image_url: formValues.image_url || undefined,
      notes: formValues.notes.trim() || undefined,
      // pass classification fields as editable values
      fit: formValues.fit || undefined,
      material: formValues.material || undefined,
      pattern: formValues.pattern || undefined,
      primary_color: formValues.primary_color || undefined,
      secondary_color: formValues.secondary_color || undefined,
      type: formValues.type || undefined
    }

    await onSubmit(payload)
  }

  const handleUpload = async () => {
    setUploadError(null)
    if (!formValues.imageFile) {
      setUploadError("Please choose an image to upload")
      return
    }
    try {
      setIsUploading(true)
      const uploaded = await uploadService.uploadImage(formValues.imageFile)
      const cls = uploaded.classification || {}
      const payload = (uploaded as any)?.raw?.data ?? {}
      const suggestedName = payload.short_name as string | undefined
      const suggestedCategory = (payload.category as string | undefined) ?? (cls.type as string | undefined)
      const suggestedOccasion = payload.ocasion as string | undefined
      const suggestedSeason = payload.season as string | undefined
      setFormValues(prev => ({
        ...prev,
        image_url: uploaded.url,
        // autofill from classification but keep editable
        type: cls.type ?? prev.type,
        fit: cls.fit ?? prev.fit,
        material: cls.material ?? prev.material,
        pattern: cls.pattern ?? prev.pattern,
        primary_color: cls.primary_color ?? prev.primary_color,
        secondary_color: cls.secondary_color ?? prev.secondary_color,
        // also try to prefill category/color if empty
        category: (suggestedCategory || "").toLowerCase() || "all",
        color: prev.color || (cls.primary_color ?? ""),
        name: suggestedName ?? prev.name,
        occasion: (suggestedOccasion || "").toLowerCase() || "all",
        season: (suggestedSeason || "").toLowerCase() || "all_season"
      }))
      setNameFromClassifier(Boolean(suggestedName))
      if (onUploadSuccess) {
        const uploadMessage = uploaded.message || uploaded.raw?.message || "Image uploaded and classified"
        onUploadSuccess(uploadMessage)
      }
      setStep("details")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/10"
        disabled={isSubmitting || isUploading}
      >
        Cancel
      </button>
      {mode === "create" && step === "upload" ? (
        <button
          type="button"
          onClick={handleUpload}
          className="rounded-xl bg-white text-[#6C4DFD] shadow-lg shadow-gray-200/50 border border-gray-200 px-5 py-2 text-sm font-semibold transition hover:shadow-xl hover:shadow-gray-300/60 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gradient-to-br dark:from-[#6C4DFD] dark:to-[#8D6BFE] dark:text-white dark:shadow-[#6C4DFD]/50 dark:border-transparent dark:hover:shadow-[#6C4DFD]/60"
          disabled={isUploading || !formValues.imageFile}
        >
          {isUploading ? "Uploading..." : "Upload & Continue"}
        </button>
      ) : (
        <button
          type="submit"
          form="clothing-form"
          className="rounded-xl bg-white text-[#6C4DFD] shadow-lg shadow-gray-200/50 border border-gray-200 px-5 py-2 text-sm font-semibold transition hover:shadow-xl hover:shadow-gray-300/60 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gradient-to-br dark:from-[#6C4DFD] dark:to-[#8D6BFE] dark:text-white dark:shadow-[#6C4DFD]/50 dark:border-transparent dark:hover:shadow-[#6C4DFD]/60"
          disabled={isSubmitting}
        >
          {mode === "create" ? "Add Item" : "Save Changes"}
        </button>
      )}
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} description={modalDescription} footer={footer} widthClassName="max-w-2xl">
      <form id="clothing-form" className="space-y-4" onSubmit={handleSubmit}>
        {mode === "create" && step === "upload" ? (
          <>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0] ? event.target.files[0] : null
                  setFormValues((prev) => ({ ...prev, imageFile: file }))
                }}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30"
              />
              {uploadError ? <p className="mt-2 text-xs text-rose-500 dark:text-rose-300">{uploadError}</p> : null}
            </div>
            {formValues.image_url ? (
              <div className="mt-2">
                <AuthImage srcPath={formValues.image_url} alt="Uploaded preview" className="h-40 w-auto rounded-xl border border-black/10 object-contain dark:border-white/10" />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-white/70">Name</label>
              <div className="relative mt-2">
                {nameFromClassifier && formValues.name ? (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Chip
                      value={formValues.name}
                      onClear={() => {
                        setFormValues((prev) => ({ ...prev, name: "" }))
                        setNameFromClassifier(false)
                      }}
                    />
                  </div>
                ) : null}
                <input
                  type="text"
                  value={nameFromClassifier ? "" : formValues.name}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, name: event.target.value }))
                    setNameFromClassifier(false)
                  }}
                  placeholder={!nameFromClassifier && !formValues.name ? "e.g. Leather Jacket" : ""}
                  className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 ${
                    nameFromClassifier && formValues.name ? "pl-28" : "pl-4"
                  } text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30 ${
                    errors.name ? "border-rose-400/70 dark:border-rose-400/70" : ""
                  }`}
                />
              </div>
              {errors.name ? <p className="mt-1 text-xs text-rose-500 dark:text-rose-300">{errors.name}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-white/70">Type</label>
              <input
                type="text"
                value={formValues.type || ""}
                onChange={(event) => setFormValues((prev) => ({ ...prev, type: event.target.value }))}
                placeholder="e.g. pants, shirt"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Season</label>
                <div className="relative mt-2">
                  {formValues.season ? (
                    <Chip value={getSeasonLabel(formValues.season)} onClear={() => setFormValues((prev) => ({ ...prev, season: "" }))} />
                  ) : (
                    <select
                      value={formValues.season || "all_season"}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, season: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40"
                    >
                      {orderedSeasonOptions.map((season) => (
                        <option key={season.value} value={season.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                          {season.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Occasion</label>
                <div className="relative mt-2">
                  {formValues.occasion ? (
                    <Chip value={getOccasionLabel(formValues.occasion)} onClear={() => setFormValues((prev) => ({ ...prev, occasion: "" }))} />
                  ) : (
                    <select
                      value={formValues.occasion}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, occasion: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40"
                    >
                      {orderedOccasionOptions.map((occasion) => (
                        <option key={occasion.value} value={occasion.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Classification fields - all editable */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Category</label>
                <div className="relative mt-2">
                  {formValues.category ? (
                    <Chip value={getCategoryLabel(formValues.category)} onClear={() => setFormValues((prev) => ({ ...prev, category: "" }))} />
                  ) : (
                    <select
                      value={formValues.category}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value }))}
                      className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40 ${
                        errors.category ? "border-rose-400/70 dark:border-rose-400/70" : ""
                      }`}
                    >
                      {orderedCategoryOptions.map((category) => (
                        <option key={category.value} value={category.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {errors.category ? <p className="mt-1 text-xs text-rose-500 dark:text-rose-300">{errors.category}</p> : null}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Fit</label>
                <input
                  type="text"
                  value={formValues.fit || ""}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, fit: event.target.value }))}
                  placeholder="e.g. regular, slim"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Material</label>
                <input
                  type="text"
                  value={formValues.material || ""}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, material: event.target.value }))}
                  placeholder="e.g. cotton, wool"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Pattern</label>
                <input
                  type="text"
                  value={formValues.pattern || ""}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, pattern: event.target.value }))}
                  placeholder="e.g. striped, plain"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Primary color</label>
                <input
                  type="text"
                  value={formValues.primary_color || ""}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, primary_color: event.target.value }))}
                  placeholder="e.g. white"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Secondary color</label>
                <input
                  type="text"
                  value={formValues.secondary_color || ""}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, secondary_color: event.target.value }))}
                  placeholder="e.g. chartreuse"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-white/70">Notes</label>
              <textarea
                rows={4}
                value={formValues.notes}
                onChange={(event) => setFormValues((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Add styling tips, fit notes, or care instructions..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
              />
            </div>

            {formValues.image_url ? (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Image</label>
                <div className="mt-2">
                  <AuthImage srcPath={formValues.image_url} alt="Uploaded" className="h-40 w-auto rounded-xl border border-black/10 object-contain dark:border-white/10" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-white/70">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null
                    setFormValues((prev) => ({ ...prev, imageFile: file }))
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30"
                />
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  )
}

