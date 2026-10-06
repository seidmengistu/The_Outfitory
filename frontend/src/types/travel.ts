export interface TravelSummary {
  travel_id: number
  user_id?: number
  name: string
  start_date?: string
  end_date?: string
}

export interface TravelDetail {
  travel_id: number
  name: string
  start_date?: string
  end_date?: string
  clothes: Array<{
    cloth_id: number
    cloth_name?: string
    name?: string
    category?: string
    color?: string
    season?: string
    image_url?: string
    user_id?: string
  }>
}

export interface CreateTravelPayload {
  name: string
  start_date?: string
  end_date?: string
}

export interface UpdateTravelPayload {
  name?: string
  start_date?: string
  end_date?: string
}


