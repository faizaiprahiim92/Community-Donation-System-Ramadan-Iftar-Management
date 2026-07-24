import api from "./api";

interface BackendReport {
  id: number;
  date: string;
  location: string;
  people_served: number;
  meals_prepared: number;
  meals_remaining: number;
  food_menu: string;
  team_leader_id: number;
  team_leader_name: string;
  volunteers_count: number;
  weather: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  video_count: number;
  created_by: number;
  created_at: string;
}

export interface DailyReport {
  id: number;
  date: string;
  location: string;
  peopleServed: number;
  mealsPrepared: number;
  mealsRemaining: number;
  foodMenu: string;
  teamLeader: string;
  volunteersCount: number;
  weather: string;
  startTime: string;
  endTime: string;
  notes?: string;
  photos: string[];
  videos: string[];
  status: "Completed" | "Pending" | "In Progress";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFrontend(r: BackendReport, nameMap: Record<number, string> = {}): DailyReport {
  return {
    id: r.id,
    date: fmtDate(r.date),
    location: r.location,
    peopleServed: r.people_served,
    mealsPrepared: r.meals_prepared,
    mealsRemaining: r.meals_remaining,
    foodMenu: r.food_menu,
    teamLeader: r.team_leader_name || nameMap[r.team_leader_id] || `User #${r.team_leader_id}`,
    volunteersCount: r.volunteers_count,
    weather: r.weather,
    startTime: r.start_time,
    endTime: r.end_time,
    notes: r.notes ?? undefined,
    photos: [],
    videos: Array.from({ length: r.video_count ?? 0 }, (_, i) => `video-${i + 1}`),
    status: r.status as DailyReport["status"],
  };
}

function toBackend(r: Partial<DailyReport>, nameToId: Record<string, number>) {
  return {
    date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
    location: r.location,
    people_served: r.peopleServed ?? 0,
    meals_prepared: r.mealsPrepared ?? 0,
    meals_remaining: r.mealsRemaining ?? 0,
    food_menu: r.foodMenu ?? "",
    team_leader_id: r.teamLeader ? nameToId[r.teamLeader] || 1 : 1,
    volunteers_count: r.volunteersCount ?? 0,
    weather: r.weather ?? "",
    start_time: r.startTime ?? "",
    end_time: r.endTime ?? "",
    notes: r.notes ?? null,
    status: r.status ?? "Pending",
  };
}

export const reportsService = {
  async stats(): Promise<{ total: number; totalPeopleServed: number; totalMealsPrepared: number; completed: number; campaignDays: number }> {
    const res = await api.get("/api/reports/stats/summary");
    return { total: res.data.total, totalPeopleServed: res.data.total_people_served, totalMealsPrepared: res.data.total_meals_prepared, completed: res.data.completed, campaignDays: res.data.campaign_days };
  },
  async list(nameMap: Record<number, string> = {}): Promise<DailyReport[]> {
    const res = await api.get<BackendReport[]>("/api/reports");
    return res.data.map((r) => toFrontend(r, nameMap));
  },
  async create(r: Partial<DailyReport>, nameToId: Record<string, number> = {}): Promise<DailyReport> {
    const res = await api.post<BackendReport>("/api/reports", toBackend(r, nameToId));
    return toFrontend(res.data, {});
  },
  async update(id: number, r: Partial<DailyReport>, nameToId: Record<string, number> = {}): Promise<DailyReport> {
    const res = await api.put<BackendReport>(`/api/reports/${id}`, toBackend(r, nameToId));
    return toFrontend(res.data, {});
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/reports/${id}`);
  },
};
