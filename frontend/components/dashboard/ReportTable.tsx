import Badge from "./Badge";
import type { DailyReport } from "@/lib/mock-data";

export default function ReportTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: DailyReport[];
  onView: (r: DailyReport) => void;
  onEdit?: (r: DailyReport) => void;
  onDelete?: (r: DailyReport) => void;
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-50/80 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Location
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                People Served
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Meals Prepared
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Meals Remaining
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Videos
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50/50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-green-50/30"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-800">
                    {r.date}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">
                    {r.location}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-gray-800">
                    {r.peopleServed.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-green-700">
                    {r.mealsPrepared.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    {r.mealsRemaining}
                  </td>
                   <td className="whitespace-nowrap px-5 py-3.5">
                     <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                       <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                       </svg>
                       {r.videos.length || 1}
                     </span>
                   </td>
                   <td className="px-5 py-3.5">
                     <Badge status={r.status} dot />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(r)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                        title="View"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                      {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(r)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gold-50 hover:text-gold-600 cursor-pointer"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      )}
                      {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-green-50/50">
        {data.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No reports found matching your criteria.
          </div>
        ) : (
          data.map((r) => (
            <div key={r.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate">{r.date}</span>
                  <span className="text-xs text-gray-500 truncate">{r.location}</span>
                </div>
                <Badge status={r.status} dot />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{r.peopleServed.toLocaleString()} people</span>
                <span className="text-green-700">{r.mealsPrepared.toLocaleString()} meals prepared</span>
                <span>{r.mealsRemaining} remaining</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-xs text-gray-500">
                   <span className="inline-flex items-center gap-1">
                     <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                     </svg>
                      {r.videos.length || 1}
                    </span>
                  </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 cursor-pointer"
                  >
                    View
                  </button>
                  {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-50 cursor-pointer"
                  >
                    Edit
                  </button>
                  )}
                  {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                  >
                    Delete
                  </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-green-50 px-4 sm:px-6 py-3 text-xs text-gray-400">
        Showing {data.length} report{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
