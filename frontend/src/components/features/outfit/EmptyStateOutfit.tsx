
export default function EmptyStateOutfit() {
    
    return (
        <div className="text-center py-12">
            <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No Saved Outfits Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start creating outfits to see them here
            </p>
            <button
                onClick={() => window.location.href = '/create-outfit'}
                className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
                Create Your First Outfit
            </button>
        </div>
    )
}
