import type { Expense } from "@/lib/mock-data";

const categoryColors: Record<string, string> = {
  Food: "bg-green-500",
  Transport: "bg-blue-500",
  Packaging: "bg-purple-500",
  Water: "bg-cyan-500",
  Cooking: "bg-amber-500",
  Other: "bg-gray-400",
};

export default function ExpenseSummary({ data }: { data: Expense[] }) {
  const approved = data.filter((e) => e.status !== "Rejected");
  const total = approved.reduce((s, e) => s + e.totalCost, 0);

  const breakdown = ["Food", "Transport", "Packaging", "Water", "Cooking", "Other"]
    .map((cat) => {
      const catTotal = approved
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.totalCost, 0);
      return { category: cat, amount: catTotal, pct: total > 0 ? (catTotal / total) * 100 : 0 };
    })
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const recent = [...data].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Expense Breakdown</h3>
        <div className="space-y-3">
          {breakdown.map((b) => (
            <div key={b.category}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${categoryColors[b.category]}`} />
                  <span className="text-sm text-gray-600">{b.category}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  ${b.amount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${categoryColors[b.category]}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <p className="mt-0.5 text-right text-xs text-gray-400">
                {b.pct.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">Top Recent Expenses</h3>
        <div className="space-y-3">
          {recent.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {e.name}
                </p>
                <p className="text-xs text-gray-400">
                  {e.receipt} &middot; {e.date}
                </p>
              </div>
              <span className="ml-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                ${e.totalCost.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
