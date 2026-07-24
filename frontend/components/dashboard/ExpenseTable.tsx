import Badge from "./Badge";
import type { Expense } from "@/lib/mock-data";

const categoryColor: Record<string, string> = {
  Food: "bg-green-50 text-green-700",
  Transport: "bg-blue-50 text-blue-700",
  Packaging: "bg-purple-50 text-purple-700",
  Water: "bg-cyan-50 text-cyan-700",
  Cooking: "bg-amber-50 text-amber-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function ExpenseTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Expense[];
  onView: (e: Expense) => void;
  onEdit?: (e: Expense) => void;
  onDelete?: (e: Expense) => void;
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-50/80 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                #
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Receipt
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Expense Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Category
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Quantity
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Unit Price
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Total Cost
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Paid By
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                Date
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
                  colSpan={11}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  No expenses found matching your criteria.
                </td>
              </tr>
            ) : (
              data.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors hover:bg-green-50/30"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    {e.id}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-mono font-medium text-gray-700">
                    {e.receipt}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-800">
                    {e.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor[e.category] || "bg-gray-100 text-gray-600"}`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    {e.quantity} {e.unit}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    ${e.unitPrice.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-gray-800">
                    ${e.totalCost.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    {e.paidBy}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">
                    {e.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={e.status} dot />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(e)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                        title="View"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>
                      {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(e)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gold-50 hover:text-gold-600 cursor-pointer"
                        title="Edit"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                      )}
                      {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(e)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
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
      <div className="border-t border-green-50 px-6 py-3 text-xs text-gray-400">
        Showing {data.length} expense{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
