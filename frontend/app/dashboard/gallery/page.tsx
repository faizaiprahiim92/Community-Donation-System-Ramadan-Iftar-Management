"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import GalleryFilters from "@/components/dashboard/GalleryFilters";
import GalleryGrid from "@/components/dashboard/GalleryGrid";
import AlbumCard from "@/components/dashboard/AlbumCard";
import { UploadModal, MediaViewer, EditMediaModal, DeleteMediaModal } from "@/components/dashboard/GalleryModal";
import { galleryService, type GalleryItem } from "@/lib/services/gallery";
import { useAuth } from "@/lib/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/permissions";
import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";

export default function GalleryPage() {
  const { user: authUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canCreate = canAccess(userRole, "gallery", "canCreate");
  const canEdit = canAccess(userRole, "gallery", "canEdit");
  const canDelete = canAccess(userRole, "gallery", "canDelete");
  const userName = authUser?.full_name || "User";
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDay, setFilterDay] = useState("All Days");
  const [filterLocation, setFilterLocation] = useState("All Locations");
  const [viewMode, setViewMode] = useState<"grid" | "albums">("grid");
  const [selectedAlbumDay, setSelectedAlbumDay] = useState<number | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [viewItem, setViewItem] = useState<GalleryItem | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await galleryService.list();
      setData(items);
    } catch (err) {
      console.error("Failed to load gallery", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.uploadedBy.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchType =
        filterType === "All" ||
        (filterType === "Photos" && item.type === "Photo") ||
        (filterType === "Videos" && item.type === "Video");
      const matchDay =
        filterDay === "All Days" || item.campaignDay === parseInt(filterDay.replace("Day ", ""));
      const matchLocation =
        filterLocation === "All Locations" || item.location === filterLocation;
      const matchAlbum =
        selectedAlbumDay === null || item.campaignDay === selectedAlbumDay;
      return matchSearch && matchType && matchDay && matchLocation && matchAlbum;
    });
  }, [data, search, filterType, filterDay, filterLocation, selectedAlbumDay]);

  const galleryStats = useMemo(() => {
    let photoCount = 0;
    let videoCount = 0;
    let todayCount = 0;
    const tagsSet = new Set<string>();
    for (const i of data) {
      if (i.type === "Photo") photoCount++;
      else videoCount++;
      if (i.date.includes("Jul 23")) todayCount++;
      for (const t of i.tags) tagsSet.add(t);
    }
    return { totalCount: data.length, photoCount, videoCount, todayCount, tagCount: tagsSet.size };
  }, [data]);

  const albums = useMemo(() => {
    const grouped: Record<number, GalleryItem[]> = {};
    for (const item of data) {
      if (!grouped[item.campaignDay]) grouped[item.campaignDay] = [];
      grouped[item.campaignDay].push(item);
    }
    return grouped;
  }, [data]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Gallery Report",
    columns: [
      { header: "Title", key: "title" },
      { header: "Type", key: "type" },
      { header: "Description", key: "description" },
      { header: "Campaign Day", key: "campaignDay" },
      { header: "Location", key: "location" },
      { header: "Uploaded By", key: "uploadedBy" },
      { header: "Date", key: "date" },
      { header: "Tags", key: "tagsDisplay" },
    ],
    rows: filtered.map((item) => ({
      title: item.title,
      type: item.type,
      description: item.description,
      campaignDay: `Day ${item.campaignDay}`,
      location: item.location,
      uploadedBy: item.uploadedBy,
      date: item.date,
      tagsDisplay: item.tags.join(", "),
    })),
    fileName: "Gallery_Report",
    userName,
    totals: {
      "Total Items": String(filtered.length),
      "Photos": String(filtered.filter((i) => i.type === "Photo").length),
      "Videos": String(filtered.filter((i) => i.type === "Video").length),
    },
  }), [filtered, userName]);

  const handleUploaded = useCallback(async () => {
    setShowUpload(false);
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(async (updated: GalleryItem) => {
    try {
      await galleryService.update(updated.id, updated);
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update", err);
    }
  }, [fetchData]);

  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await galleryService.remove(deleteItem.id);
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  }, [deleteItem, fetchData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        subtitle="Manage campaign photos, videos, and albums"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gallery" },
        ]}
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Media" value={String(galleryStats.totalCount)} description="All photos & videos" change="+12%" trend="up" icon="campaign" />
        <StatCard label="Photos" value={String(galleryStats.photoCount)} description="Static images" change="+8%" trend="up" icon="donation" />
        <StatCard label="Videos" value={String(galleryStats.videoCount)} description="Video clips" change="+15%" trend="up" icon="meals" />
        <StatCard label="Total Size" value="373.1 MB" description="Storage used" change="+5%" trend="up" icon="balance" />
        <StatCard label="Today" value={String(galleryStats.todayCount)} description="Uploaded today" change="+3" trend="up" icon="people" />
        <StatCard label="Unique Tags" value={String(galleryStats.tagCount)} description="Search keywords" change="+4" trend="up" icon="expense" />
      </div>

      <GalleryFilters
        search={search}
        onSearchChange={setSearch}
        type={filterType}
        onTypeChange={setFilterType}
        day={filterDay}
        onDayChange={setFilterDay}
        location={filterLocation}
        onLocationChange={setFilterLocation}
        onUpload={canCreate ? () => setShowUpload(true) : undefined}
        onCreateAlbum={() => setViewMode("albums")}
      />

      <div className="flex items-center justify-end">
        <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setViewMode("grid"); setSelectedAlbumDay(null); }}
          className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            viewMode === "grid"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
            All Media
          </span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("albums")}
          className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            viewMode === "albums"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            Albums
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          {viewMode === "grid" ? (
            <GalleryGrid
              data={filtered}
              onView={setViewItem}
              onEdit={canEdit ? setEditItem : undefined as any}
              onDelete={canDelete ? setDeleteItem : undefined as any}
            />
          ) : (
            <div className="space-y-6">
              {selectedAlbumDay !== null && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumDay(null)}
                    className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    Back to Albums
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">Day {selectedAlbumDay}</h3>
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    {filtered.length} items
                  </span>
                </div>
              )}
              {selectedAlbumDay === null ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(albums)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, items]) => (
                      <AlbumCard
                        key={day}
                        day={Number(day)}
                        items={items}
                        onClick={() => {
                          setSelectedAlbumDay(Number(day));
                          setViewMode("albums");
                        }}
                      />
                    ))}
                </div>
              ) : (
                <GalleryGrid
                  data={filtered}
                  onView={setViewItem}
                  onEdit={canEdit ? setEditItem : undefined as any}
                  onDelete={canDelete ? setDeleteItem : undefined as any}
                />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Gallery Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Media</span>
                <span className="text-sm font-semibold text-gray-900">{galleryStats.totalCount} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Photos</span>
                <span className="text-sm font-semibold text-green-700">{galleryStats.photoCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Videos</span>
                <span className="text-sm font-semibold text-red-600">{galleryStats.videoCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Storage Used</span>
                <span className="text-sm font-semibold text-gray-900">373.1 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Campaign Days</span>
                <span className="text-sm font-semibold text-gray-900">5 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Locations</span>
                <span className="text-sm font-semibold text-gray-900">5 blocks</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">By Campaign Day</h3>
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((day) => {
                const dayItems = data.filter((i) => i.campaignDay === day);
                const dayPhotos = dayItems.filter((i) => i.type === "Photo").length;
                const dayVideos = dayItems.filter((i) => i.type === "Video").length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedAlbumDay(day);
                      setViewMode("albums");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-green-50/50 cursor-pointer"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
                      day === 1 ? "from-green-200 to-green-300" :
                      day === 2 ? "from-amber-200 to-amber-300" :
                      day === 3 ? "from-blue-200 to-blue-300" :
                      day === 4 ? "from-purple-200 to-purple-300" :
                      "from-rose-200 to-rose-300"
                    }`}>
                      <span className="text-xs font-bold text-white">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">Day {day}</p>
                      <p className="text-xs text-gray-400">{dayPhotos} photos, {dayVideos} videos</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-green-50/80 bg-white p-3 sm:p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Top Uploaders</h3>
            <div className="space-y-2.5">
              {Object.entries(
                data.reduce<Record<string, number>>((acc, item) => {
                  acc[item.uploadedBy] = (acc[item.uploadedBy] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{name}</span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}
      {viewItem && <MediaViewer item={viewItem} onClose={() => setViewItem(null)} />}
      {editItem && canEdit && <EditMediaModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />}
      {deleteItem && canDelete && <DeleteMediaModal item={deleteItem} onClose={() => setDeleteItem(null)} onDelete={handleDelete} />}
    </div>
  );
}
