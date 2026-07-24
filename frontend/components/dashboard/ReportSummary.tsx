import type { DailyReport } from "@/lib/mock-data";

export default function ReportSummary({ data }: { data: DailyReport[] }) {
  const completed = data.filter((r) => r.status === "Completed");
  const totalMeals = completed.reduce((s, r) => s + r.mealsPrepared, 0);
  const totalPeople = completed.reduce((s, r) => s + r.peopleServed, 0);
  const latest = [...data].sort((a, b) => b.id - a.id)[0];
  const progressPct = data.length > 0 ? Math.round((completed.length / data.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Today&apos;s Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-green-50/50 px-4 py-3">
            <span className="text-sm text-gray-600">People Served</span>
            <span className="text-lg font-bold text-green-700">{totalPeople.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-blue-50/50 px-4 py-3">
            <span className="text-sm text-gray-600">Meals Prepared</span>
            <span className="text-lg font-bold text-blue-700">{totalMeals.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-amber-50/50 px-4 py-3">
            <span className="text-sm text-gray-600">Reports Completed</span>
            <span className="text-lg font-bold text-amber-700">{completed.length}/{data.length}</span>
          </div>
        </div>
      </div>

      {latest && (
        <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Latest Report</h3>
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">{latest.location}</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                latest.status === "Completed" ? "bg-green-50 text-green-700" : latest.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
              }`}>
                {latest.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{latest.date} &middot; {latest.startTime} - {latest.endTime}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">People</p>
                <p className="text-sm font-bold text-gray-800">{latest.peopleServed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Meals</p>
                <p className="text-sm font-bold text-gray-800">{latest.mealsPrepared.toLocaleString()}</p>
              </div>
            </div>
            {latest.foodMenu && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Menu</p>
                <p className="text-xs text-gray-700">{latest.foodMenu}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Campaign Progress</h3>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-green-700">{progressPct}%</p>
            <p className="text-xs text-gray-400">{completed.length} of {data.length} days completed</p>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-4 space-y-2">
          {data.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{r.date}</span>
              <span className={r.status === "Completed" ? "text-green-600 font-medium" : r.status === "Pending" ? "text-gray-400" : "text-amber-600 font-medium"}>
                {r.status === "Completed" ? `${r.peopleServed} served` : r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
