import { useState } from 'react'
import { Edit3, Eye, Trash2, Calendar, Palette, Heart } from 'lucide-react'
import type { OutfitModelProps } from '../../../types'
import { ClothingItem, getGridLayout } from './OutfitGridLayout'


export default function OutfitGrid({ outfits, onViewOutfit, onDeleteOutfit }: OutfitModelProps) {
  const outfitsList = Array.isArray(outfits) ? outfits : outfits?.data || []
  const [hoveredOutfit, setHoveredOutfit] = useState<string | null>(null)
  
  const handleUpdate = () => {
    alert("Handle update outfit...")
  }

  return (
    <>
      {outfitsList.map((outfit) => (
        <div 
          key={outfit.outfit_id} 
          className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] w-full aspect-[5/4]"
          onMouseEnter={() => setHoveredOutfit(outfit.outfit_id.toString())}
          onMouseLeave={() => setHoveredOutfit(null)}
        >
          
          {/* Pure Image Gallery - Full Height */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`
              bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 w-full h-full transition-all duration-500
              ${hoveredOutfit === outfit.outfit_id.toString() ? 'scale-105' : 'scale-100'}
            `}>
              {outfit.clothes?.length ? (
                <div className={`grid w-full h-full gap-1 ${getGridLayout(outfit.clothes.length)} transition-all duration-300`}>
                  {outfit.clothes.slice(0, 4).map((item, index) => (
                    <ClothingItem 
                      key={item.cloth_id} 
                      item={item} 
                      index={index} 
                      totalItems={outfit.clothes.length} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Palette className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm opacity-75">Empty Outfit</p>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Hover Overlay with All Details */}
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
              transition-all duration-500 flex items-end justify-center p-6
              ${hoveredOutfit === outfit.outfit_id.toString() 
                ? 'opacity-100 backdrop-blur-sm' 
                : 'opacity-0 pointer-events-none'
              }
            `}>
              <div className="text-center space-y-4 transform transition-all duration-500">
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-2xl">{outfit.name}</h3>
                  <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(outfit.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
                
                {outfit.description && (
                  <p className="text-white/90 text-sm line-clamp-3 max-w-xs leading-relaxed">
                    {outfit.description}
                  </p>
                )}
                
                {/* Action Buttons in Overlay */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewOutfit?.(outfit)
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-500/80 backdrop-blur-md text-white cursor-pointer rounded-lg hover:bg-blue-600/90 transition-all duration-300 border border-blue-400/30 font-medium"
                  >
                    <Eye size={18} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewOutfit?.(outfit)
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-yellow-500/80 backdrop-blur-md text-white cursor-pointer rounded-lg hover:bg-yellow-600/90 transition-all duration-300 border border-blue-400/30 font-medium"
                  >
                    <Edit3 size={18} />
                    <span>Update</span>
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="p-3 bg-green-500/80 backdrop-blur-md text-white rounded-lg hover:bg-green-600/90 cursor-pointer transition-all duration-300"
                    title="add to favorite"
                  >
                    <Heart size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteOutfit?.(outfit.outfit_id.toString())
                    }}
                    className="p-3 bg-red-500/80 backdrop-blur-md text-white rounded-lg hover:bg-red-600/90 cursor-pointer transition-all duration-300"
                    title="Delete outfit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
