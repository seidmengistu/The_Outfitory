import type { ClothingItem } from "./clothing";

// All types for outfit created/to be created will be written here
export interface Outfit {
  id: number;
  user_id: number
  name: string;
  description?: string;
  imageUrl?: string;
  items: OutfitItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutfitRequest {
  user_id: number;
  name: string;
  description?: string;
  clothes: number[];
}

// Backend outfit type that matches your API response
export interface BackendOutfit {
  outfit_id: number
  user_id: number
  name: string
  description?: string
  created_at: string
  clothes: BackendClothingItem[]  
}

// export interface OutfitGridProps {
//   outfits: BackendOutfit[] | { data: BackendOutfit[] }
//   onViewOutfit: (outfit: BackendOutfit) => void
//   onDeleteOutfit: (outfitId: string) => void
//   outfit: any; 
//   onClose: () => void;
// }
export interface OutfitModelProps {
  outfit: BackendOutfit; 
  onClose: () => void;
  outfits?: BackendOutfit[] | { data: BackendOutfit[] }; 
  onViewOutfit?: (outfit: BackendOutfit) => void;
  onDeleteOutfit?: (outfitId: string) => void;
}



//Type for clothing items inside the outfit
export interface BackendClothingItem {
  cloth_id: number
  name: string
  image_url?: string
}

export interface CreateOutfitPayload{
   user_id: number;
    name?: string;
    description?: string;
    clothes?: number[]; 
}

export interface OutfitItem {
  id: string;
  outfit_id: Outfit['id']
  clothing_id: ClothingItem['id']
}

export interface UpdateOutfitPayload {
  id: string;
  name?: string;
  description?: string;
  items?: OutfitItem[];
}

export interface OutfitFilter {
  type?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface OutfitSortOptions {
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

export interface PaginatedOutfitResponse {
  outfits: Outfit[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OutfitStatistics {
  totalOutfits: number;
  mostCommonItemType: string;
  averageItemsPerOutfit: number;
}

export const ItemTypes = {
  CLOTHING_ITEM: 'clothing_item'
}

// Helper type for the complete backend response
export interface BackendOutfitResponse {
  code: number
  data: BackendOutfit[]
  message: string
}