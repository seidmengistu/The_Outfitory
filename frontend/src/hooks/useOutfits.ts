import { useOutfitContext } from '../contexts/OutfitContext'

export const useOutfits = () => {
    const context = useOutfitContext()

    // Load outfits for current user (automatically from token)
    const loadCurrentUserOutfits = async () => {
        await context.getAllOutfits()
    }

    // Create outfit for current user (automatically from token)
    const createOutfitForCurrentUser = async (outfitData: {
        name: string;
        description?: string;
        clothingIds: number[];
    }) => {
        return await context.createOutfit(outfitData)
    }

    // Get outfit by ID for current user (automatically from token)
    const getOutfitByIdForCurrentUser = async (outfitId: number) => {
        await context.getOutfitById(outfitId)
    }

    return {
        // State
        outfits: context.outfits,
        outfitById: context.outfitById,
        loading: context.loading,
        error: context.error,
        
        // Actions for current user (no user_id needed)
        loadCurrentUserOutfits,
        createOutfitForCurrentUser,
        getOutfitByIdForCurrentUser,
        
        // Direct context actions
        getAllOutfits: context.getAllOutfits,
        getOutfitById: context.getOutfitById,
        createOutfit: context.createOutfit,
        updateOutfit: context.updateOutfit,
        deleteOutfit: context.deleteOutfit,
        
        // Utilities
        refreshOutfits: context.refreshOutfits,
        clearError: context.clearError,
        resetOutfitById: context.resetOutfitById
    }
}