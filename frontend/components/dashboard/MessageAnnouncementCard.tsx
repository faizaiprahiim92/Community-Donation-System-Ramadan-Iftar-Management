import type { Message } from "@/lib/services/messages";

const priorityStyles: Record<string, { border: string; bg: string; badge: string; icon: string }> = {
  Low: { border: "border-l-gray-300", bg: "bg-gray-50", badge: "bg-gray-100 text-gray-600", icon: "text-gray-400" },
  Medium: { border: "border-l-blue-400", bg: "bg-blue-50/50", badge: "bg-blue-100 text-blue-700", icon: "text-blue-500" },
  High: { border: "border-l-amber-400", bg: "bg-amber-50/50", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
  Urgent: { border: "border-l-red-500", bg: "bg-red-50/50", badge: "bg-red-100 text-red-700", icon: "text-red-500" },
};

export default function MessageAnnouncementCard({
  message,
  onClick,
}: {
  message: Message;
  onClick: () => void;
}) {
  const style = priorityStyles[message.priority] || priorityStyles.Low;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-l-4 border border-green-50/80 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md hover:shadow-green-100/30 hover:-translate-y-0.5 cursor-pointer ${style.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
          <svg className={`h-5 w-5 ${style.icon}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1-8.635 2.02c.502 2.097.553 4.088.152 5.724a.5.5 0 0 0 .479.594c3.16.522 6.46.317 8.955-.607.47-.12.813-.529.813-1.007v-2.02c0-.477-.342-.886-.813-1.007a23.997 23.997 0 0 0-8.135-1.124m0-5.18a23.97 23.97 0 0 1 8.135 1.124c.47.121.813.53.813 1.007v2.02c0 .478-.343.887-.813 1.007a23.997 23.997 0 0 1-8.955-.607.5.5 0 0 1-.479-.594c-.4-1.636-.35-3.627.152-5.724a.5.5 0 0 1 .479-.594m3.45 4.937c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125 1.125v3.75c0 .621.504 1.125 1.125 1.125s1.125-.504 1.125-1.125v-3.75Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
              {message.priority}
            </span>
            <span className="text-[10px] text-gray-400">{message.date}</span>
          </div>
          <p className="mt-1.5 text-sm font-bold text-gray-900 line-clamp-1">{message.subject}</p>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{message.content}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${message.senderColor} flex items-center justify-center`}>
              <span className="text-[8px] font-bold text-white">{message.senderInitials}</span>
            </div>
            <span className="text-[11px] text-gray-500">{message.senderName}</span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-[10px] text-gray-400">{message.recipientNames.length} recipients</span>
          </div>
        </div>
      </div>
    </button>
  );
}
