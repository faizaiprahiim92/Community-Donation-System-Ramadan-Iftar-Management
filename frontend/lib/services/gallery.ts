import api from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BackendGallery {
  id: number;
  type: string;
  title: string;
  description: string;
  campaign_day: number;
  location: string;
  date: string;
  uploaded_by_id: number;
  uploaded_by_name: string;
  tags: string;
  color: string;
  file_name: string | null;
  file_path: string | null;
  file_size: string;
  duration: string | null;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  type: "Photo" | "Video";
  title: string;
  description: string;
  campaignDay: 1 | 2 | 3 | 4 | 5;
  location: string;
  date: string;
  uploadedBy: string;
  tags: string[];
  color: string;
  size: string;
  duration?: string;
  videoUrl?: string;
  fileName?: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFrontend(g: BackendGallery, nameMap: Record<number, string> = {}): GalleryItem {
  let parsedTags: string[] = [];
  try {
    parsedTags = JSON.parse(g.tags);
  } catch { /* ignore */ }
  const videoUrl = g.file_path
    ? g.file_path.startsWith("http")
      ? g.file_path
      : `${API_BASE_URL}${g.file_path}`
    : undefined;
  return {
    id: g.id,
    type: g.type as "Photo" | "Video",
    title: g.title,
    description: g.description,
    campaignDay: g.campaign_day as GalleryItem["campaignDay"],
    location: g.location,
    date: fmtDate(g.date),
    uploadedBy: g.uploaded_by_name || nameMap[g.uploaded_by_id] || `User #${g.uploaded_by_id}`,
    tags: parsedTags,
    color: g.color,
    size: g.file_size,
    duration: g.duration ?? undefined,
    videoUrl,
    fileName: g.file_name ?? undefined,
  };
}

function toBackend(g: Partial<GalleryItem>, nameToId: Record<string, number>) {
  return {
    type: g.type,
    title: g.title,
    description: g.description,
    campaign_day: g.campaignDay,
    location: g.location,
    date: g.date ? new Date(g.date).toISOString() : new Date().toISOString(),
    tags: JSON.stringify(g.tags || []),
    color: g.color || "from-green-100 to-green-200",
    file_name: g.fileName || null,
    file_path: g.videoUrl || null,
    file_size: g.size || "1 MB",
    duration: g.duration ?? null,
  };
}

export const galleryService = {
  async stats(): Promise<{ total: number; photos: number; videos: number }> {
    const res = await api.get("/api/gallery/stats/summary");
    return { total: res.data.total, photos: res.data.photos, videos: res.data.videos };
  },
  async list(nameMap: Record<number, string> = {}): Promise<GalleryItem[]> {
    const res = await api.get<BackendGallery[]>("/api/gallery");
    return res.data.map((g) => toFrontend(g, nameMap));
  },
  async uploadFile(
    file: File,
    meta: {
      type: string;
      title: string;
      description: string;
      campaignDay: number;
      location: string;
      date: string;
      tags: string[];
      color: string;
      duration?: string;
    },
    onProgress?: (pct: number) => void,
  ): Promise<GalleryItem> {
    const form = new FormData();
    form.append("file", file);
    form.append("type", meta.type);
    form.append("title", meta.title);
    form.append("description", meta.description);
    form.append("campaign_day", String(meta.campaignDay));
    form.append("location", meta.location);
    form.append("date", meta.date ? new Date(meta.date).toISOString() : new Date().toISOString());
    form.append("tags", JSON.stringify(meta.tags));
    form.append("color", meta.color);
    if (meta.duration) form.append("duration", meta.duration);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    const data: BackendGallery = await res.json();
    return toFrontend(data, {});
  },
  async create(g: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await api.post<BackendGallery>("/api/gallery", toBackend(g, {}));
    return toFrontend(res.data, {});
  },
  async update(id: number, g: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await api.put<BackendGallery>(`/api/gallery/${id}`, toBackend(g, {}));
    return toFrontend(res.data, {});
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/gallery/${id}`);
  },
};
