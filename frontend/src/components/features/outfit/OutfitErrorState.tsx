
export default function OutfitErrorState({ error, clearError, loadCurrentUserOutfits }: { error: string; clearError: () => void; loadCurrentUserOutfits: () => Promise<void> }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">Error Loading Outfits</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                clearError()
                loadCurrentUserOutfits()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={clearError}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
  )
}
