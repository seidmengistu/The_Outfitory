import { createContext, useState, useContext } from "react"
import type { ReactNode } from "react"
import { outfitService } from "../services/outfit.service"
import type { BackendOutfit } from "../types/outfit"

interface OutfitContextType {
    outfits: BackendOutfit[]
    outfitById: BackendOutfit | null
    loading: boolean
    error: string | null

    // Core CRUD operations 
    getAllOutfits: () => Promise<void>
    getOutfitById: (outfitId: number) => Promise<void>
    createOutfit: (outfitData: {
        name: string;
        description?: string;
        clothingIds: number[];
    }) => Promise<BackendOutfit | null>
    updateOutfit: (id: string, data: Partial<BackendOutfit>) => Promise<void>
    deleteOutfit: (id: string) => Promise<void>

    // Utility functions
    refreshOutfits: () => Promise<void>
    clearError: () => void
    resetOutfitById: () => void
}

export const OutfitContext = createContext<OutfitContextType | undefined>(undefined)

export const OutfitProvider = ({ children }: { children: ReactNode }) => {
    const [outfits, setOutfits] = useState<BackendOutfit[]>([])
    const [outfitById, setOutfitById] = useState<BackendOutfit | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Get all outfits for current user (from token)

    const getAllOutfits = async () => {
        setLoading(true)
        setError(null)

        try {
            // console.log('Fetching outfits for current user')
            const data = await outfitService.getAllOutfits()
            setOutfits(data) // Will be empty array if no outfits
            // console.log('Outfits loaded successfully:', data)
        } catch (error: any) {
            // console.log('Full error object:', error)

            let errorMessage = "Failed to load outfits"

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            // console.log('Extracted error message:', errorMessage)
            setError(errorMessage)
            // console.error('Error loading outfits:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get a specific outfit by ID
    const getOutfitById = async (outfitId: number) => {
        setLoading(true)
        setError(null)

        try {
            // console.log('Fetching outfit:', outfitId)
            const outfit = await outfitService.getOutfitById(outfitId)
            setOutfitById(outfit)
            // console.log('Outfit loaded successfully:', outfit)
        } catch (error: any) {
            let errorMessage = "Failed to load outfit"

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setError(errorMessage)
            // console.error('Error loading outfit:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Create a new outfit
    const createOutfit = async (outfitData: {
        name: string;
        description?: string;
        clothingIds: number[];
    }): Promise<BackendOutfit | null> => {
        setLoading(true)
        setError(null)

        try {
            // console.log('Creating outfit with data:', outfitData)
            const newOutfit = await outfitService.createOutfit(outfitData)

            if (newOutfit?.data) {
                setOutfits(prevOutfits => [...prevOutfits, newOutfit.data])
                // console.log('Outfit created successfully:', newOutfit.data)
                return newOutfit.data
            }

            return newOutfit
        } catch (error: any) {
            let errorMessage = "Failed to create outfit"

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setError(errorMessage)
            // console.error('Error creating outfit:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Update an existing outfit
    const updateOutfit = async (id: string, data: Partial<BackendOutfit>) => {
        setLoading(true)
        setError(null)

        try {
            // console.log('Updating outfit:', { id, data })
            const updatedOutfit = await outfitService.updateOutfit(id, data)

            setOutfits(prevOutfits =>
                prevOutfits.map(outfit =>
                    outfit.outfit_id.toString() === id ? { ...outfit, ...updatedOutfit.data } : outfit
                )
            )

            if (outfitById && outfitById.outfit_id.toString() === id) {
                setOutfitById({ ...outfitById, ...updatedOutfit.data })
            }

            // console.log('Outfit updated successfully:', updatedOutfit)
        } catch (error: any) {
            let errorMessage = "Failed to update outfit"

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setError(errorMessage)
            // console.error('Error updating outfit:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Delete an outfit
    const deleteOutfit = async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            // console.log('Deleting outfit:', id)
            await outfitService.deleteOutfit(id)

            setOutfits(prevOutfits =>
                prevOutfits.filter(outfit => outfit.outfit_id.toString() !== id)
            )

            if (outfitById && outfitById.outfit_id.toString() === id) {
                setOutfitById(null)
            }

            // console.log('Outfit deleted successfully')
        } catch (error: any) {
            let errorMessage = "Failed to delete outfit"

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setError(errorMessage)
            // console.error('Error deleting outfit:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Refresh outfits (reload from server)
    const refreshOutfits = async () => {
        await getAllOutfits()
    }

    // Clear error state
    const clearError = () => {
        setError(null)
    }

    // Reset outfit by ID
    const resetOutfitById = () => {
        setOutfitById(null)
    }

    const value: OutfitContextType = {
        outfits,
        outfitById,
        loading,
        error,
        getAllOutfits,
        getOutfitById,
        createOutfit,
        updateOutfit,
        deleteOutfit,
        refreshOutfits,
        clearError,
        resetOutfitById
    }

    return (
        <OutfitContext.Provider value={value}>
            {children}
        </OutfitContext.Provider>
    )
}

export const useOutfitContext = () => {
    const context = useContext(OutfitContext)
    if (context === undefined) {
        throw new Error('useOutfitContext must be used within an OutfitProvider')
    }
    return context
}