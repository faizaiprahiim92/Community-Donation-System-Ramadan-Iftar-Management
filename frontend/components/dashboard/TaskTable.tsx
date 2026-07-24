import PriorityBadge from "./PriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import type { Task } from "@/lib/mock-data";

const roleColor: Record<string, string> = {
  Manager: "bg-green-100 text-green-700",
  Leader: "bg-amber-100 text-amber-700",
  Volunteer: "bg-blue-100 text-blue-700",
};

export default function TaskTable({
  data,
  onView,
  onEdit,
  onDelete,
  currentUserId,
  onMarkComplete,
}: {
  data: Task[];
  onView: (t: Task) => void;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
  currentUserId?: number;
  onMarkComplete?: (t: Task) => void;
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-50/80 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Task Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Assigned To</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Priority</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Start Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Due Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Progress</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                  No tasks found matching your criteria.
                </td>
              </tr>
            ) : (
              data.map((t) => {
                const isMyTask = currentUserId !== undefined && t.assignedToId === currentUserId;
                return (
                <tr key={t.id} className={`transition-colors hover:bg-green-50/30 ${isMyTask ? "bg-green-50/50" : ""}`}>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-800 max-w-[200px]">
                    <div className="truncate">{t.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-[10px] font-bold text-white">
                        {t.assignedTo.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-sm text-gray-600">{t.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColor[t.role] || "bg-gray-100 text-gray-600"}`}>
                      {t.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <TaskStatusBadge status={t.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{t.startDate}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{t.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <div className="w-20">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{t.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${t.progress === 100 ? "bg-green-500" : t.progress > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => onView(t)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer" title="View">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                      {isMyTask && onMarkComplete && t.status !== "Completed" && (
                      <button type="button" onClick={() => onMarkComplete(t)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 cursor-pointer" title="Mark Complete">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </button>
                      )}
                      {onEdit && (
                      <button type="button" onClick={() => onEdit(t)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gold-50 hover:text-gold-600 cursor-pointer" title="Edit">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      )}
                      {onDelete && (
                      <button type="button" onClick={() => onDelete(t)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer" title="Delete">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-green-50 px-6 py-3 text-xs text-gray-400">
        Showing {data.length} task{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
