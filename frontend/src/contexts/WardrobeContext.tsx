import { wardrobeService, uploadService, authService } from "../services";
import type { ClothingFormValues, ClothingItem, WardrobeFilters } from "../types"
import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "../hooks/useAuth"
    

interface WardrobeContextType {
    clothes: ClothingItem[]
    selectedClothing: ClothingItem | null
    loading: boolean
    error: string | null
    activeFilters: WardrobeFilters | null
    addClothing: (data: ClothingFormValues) => Promise<boolean>
    updateClothing: (id: string, data: Partial<ClothingFormValues>) => Promise<any>
    deleteClothing: (id: string) => Promise<any>
    getClothingById: (id: string) => Promise<ClothingItem | null>
    filterClothes: (filters: WardrobeFilters) => Promise<void>
    clearFilters: () => Promise<void>
    refreshWardrobe: () => Promise<void>
}

interface WardrobeProviderProps {
    children: ReactNode
    userId?: string
}

export const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined)

export const WardrobeProvider = ({ children, userId }: WardrobeProviderProps) => {
    const [clothes, setClothes] = useState<ClothingItem[]>([])
    const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [activeFilters, setActiveFilters] = useState<WardrobeFilters | null>(null)

    const { getToken } = useAuth()
    const token = getToken()
    const tokenUserId = useMemo(() => authService.getCurrentUserId(), [token])
    const normalizedUserId = useMemo(() => {
        const fromToken = tokenUserId ? String(tokenUserId) : ""
        if (fromToken) return fromToken
        return userId ? String(userId) : ""
    }, [tokenUserId, userId])

    const loadWardrobe = useCallback(async () => {
        if (!normalizedUserId) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const data = await wardrobeService.getAllClothes()
            const ownClothes = data.filter(item => item.user_id === normalizedUserId)
            setClothes(ownClothes)
        } catch (err) {
            console.error("Error loading wardrobe", err)
            // Do not surface a user-facing error for initial load failures
        } finally {
            setLoading(false)
        }
    }, [normalizedUserId])

    useEffect(() => {
        void loadWardrobe()
    }, [loadWardrobe])

    const getClothingById = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const clothing = await wardrobeService.getClothesById(id)
            // Frontend ownership guard
            if (clothing && normalizedUserId && clothing.user_id !== normalizedUserId) {
                setError("Not authorized to access this item")
                setSelectedClothing(null)
                return null
            }
            setSelectedClothing(clothing)
            return clothing
        } catch (err) {
            console.error("Error fetching clothing", err)
            setError("Failed to load the clothing item")
            throw err
        } finally {
            setLoading(false)
        }
    }, [normalizedUserId])

    const addClothing = useCallback(async (payload: ClothingFormValues) => {
        setLoading(true)
        setError(null)
        try {
            if (!normalizedUserId) {
                setError("Not authenticated")
                return false
            }
            let imageUrl: string | undefined
            if (payload.imageFile) {
                const uploaded = await uploadService.uploadImage(payload.imageFile)
                imageUrl = uploaded.url
            }

            const { imageFile, ...rest } = payload as any
            const submission = {
                ...rest,
                ...(imageUrl ? { image_url: imageUrl } : {}),
                user_id: normalizedUserId
            }

            console.log('submission:', submission)

            await wardrobeService.addClothe(submission)
            await loadWardrobe()
            return true
        } catch (err) {
            console.error("Error adding clothing", err)
            setError("Failed to add clothing")
            return false
        } finally {
            setLoading(false)
        }
    }, [loadWardrobe, normalizedUserId])

    const updateClothing = useCallback(async (id: string, payload: Partial<ClothingFormValues>) => {
        setError(null)
        try {
            // Frontend ownership guard
            const item = await wardrobeService.getClothesById(id)
            if (!item || (normalizedUserId && item.user_id !== normalizedUserId)) {
                setError("Not authorized to update this item")
                throw new Error("Not authorized")
            }
            let imageUrl: string | undefined
            if (payload.imageFile) {
                const uploaded = await uploadService.uploadImage(payload.imageFile)
                imageUrl = uploaded.url
            }

            const { imageFile, ...rest } = payload as any
            const updatePayload = {
                ...rest,
                ...(imageUrl ? { image_url: imageUrl } : {})
            }

            const response = await wardrobeService.updateClothe(id, updatePayload)
            await loadWardrobe()
            return response
        } catch (err) {
            console.error("Error updating clothing", err)
            setError("Failed to update clothing")
            throw err
        }
    }, [loadWardrobe, normalizedUserId])

    const deleteClothing = useCallback(async (id: string) => {
        setError(null)
        try {
            // Frontend ownership guard
            const item = await wardrobeService.getClothesById(id)
            if (!item || (normalizedUserId && item.user_id !== normalizedUserId)) {
                setError("Not authorized to delete this item")
                throw new Error("Not authorized")
            }
            const response = await wardrobeService.deleteClothe(id)
            await loadWardrobe()
            return response
        } catch (err) {
            console.error("Error deleting clothing", err)
            setError("Failed to delete clothing")
            throw err
        }
    }, [loadWardrobe, normalizedUserId])

    const filterClothes = useCallback(async (filters: WardrobeFilters) => {
        setLoading(true)
        setError(null)
        try {
            console.log("Applying filters:", filters)
            // First, get all clothes (then restrict to current user's)
            const allClothes = await wardrobeService.getAllClothes()
            const ownClothes = allClothes.filter(item => item.user_id === normalizedUserId)
            console.log("All clothes before filtering:", ownClothes.length)
            
            // Apply client-side filtering on current user's items only
            const filteredClothes = ownClothes.filter(item => {
                if (filters.category && item.category !== filters.category) {
                    return false
                }
                if (filters.season && item.season !== filters.season) {
                    return false
                }
                if (filters.occasion && item.occasion !== filters.occasion) {
                    return false
                }
                return true
            })
            
            console.log("Filtered clothes:", filteredClothes.length)
            setClothes(filteredClothes)
            setActiveFilters(filters)
        } catch (err) {
            console.error("Error filtering wardrobe", err)
            setError("Failed to apply filters")
            throw err
        } finally {
            setLoading(false)
        }
    }, [normalizedUserId])

    const clearFilters = useCallback(async () => {
        setActiveFilters(null)
        await loadWardrobe()
    }, [loadWardrobe])

    const refreshWardrobe = useCallback(async () => {
        setActiveFilters(null)
        await loadWardrobe()
    }, [loadWardrobe])

    return (
        <WardrobeContext.Provider
            value={{
                clothes,
                selectedClothing,
                loading,
                error,
                activeFilters,
                addClothing,
                updateClothing,
                deleteClothing,
                getClothingById,
                filterClothes,
                clearFilters,
                refreshWardrobe
            }}
        >{children}</WardrobeContext.Provider>
    )
}