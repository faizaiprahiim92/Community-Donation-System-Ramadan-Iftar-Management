import api from "./api";

interface BackendMessage {
  id: number;
  sender_id: number;
  recipient_ids: string;
  subject: string;
  content: string;
  priority: string;
  status: string;
  is_read: boolean;
  is_pinned: boolean;
  is_announcement: boolean;
  attachments: string;
  created_at: string;
}

interface BackendThread {
  id: number;
  message_id: number;
  sender_id: number;
  content: string;
  is_system: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  recipientIds: number[];
  recipientNames: string[];
  recipientRole: string;
  subject: string;
  content: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Sent" | "Delivered" | "Read";
  isRead: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  date: string;
  time: string;
  attachments: { name: string; type: "image" | "video" | "document"; size: string }[];
  thread: {
    id: number;
    senderId: number;
    senderName: string;
    senderInitials: string;
    senderColor: string;
    content: string;
    date: string;
    time: string;
    isSystem?: boolean;
  }[];
}

const senderColors = [
  "from-green-500 to-green-600",
  "from-gold-400 to-gold-500",
  "from-blue-400 to-blue-500",
  "from-purple-400 to-purple-500",
  "from-rose-400 to-rose-500",
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string) {
  const parts = name.split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export async function fetchMessages(
  nameMap: Record<number, string>
): Promise<Message[]> {
  const msgRes = await api.get<BackendMessage[]>("/api/messages");
  const messages: Message[] = [];

  for (const m of msgRes.data) {
    const threadRes = await api.get<BackendThread[]>(
      `/api/messages/${m.id}/thread`
    );
    const senderName = nameMap[m.sender_id] || `User #${m.sender_id}`;
    let parsedAttachments: { name: string; type: "image" | "video" | "document"; size: string }[] = [];
    try { parsedAttachments = JSON.parse(m.attachments); } catch { /* */ }

    const thread = threadRes.data.map((t) => ({
      id: t.id,
      senderId: t.sender_id,
      senderName: nameMap[t.sender_id] || `User #${t.sender_id}`,
      senderInitials: getInitials(nameMap[t.sender_id] || "U"),
      senderColor: senderColors[t.sender_id % senderColors.length],
      content: t.content,
      date: fmtDate(t.created_at),
      time: fmtTime(t.created_at),
      isSystem: t.is_system,
    }));

    let parsedRecipientIds: number[] = [];
    try { parsedRecipientIds = JSON.parse(m.recipient_ids); } catch { /* */ }

    messages.push({
      id: m.id,
      senderId: m.sender_id,
      senderName,
      senderInitials: getInitials(senderName),
      senderColor: senderColors[m.sender_id % senderColors.length],
      recipientIds: parsedRecipientIds,
      recipientNames: parsedRecipientIds.map((id) => nameMap[id] || `User #${id}`),
      recipientRole: "All",
      subject: m.subject,
      content: m.content,
      priority: m.priority as Message["priority"],
      status: m.status as Message["status"],
      isRead: m.is_read,
      isPinned: m.is_pinned,
      isAnnouncement: m.is_announcement,
      date: fmtDate(m.created_at),
      time: fmtTime(m.created_at),
      attachments: parsedAttachments,
      thread,
    });
  }
  return messages;
}

export async function createMessage(
  data: Partial<Message>
): Promise<void> {
  await api.post("/api/messages", {
    recipient_ids: JSON.stringify(data.recipientIds || []),
    subject: data.subject,
    content: data.content,
    priority: data.priority || "Medium",
    is_announcement: data.isAnnouncement || false,
    attachments: JSON.stringify(data.attachments || []),
  });
}

export async function updateMessage(
  id: number,
  data: Partial<Message>
): Promise<void> {
  await api.put(`/api/messages/${id}`, {
    is_read: data.isRead,
    is_pinned: data.isPinned,
    status: data.status,
  });
}

export async function addThreadReply(
  messageId: number,
  content: string
): Promise<void> {
  await api.post(`/api/messages/${messageId}/thread`, { content });
}

export async function deleteMessage(id: number): Promise<void> {
  await api.delete(`/api/messages/${id}`);
}
