import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useTheme } from '../hooks/useTheme';

// TS Interface
interface Collection {
  id: number;
  name: string;
  outfitCount: number;
}

// --- CollectionCard Component ---
interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const cardBg = theme === "dark"
    ? "bg-white/5 border-white/10 hover:bg-white/10"
    : "bg-white/80 border-black/10 hover:bg-gray-100";

  const titleText = theme === "dark" ? "text-white" : "text-gray-900";
  const countText = theme === "dark" ? "text-white/60" : "text-gray-600";

  return (
    <div
      onClick={() => navigate(`/collection/${collection.id}`)}
      className={`flex items-center justify-between rounded-2xl border p-6 transition cursor-pointer ${cardBg}`}
    >
      <div>
        <h3 className={`text-xl font-semibold ${titleText}`}>{collection.name}</h3>
        <p className={`text-sm mt-1 ${countText}`}>{collection.outfitCount} Outfits</p>
      </div>

      <svg
        className={`w-6 h-6 ${titleText}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

// =====================================================
//       MAIN COLLECTION PAGE COMPONENT
// =====================================================
const CollectionPage: React.FC = () => {
  const { theme } = useTheme();
  const [collectionName, setCollectionName] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // theme-aware styles
  const pageBg = theme === "dark" ? "bg-transparent" : "bg-gray-50";
  const panel = theme === "dark"
    ? "bg-white/5 border-white/10"
    : "bg-white/80 border-black/10";

  const inputBg = theme === "dark"
    ? "bg-white/10 border-white/10 text-white placeholder-white/50"
    : "bg-white border-black/10 text-gray-900 placeholder-gray-400";

  const headingText = theme === "dark" ? "text-white" : "text-gray-900";
  const subHeadingText = theme === "dark" ? "text-white/80" : "text-gray-700";

  // ------------------------------------------------
  // 1️⃣ Get the outfit count for each collection
  // ------------------------------------------------
  const fetchCollectionCounts = async (collections: any[]) => {
    const updated = await Promise.all(
      collections.map(async (col) => {
        try {
          const res = await axios.get(
            `http://localhost:8000/collection/get_collection/${col.collection_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          return {
            id: col.collection_id,
            name: col.name,
            outfitCount: res.data.data.outfits?.length || 0,
          };

        } catch (err) {
          console.error("Failed to fetch collection details:", err);
          return {
            id: col.collection_id,
            name: col.name,
            outfitCount: 0,
          };
        }
      })
    );

    setCollections(updated);
    setLoading(false);
  };

  // ------------------------------------------------
  // 2️⃣ Load all collections and fetch their counts
  // ------------------------------------------------
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/collection/get_all_collections",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawCollections = res.data.data || [];

        await fetchCollectionCounts(rawCollections);

      } catch (error) {
        console.error("Error loading collections:", error);
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  // ------------------------------------------------
  // 3️⃣ Create new collection
  // ------------------------------------------------
  const handleCreateList = async () => {
    if (!collectionName.trim()) {
      alert("Please enter a collection name.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/collection/add_collection",
        { name: collectionName, description: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCollectionName("");

      const res = await axios.get(
        "http://localhost:8000/collection/get_all_collections",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rawCollections = res.data.data;
      await fetchCollectionCounts(rawCollections);

    } catch (err) {
      console.error("Error creating collection:", err);
      alert("Could not create collection.");
    }
  };

  return (
    <div className={`min-h-screen p-6 space-y-8 transition-colors duration-300 ${pageBg}`}>
      <h1 className={`text-3xl font-bold ${headingText}`}>Collections</h1>

      {/* --- Create a New Collection Section --- */}
      <section className="mb-12">
        <div className={`rounded-2xl border p-6 shadow-lg ${panel}`}>
          <h2 className={`mb-4 text-xl font-semibold ${subHeadingText}`}>
            Create a New Collection
          </h2>

          <div className="flex items-center">
            <input
              type="text"
              placeholder="e.g., Sports, Formals"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className={`flex-1 rounded-xl px-4 py-3 outline-none ${inputBg}`}
            />

            <button
              onClick={handleCreateList}
              className="ml-4 rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600 transition"
            >
              Create
            </button>
          </div>
        </div>
      </section>

      {/* --- Existing Collections Section --- */}
      <section className="space-y-4">
        <h2 className={`text-2xl font-semibold ${subHeadingText}`}>Your Collections</h2>

        {loading ? (
          <p className={subHeadingText}>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))
            ) : (
              <p className={subHeadingText}>No collections yet. Create one!</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CollectionPage;
