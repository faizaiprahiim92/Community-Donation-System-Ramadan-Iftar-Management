type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
};

const typeStyles: Record<string, { bg: string; text: string; icon: string }> = {
  event: { bg: "bg-green-50", text: "text-green-600", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" },
  milestone: { bg: "bg-gold-50", text: "text-gold-600", icon: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.665 6.023 6.023 0 0 1-2.77-.665" },
  info: { bg: "bg-blue-50", text: "text-blue-600", icon: "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" },
};

export default function AnnouncementCard({
  announcements,
}: {
  announcements: Announcement[];
}) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Announcements</h3>
        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
          {announcements.length} New
        </span>
      </div>
      <div className="space-y-3">
        {announcements.map((item) => {
          const style = typeStyles[item.type] || typeStyles.info;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl bg-gray-50/70 p-3 transition-colors hover:bg-gray-50"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                <svg className={`h-4 w-4 ${style.text}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                <p className="mt-1 text-[10px] text-gray-400">{item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
