import { useEffect, useMemo, useRef, useState } from "react"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { CLOTHING_CATEGORIES, CLOTHING_OCCASIONS, CLOTHING_SEASONS } from "../../../lib/constants"
import type { WardrobeFilters } from "../../../types"

interface ClothingFiltersProps {
  onApply: (filters: WardrobeFilters) => void
  onClear: () => void
  activeFilters?: WardrobeFilters | null
  disabled?: boolean
}

type LocalFilters = {
  category: string
  season: string
  occasion: string
}

const defaultFilters: LocalFilters = {
  category: "",
  season: "",
  occasion: ""
}

export default function ClothingFilters({ onApply, onClear, activeFilters, disabled = false }: ClothingFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<LocalFilters>(defaultFilters)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const hasActiveFilters = useMemo(() => {
    if (!activeFilters) {
      return false
    }
    return Object.values(activeFilters).some(Boolean)
  }, [activeFilters])

  useEffect(() => {
    setFilters({
      category: activeFilters?.category ?? "",
      season: activeFilters?.season ?? "",
      occasion: activeFilters?.occasion ?? ""
    })
  }, [activeFilters])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const applyFilters = () => {
    const payload: WardrobeFilters = {}
    if (filters.category) {
      payload.category = filters.category
    }
    if (filters.season) {
      payload.season = filters.season
    }
    if (filters.occasion) {
      payload.occasion = filters.occasion
    }

    console.log("Filter payload:", payload)
    onApply(payload)
    setIsOpen(false)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    onClear()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:text-white ${
          hasActiveFilters ? "bg-gray-100 text-gray-900 dark:bg-white/15 dark:text-white" : ""
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-label="Filter wardrobe"
      >
        <SlidersHorizontal size={20} />
      </button>

          {isOpen ? (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-3xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl shadow-gray-200/50 dark:border-white/10 dark:bg-[#1F1643] dark:text-white dark:shadow-black/50">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Category</label>
                  <select
                    value={filters.category}
                    onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40"
                  >
                    <option value="" className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">All categories</option>
                    {CLOTHING_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                        {category.label}
                      </option>
                    ))}
                  </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Season</label>
              <select
                value={filters.season}
                onChange={(event) => setFilters((prev) => ({ ...prev, season: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40"
              >
                <option value="" className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">Any season</option>
                {CLOTHING_SEASONS.map((season) => (
                  <option key={season.value} value={season.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                    {season.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Occasion</label>
              <select
                value={filters.occasion}
                onChange={(event) => setFilters((prev) => ({ ...prev, occasion: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#6C4DFD] focus:outline-none focus:ring-2 focus:ring-[#6C4DFD]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/40"
              >
                <option value="" className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">Any occasion</option>
                {CLOTHING_OCCASIONS.map((occasion) => (
                  <option key={occasion.value} value={occasion.value} className="bg-white text-gray-900 dark:bg-[#1F1643] dark:text-white">
                    {occasion.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              <RotateCcw size={16} /> Reset
            </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-xl bg-white text-[#6C4DFD] shadow-lg shadow-gray-200/50 border border-gray-200 px-5 py-2 text-sm font-semibold transition hover:shadow-xl hover:shadow-gray-300/60 dark:bg-gradient-to-br dark:from-[#6C4DFD] dark:to-[#8D6BFE] dark:text-white dark:shadow-[#6C4DFD]/50 dark:border-transparent dark:hover:shadow-[#6C4DFD]/60"
                >
                  Apply Filters
                </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
