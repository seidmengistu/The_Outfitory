
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, X, ChevronUp, EllipsisVertical } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

// ------------------- Types -------------------
interface Item {
  name: string;
  image_url: string;
}

interface Outfit {
  id: number;
  name: string;
  items: Item[] | undefined;
}


const OutfitRow = ({
  outfit,
  onAdd,
}: {
  outfit: Outfit;
  onAdd: (id: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [imageMap, setImageMap] = useState<string[]>([]);
  const { theme } = useTheme();

  const items = outfit.items ?? [];
  const visible = items.slice(0, 3);
  const remaining = items.length - visible.length;

  const cardBg =
    theme === "dark"
      ? "bg-white/5 border-white/10 hover:bg-white/10"
      : "bg-white border-black/10 hover:bg-gray-100";

  const innerBg =
    theme === "dark"
      ? "bg-white/5 border-white/10"
      : "bg-gray-50 border-black/10";

  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-white/70" : "text-gray-600";

  // ---------------- Image Loader ----------------
  useEffect(() => {
    items.forEach(async (item: Item, index: number) => {
      if (!item?.image_url) return;

      try {
        const res = await fetch(item.image_url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) return;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        setImageMap((prev) => {
          const updated = [...prev];
          updated[index] = url;
          return updated;
        });
      } catch (err) {
        console.error("Failed loading item image:", err);
      }
    });
  }, [items]);

  return (
    <div
      className={`rounded-2xl border p-4 mb-4 cursor-pointer transition ${cardBg}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Thumbnails */}
          <div className="flex items-center -space-x-2">
            {visible.map((item, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full overflow-hidden border border-white/30"
              >
                <img
                  src={imageMap[idx]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {remaining > 0 && (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-medium leading-none border border-[#6B6B6B] ${
                  theme === "dark"
                    ? "bg-[#1C1837] text-[#F178B6]"
                    : "bg-gray-200 text-gray-900"
                }`}
                style={{ lineHeight: "1" }}
              >
                +{remaining}
              </div>
            )}
          </div>

          <h3 className={`text-lg ${textPrimary}`}>{outfit.name}</h3>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            expanded ? setExpanded(false) : onAdd(outfit.id);
          }}
          className={`rounded-xl p-2 ${
            theme === "dark"
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
          }`}
        >
          {expanded ? <ChevronUp size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className={`mt-4 rounded-xl border p-4 space-y-3 ${innerBg}`}>
          <h4 className={`text-sm font-semibold ${textSecondary}`}>Items:</h4>

          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                  <img
                    src={imageMap[idx]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={textSecondary}>{item.name}</span>
              </div>
            ))
          ) : (
            <p className={`${textSecondary} italic`}>No items found.</p>
          )}
        </div>
      )}
    </div>
  );
};


const AddedOutfitRow = ({
  outfit,
  onRemove,
}: {
  outfit: Outfit;
  onRemove: (id: number) => void;
}) => {
  const { theme } = useTheme();
  const [imageMap, setImageMap] = useState<string[]>([]);

  const items = outfit.items ?? [];
  const visible = items.slice(0, 3);
  const remaining = items.length - visible.length;

  const cardBg =
    theme === "dark"
      ? "bg-white/5 border-white/10"
      : "bg-white border-black/10";

  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";

  // Load images
  useEffect(() => {
    items.forEach(async (item: Item, index: number) => {
      try {
        const res = await fetch(item.image_url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        setImageMap((prev) => {
          const updated = [...prev];
          updated[index] = url;
          return updated;
        });
      } catch {}
    });
  }, [items]);

  return (
    <div
      className={`rounded-xl p-4 mb-3 flex justify-between items-center ${cardBg}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {visible.map((item, idx) => (
            <div
              key={idx}
              className="w-10 h-10 rounded-full overflow-hidden border border-white/20"
            >
              <img
                src={imageMap[idx]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {remaining > 0 && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-medium leading-none ${
                theme === "dark"
                  ? "bg-white/10 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              style={{ lineHeight: "1" }}
            >
              +{remaining}
            </div>
          )}
        </div>

        <span className={`text-lg ${textPrimary}`}>{outfit.name}</span>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(outfit.id)}
        className={`rounded-full p-2 ${
          theme === "dark"
            ? "bg-rose-600/80 hover:bg-rose-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

//                MAIN PAGE COMPONENT 
const CollectionDetailsPage: React.FC = () => {
  const { id } = useParams();
  const collectionId = Number(id);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [collectionName, setCollectionName] = useState("");
  const [collectionOutfits, setCollectionOutfits] = useState<Outfit[]>([]);
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [availableOutfits, setAvailableOutfits] = useState<Outfit[]>([]);

  // Loader for “Add from Outfits”
  const [loadingOutfits, setLoadingOutfits] = useState(true);

  // Menu + Modals
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newName, setNewName] = useState("");

  // Theme styling
  const pageBg = theme === "dark" ? "bg-transparent" : "bg-gray-50";
  const panel =
    theme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-black/10";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-white/70" : "text-gray-600";

  // ---------------- Fetch Collection ----------------
  const fetchCollection = async () => {
    const res = await axios.get(
      `http://localhost:8000/collection/get_collection/${collectionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data.data;
    setCollectionName(data.name);

    const mapped = data.outfits.map((o: any) => ({
      id: o.outfit_id,
      name: o.outfit_name,
      items: o.clothes ?? [],
    }));

    setCollectionOutfits(mapped);
  };

  // ---------------- Fetch All Outfits ----------------
  const fetchAllOutfits = async () => {
    const res = await axios.get(
      "http://localhost:8000/outfit/get_all_outfits",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const mapped = res.data.data.map((o: any) => ({
      id: o.outfit_id,
      name: o.name,
      items: o.clothes ?? [],
    }));

    setAllOutfits(mapped);
  };

  // Load data with loader
  useEffect(() => {
    const load = async () => {
      setLoadingOutfits(true);
      await Promise.all([fetchCollection(), fetchAllOutfits()]);
      setLoadingOutfits(false);
    };

    load();
  }, []);

  // Determine outfits not yet added
  useEffect(() => {
    setAvailableOutfits(
      allOutfits.filter((o) => !collectionOutfits.some((c) => c.id === o.id))
    );
  }, [allOutfits, collectionOutfits]);

  // ---------------- Add Outfit ----------------
  const handleAddOutfit = async (outfitId: number) => {
    try {
      await axios.post(
        "http://localhost:8000/collection/add_outfit_to_collection",
        { collection_id: collectionId, outfit_id: outfitId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chosen = allOutfits.find((o) => o.id === outfitId);
      if (!chosen) return;

      setCollectionOutfits([...collectionOutfits, chosen]);
      setAvailableOutfits(
        availableOutfits.filter((o) => o.id !== outfitId)
      );
    } catch (err) {
      console.error("Failed adding outfit:", err);
    }
  };

  // ---------------- Remove Outfit ----------------
  const handleRemoveOutfit = async (outfitId: number) => {
    try {
      await axios.delete(
        `http://localhost:8000/collection/remove_outfit_from_collection/${collectionId}/${outfitId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const removed = collectionOutfits.find((o) => o.id === outfitId);
      if (!removed) return;

      setCollectionOutfits(collectionOutfits.filter((o) => o.id !== outfitId));
      setAvailableOutfits([...availableOutfits, removed]);
    } catch (err) {
      console.error("Failed removing:", err);
    }
  };

  // ---------------- Rename Collection ----------------
  const renameCollection = async () => {
    try {
      await axios.put(
        `http://localhost:8000/collection/update_collection/${collectionId}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCollectionName(newName);
      setShowRename(false);
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  // ---------------- Delete Collection ----------------
  const deleteCollection = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/collection/delete_collection/${collectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/collection");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ======================================================================
  //                           RENDER UI
  // ======================================================================
  return (
    <div className={`min-h-screen p-8 space-y-8 ${pageBg}`}>
      {/* Breadcrumb */}
      <div className={`flex items-center gap-3 text-sm ${textSecondary}`}>
        <Link to="/collection" className="hover:underline">
          Collections
        </Link>
        <span>|</span>
        <span className={textPrimary}>{collectionName}</span>
      </div>

      {/* Title + Menu */}
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>{collectionName}</h1>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-xl ${
              theme === "dark"
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            <EllipsisVertical size={20} />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-xl p-2 space-y-1 z-10 ${
                theme === "dark"
                  ? "bg-white/10 border-white/10 backdrop-blur-md"
                  : "bg-white border-black/10"
              }`}
            >
              <button
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 ${textPrimary}`}
                onClick={() => {
                  setShowMenu(false);
                  setNewName(collectionName);
                  setShowRename(true);
                }}
              >
                Rename Collection
              </button>

              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400"
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
              >
                Delete Collection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================== OUTFITS IN COLLECTION ================== */}
      <section className={`rounded-2xl border p-6 space-y-4 ${panel}`}>
        <h2 className={`text-xl font-semibold ${textPrimary}`}>
          Outfits in this Collection
        </h2>

        <div
          className={`rounded-xl border border-dashed p-6 ${
            theme === "dark" ? "border-white/20" : "border-gray-300"
          }`}
        >
          {collectionOutfits.length === 0 ? (
            <div className={`flex flex-col items-center text-center py-12 ${textSecondary}`}>
              <div
                className={`mb-3 rounded-xl p-4 ${
                  theme === "dark" ? "bg-white/10" : "bg-gray-200"
                }`}
              >
                <Plus />
              </div>
              <p>No outfits added yet.</p>
            </div>
          ) : (
            collectionOutfits.map((o) => (
              <AddedOutfitRow
                key={o.id}
                outfit={o}
                onRemove={handleRemoveOutfit}
              />
            ))
          )}
        </div>
      </section>

      {/* ================== ADD FROM OUTFITS ================== */}
      <section className="space-y-4">
        <h2 className={`text-2xl font-semibold ${textPrimary}`}>
          Add from Outfits
        </h2>

        {loadingOutfits ? (
          <div className="flex justify-center py-10">
            <div
              className={`w-8 h-8 rounded-full border-4 animate-spin ${
                theme === "dark"
                  ? "border-white/20 border-t-white"
                  : "border-gray-300 border-t-gray-600"
              }`}
            />
          </div>
        ) : availableOutfits.length === 0 ? (
          <p className={textSecondary}>All outfits are already added.</p>
        ) : (
          availableOutfits.map((o) => (
            <OutfitRow key={o.id} outfit={o} onAdd={handleAddOutfit} />
          ))
        )}
      </section>

      {/* ------------------ Rename Modal ------------------ */}
      {showRename && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div
            className={`rounded-2xl p-6 w-96 space-y-4 ${
              theme === "dark"
                ? "bg-white/10 border-white/10"
                : "bg-white border-black/20"
            }`}
          >
            <h3 className={`text-xl font-semibold ${textPrimary}`}>
              Rename Collection
            </h3>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`w-full rounded-xl p-3 outline-none ${
                theme === "dark"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-gray-100 border-black/20 text-gray-900"
              }`}
              placeholder="New name"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRename(false)}
                className={`px-4 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={renameCollection}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  theme === "dark"
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-gray-800 hover:bg-black text-white"
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Delete Modal ------------------ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div
            className={`rounded-2xl p-6 w-96 space-y-4 ${
              theme === "dark"
                ? "bg-white/10 border-white/10"
                : "bg-white border-black/20"
            }`}
          >
            <h3 className={`text-xl font-semibold ${textPrimary}`}>
              Delete Collection?
            </h3>

            <p className={textSecondary}>
              This action cannot be undone. The outfits themselves will remain
              saved.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={deleteCollection}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  theme === "dark"
                    ? "bg-rose-600/80 hover:bg-rose-600 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetailsPage;
