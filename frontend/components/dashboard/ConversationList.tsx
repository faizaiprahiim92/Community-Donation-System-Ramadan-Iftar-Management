import type { Message } from "@/lib/mock-data";

const filterTabs = ["All", "Announcements", "Managers", "Leaders", "Volunteers", "Pinned", "Unread"];

export default function ConversationList({
  messages,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedId,
  onSelect,
}: {
  messages: Message[];
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: string;
  onFilterChange: (v: string) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-green-50/80 bg-white shadow-sm">
      <div className="border-b border-green-50 p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onFilterChange(tab)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                activeFilter === tab
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No conversations found</p>
          </div>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => onSelect(msg.id)}
              className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                selectedId === msg.id
                  ? "bg-green-50/70"
                  : "hover:bg-gray-50/70"
              }`}
            >
              <div className={`relative shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${msg.senderColor} flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{msg.senderInitials}</span>
                {!msg.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${!msg.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                    {msg.senderName}
                  </p>
                  <span className="shrink-0 text-[10px] text-gray-400">{msg.time}</span>
                </div>
                <p className={`mt-0.5 text-xs truncate ${!msg.isRead ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                  {msg.subject}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400 truncate">{msg.content}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  {msg.isPinned && (
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                    </svg>
                  )}
                  {msg.isAnnouncement && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">ANNOUNCEMENT</span>
                  )}
                  {msg.priority === "Urgent" && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">URGENT</span>
                  )}
                  {msg.priority === "High" && (
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">HIGH</span>
                  )}
                  {msg.attachments.length > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.939A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                      </svg>
                      {msg.attachments.length}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
