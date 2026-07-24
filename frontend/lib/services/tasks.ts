import api from "./api";

interface BackendTask {
  id: number;
  name: string;
  description: string;
  assigned_to_id: number;
  assigned_to_name: string;
  assigned_to_role: string;
  priority: string;
  start_date: string;
  due_date: string;
  status: string;
  notes: string | null;
  progress: number;
  created_by: number;
  created_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  assignedTo: string;
  assignedToId: number;
  role: "Manager" | "Leader" | "Volunteer";
  priority: "Low" | "Medium" | "High";
  startDate: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
  notes?: string;
  progress: number;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toFrontend(t: BackendTask, nameMap: Record<number, string> = {}, roleMap: Record<number, string> = {}): Task {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    assignedTo: t.assigned_to_name || nameMap[t.assigned_to_id] || `User #${t.assigned_to_id}`,
    assignedToId: t.assigned_to_id,
    role: (t.assigned_to_role || roleMap[t.assigned_to_id] || "Volunteer") as Task["role"],
    priority: t.priority as Task["priority"],
    startDate: fmtDate(t.start_date),
    dueDate: fmtDate(t.due_date),
    status: t.status as Task["status"],
    notes: t.notes ?? undefined,
    progress: t.progress,
  };
}

function toBackend(t: Partial<Task>, nameToId: Record<string, number>) {
  return {
    name: t.name,
    description: t.description ?? "",
    assigned_to_id: t.assignedTo ? nameToId[t.assignedTo] || 1 : 1,
    priority: t.priority ?? "Medium",
    start_date: t.startDate ? new Date(t.startDate).toISOString() : new Date().toISOString(),
    due_date: t.dueDate ? new Date(t.dueDate).toISOString() : new Date().toISOString(),
    status: t.status ?? "Pending",
    notes: t.notes ?? null,
    progress: t.progress ?? 0,
  };
}

export const tasksService = {
  async list(nameMap: Record<number, string> = {}, roleMap: Record<number, string> = {}): Promise<Task[]> {
    const res = await api.get<BackendTask[]>("/api/tasks");
    return res.data.map((t) => toFrontend(t, nameMap, roleMap));
  },
  async create(t: Partial<Task>, nameToId: Record<string, number> = {}): Promise<Task> {
    const res = await api.post<BackendTask>("/api/tasks", toBackend(t, nameToId));
    return toFrontend(res.data, {}, {});
  },
  async update(id: number, t: Partial<Task>, nameToId: Record<string, number> = {}): Promise<Task> {
    const res = await api.put<BackendTask>(`/api/tasks/${id}`, toBackend(t, nameToId));
    return toFrontend(res.data, {}, {});
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/tasks/${id}`);
  },
};
