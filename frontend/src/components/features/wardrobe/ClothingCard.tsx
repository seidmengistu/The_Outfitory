import { Pencil, Trash2 } from "lucide-react"
import type { ClothingItem } from "../../../types"
import AuthImage from "../../common/AuthImage"

interface ClothingCardProps {
  item: ClothingItem
  onEdit: (item: ClothingItem) => void
  onDelete: (item: ClothingItem) => void
  onView: (item: ClothingItem) => void
}

const formatLabel = (value?: string) => {
  if (!value) {
    return ""
  }

  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function ClothingCard({ item, onEdit, onDelete, onView }: ClothingCardProps) {
  const imageUrl = item.image_url
  const categoryLabel = formatLabel(item.category)
  const subLabel = formatLabel(item.occasion) || formatLabel(item.category)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 text-gray-900 shadow-md shadow-gray-200/50 transition-shadow hover:shadow-lg hover:shadow-gray-300/50 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#241254] dark:to-[#1A0F3C] dark:text-white dark:shadow-black/20 dark:hover:shadow-black/30"
      role="button"
      tabIndex={0}
      onClick={() => onView(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView(item)
        }
      }}
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-[#120A26]">
        <div className="absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-gray-400 bg-white/80 dark:border-white/70 dark:bg-white/10" />

        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden">
          {imageUrl ? (
            <AuthImage
              srcPath={imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500 dark:bg-[#170C35] dark:text-white/40">No Image</div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white/90">
          {item.name || "Untitled Item"}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-white/40">{categoryLabel}</span>
          {/* <span className="text-xs text-gray-600 dark:text-white/60">{subLabel}</span> */}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(item)
          }}
          aria-label="Edit clothing"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-md transition hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          <Pencil size={16} />
        </button>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(item)
          }}
          aria-label="Delete clothing"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-md transition hover:bg-rose-50 hover:text-rose-600 dark:bg-white/10 dark:text-white dark:hover:bg-rose-500/90"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}
