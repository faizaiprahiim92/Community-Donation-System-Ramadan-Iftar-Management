"use client";

import { useState, useRef } from "react";
import type { GalleryItem } from "@/lib/mock-data";

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100";

const locations = [
  "Block A - Main Hall",
  "Block B - Community Center",
  "Block C - Open Area",
  "Block D - School Yard",
  "Block E - Park",
];

export function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"Photo" | "Video">("Video");
  const [campaignDay, setCampaignDay] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [location, setLocation] = useState(locations[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capturedDate, setCapturedDate] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const gradients = [
    "from-green-200 to-green-300",
    "from-amber-200 to-amber-300",
    "from-blue-200 to-blue-300",
    "from-purple-200 to-purple-300",
    "from-cyan-200 to-cyan-300",
  ];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) setType("Video");
    else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) setType("Photo");
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    if (!title.trim()) { setError("Title is required."); return; }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const { galleryService } = await import("@/lib/services/gallery");
      await galleryService.uploadFile(
        file,
        {
          type,
          title: title.trim(),
          description,
          campaignDay,
          location,
          date: capturedDate || new Date().toISOString(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          color: gradients[Math.floor(Math.random() * gradients.length)],
        },
        setProgress,
      );
      onUploaded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Upload Media</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/mov,video/avi,video/webm,image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter") fileRef.current?.click(); }}
                className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer ${
                  file ? "border-green-400 bg-green-50/30" : "border-gray-200 hover:border-green-400"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {type === "Video" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      )}
                    </svg>
                    <p className="text-sm font-semibold text-green-700">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)} &middot; Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600">Click to select a file</p>
                    <p className="text-xs text-gray-400">MP4, MOV, AVI, WEBM, JPG, PNG, GIF</p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Media Type *</label>
                <div className="flex gap-2">
                  {(["Photo", "Video"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                      type === t
                        ? t === "Photo" ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-red-500 text-white shadow-lg shadow-red-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Campaign Day *</label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setCampaignDay(d)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                      campaignDay === d ? "bg-green-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter media title" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe this media..." className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Captured Date</label>
                <input type="date" value={capturedDate} onChange={(e) => setCapturedDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., iftar, volunteers, cooking" className={inputClass} />
                <p className="mt-1 text-xs text-gray-400">Separate tags with commas</p>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
              )}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-semibold text-green-700">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} disabled={uploading} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={uploading || !file} className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function MediaViewer({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  const [videoError, setVideoError] = useState(false);
  const hasVideo = item.type === "Video" && item.videoUrl && !videoError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 z-20 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70 cursor-pointer backdrop-blur-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
        <div className={`flex flex-1 items-center justify-center bg-gradient-to-br ${item.color} min-h-[200px] md:min-h-0 ${hasVideo ? "p-0" : ""}`}>
          {hasVideo ? (
            <video
              src={item.videoUrl}
              controls
              autoPlay
              className="h-full w-full object-contain bg-black"
              onError={() => setVideoError(true)}
            />
          ) : item.type === "Video" && item.videoUrl && videoError ? (
            <div className="flex flex-col items-center gap-3 text-white/70">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <p className="text-sm font-medium">Video not found</p>
              <p className="text-xs text-white/50">{item.fileName || "File unavailable"}</p>
            </div>
          ) : item.type === "Video" ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm cursor-pointer">
              <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <svg className="h-20 w-20 text-white/50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          )}
        </div>
        <div className="w-full overflow-y-auto p-6 md:w-80">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              item.type === "Photo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {item.type}
            </span>
            {item.duration && (
              <span className="text-xs text-gray-400">{item.duration}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
          {item.description && (
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          )}
          <div className="mt-4 space-y-3">
            {[
              { label: "Location", value: item.location, icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" },
              { label: "Campaign Day", value: `Day ${item.campaignDay}`, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" },
              { label: "Date", value: item.date, icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
              { label: "Uploaded By", value: item.uploadedBy, icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
              { label: "Size", value: item.size, icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={field.icon} />
                </svg>
                <div>
                  <p className="text-[10px] text-gray-400">{field.label}</p>
                  <p className="text-sm font-medium text-gray-800">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
          {item.tags.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EditMediaModal({
  item,
  onClose,
  onSave,
}: {
  item: GalleryItem;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [campaignDay, setCampaignDay] = useState<1 | 2 | 3 | 4 | 5>(item.campaignDay);
  const [location, setLocation] = useState(item.location);
  const [tags, setTags] = useState(item.tags.join(", "));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...item,
      title,
      description,
      campaignDay,
      location,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Media</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Campaign Day *</label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setCampaignDay(d)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                      campaignDay === d ? "bg-green-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer">Save Changes</button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function DeleteMediaModal({
  item,
  onClose,
  onDelete,
}: {
  item: GalleryItem;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-red-100/80 bg-white shadow-2xl">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete {item.type}?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-700">{item.title}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-red-50 px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="button" onClick={onDelete} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200/50 transition-all hover:bg-red-600 cursor-pointer">Delete</button>
        </div>
      </div>
    </ModalOverlay>
  );
}
