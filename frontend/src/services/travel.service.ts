import api from "../lib/api"
import { authService } from "./auth.service"
import type { CreateTravelPayload, TravelDetail, TravelSummary, UpdateTravelPayload } from "../types/travel"

const normalizeTravelSummary = (row: any): TravelSummary => ({
  travel_id: Number(row?.travel_id ?? row?.id ?? 0),
  user_id: row?.user_id ? Number(row.user_id) : undefined,
  name: row?.name ?? "Untitled",
  start_date: row?.start_date ? String(row.start_date) : undefined,
  end_date: row?.end_date ? String(row.end_date) : undefined
})

const normalizeTravelDetail = (payload: any): TravelDetail => {
  const base: TravelDetail = {
    travel_id: Number(payload?.travel_id ?? payload?.id ?? 0),
    name: payload?.name ?? "Untitled",
    start_date: payload?.start_date ? String(payload.start_date) : undefined,
    end_date: payload?.end_date ? String(payload.end_date) : undefined,
    clothes: Array.isArray(payload?.clothes) ? payload.clothes.map((c: any) => ({
      cloth_id: Number(c?.cloth_id ?? c?.id ?? 0),
      cloth_name: c?.cloth_name ?? c?.name,
      name: c?.cloth_name ?? c?.name,
      category: c?.category,
      color: c?.color,
      season: c?.season,
      image_url: c?.image_url,
      user_id: c?.user_id ? String(c.user_id) : undefined
    })) : []
  }
  return base
}

export const travelService = {
  async getAllTravels(): Promise<TravelSummary[]> {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      throw new Error("Not authenticated")
    }
    try {
      const response = await api.get(`/travel/get_all_travels`)
      const list = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
      return list.map(normalizeTravelSummary)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404) {
        return []
      }
      throw err
    }
  },

  async getTravel(travelId: number): Promise<TravelDetail> {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      throw new Error("Not authenticated")
    }
    const { data } = await api.get(`/travel/get_travel/${travelId}`)
    const raw = data?.data ?? data
    return normalizeTravelDetail(raw)
  },

  async addTravel(payload: CreateTravelPayload): Promise<TravelSummary> {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      throw new Error("Not authenticated")
    }
    const body = { ...payload, user_id: Number(userId) }
    const { data } = await api.post(`/travel/add_travel`, body)
    // Follow-up fetch to return created entity if possible
    const newId = data?.data?.travel_id
    if (newId) {
      return this.getTravel(newId).then(d => ({
        travel_id: d.travel_id,
        name: d.name,
        start_date: d.start_date,
        end_date: d.end_date
      }))
    }
    return normalizeTravelSummary(data?.data ?? body)
  },

  async updateTravel(travelId: number, payload: UpdateTravelPayload) {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      throw new Error("Not authenticated")
    }
    const { data } = await api.put(`/travel/update_travel/${travelId}`, payload)
    return data
  },

  async deleteTravel(travelId: number) {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      throw new Error("Not authenticated")
    }
    const { data } = await api.delete(`/travel/delete_travel/${travelId}`)
    return data
  },

  async addClothToTravel(travelId: number, clothId: number) {
    const payload = { travel_id: travelId, cloth_id: clothId }
    const { data } = await api.post(`/travel/add_cloth_to_travel`, payload)
    return data
  },

  async removeClothFromTravel(travelId: number, clothId: number) {
    const { data } = await api.delete(`/travel/remove_cloth_from_travel/${travelId}/${clothId}`)
    return data
  }
}


