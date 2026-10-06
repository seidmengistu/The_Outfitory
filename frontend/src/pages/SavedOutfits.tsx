import { useEffect, useState, useRef } from 'react'
import { useOutfits } from '../hooks/useOutfits'
import { useAuth } from '../hooks/useAuth'
import DeleteConfirmationModel from '../lib/helper/DeleteConfirmationModel'
import AuthModel from '../lib/helper/AuthModel'
import Loader from '../components/ui/Loader'
import OutfitGrid from '../components/features/outfit/OutfitGrid'
import OutfitModel from '../components/features/outfit/OutfitModel'
import EmptyStateOutfit from '../components/features/outfit/EmptyStateOutfit'
import type { BackendOutfit } from '../types'

export default function SavedOutfits() {
  const [selectedOutfit, setSelectedOutfit] = useState<BackendOutfit | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null)
  const isLoadingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  
  // Outfit context
  const { 
    outfits, 
    loading, 
    error, 
    loadCurrentUserOutfits,
    deleteOutfit,
    clearError 
  } = useOutfits()
  
  const backendOutfits = outfits as unknown as BackendOutfit[]
  
  // Auth context for user verification
  const { getToken } = useAuth()
  const isLoggedIn = !!getToken()
  useEffect(() => {
    if (isLoggedIn && !hasInitializedRef.current && !isLoadingRef.current && !loading) {
      hasInitializedRef.current = true
      isLoadingRef.current = true
      
      loadCurrentUserOutfits()
        .then(() => {
        })
        .catch((error) => {
          hasInitializedRef.current = false 
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    }
  }, [])
  // Handle outfit deletion
  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await deleteOutfit(outfitId)
      setShowDeleteModal(null)
    } catch (error) {
    }
  }
  // Handle retry loading outfits
  const handleRetryLoading = async () => {
    if (isLoadingRef.current) return 
    
    hasInitializedRef.current = false
    isLoadingRef.current = true
    clearError()
    
    try {
      await loadCurrentUserOutfits()
      hasInitializedRef.current = true
    } catch (error) {
      hasInitializedRef.current = false
    } finally {
      isLoadingRef.current = false
    }
  }
  // Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <AuthModel/>
    )
  }
  // Loading state
  if (loading) {
    return (
      <Loader/>
    )
  }
  // Error state
  if (error && outfits.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Unable to Load Outfits
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={handleRetryLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
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
  return (
    <div className="h-full w-full px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saved Outfits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {backendOutfits.length} outfit{backendOutfits.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/create-outfit'}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25"
        >
          Create New Outfit
        </button>
      </div>
      {/* Empty state */}
      {backendOutfits.length === 0 ? (
        <EmptyStateOutfit/>
      ) : (
        /* CSS Grid Layout - fixes the full-width issue */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          <OutfitGrid 
            outfits={backendOutfits}
            onViewOutfit={(outfit) => setSelectedOutfit(outfit)}
            onDeleteOutfit={(outfitId) => setShowDeleteModal(outfitId)}
            // onUpdateOutfit={(outfitId:any) => setShowUpdateModal(outfitId)}
          />
        </div>
      )}
      {/* Outfit Detail Modal */}
      {selectedOutfit && (
        <OutfitModel
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          outfits={backendOutfits}
          onViewOutfit={(outfit:any) => setSelectedOutfit(outfit)}
          onDeleteOutfit={(outfitId:any) => setShowDeleteModal(outfitId)}
          // onUpdateOutfit={(outfitId:any) => setShowUpdateModal(outfitId)}
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModel 
          handleDeleteOutfit={handleDeleteOutfit}
          setShowDeleteModal={setShowDeleteModal}
          showDeleteModal={showDeleteModal}
        />
      )}
    </div>
  )
}
