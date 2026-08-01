const projectPhases = [
  { phase: "Planning Phase", date: "10 February 2026" },
  { phase: "Requirements & Schedule", date: "17 February 2026" },
  { phase: "Database Design & UI Discussion", date: "24 February 2026" },
  { phase: "Development & Documentation", date: "5 March 2026" },
  { phase: "Final Preparation", date: "10 March 2026" },
  { phase: "Ramadan Iftar Campaign", date: "15 - 19 March 2026" },
  { phase: "System Integration & Testing", date: "18 July 2026" },
  { phase: "Final Review & Documentation", date: "24 July 2026" },
];

export default function TimelineCard() {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">Project Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-4">
          {projectPhases.map((p, i) => {
            const isLast = i === projectPhases.length - 1;

            return (
              <div key={p.phase} className="relative flex items-start gap-4 pl-1">
                <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div className={`flex-1 pb-2 ${isLast ? "" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-green-700">{p.phase}</p>
                    <span className="text-xs font-medium text-green-600">Completed</span>
                  </div>
                  <p className="text-xs text-gray-400">{p.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
