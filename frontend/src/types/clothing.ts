import type { User } from "./user"

export interface ClothingItem {
  id: string
  user_id: User['id']
  name: string
  category: string
  color?: string
  season?: string
  occasion?: string
  image_url?: string
  notes?: string
  is_favorite?: boolean
  created_at?: string
  updated_at?: string
  // Classification fields (from file/upload)
  fit?: string
  material?: string
  pattern?: string
  primary_color?: string
  secondary_color?: string
  type?: string
}

export interface ClothingFormValues {
  name: string
  category: string
  color?: string
  season?: string
  occasion?: string
  imageFile?: File | null
  notes?: string
  // Optional pre-uploaded image URL (if image was uploaded in a prior step)
  image_url?: string
  // Classification fields (all editable by user)
  fit?: string
  material?: string
  pattern?: string
  primary_color?: string
  secondary_color?: string
  type?: string
}

export interface WardrobeFilters {
  category?: string
  season?: string
  occasion?: string
  color?: string
}