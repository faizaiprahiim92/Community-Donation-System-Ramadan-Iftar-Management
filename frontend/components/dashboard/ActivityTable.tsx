interface Activity {
  date: string;
  activity: string;
  user: string;
  status: string;
}

interface ActivityTableProps {
  activities: Activity[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-0.5 text-xs font-semibold text-gold-700">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Pending
    </span>
  );
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-green-50 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-sm font-bold text-gray-900">Recent Activities</h3>
        <p className="text-xs text-gray-400">Latest actions across the system</p>
      </div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-50/80 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50/50">
            {activities.map((a, i) => (
              <tr key={i} className="transition-colors hover:bg-green-50/30">
                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-gray-500">{a.date}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-700">{a.activity}</td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{a.user}</td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-green-50/50">
        {activities.map((a, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 leading-snug">{a.activity}</p>
              <StatusBadge status={a.status} />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                {a.date}
              </span>
              <span>|</span>
              <span>{a.user}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
