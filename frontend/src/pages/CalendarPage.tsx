import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOutfits } from "../hooks/useOutfits";
import { useTheme } from "../hooks/useTheme";

// Types
interface CalendarEntry {
  calendar_id: number;
  date: string;
  outfit_name?: string;
  outfit_id?: number;
  description?: string;
}

interface DayData {
  dayOfMonth: number;
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  entry?: CalendarEntry;
}

// Utility
const normalizeDate = (raw: string | Date) => {
  const d = new Date(raw);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export default function CalendarPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Query param handling
  const params = new URLSearchParams(location.search);
  const urlDate = params.get("date");

  // Base dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // State
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [selectedOutfitDetails, setSelectedOutfitDetails] = useState<any>(null);
  const [imageMap, setImageMap] = useState<string[]>([]);
  const [didAutoSelect, setDidAutoSelect] = useState(false);

  const { outfits, loadCurrentUserOutfits } = useOutfits();

  // ---------------------------------------------------
  // FETCH: Calendar entries
  // ---------------------------------------------------
  const fetchCalendarEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8000/calendar/get_all_entries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();
      setEntries(json.data || []);
    } catch (err) {
      console.error("Failed to fetch calendar entries", err);
    }
  };

  // Load events + outfits on startup
  useEffect(() => {
    fetchCalendarEvents();
    loadCurrentUserOutfits();
  }, []);

  // ---------------------------------------------------
  // FIXED: AUTO-SELECT TODAY (RUNS ONCE)
  // ---------------------------------------------------
  useEffect(() => {
    if (entries.length === 0 || didAutoSelect) return;

    const todayStr = normalizeDate(today);
    const entry = entries.find((e) => normalizeDate(e.date) === todayStr);

    setSelectedEntry(entry || null);
    setDidAutoSelect(true);

    if (entry?.outfit_id) loadOutfitDetails(entry.outfit_id);
    else setSelectedOutfitDetails(null);
  }, [entries]);

  // ---------------------------------------------------
  // If a ?date= param is given (weekly planner link)
  // ---------------------------------------------------
  useEffect(() => {
    if (!urlDate || entries.length === 0) return;

    const target = new Date(urlDate);

    setCurrentDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setSelectedDate(target);

    const entry = entries.find(
      (e) => normalizeDate(e.date) === normalizeDate(target)
    );

    setSelectedEntry(entry || null);

    if (entry?.outfit_id) loadOutfitDetails(entry.outfit_id);

    setTimeout(() => {
      rightPanelRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  }, [urlDate, entries]);

  // ---------------------------------------------------
  // Load outfit detail + images
  // ---------------------------------------------------
  const loadOutfitDetails = async (outfitId: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/outfit/get_outfit/${outfitId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();
      setSelectedOutfitDetails(json.data);
      setImageMap([]); // reset before refill
    } catch (err) {
      console.error("Failed to load outfit details", err);
    }
  };

  // Load item images safely
  useEffect(() => {
    if (!selectedOutfitDetails?.clothes) return;

    selectedOutfitDetails.clothes.forEach(async (item: any, index: number) => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(item.image_url, {
          headers: { Authorization: `Bearer ${token}` },
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
        console.error("Image load failed:", err);
      }
    });
  }, [selectedOutfitDetails]);

  // ---------------------------------------------------
  // Calendar Grid
  // ---------------------------------------------------
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIdx = new Date(year, month, 1).getDay();
    const totalDays = getDaysInMonth(year, month);
    const totalSlots = 42;

    const days: DayData[] = [];

    // Previous month filler
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        dayOfMonth: date.getDate(),
        date,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    // Current month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const formatted = normalizeDate(date);
      const entry = entries.find((e) => normalizeDate(e.date) === formatted);

      days.push({
        dayOfMonth: day,
        date,
        isCurrentMonth: true,
        isSelected: normalizeDate(selectedDate) === formatted,
        entry,
      });
    }

    // Next month filler
    while (days.length < totalSlots) {
      const date = new Date(
        year,
        month + 1,
        days.length - (firstDayIdx + totalDays) + 1
      );

      days.push({
        dayOfMonth: date.getDate(),
        date,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    return days;
  }, [currentDate, selectedDate, entries]);

  // ---------------------------------------------------
  // Day click handler (selects correct entry)
  // ---------------------------------------------------
  const handleDayClick = useCallback(
    (day: DayData) => {
      if (!day.isCurrentMonth) return;

      setSelectedDate(day.date);
      setSelectedEntry(day.entry || null);

      if (day.entry?.outfit_id) loadOutfitDetails(day.entry.outfit_id);
      else setSelectedOutfitDetails(null);
    },
    []
  );

  // ---------------------------------------------------
  // Delete entry
  // ---------------------------------------------------
  const deleteEntry = async () => {
    if (!selectedEntry) return;

    try {
      await fetch(
        `http://localhost:8000/calendar/delete_entry/${selectedEntry.calendar_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSelectedEntry(null);
      setSelectedOutfitDetails(null);
      fetchCalendarEvents(); // refresh
    } catch (err) {
      console.error("Failed to delete entry", err);
    }
  };

  // ---------------------------------------------------
  // Assign outfit to selected day
  // ---------------------------------------------------
  const assignOutfit = async (outfitId: number) => {
    const formatted = normalizeDate(selectedDate);

    try {
      const res = await fetch("http://localhost:8000/calendar/add_entry", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outfit_id: outfitId, date: formatted }),
      });

      const json = await res.json();

      await fetchCalendarEvents();

      // Ensure the right panel shows the correct assigned outfit
      setSelectedEntry({
        calendar_id: json.data.calendar_id,
        outfit_id: outfitId,
        outfit_name: outfits.find((o) => o.outfit_id === outfitId)?.name,
        date: formatted,
      });

      loadOutfitDetails(outfitId);
    } catch (err) {
      console.error("Failed to assign outfit", err);
    }
  };

  // Navigate to create outfit
  const createOutfit = () => {
    const formatted = normalizeDate(selectedDate);
    navigate(`/create-outfit?date=${formatted}`);
  };

  // ---------------------------------------------------
  // UI Theme Classes
  // ---------------------------------------------------
  const pageBg = theme === "dark" ? "bg-transparent" : "bg-gray-50";
  const panelBase =
    theme === "dark"
      ? "bg-white/5 border border-white/10 text-white"
      : "bg-white/80 border border-black/10 text-gray-900";
  const subtlePanel =
    theme === "dark"
      ? "bg-white/5 border border-white/10 text-white"
      : "bg-white/60 border border-black/10 text-gray-900";
  const controlBtn =
    theme === "dark"
      ? "bg-white/10 hover:bg-white/20 text-white"
      : "bg-gray-300 hover:bg-gray-400 text-gray-900";
  const smallMuted = theme === "dark" ? "text-white/60" : "text-gray-500";

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div className={`min-h-screen p-4 sm:p-8 ${pageBg}`}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* MONTH HEADER */}
        <div className={`p-6 rounded-2xl shadow-xl ${panelBase}`}>
          <div className="flex justify-between items-center mb-6 text-2xl font-bold">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              className={`p-2 rounded-full ${controlBtn}`}
            >
              <ChevronLeft size={24} />
            </button>

            <h1>
              {currentDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h1>

            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              className={`p-2 rounded-full ${controlBtn}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* WEEKDAYS */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div className="grid grid-cols-7 gap-2 mt-2">
            {calendarDays.map((day, idx) => {
              const isToday =
                day.date.toDateString() === today.toDateString();

              const cellClass = day.isCurrentMonth
                ? day.isSelected
                  ? theme === "dark"
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-gray-300/70 border-gray-500"
                  : theme === "dark"
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/60 border-black/10 hover:bg-gray-100"
                : theme === "dark"
                  ? "opacity-30 bg-white/5 border-white/10"
                  : "opacity-30 bg-white/60 border-black/10";

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`p-2 rounded-xl min-h-[5rem] flex flex-col items-center cursor-pointer border transition ${cellClass}`}
                >
                  <span
                    className={`text-lg font-bold flex items-center justify-center ${
                      isToday
                        ? theme === "dark"
                          ? "rounded-full w-8 h-8 bg-white text-black"
                          : "rounded-full w-8 h-8 bg-gray-800 text-white"
                        : ""
                    }`}
                  >
                    {String(day.dayOfMonth).padStart(2, "0")}
                  </span>

                  {day.entry && (
                    <p className="text-xs mt-1 opacity-80">
                      {day.entry.outfit_name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          ref={rightPanelRef}
          className={`p-6 rounded-2xl shadow-xl ${panelBase}`}
        >
          <h2 className="text-2xl font-semibold mb-4">
            Plan for{" "}
            {selectedDate.getDate() +
              " " +
              selectedDate.toLocaleString("en-US", { month: "long" })}
          </h2>

          {selectedEntry ? (
            <>
              {/* Selected outfit summary */}
              <div className={`p-4 rounded-xl mb-4 ${subtlePanel}`}>
                <p className={`text-sm ${smallMuted}`}>Planned Outfit:</p>
                <h3 className="text-2xl font-semibold">
                  {selectedEntry.outfit_name}
                </h3>
              </div>

              {/* CLOTHES LIST + IMAGES */}
              {selectedOutfitDetails?.clothes?.length > 0 && (
                <div className={`p-4 rounded-xl mb-4 ${subtlePanel}`}>
                  <p className={`text-sm ${smallMuted} mb-2`}>
                    Items in Outfit:
                  </p>

                  <ul className="space-y-2">
                    {selectedOutfitDetails.clothes.map((item: any) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-800 dark:bg-white/70" />
                        {item.name}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-6 gap-3 mt-4">
                    {selectedOutfitDetails.clothes.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-white/20"
                        >
                          <img
                            src={imageMap[index]}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* DELETE BUTTON */}
              <button
                onClick={deleteEntry}
                className="w-full py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Outfit
              </button>
            </>
          ) : (
            <>
              {/* EMPTY STATE */}
              <div
                className={`p-8 rounded-xl border mb-6 ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white/60"
                    : "bg-white/60 border-black/10 text-gray-600"
                }`}
              >
                <XCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
                <p>No outfit planned</p>
              </div>

              {/* ASSIGN OUTFIT SELECT */}
              <select
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) assignOutfit(id);
                }}
                className={`w-full p-3 rounded-xl mb-4 ${
                  theme === "dark"
                    ? "bg-white/5 border-white/20 text-white"
                    : "bg-white/60 border-black/10 text-gray-900"
                }`}
              >
                <option value="">Assign a saved outfit</option>
                {outfits.map((o) => (
                  <option key={o.outfit_id} value={o.outfit_id}>
                    {o.name}
                  </option>
                ))}
              </select>

              {/* CREATE NEW OUTFIT */}
              <button
                onClick={createOutfit}
                className={`w-full py-3 rounded-xl font-semibold ${
                  theme === "dark"
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                }`}
              >
                Create a new outfit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
