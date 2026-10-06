//  All constants wether variables or any other things will be written from here

export const CLOTHING_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "dress", label: "Dress" },
] as const

export const CLOTHING_SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all_season", label: "All Season" },
] as const

export const CLOTHING_OCCASIONS = [
  { value: "all", label: "All Occasion" },
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "sports", label: "Sports" },
  { value: "party", label: "Party" },
] as const