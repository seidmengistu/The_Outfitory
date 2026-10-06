import api from "../lib/api"
import type { Outfit, BackendOutfitResponse, BackendOutfit } from "../types/outfit"

export const outfitService = {
    getAllOutfits: async (): Promise<BackendOutfit[]> => {
        try {
            const response = await api.get(`/outfit/get_all_outfits`)
            if (!response) {
                return []
            }

            // Check if response.data has the expected structure
            if (response.data && typeof response.data === 'object') {
                if ('data' in response.data) {
                    return response.data.data
                } else if (Array.isArray(response.data)) {
                    return response.data
                } else {
                    return []
                }
            }

            return response.data
        } catch (error: any) {
            const status = error.response?.status || error.status

            // Handle 404 gracefully - user has no outfits yet
            if (status === 404) {
                return []
            }

            // Handle other specific errors
            if (status === 401) {
                throw new Error('Please log in to view your outfits')
            }

            if (status === 403) {
                throw new Error('You do not have permission to view outfits')
            }

            if (status >= 500) {
                throw new Error('Server error - please try again later')
            }

            // Check for network issues
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                throw new Error('Unable to connect to server - please check your connection')
            }

            if (error.message && error.message.includes('Nessun outfit trovato')) {
                return []
            }

            if (error.response?.data) {
                let message = error.response.data?.message || error.message
                if (message.includes('Nessun outfit trovato')) {
                    return []
                }

                const backendErrorMessage = new Error(message)
                throw backendErrorMessage
            }

            throw new Error('Unable to load outfits - please check your connection')
        }
    },


    getOutfitById: async (outfitId: number): Promise<Outfit> => {
        try {
            const response = await api.get(`/outfit/get_single_outfit/${outfitId}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    createOutfit: async (outfitData: {
        name: string;
        description?: string;
        clothingIds: number[];
    }) => {
        try {

            const payload = {
                name: outfitData.name,
                description: outfitData.description || '',
                clothes: outfitData.clothingIds.map(id => Number(id)),
            }


            const response = await api.post('/outfit/add_outfit', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    updateOutfit: async (outfitId: string, data: Partial<Outfit>) => {
        try {
            const response = await api.put(`/outfit/update_outfit/${outfitId}`, data)
            return response.data
        } catch (error) {
            throw error
        }
    },

    deleteOutfit: async (outfitId: string) => {
        try {
            const response = await api.delete(`/outfit/delete_outfit/${outfitId}`)
            return response.data
        } catch (error) {
            throw error
        }
    }
}