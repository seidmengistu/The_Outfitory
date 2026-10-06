
export default function AuthModel() {
  return (
   <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Saved Outfits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view your saved outfits
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Log In
          </button>
        </div>
      </div>
  )
}
