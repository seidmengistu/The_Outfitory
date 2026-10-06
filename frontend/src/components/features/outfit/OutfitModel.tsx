import { useState } from 'react'
import { X, Calendar, Palette, Eye, Sparkles } from 'lucide-react'
import AuthImage from "../../common/AuthImage"
import type { OutfitModelProps } from '../../../types'
// import type { OutfitGridProps } from '../../../types'

export default function OutfitModel({ outfit, onClose }: OutfitModelProps) {
  const [viewAll, setViewAll] = useState(false)
  const itemsToShow = viewAll ? outfit.clothes : outfit.clothes?.slice(0, 6) || []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Modern Header */}
        <div className="relative  p-6 text-dark dark:text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-2xl font-bold">{outfit.name}</h2>
              </div>
              
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {outfit.clothes?.length ? (
            <div className="space-y-6">
              {/* Items Count & View Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Outfit Items ({outfit.clothes.length})
                </h3>
                {outfit.clothes.length > 6 && (
                  <button
                    onClick={() => setViewAll(!viewAll)}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                  >
                    {viewAll ? 'Show Less' : `View All ${outfit.clothes.length} Items`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemsToShow.map((item: any, index: number) => (
                  <div
                    key={item.cloth_id}
                    className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 aspect-[4/4]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {item.image_url ? (
                      <AuthImage
                        srcPath={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <div className="text-center p-4">
                          <Palette className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Modern overlay with item details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-white/80 text-xs capitalize">{item.category || 'Clothing'}</p>
                      </div>
                    </div>

                    {/* Item number badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show remaining count if not viewing all */}
              {!viewAll && outfit.clothes.length > 6 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      And {outfit.clothes.length - 6} more amazing pieces...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Palette className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Items in This Outfit</h3>
              <p className="text-sm text-center">This outfit doesn't have any clothing items yet.</p>
            </div>
          )}
        </div>

        {/* Modern Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Created {new Date(outfit.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })} • {outfit.clothes?.length || 0} pieces total
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
