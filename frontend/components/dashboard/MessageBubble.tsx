import type { Message } from "@/lib/mock-data";

export function MessageBubble({
  msg,
  thread,
}: {
  msg: Message["thread"][0];
  thread: Message["thread"];
}) {
  const isOwn = msg.senderId === 1;
  const isSystem = msg.isSystem;

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`shrink-0 h-8 w-8 rounded-full bg-gradient-to-br ${msg.senderColor} flex items-center justify-center`}>
        <span className="text-[10px] font-bold text-white">{msg.senderInitials}</span>
      </div>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-xs font-semibold text-gray-700">{msg.senderName}</span>
          <span className="text-[10px] text-gray-400">{msg.time}</span>
        </div>
        <div className={`mt-1 rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-green-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}>
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      </div>
    </div>
  );
}

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-500">
        {date}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function MessageWindow({
  message,
}: {
  message: Message;
}) {
  const thread = message.thread;

  let lastDate = "";
  const elements: React.ReactNode[] = [];

  thread.forEach((msg) => {
    if (msg.date !== lastDate) {
      elements.push(<DateSeparator key={`date-${msg.date}`} date={msg.date} />);
      lastDate = msg.date;
    }
    elements.push(
      <MessageBubble key={msg.id} msg={msg} thread={thread} />
    );
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-green-50/80 bg-white shadow-sm">
      <div className="border-b border-green-50 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${message.senderColor} flex items-center justify-center`}>
              <span className="text-[10px] font-bold text-white">{message.senderInitials}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{message.senderName}</p>
              <p className="text-[11px] text-gray-400">{message.recipientNames.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {message.isPinned && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
                Pinned
              </span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              message.priority === "Urgent" ? "bg-red-50 text-red-700" :
              message.priority === "High" ? "bg-amber-50 text-amber-700" :
              message.priority === "Medium" ? "bg-blue-50 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {message.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {elements}
      </div>

      <div className="border-t border-green-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <button type="button" className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.939A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
          <button type="button" className="shrink-0 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
