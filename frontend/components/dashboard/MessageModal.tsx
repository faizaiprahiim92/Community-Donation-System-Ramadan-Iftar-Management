"use client";

import { useState } from "react";
import RecipientSelector from "./RecipientSelector";
import { users } from "@/lib/mock-data";
import type { Message } from "@/lib/mock-data";

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100";

export function NewMessageModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (msg: Omit<Message, "id" | "thread">) => void;
}) {
  const [recipients, setRecipients] = useState<number[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recipients.length === 0) return;

    const recipientNames = recipients
      .map((id) => {
        const u = users.find((u) => u.id === id);
        return u?.fullName || "";
      })
      .filter(Boolean);

    onSend({
      senderId: 1,
      senderName: "Ahmed Hassan",
      senderInitials: "AH",
      senderColor: "from-green-500 to-green-600",
      recipientIds: recipients,
      recipientNames,
      recipientRole: "All",
      subject,
      content,
      priority,
      status: "Sent",
      isRead: true,
      isPinned: false,
      isAnnouncement,
      date: "Jul 23, 2026",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      attachments: [],
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">New Message</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Recipients *</label>
                <RecipientSelector selected={recipients} onChange={setRecipients} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncement}
                    onChange={(e) => setIsAnnouncement(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Announcement</span>
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority *</label>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                      priority === p
                        ? p === "Urgent" ? "bg-red-500 text-white shadow-lg shadow-red-200"
                        : p === "High" ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                        : p === "Medium" ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-500 text-white shadow-lg shadow-gray-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
                <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
                <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Type your message..." className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Attachment</label>
                <div className="rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center transition-colors hover:border-green-400 cursor-pointer">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.939A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Click to attach file</p>
                  <p className="mt-1 text-xs text-gray-400">PDF, images, videos up to 50MB</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={recipients.length === 0} className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
