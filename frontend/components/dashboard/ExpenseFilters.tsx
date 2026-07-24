const categories = [
  "All Categories",
  "Food",
  "Transport",
  "Packaging",
  "Water",
  "Cooking",
  "Other",
];
const statuses = ["All Status", "Approved", "Pending", "Rejected"];

export default function ExpenseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateFilter,
  onDateChange,
  status,
  onStatusChange,
  onAdd,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  dateFilter: string;
  onDateChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onAdd?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
        />

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Expense
        </button>
        )}
      </div>
    </div>
  );
}
