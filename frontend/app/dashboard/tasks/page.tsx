"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import TaskTable from "@/components/dashboard/TaskTable";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import TaskSummary from "@/components/dashboard/TaskSummary";
import {
  AddTaskModal,
  ViewTaskModal,
  EditTaskModal,
  DeleteTaskModal,
} from "@/components/dashboard/TaskModal";
import { tasksService, type Task } from "@/lib/services/tasks";
import { usersService, type User } from "@/lib/services/users";
import { useAuth } from "@/lib/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/permissions";
import { buildNameToId } from "@/lib/services/helpers";
import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";

type ModalType = "add" | "view" | "edit" | "delete" | null;

export default function TasksPage() {
  const { user: authUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canEdit = canAccess(userRole, "tasks", "canEdit");
  const canDelete = canAccess(userRole, "tasks", "canDelete");
  const [data, setData] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [assigneeFilter, setAssigneeFilter] = useState("All Assignees");
  const [dateFilter, setDateFilter] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const userName = authUser?.full_name || "User";

  const assignees = useMemo(() => ["All Assignees", ...users.map((u) => u.fullName)], [users]);

  const fetchData = useCallback(async () => {
    try {
      const tasks = await tasksService.list();
      setData(tasks);
      try {
        const names = await usersService.names();
        setUsers(names.map((n) => ({ id: n.id, fullName: n.fullName } as User)));
      } catch {
        // name map may fail for Volunteers, create/edit will be hidden anyway
      }
      try {
        const fullUsers = await usersService.list();
        setTeamUsers(fullUsers);
      } catch {
        // full user list may be restricted for Volunteers, Add/Edit are hidden anyway
      }
    } catch {
      // API may be down
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => data.filter((t) => {
    const matchSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All Priority" || t.priority === priorityFilter;
    const matchAssignee = assigneeFilter === "All Assignees" || t.assignedTo === assigneeFilter;
    const matchDate = dateFilter === "" || t.dueDate.includes(dateFilter) || t.startDate.includes(dateFilter);
    return matchSearch && matchStatus && matchPriority && matchAssignee && matchDate;
  }), [data, search, statusFilter, priorityFilter, assigneeFilter, dateFilter]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Tasks Report",
    columns: [
      { header: "Task Name", key: "name" },
      { header: "Assigned To", key: "assignedTo" },
      { header: "Status", key: "status" },
      { header: "Priority", key: "priority" },
      { header: "Start Date", key: "startDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Description", key: "description" },
    ],
    rows: filtered.map((t) => ({
      name: t.name,
      assignedTo: t.assignedTo,
      status: t.status,
      priority: t.priority,
      startDate: t.startDate,
      dueDate: t.dueDate,
      description: t.description,
    })),
    fileName: "Tasks_Report",
    userName,
    totals: {
      "Total Tasks": String(filtered.length),
      "Completed": String(filtered.filter((t) => t.status === "Completed").length),
      "In Progress": String(filtered.filter((t) => t.status === "In Progress").length),
      "Pending": String(filtered.filter((t) => t.status === "Pending").length),
    },
  }), [filtered, userName]);

  const taskStats = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let highPriority = 0;
    let overdue = 0;
    for (const t of data) {
      if (t.status === "Completed") completedCount++;
      else if (t.status === "In Progress") inProgressCount++;
      else pendingCount++;
      if (t.priority === "High" && t.status !== "Completed") highPriority++;
      if (t.status !== "Completed" && t.dueDate < "Jul 23, 2026") overdue++;
    }
    return { totalTasks: data.length, completedCount, inProgressCount, pendingCount, highPriority, overdue };
  }, [data]);

  const openModal = useCallback((type: ModalType, task?: Task) => {
    setModal(type);
    setSelected(task || null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelected(null);
  }, []);

  const handleAdd = useCallback(async (t: Omit<Task, "id">) => {
    try {
      const nameToId = buildNameToId(users);
      await tasksService.create(t, nameToId);
      await fetchData();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
    closeModal();
  }, [users, fetchData, closeModal]);

  const handleSave = useCallback(async (updated: Task) => {
    try {
      const nameToId = buildNameToId(users);
      await tasksService.update(updated.id, updated, nameToId);
      await fetchData();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
    closeModal();
  }, [users, fetchData, closeModal]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      try {
        await tasksService.remove(selected.id);
        await fetchData();
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
      closeModal();
    }
  }, [selected, fetchData, closeModal]);

  const handleMarkComplete = useCallback(async (task: Task) => {
    try {
      await tasksService.update(task.id, { ...task, status: "Completed", progress: 100 });
      await fetchData();
    } catch (err) {
      console.error("Failed to mark task complete:", err);
    }
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks Management"
        subtitle="Manage Ramadan campaign tasks and team assignments"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tasks" },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading tasks...</p>
        </div>
      ) : (<>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Tasks" value={String(taskStats.totalTasks)} description="All campaign tasks" icon="campaign" change={`${taskStats.totalTasks}`} trend="up" />
        <StatCard label="Completed" value={String(taskStats.completedCount)} description="Done tasks" icon="meals" change={`${taskStats.completedCount}`} trend="up" />
        <StatCard label="In Progress" value={String(taskStats.inProgressCount)} description="Active tasks" icon="donation" change={`${taskStats.inProgressCount}`} trend="up" />
        <StatCard label="Pending" value={String(taskStats.pendingCount)} description="Awaiting start" icon="balance" change={`${taskStats.pendingCount}`} trend="up" />
        <StatCard label="High Priority" value={String(taskStats.highPriority)} description="Urgent tasks" icon="expense" change={`${taskStats.highPriority}`} trend="up" />
        <StatCard label="Overdue" value={String(taskStats.overdue)} description="Past due date" icon="people" change={`${taskStats.overdue}`} trend={taskStats.overdue > 0 ? "down" : "up"} />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-green-50/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100">
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100">
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100">
            {assignees.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 p-0.5">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Kanban
            </button>
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
            Add Task
          </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
      </div>

      {view === "table" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
          <TaskTable
            data={filtered}
            onView={(t) => openModal("view", t)}
            onEdit={canEdit ? (t) => openModal("edit", t) : undefined}
            onDelete={canDelete ? (t) => openModal("delete", t) : undefined}
            currentUserId={authUser?.id}
            onMarkComplete={handleMarkComplete}
          />
          <TaskSummary data={data} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
          <div>
            <KanbanBoard data={filtered} />
          </div>
          <TaskSummary data={data} />
        </div>
      )}

      {modal === "add" && <AddTaskModal onClose={closeModal} onAdd={handleAdd} users={teamUsers} />}
      {modal === "view" && selected && <ViewTaskModal task={selected} onClose={closeModal} />}
      {modal === "edit" && selected && <EditTaskModal task={selected} onClose={closeModal} onSave={handleSave} users={teamUsers} />}
      {modal === "delete" && selected && <DeleteTaskModal task={selected} onClose={closeModal} onDelete={handleDelete} />}
      </>)}
    </div>
  );
}
