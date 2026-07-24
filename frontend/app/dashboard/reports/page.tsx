"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import ReportCards from "@/components/dashboard/ReportCard";
import ReportTable from "@/components/dashboard/ReportTable";
import ReportSummary from "@/components/dashboard/ReportSummary";
import {
  AddReportModal,
  ViewReportModal,
  EditReportModal,
  DeleteReportModal,
} from "@/components/dashboard/ReportModal";
import { reportsService, type DailyReport } from "@/lib/services/reports";
import { usersService } from "@/lib/services/users";
import { useAuth } from "@/lib/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/permissions";

import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";
import { getLocations } from "@/lib/locations";

type ModalType = "add" | "view" | "edit" | "delete" | null;

export default function ReportsPage() {
  const { user: authUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canEdit = canAccess(userRole, "reports", "canEdit");
  const canDelete = canAccess(userRole, "reports", "canDelete");
  const [data, setData] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameToId, setNameToId] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [locationFilterOptions, setLocationFilterOptions] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<DailyReport | null>(null);
  const userName = authUser?.full_name || "User";

  const fetchData = useCallback(async () => {
    try {
      const reports = await reportsService.list();
      setData(reports);
      try {
        const names = await usersService.names();
        const ntId: Record<string, number> = {};
        for (const n of names) ntId[n.fullName] = n.id;
        setNameToId(ntId);
      } catch {
        // name map may fail for Volunteers, create/edit will be hidden anyway
      }
    } catch {
      // API may be down
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refreshLocations = useCallback(() => {
    const saved = getLocations();
    const fromData = data.map((r) => r.location);
    const allLocations = [...new Set([...saved, ...fromData])].sort();
    setLocationFilterOptions(allLocations);
  }, [data]);

  useEffect(() => { refreshLocations(); }, [refreshLocations]);

  const filtered = useMemo(() => data.filter((r) => {
    const matchSearch =
      search === "" ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.teamLeader.toLowerCase().includes(search.toLowerCase()) ||
      r.foodMenu.toLowerCase().includes(search.toLowerCase());
    const matchLocation =
      locationFilter === "All Locations" || r.location === locationFilter;
    const matchDate = dateFilter === "" || r.date.includes(dateFilter);
    return matchSearch && matchLocation && matchDate;
  }), [data, search, locationFilter, dateFilter]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Daily Reports",
    columns: [
      { header: "Date", key: "date" },
      { header: "Location", key: "location" },
      { header: "Team Leader", key: "teamLeader" },
      { header: "People Served", key: "peopleServed" },
      { header: "Meals Prepared", key: "mealsPrepared" },
      { header: "Meals Remaining", key: "mealsRemaining" },
      { header: "Food Menu", key: "foodMenu" },
      { header: "Videos", key: "videoCount" },
      { header: "Status", key: "status" },
    ],
    rows: filtered.map((r) => ({
      date: r.date,
      location: r.location,
      teamLeader: r.teamLeader,
      peopleServed: r.peopleServed.toLocaleString(),
      mealsPrepared: r.mealsPrepared.toLocaleString(),
      mealsRemaining: r.mealsRemaining,
      foodMenu: r.foodMenu,
      videoCount: r.videos.length,
      status: r.status,
    })),
    fileName: "Daily_Reports",
    userName,
    totals: {
      "Total Reports": String(filtered.length),
      "Total People Served": filtered.reduce((sum, r) => sum + r.peopleServed, 0).toLocaleString(),
      "Total Meals Prepared": filtered.reduce((sum, r) => sum + r.mealsPrepared, 0).toLocaleString(),
    },
  }), [filtered, userName]);

  const openModal = useCallback((type: ModalType, report?: DailyReport) => {
    setModal(type);
    setSelected(report || null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelected(null);
    refreshLocations();
  }, [refreshLocations]);

  const handleAdd = useCallback(async (r: Omit<DailyReport, "id">) => {
    try {
      await reportsService.create(r, nameToId);
      await fetchData();
    } catch (err) {
      console.error("Failed to create report:", err);
    }
    closeModal();
  }, [nameToId, fetchData, closeModal]);

  const handleSave = useCallback(async (updated: DailyReport) => {
    try {
      await reportsService.update(updated.id, updated, nameToId);
      await fetchData();
    } catch (err) {
      console.error("Failed to update report:", err);
    }
    closeModal();
  }, [nameToId, fetchData, closeModal]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      try {
        await reportsService.remove(selected.id);
        await fetchData();
      } catch (err) {
        console.error("Failed to delete report:", err);
      }
      closeModal();
    }
  }, [selected, fetchData, closeModal]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Reports"
        subtitle="Manage Ramadan Iftar daily activities and reports"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Daily Reports" },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading reports...</p>
        </div>
      ) : (<>
        <ReportCards data={data} />

        <div className="flex flex-col gap-4 rounded-2xl border border-green-50/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              <option value="All Locations">All Locations</option>
              {locationFilterOptions.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          {canEdit && (
          <button
            type="button"
            onClick={() => openModal("add")}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Daily Report
          </button>
          )}
        </div>

        <div className="flex items-center justify-end">
          <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <ReportTable
            data={filtered}
            onView={(r) => openModal("view", r)}
            onEdit={canEdit ? (r) => openModal("edit", r) : undefined}
            onDelete={canDelete ? (r) => openModal("delete", r) : undefined}
          />
          <div className="space-y-6">
            <ReportSummary data={data} />
          </div>
        </div>

        {modal === "add" && (
          <AddReportModal onClose={closeModal} onAdd={handleAdd} />
        )}
        {modal === "view" && selected && (
          <ViewReportModal report={selected} onClose={closeModal} />
        )}
        {modal === "edit" && selected && (
          <EditReportModal
            report={selected}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
        {modal === "delete" && selected && (
          <DeleteReportModal
            report={selected}
            onClose={closeModal}
            onDelete={handleDelete}
          />
        )}
      </>)}
    </div>
  );
}
