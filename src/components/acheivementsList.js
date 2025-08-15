// src/components/acheivementsList.js
import { Search } from "@mui/icons-material";
import { useEffect, useState } from "react";

export default function AchievementsList() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(query = q) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: "1", pageSize: "200" });
      const trimmed = (query || "").trim();
      if (trimmed) params.set("q", trimmed); // server searches by title (name)

      const res = await fetch(`/api/achievements?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      console.error("Load achievements failed:", e);
      setError("Failed to load achievements.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchKey = (e) => {
    if (e.key === "Enter") load(q);
  };

  return (
    <div className="mx-auto w-[48rem] max-w-3xl px-4">
      {/* Card Shell */}
      <div className="rounded-2xl border bg-white shadow-sm">
        {/* Top bar controls */}
        <div className="flex flex-col flex-wrap items-center gap-3 px-4 md:px-6 pt-5 pb-4">
          <div className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search achievements by name"
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="h-[calc(350px)] overflow-y-auto px-2 md:px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              Loading achievements…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-600">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              No achievements found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 px-16">
              {items.map((a) => (
                <li key={a._id || a.id} className="px-2 md:px-2">
                  <div className="flex items-start gap-6 py-4">
                    {/* Logo */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-dashGreen border-topOrange">
                      {a.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          src={a.logo}
                          onError={(e) => {
                            // graceful fallback if hotlink breaks
                            e.currentTarget.src = "/placeholder-icon.png";
                          }}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg truncate font-semibold text-customBlack">
                        {a.title || ""}
                      </h3>
                      <p className="mt-1 text-gray-700 whitespace-pre-line">
                        {a.description || ""}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 md:px-6 py-3">
          <span className="text-sm text-gray-600">
            Showing {items.length} 
            {typeof total === "number" && total >= items.length ? ` of ${total}` : ""}
            {items.length === 1 ? " Acheivement" : " Acheivements"}
          </span>
        </div>
      </div>
    </div>
  );
}