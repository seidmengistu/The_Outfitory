import type { ClothingItem } from "../../../types"
import ClothingCard from "./ClothingCard"

interface ClothingGridProps {
  items: ClothingItem[]
  onEdit: (item: ClothingItem) => void
  onDelete: (item: ClothingItem) => void
  onView: (item: ClothingItem) => void
  emptyMessage?: string
}

export default function ClothingGrid({ items, onEdit, onDelete, onView, emptyMessage = "No clothes found." }: ClothingGridProps) {
  if (!items.length) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/60">
        <p className="text-base font-medium">{emptyMessage}</p>
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-white/40">
          Start by adding a new clothing item to populate your wardrobe.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
      {items.map((item) => (
        <ClothingCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onView={onView} />
      ))}
    </div>
  )
}
