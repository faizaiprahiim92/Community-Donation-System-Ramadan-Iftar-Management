const typeFilters = ["All", "Photos", "Videos"];
const dayFilters = ["All Days", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
const locationFilters = [
  "All Locations",
  "Block A - Main Hall",
  "Block B - Community Center",
  "Block C - Open Area",
  "Block D - School Yard",
  "Block E - Park",
];

export default function GalleryFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  day,
  onDayChange,
  location,
  onLocationChange,
  onUpload,
  onCreateAlbum,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  day: string;
  onDayChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  onUpload?: () => void;
  onCreateAlbum: () => void;
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                type === t
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
        >
          {dayFilters.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
        >
          {locationFilters.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Upload
          </button>
          )}
          <button
            type="button"
            onClick={onCreateAlbum}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            Albums
          </button>
        </div>
      </div>
    </div>
  );
}
