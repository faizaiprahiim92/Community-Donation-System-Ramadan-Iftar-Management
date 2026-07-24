const priorityColor: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-blue-50 text-blue-700",
};

const statusColor: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-green-50 text-green-700",
};

const statusLabel: Record<string, string> = {
  in_progress: "In Progress",
  pending: "Pending",
  completed: "Completed",
};

export default function TaskCard({ tasks }: { tasks: { task: string; assignedTo: string; priority: string; status: string }[] }) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">Today&apos;s Tasks</h3>
      <div className="space-y-3">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{t.task}</p>
              <p className="text-xs text-gray-400">{t.assignedTo}</p>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColor[t.priority] || "bg-gray-100 text-gray-600"}`}>
                {t.priority}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[t.status] || "bg-gray-100 text-gray-600"}`}>
                {statusLabel[t.status] || t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
