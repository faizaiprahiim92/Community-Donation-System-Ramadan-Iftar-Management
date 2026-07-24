import type { Task } from "@/lib/mock-data";

export default function TaskSummary({ data }: { data: Task[] }) {
  const today = "Jul 23, 2026";
  const todayTasks = data.filter(
    (t) => t.dueDate.includes("Jul 23") || t.startDate.includes("Jul 23")
  );
  const upcoming = [...data]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const recentUpdates = [...data]
    .filter((t) => t.status === "Completed" || t.status === "In Progress")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Today&apos;s Tasks</h3>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-gray-400">No tasks for today</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.assignedTo}</p>
                </div>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  t.status === "Completed" ? "bg-green-50 text-green-700" : t.status === "In Progress" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Upcoming Deadlines</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">All tasks completed</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">Due: {t.dueDate}</p>
                </div>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  t.priority === "High" ? "bg-red-50 text-red-700" : t.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Recent Updates</h3>
        <div className="space-y-2">
          {recentUpdates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.assignedTo}</p>
              </div>
              <div className="ml-2 shrink-0">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${t.progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{t.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
