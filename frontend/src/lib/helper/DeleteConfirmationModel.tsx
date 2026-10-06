
export default function DeleteConfirmationModel({ handleDeleteOutfit, setShowDeleteModal, showDeleteModal }: { handleDeleteOutfit: (outfitId: string) => Promise<void>, setShowDeleteModal: (value: string | null) => void, showDeleteModal: string }) {

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Delete Outfit
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this outfit? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteModal(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDeleteOutfit(showDeleteModal)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
