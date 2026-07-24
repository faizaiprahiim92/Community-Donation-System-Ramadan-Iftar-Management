import PriorityBadge from "./PriorityBadge";
import type { Task } from "@/lib/mock-data";

const roleColor: Record<string, string> = {
  Manager: "bg-green-100 text-green-700",
  Leader: "bg-amber-100 text-amber-700",
  Volunteer: "bg-blue-100 text-blue-700",
};

export default function KanbanTaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:shadow-green-100/30 cursor-pointer">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800 leading-snug">
          {task.name}
        </h4>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="mb-3 text-xs text-gray-500 line-clamp-2">
        {task.description}
      </p>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-gray-600">{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${
              task.progress === 100
                ? "bg-green-500"
                : task.progress > 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-[10px] font-bold text-white">
            {task.assignedTo.split(" ").map((n) => n[0]).join("")}
          </div>
          <span className="text-xs text-gray-600">{task.assignedTo}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleColor[task.role] || "bg-gray-100 text-gray-600"}`}>
          {task.role}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>Due: {task.dueDate}</span>
      </div>
    </div>
  );
}
