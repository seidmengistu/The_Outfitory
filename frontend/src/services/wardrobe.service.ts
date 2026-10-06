import api from "../lib/api"
import type { ClothingFormValues, ClothingItem, WardrobeFilters } from "../types/clothing"

const normalizeClothing = (item: any): ClothingItem => {
    const rawImage: string | undefined = item?.image_url ?? item?.imageUrl ?? undefined
    const base = (api.defaults.baseURL ?? '').toString().replace(/\/+$/,'')

    let image_url: string | undefined
    if (!rawImage) {
        image_url = undefined
    } else {
        // Always derive final URL as /file/get/<filename>
        const filename = rawImage.split('/').pop() as string
        const encoded = encodeURIComponent(filename)
        const isAlreadyCorrect = /\/file\/get\//.test(rawImage)
        if (/^https?:\/\//i.test(rawImage)) {
            image_url = isAlreadyCorrect ? rawImage : `${base || ''}/file/get/${encoded}`
        } else {
            image_url = `${base || ''}/file/get/${encoded}`
        }
    }

    return {
        id: String(item?.id ?? item?.cloth_id ?? ""),
        user_id: String(item?.user_id ?? item?.userId ?? ""),
        name: item?.name ?? "Untitled",
        category: item?.category ?? item?.type ?? "unknown",
        color: item?.color ?? item?.primary_color ?? undefined,
        season: item?.season ?? item?.Season ?? undefined,
        occasion: item?.occasion ?? item?.Occasion ?? undefined,
        image_url,
        notes: item?.notes ?? item?.description ?? undefined,
        is_favorite: item?.is_favorite ?? item?.isFavorite ?? undefined,
        created_at: item?.created_at ?? item?.createdAt ?? undefined,
        updated_at: item?.updated_at ?? item?.updatedAt ?? undefined,
        // Classification fields (if the backend returns them)
        fit: item?.fit ?? undefined,
        material: item?.material ?? undefined,
        pattern: item?.pattern ?? undefined,
        primary_color: item?.primary_color ?? undefined,
        secondary_color: item?.secondary_color ?? undefined,
        type: item?.type ?? item?.typeCloth ?? undefined,
    }
}

const extractArray = (payload: any): any[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (Array.isArray(payload?.data)) {
        return payload.data
    }

    if (Array.isArray(payload?.items)) {
        return payload.items
    }

    return []
}

const extractSingle = (payload: any): any => {
    if (!payload) {
        return null
    }

    if (payload?.data) {
        return payload.data
    }

    return payload
}

export const wardrobeService = {
    async getAllClothes(): Promise<ClothingItem[]> {
        const response = await api.get(`/clothes/get_all_clothes`)
        const items = extractArray(response.data).map(normalizeClothing)
        return items
    },

    async getClothesById(id: string): Promise<ClothingItem | null> {
        const response = await api.get(`/clothes/get_single_cloth/${id}`)
        const item = extractSingle(response.data)
        if (!item) {
            return null
        }
        return normalizeClothing(item)
    },

    async addClothe(data: ClothingFormValues & { user_id: string }) {
        // Map fields to backend schema (type -> typeCloth)
        const mapped: any = {
            ...data,
            typeCloth: (data as any).type ?? (data as any).typeCloth ?? undefined,
        }
        // Remove client-only field 'type' to avoid ambiguity
        delete (mapped as any).type
        const response = await api.post("/clothes/add_cloth", mapped)
        return response.data
    },

    async updateClothe(id: string, data: Partial<ClothingFormValues>) {
        const mapped: any = {
            ...data,
            typeCloth: (data as any).type ?? (data as any).typeCloth ?? undefined,
        }
        delete (mapped as any).type
        const response = await api.put(`/clothes/update_cloth/${id}`, mapped)
        return response.data
    },

    async deleteClothe(clothingId: string) {
        const response = await api.delete(`/clothes/delete_cloth/${clothingId}`)
        return response.data
    },

    async filterClothes(_userId: string, filters: WardrobeFilters): Promise<ClothingItem[]> {
        // Backend route not available: do client-side filtering after fetching all
        const all = await this.getAllClothes()
        return all.filter(item => {
            if (filters.category && item.category !== filters.category) return false
            if (filters.season && item.season !== filters.season) return false
            if (filters.occasion && item.occasion !== filters.occasion) return false
            return true
        })
    }
}