import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Plus, X } from "lucide-react"
import { TravelProvider, useTravelContext } from "../contexts/TravelContext"
import type { ClothingItem } from "../types"
import AuthImage from "../components/common/AuthImage"
import { wardrobeService } from "../services/wardrobe.service"

const tabs = ["All", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"]

// Category mapping used for wardrobe filters 
const getCategoryTab = (item: ClothingItem): string => {
  const c = (item.category || "").toLowerCase()
  if (/(top|tee|shirt|t[- ]?shirt|sweater|hoodie|flannel)/i.test(c)) return "Tops"
  if (/(pant|jean|trouser|short|skirt|bottom)/i.test(c)) return "Bottoms"
  if (/(shoe|sneaker|boot|heel|sandal)/i.test(c)) return "Shoes"
  if (/(accessory|belt|hat|cap|watch|scarf)/i.test(c)) return "Accessories"
  if (/(jacket|coat|outer|outerwear|parka)/i.test(c)) return "Outerwear"
  return "Tops"
}

function TravelDetailInner() {
  const params = useParams()
  const id = Number(params.id)
  const { currentTravel, getTravelById, addItem, removeItem } = useTravelContext()
  const [activeTab, setActiveTab] = useState<string>("All")
  const [clothMeta, setClothMeta] = useState<Record<number, { image_url?: string; name?: string }>>({})
  const [allClothes, setAllClothes] = useState<ClothingItem[]>([])
  const [, setLoadingClothes] = useState<boolean>(false)
  const fetchedTravelIdRef = useRef<number | null>(null)
  const fetchedMetaForTravelIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (fetchedTravelIdRef.current === id) return
    fetchedTravelIdRef.current = id
    void getTravelById(id)
  }, [getTravelById, id])

  // Derive meta (image, name) from the full wardrobe instead of per-item requests
  useEffect(() => {
    if (!currentTravel) {
      setClothMeta({})
      return
    }
    const wanted = new Set((currentTravel.clothes || []).map(c => Number(c.cloth_id)))
    if (wanted.size === 0) {
      setClothMeta({})
      return
    }
    const map: Record<number, { image_url?: string; name?: string }> = {}
    for (const item of allClothes) {
      const nid = Number(item.id)
      if (wanted.has(nid)) {
        map[nid] = { image_url: item.image_url, name: item.name }
      }
    }
    setClothMeta(map)
    fetchedMetaForTravelIdRef.current = currentTravel.travel_id
  }, [allClothes, currentTravel])

  const currentIds = useMemo(() => new Set((currentTravel?.clothes || []).map(c => Number(c.cloth_id))), [currentTravel])

  // Fetch user's wardrobe for the "Add from Wardrobe" section
  useEffect(() => {
    const load = async () => {
      setLoadingClothes(true)
      try {
        const items = await wardrobeService.getAllClothes()
        setAllClothes(items)
      } catch {
        setAllClothes([])
      } finally {
        setLoadingClothes(false)
      }
    }
    void load()
  }, [])

  const wardrobeByTab: ClothingItem[] = useMemo(() => {
    if (!allClothes.length) return []
    if (activeTab === "All") return allClothes
    return allClothes.filter((c) => getCategoryTab(c) === activeTab)
  }, [allClothes, activeTab])

  return (
    <div className="p-6 space-y-8 text-slate-900 dark:text-white">
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-white/60">
        <Link to="/travels" className="hover:underline">Travel List</Link>
        <span>|</span>
        <span className="text-slate-900 dark:text-white">{currentTravel?.name ?? "Trip"}</span>
      </div>

      <h1 className="text-3xl font-bold">{currentTravel?.name || "Trip"}</h1>

      {/* Current items */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Items</h2>
        <div className="rounded-xl border border-dashed border-slate-200/80 dark:border-white/20 p-6 bg-white dark:bg-transparent">
          {currentTravel?.clothes && currentTravel.clothes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {currentTravel.clothes.map((c) => (
                <div key={c.cloth_id} className="relative rounded-xl overflow-hidden bg-white/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm">
                  {/* Image */}
                  <div className="aspect-3/4 w-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    {(() => {
                      const meta = clothMeta[Number(c.cloth_id)]
                      const img = meta?.image_url
                      if (img) {
                        return (
                          <AuthImage
                            srcPath={img}
                            alt={meta?.name || c.cloth_name || `Item #${c.cloth_id}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )
                      }
                      return <div className="h-full w-full bg-white/10" />
                    })()}
                  </div>
                  <div className="p-3 text-slate-800 dark:text-white/80 text-sm">{c.cloth_name || c.name || `Item #${c.cloth_id}`}</div>
                  <button
                    className="absolute right-2 top-2 rounded-full bg-rose-600/80 p-1 text-white hover:bg-rose-600 shadow-sm"
                    onClick={() => void removeItem(id, Number(c.cloth_id))}
                    aria-label="Remove from travel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600 dark:text-white/60">
              <div className="mb-3 rounded-xl bg-slate-100 dark:bg-white/10 p-4">
                <Plus />
              </div>
              <p>This list is empty. Add items from your wardrobe.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add from wardrobe */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Add from Wardrobe</h2>

        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === t
                  ? "bg-slate-900 text-white dark:bg-white/20 dark:text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white/90 dark:bg-white/5 p-4 border border-slate-200/80 dark:border-white/10 space-y-3 shadow-sm">
          {wardrobeByTab.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-xl bg-white dark:bg-white/5 p-3 border border-slate-200/80 dark:border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10">
                  {w.image_url ? (
                    <AuthImage
                      srcPath={w.image_url}
                      alt={w.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                <div className="text-slate-900 dark:text-white/90">{w.name}</div>
              </div>
              <button
                disabled={currentIds.has(Number(w.id))}
                onClick={() => void addItem(id, Number(w.id))}
                className="rounded-xl px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                aria-label="Add to travel"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}

          {wardrobeByTab.length === 0 && (
            <div className="p-6 text-center text-slate-600 dark:text-white/60">No items in this category.</div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function TravelDetail() {
  return (
    <TravelProvider>
      <TravelDetailInner />
    </TravelProvider>
  )
}


