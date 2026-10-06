import { useDrag } from 'react-dnd'
import { ItemTypes, type ClothingItem } from '../../../types'
import AuthImage from '../../common/AuthImage'

interface DraggableClothingItemProps {
  item: ClothingItem
  isInOutfit?: boolean
}

export default function DraggableClothingItem({ item, isInOutfit = false }: DraggableClothingItemProps) {

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CLOTHING_ITEM,
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    // Disable dragging if item is already in outfit
    canDrag: !isInOutfit
  })

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`
        p-3 rounded-lg border-2 transition-all duration-200 relative
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isInOutfit 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-400 cursor-not-allowed opacity-60' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 cursor-move'
        }
      `}
    >
      {/* Selected indicator */}
      {isInOutfit && (
        <div className="absolute top-1 right-1 z-10 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Overlay for disabled state */}
      {isInOutfit && (
        <div className="absolute inset-0 bg-green-500/10 rounded-lg pointer-events-none" />
      )}
      
      <div className={`${isInOutfit ? 'filter grayscale-50' : ''}`}>
        <AuthImage
          srcPath={item.image_url}
          alt={item.name}
          className="w-full h-24 object-cover rounded-md mb-2"
          loading="lazy"
        />
      </div>
      
      <div className="text-sm">
        <p className={`font-medium ${isInOutfit ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-white'}`}>
          {item.name}
        </p>
        <p className={`capitalize ${isInOutfit ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {item.category}
        </p>
        {isInOutfit && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
            ✓ Added to outfit
          </p>
        )}
      </div>
    </div>
  )
}