import api from "./api";

interface BackendUser {
  id: number;
  full_name: string;
  username: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  phone: string;
  role: "Manager" | "Leader" | "Volunteer";
  status: "Active" | "Inactive";
  createdAt: string;
  initials: string;
  color: string;
}

const COLORS = [
  "from-green-500 to-green-600",
  "from-gold-400 to-gold-500",
  "from-blue-400 to-blue-500",
];

function toFrontend(u: BackendUser, idx: number): User {
  const parts = u.full_name.split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : u.full_name.slice(0, 2).toUpperCase();
  return {
    id: u.id,
    fullName: u.full_name,
    username: u.username,
    phone: u.phone,
    role: u.role as User["role"],
    status: u.is_active ? "Active" : "Inactive",
    createdAt: new Date(u.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    initials,
    color: COLORS[idx % COLORS.length],
  };
}

export const usersService = {
  async stats(): Promise<{ total: number; managers: number; leaders: number; volunteers: number; active: number }> {
    const res = await api.get("/api/users/stats/summary");
    return { total: res.data.total, managers: res.data.managers, leaders: res.data.leaders, volunteers: res.data.volunteers, active: res.data.active };
  },
  async list(): Promise<User[]> {
    const res = await api.get<BackendUser[]>("/api/users");
    return res.data.map((u, i) => toFrontend(u, i));
  },
  async names(): Promise<{ id: number; fullName: string }[]> {
    const res = await api.get<{ id: number; full_name: string }[]>("/api/users/names");
    return res.data.map((u) => ({ id: u.id, fullName: u.full_name }));
  },
};
