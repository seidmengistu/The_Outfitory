import { useCallback, useEffect, useRef, useState } from 'react'
import OutfitDropZone from '../components/features/outfit/DragableZone'
import DraggableClothingItem from '../components/features/outfit/DragableClothingItem'
import { useOutfits } from '../hooks/useOutfits'
import { useWardrobe } from '../hooks/useWardrobe'
import type { ClothingItem } from '../types/clothing'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, type ToastMessage } from "../components/ui/Toast"

export default function OutfitCreator() {
  const [currentOutfit, setCurrentOutfit] = useState<ClothingItem[]>([])
  const [outfitName, setOutfitName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timeoutsRef = useRef<Record<string, number>>({})

const navigate = useNavigate();
const location = useLocation();
const params = new URLSearchParams(location.search);
const selectedDate = params.get("date"); // e.g. 2025-12-10

  // Outfit context
  const {
    loading: outfitLoading,
    error: outfitError,
    createOutfitForCurrentUser,
  } = useOutfits()

  // Wardrobe context for getting clothing items
  const {
    clothes: wardrobeItems,
    loading: wardrobeLoading,
    error: wardrobeError,
  } = useWardrobe()

// Toas notifications
  const showToast = useCallback((message: string, type: ToastMessage["type"]) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    const timeoutId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      if (timeoutsRef.current[id]) {
        clearTimeout(timeoutsRef.current[id])
        delete timeoutsRef.current[id]
      }
    }, 4000)

    timeoutsRef.current[id] = timeoutId
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [])


  const handleItemDrop = (item: ClothingItem) => {
    const itemExists = currentOutfit.some(outfitItem => outfitItem.id === item.id)


    if (!itemExists) {
      setCurrentOutfit(prev => [...prev, item])
      console.log('Item added to outfit:', item)
    } else {
      console.log('Item already in outfit:', item.name)
    }
  }

  useEffect(() => {

  })
  const filteredWardrobeItems = wardrobeItems.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category.toLowerCase() === selectedCategory.toLowerCase()
  })


  const categories = [
    { id: 'all', label: 'All' },
    { id: 'top', label: 'Tops' },
    { id: 'bottom', label: 'Bottoms' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'outerwear', label: 'Outerwear' }
  ]

  const handleItemRemove = (itemId: string) => {
    setCurrentOutfit(prev => {
      const newOutfit = prev.filter(item => item.id !== itemId)
      console.log('Item removed from outfit, new outfit:', newOutfit)
      return newOutfit
    })
  }

  // Handle save outfit
const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      showToast("Please enter an outfit name", "error");
      return;
    }

    if (currentOutfit.length === 0) {
      showToast("Please add at least one clothing item to your outfit", "error");
      return;
    }

    try {
      console.log("Saving outfit:", {
        name: outfitName,
        items: currentOutfit
      });

      const result = await createOutfitForCurrentUser({
        name: outfitName.trim(),
        description: `Custom outfit with ${currentOutfit.length} items`,
        clothingIds: currentOutfit.map(item => parseInt(item.id))
      });
      console.log("Outfit saved successfully:", result);

      const newOutfitId = (result as any).outfit_id;

      if (!newOutfitId) {
        showToast("Outfit saved but ID missing. Check backend.", "error");
        return;
      }

      if (selectedDate) {
        await fetch("http://localhost:8000/calendar/add_entry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            outfit_id: newOutfitId,
            date: selectedDate
          })
        });

        console.log("Added to calendar!");
        showToast("Outfit saved and added to calendar!", "success");
        navigate("/calendar");
      } else {
        showToast("Outfit created successfully!", "success");
      }

      setCurrentOutfit([]);
      setOutfitName("");

    } catch (error) {
      console.error("Failed to save outfit:", error);
      showToast("Failed to save outfit. Please try again.", "error");
    }
  };



  // Handle clear outfit
  const handleClearOutfit = () => {
    setCurrentOutfit([])
    setOutfitName('')
    console.log('Outfit cleared')
  }

  // Loading state
  if (wardrobeLoading || outfitLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your wardrobe...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (wardrobeError || outfitError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Error: {wardrobeError || outfitError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            Select Items to Create Your Outfit
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/ai-recommendations" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-120px)]">
        {/* Wardrobe Items */}
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Your Wardrobe ({filteredWardrobeItems.length} items)
          </h3>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${selectedCategory === category.id
                    ? 'bg-purple-500 text-white cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`} 
              >
                {category.label}
              </button>
            ))}
          </div>

          {filteredWardrobeItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No clothing items found.</p>
              <p className="text-sm mt-2">Add items to your wardrobe first!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto">
                {filteredWardrobeItems.map((item) => (
                  <DraggableClothingItem
                    key={item.id}
                    item={item}
                    isInOutfit={currentOutfit.some(outfitItem => outfitItem.id === item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Outfit Creation Area */}
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Drag Here
          </h3>

          <div className="flex-1">
            <OutfitDropZone
              outfitItems={currentOutfit}
              onItemDrop={handleItemDrop}
              onItemRemove={handleItemRemove}
              showNameInput={currentOutfit.length > 0}
              outfitName={outfitName}
              onNameChange={setOutfitName}
              onSave={handleSaveOutfit}
              onClear={handleClearOutfit}
              isLoading={outfitLoading}
            />
          </div>
        </div>
      </div>

      {/* Debug info (remove in production) */}
      {import.meta.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Current Outfit Items: {currentOutfit.length}</p>
          <p>Filtered Wardrobe Items: {filteredWardrobeItems.length}</p>
          <p>Outfit Name: {outfitName || 'Not set'}</p>
          <p>Selected Category: {selectedCategory}</p>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  )
}
