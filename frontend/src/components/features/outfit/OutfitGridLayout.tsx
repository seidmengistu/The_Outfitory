import AuthImage from "../../common/AuthImage"

export const getGridLayout = (itemCount: number) => {
  if (itemCount <= 1) return 'grid-cols-1'
  if (itemCount === 2) return 'grid-cols-2'
  if (itemCount === 3) return 'grid-cols-2 grid-rows-2'
  if (itemCount >= 4) return 'grid-cols-2 grid-rows-2'
  return 'grid-cols-2'
}

export const ClothingItem = ({ item, index, totalItems }: { 
  item: any, 
  index: number, 
  totalItems: number 
}) => {
  const getItemClasses = () => {
    if (totalItems === 1) {
      return 'w-full h-full shadow-lg' 
    }
    if (totalItems === 2) {
      return 'w-full h-full shadow-md' 
    }
    if (totalItems === 3) {
      if (index === 0) {
        return 'row-span-2 w-full h-full shadow-lg' 
      } else {
        return 'w-full h-full shadow-md' 
      }
    }
    // For 4+ items - all equal
    return 'w-full h-full shadow-sm'
  }
  
  const getAnimationDelay = () => {
    return `${index * 0.1}s` 
  }
  
  return (
    <div 
      className={`
        group relative overflow-hidden rounded-xl bg-white dark:bg-gray-700 
        transition-all duration-500 hover:shadow-2xl hover:scale-105
        ${getItemClasses()}
      `}
      style={{
        animationDelay: getAnimationDelay()
      }}
    >
      {item.image_url ? (
        <AuthImage
          srcPath={item.image_url}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-400 dark:text-gray-500">
          <div className="text-center p-3">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-medium text-center opacity-70 leading-tight">{item.name}</p>
          </div>
        </div>
      )}

      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

      {/* Enhanced item name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <p className="text-white text-sm font-semibold truncate">{item.name}</p>
        <p className="text-white/80 text-xs capitalize">{item.category || 'Clothing'}</p>
      </div>

      {/* Modern "+X more" indicator for 4+ items */}
      {totalItems > 4 && index === 3 && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <span className="text-white font-bold text-lg">+{totalItems - 4}</span>
            </div>
            <p className="text-white text-sm font-medium opacity-90">more pieces</p>
          </div>
        </div>
      )}

      {/* Subtle border enhancement */}
      <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
    </div>
  )
}