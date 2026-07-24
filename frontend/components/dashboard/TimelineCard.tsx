import type { DailyReport } from "@/lib/mock-data";

const campaignDays = [
  { day: 1, date: "Jul 19" },
  { day: 2, date: "Jul 20" },
  { day: 3, date: "Jul 21" },
  { day: 4, date: "Jul 22" },
  { day: 5, date: "Jul 23" },
];

export default function TimelineCard({ data }: { data: DailyReport[] }) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">Campaign Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-4">
          {campaignDays.map((day, i) => {
            const report = data.find((r) => r.date.includes(`Jul ${day.day + 18}`));
            const isCompleted = report?.status === "Completed";
            const isPending = !report || report.status === "Pending";
            const isLast = i === campaignDays.length - 1;

            return (
              <div key={day.day} className="relative flex items-start gap-4 pl-1">
                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isPending
                        ? "bg-gray-200 text-gray-500"
                        : "bg-amber-400 text-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    day.day
                  )}
                </div>
                <div className={`flex-1 pb-2 ${!isLast ? "" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${isCompleted ? "text-green-700" : isPending ? "text-gray-400" : "text-amber-700"}`}>
                      Day {day.day}
                    </p>
                    <span className={`text-xs font-medium ${isCompleted ? "text-green-600" : isPending ? "text-gray-400" : "text-amber-600"}`}>
                      {isCompleted ? "Completed" : isPending ? "Pending" : "In Progress"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {day.date}, 2026
                    {report && ` \u00B7 ${report.location}`}
                  </p>
                  {report && isCompleted && (
                    <p className="mt-1 text-xs text-gray-500">
                      {report.peopleServed} people served
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
