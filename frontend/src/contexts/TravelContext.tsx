import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { travelService } from "../services/travel.service"
import { authService } from "../services"
import type { CreateTravelPayload, TravelDetail, TravelSummary, UpdateTravelPayload } from "../types/travel"

interface TravelContextType {
  travels: TravelSummary[]
  currentTravel: TravelDetail | null
  loading: boolean
  error: string | null

  // travel CRUD
  loadTravels: () => Promise<void>
  getTravelById: (travelId: number) => Promise<void>
  createTravel: (payload: CreateTravelPayload) => Promise<TravelSummary | null>
  updateTravel: (travelId: number, payload: UpdateTravelPayload) => Promise<void>
  deleteTravel: (travelId: number) => Promise<void>

  // item operations
  addItem: (travelId: number, clothId: number) => Promise<void>
  removeItem: (travelId: number, clothId: number) => Promise<void>

  // helpers
  resetCurrent: () => void
}

export const TravelContext = createContext<TravelContextType | undefined>(undefined)

export const TravelProvider = ({ children }: { children: ReactNode }) => {
  const [travels, setTravels] = useState<TravelSummary[]>([])
  const [currentTravel, setCurrentTravel] = useState<TravelDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const userId = useMemo(() => authService.getCurrentUserId(), [])

  const loadTravels = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await travelService.getAllTravels()
      setTravels(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load travels")
    } finally {
      setLoading(false)
    }
  }, [userId])


  const getTravelById = useCallback(async (travelId: number) => {
    setLoading(true)
    setError(null)
    try {
      const detail = await travelService.getTravel(travelId)
      setCurrentTravel(detail)
    } catch (err: any) {
      setError(err?.message || "Failed to load travel")
    } finally {
      setLoading(false)
    }
  }, [])

  const createTravel = useCallback(async (payload: CreateTravelPayload) => {
    setLoading(true)
    setError(null)
    try {
      const created = await travelService.addTravel(payload)
      await loadTravels()
      return created
    } catch (err: any) {
      setError(err?.message || "Failed to create travel")
      return null
    } finally {
      setLoading(false)
    }
  }, [loadTravels])

  const updateTravel = useCallback(async (travelId: number, payload: UpdateTravelPayload) => {
    setLoading(true)
    setError(null)
    try {
      await travelService.updateTravel(travelId, payload)
      await loadTravels()
      if (currentTravel?.travel_id === travelId) {
        await getTravelById(travelId)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update travel")
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentTravel?.travel_id, getTravelById, loadTravels])

  const deleteTravel = useCallback(async (travelId: number) => {
    setLoading(true)
    setError(null)
    try {
      await travelService.deleteTravel(travelId)
      setTravels(prev => prev.filter(t => t.travel_id !== travelId))
      if (currentTravel?.travel_id === travelId) {
        setCurrentTravel(null)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete travel")
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentTravel?.travel_id])

  const addItem = useCallback(async (travelId: number, clothId: number) => {
    setError(null)
    try {
      await travelService.addClothToTravel(travelId, clothId)
      if (currentTravel?.travel_id === travelId) {
        const updated = await travelService.getTravel(travelId)
        setCurrentTravel(updated)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add item")
      throw err
    }
  }, [currentTravel?.travel_id])

  const removeItem = useCallback(async (travelId: number, clothId: number) => {
    setError(null)
    try {
      await travelService.removeClothFromTravel(travelId, clothId)
      if (currentTravel?.travel_id === travelId) {
        setCurrentTravel({
          ...currentTravel,
          clothes: currentTravel.clothes.filter(c => Number(c.cloth_id) !== Number(clothId))
        })
      }
    } catch (err: any) {
      setError(err?.message || "Failed to remove item")
      throw err
    }
  }, [currentTravel])

  const resetCurrent = () => setCurrentTravel(null)

  const value: TravelContextType = {
    travels,
    currentTravel,
    loading,
    error,
    loadTravels,
    getTravelById,
    createTravel,
    updateTravel,
    deleteTravel,
    addItem,
    removeItem,
    resetCurrent
  }

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
}

export const useTravelContext = () => {
  const ctx = useContext(TravelContext)
  if (!ctx) {
    throw new Error("useTravelContext must be used within TravelProvider")
  }
  return ctx
}


