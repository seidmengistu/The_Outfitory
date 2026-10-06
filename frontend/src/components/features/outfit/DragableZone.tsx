import { useDrop } from 'react-dnd'
import { ItemTypes, type ClothingItem } from '../../../types'
import AuthImage from '../../common/AuthImage'

interface OutfitDropZoneProps {
  outfitItems: ClothingItem[]
  onItemDrop: (item: ClothingItem) => void
  onItemRemove: (itemId: string) => void
  showNameInput?: boolean
  outfitName?: string
  onNameChange?: (name: string) => void
  onSave?: () => void
  onClear?: () => void
  isLoading?: boolean
}

export default function OutfitDropZone({ 
  outfitItems, 
  onItemDrop, 
  onItemRemove,
  showNameInput = false,
  outfitName = '',
  onNameChange,
  onSave,
  onClear,
  isLoading = false
}: OutfitDropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.CLOTHING_ITEM,
    drop: (item: ClothingItem) => {
      // Check if item already exists in outfit
      if (!outfitItems.find(outfitItem => outfitItem.id === item.id)) {
        onItemDrop(item)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const isActive = isOver && canDrop

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        min-h-[400px] p-6 rounded-xl border-2 border-dashed transition-all duration-300
        ${isActive
          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
          : canDrop
            ? 'border-purple-300 bg-purple-25 dark:bg-purple-900/10'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }
      `}
    >
      {outfitItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg">Add more</span>
          </div>
          <p className="text-center">
            {isActive ? 'Drop items here!' : 'Drag items here from your wardrobe'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Outfit Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {outfitItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  {item.image_url ? (
                    <AuthImage
                      srcPath={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500 dark:bg-[#170C35] dark:text-white/40">No Image</div>
                  )}
                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.category}
                  </p>
                </div>
                <button
                  onClick={() => onItemRemove(item.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Outfit Name Input and Buttons - Show when there are items */}
          {showNameInput && outfitItems.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Select outfit name
              </h4>
              
              <input
                type="text"
                placeholder="Outfit Name"
                value={outfitName}
                onChange={(e) => onNameChange?.(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />

              <div className="flex gap-3">
                <button
                  onClick={onClear}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
                <button
                  onClick={onSave}
                  disabled={!outfitName.trim() || isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}