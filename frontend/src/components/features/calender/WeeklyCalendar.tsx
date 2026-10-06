import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import Loader from "../../../components/ui/Loader";

interface WeekEntry {
  calendar_id: number;
  date: string;
  description?: string;
  outfit_name: string | null;
  outfit_id?: number;
}

interface Outfit {
  outfit_id: number;
  name: string;
}

export default function WeeklyPlanner() {
  const [entries, setEntries] = useState<WeekEntry[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);     // ⭐ NEW
  const [error, setError] = useState<string | null>(null); // optional

  const { theme } = useTheme();
  const navigate = useNavigate();

  /** Fetch weekly data */
  const loadWeek = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/calendar/get_current_week", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data.data || []);
    } catch (err) {
      setError("Failed to load weekly plan");
    }
  };

  /** Fetch outfits */
  const loadOutfits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/outfit/get_all_outfits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutfits(res.data.data || []);
    } catch (err) {
      setError("Failed to load outfits");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([loadWeek(), loadOutfits()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // ⭐ SHOW LOADER (same styling as Wardrobe page)
  if (loading) {
    return (
      <div className="rounded-3xl bg-[#0F0A2C]/60 py-20">
        <Loader label="Loading weekly planner..." />
      </div>
    );
  }

  /** Date helpers */
  const normalizeDate = (raw: string | Date) => {
    const d = new Date(raw);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayShort = normalizeDate(today);

  const weekday = today.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  /** Assign outfit */
  const assignOutfit = async (outfitId: number) => {
    if (!activeDate) return;

    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8000/calendar/add_entry",
      { outfit_id: outfitId, date: activeDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowModal(false);
    await loadWeek();
  };

  /** Open modal */
  const handlePlanClick = (shortDate: string) => {
    setActiveDate(shortDate);
    setShowModal(true);
  };

  const formattedItems = weekDates.map((dateObj, index) => {
    const short = normalizeDate(dateObj);
    const matching = entries.find((e) => normalizeDate(e.date) === short);

    return {
      day: daysOfWeek[index],
      date: String(dateObj.getDate()).padStart(2, "0"),
      value: matching?.outfit_name ?? "None",
      action: matching ? "View" : "Plan",
      isToday: short === todayShort,
      short,
    };
  });

  /* ---------- Theme helpers ---------- */
  const panel = theme === "dark"
    ? "bg-white/5 border border-white/10 text-white"
    : "bg-white/80 border border-black/10 text-gray-900";

  const softPanel = theme === "dark"
    ? "bg-white/10 border border-white/20"
    : "bg-gray-100 border border-black/10";

  const buttonBase =
    "text-sm font-medium py-2 px-4 rounded-lg border transition-colors w-16 text-center";

  const buttonStyle = theme === "dark"
    ? `${buttonBase} border-white/20 text-white hover:bg-white/10`
    : `${buttonBase} border-gray-300 text-gray-700 hover:bg-gray-200`;

  const modalBg =
    theme === "dark" ? "bg-black/60" : "bg-black/40";

  return (
    <>
      {/* WEEKLY PLANNER */}
      <div className={`rounded-2xl p-6 shadow-lg ${panel}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> Weekly Planner
        </h3>

        <div className="space-y-3">
          {formattedItems.map((item) => (
            <div
              key={item.short}
              className={`
                flex items-center justify-between rounded-xl border p-4 transition 
                ${softPanel}
                hover:bg-gray-200 dark:hover:bg-white/10
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm font-bold
                    ${
                      item.isToday
                        ? "bg-black text-white dark:bg-white dark:text-black border border-gray-300"
                        : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white"
                    }
                  `}
                >
                  <div>{item.day}</div>
                  <div className="text-xs opacity-70">{item.date}</div>
                </div>

                <div>
                  <div className="text-xs opacity-60">Planned Outfit:</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>

              <button
                className={buttonStyle}
                onClick={() =>
                  item.action === "View"
                    ? navigate(`/calendar?date=${item.short}`)
                    : handlePlanClick(item.short)
                }
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className={`fixed inset-0 ${modalBg} backdrop-blur-sm flex items-center justify-center z-50`}
        >
          <div
            className={`p-6 w-80 rounded-2xl shadow-xl border ${
              theme === "dark"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white border-black/10 text-gray-900"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Plan Outfit
            </h2>

            <label className="text-sm mb-2 block opacity-70">
              Assign an Outfit
            </label>

            <select
              className={`
                w-full p-2 rounded-lg border mb-4
                ${
                  theme === "dark"
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white border-black/20 text-gray-900"
                }
              `}
              onChange={(e) => assignOutfit(Number(e.target.value))}
            >
              <option value="">Select outfit</option>

              {outfits.map((o) => (
                <option key={o.outfit_id} value={o.outfit_id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button
              className="
                w-full py-2 rounded-lg font-semibold 
                bg-purple-600 hover:bg-purple-700 text-white mb-3
              "
              onClick={() => navigate(`/create-outfit?date=${activeDate}`)}
            >
              Create New Outfit
            </button>

            <button
              className={`
                w-full py-2 rounded-lg font-semibold 
                ${theme === "dark"
                  ? "border border-white/20 hover:bg-white/10"
                  : "border border-black/20 hover:bg-gray-200"
                }
              `}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
