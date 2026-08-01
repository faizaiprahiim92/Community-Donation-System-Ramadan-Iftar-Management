import type { Task } from "@/lib/mock-data";

const projectMilestones = [
  { phase: "Planning Phase", date: "10 February 2026" },
  { phase: "Requirements & Schedule", date: "17 February 2026" },
  { phase: "Database Design & UI Discussion", date: "24 February 2026" },
  { phase: "Development & Documentation", date: "5 March 2026" },
  { phase: "Final Preparation", date: "10 March 2026" },
  { phase: "Ramadan Iftar Campaign", date: "15 - 19 March 2026" },
  { phase: "System Integration & Testing", date: "18 July 2026" },
  { phase: "Final Review & Documentation", date: "24 July 2026" },
];

export default function TaskSummary({ data }: { data: Task[] }) {
  const todayTasks = data.slice(0, 5);
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
        <h3 className="mb-4 text-sm font-bold text-gray-900">Completed Project Milestones</h3>
        <div className="space-y-2">
          {projectMilestones.map((m) => (
            <div key={m.phase} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{m.phase}</p>
                  <p className="text-xs text-gray-400">{m.date}</p>
                </div>
              </div>
              <span className="ml-2 shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Completed
              </span>
            </div>
          ))}
        </div>
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
