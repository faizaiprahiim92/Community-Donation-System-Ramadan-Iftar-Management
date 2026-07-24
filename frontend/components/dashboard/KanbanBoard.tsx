import KanbanTaskCard from "./KanbanTaskCard";
import type { Task } from "@/lib/mock-data";

const columns: { key: Task["status"]; label: string; color: string; bg: string }[] = [
  { key: "Pending", label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  { key: "In Progress", label: "In Progress", color: "text-blue-700", bg: "bg-blue-50" },
  { key: "Completed", label: "Completed", color: "text-green-700", bg: "bg-green-50" },
];

export default function KanbanBoard({ data }: { data: Task[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const tasks = data.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="rounded-2xl border border-green-50/80 bg-gray-50/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${col.bg} ${col.color}`}>
                  {tasks.length}
                </span>
                <h3 className={`text-sm font-bold ${col.color}`}>{col.label}</h3>
              </div>
              <div className={`h-2 w-2 rounded-full ${col.bg}`} />
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
                  <p className="text-xs text-gray-400">No tasks</p>
                </div>
              ) : (
                tasks.map((t) => <KanbanTaskCard key={t.id} task={t} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
