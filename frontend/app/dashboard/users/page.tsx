"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usersService, type User } from "@/lib/services/users";
import { useAuth } from "@/lib/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import { canAccess, type Role } from "@/lib/permissions";
import StatCard from "@/components/dashboard/StatCard";
import PageHeader from "@/components/dashboard/PageHeader";
import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";

type ModalType = "add" | "view" | "edit" | "delete" | null;

const emptyForm = {
  fullName: "",
  username: "",
  phone: "",
  role: "Volunteer" as User["role"],
  password: "",
  confirmPassword: "",
  status: "Active" as User["status"],
};

function RoleBadge({ role }: { role: User["role"] }) {
  const styles: Record<string, string> = {
    Manager: "bg-green-50 text-green-700",
    Leader: "bg-gold-50 text-gold-700",
    Volunteer: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: User["status"] }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

type UserFormData = {
  fullName: string;
  username: string;
  phone: string;
  role: User["role"];
  password: string;
  status: User["status"];
};

function AddEditUserModal({
  mode,
  user,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  user?: User;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
}) {
  const [form, setForm] = useState(
    user
      ? { ...user, password: "", confirmPassword: "" }
      : { ...emptyForm }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError("");
    if (!form.fullName.trim() || !form.username.trim()) {
      setError("Full name and username are required");
      return;
    }
    if (mode === "add" && form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        phone: form.phone,
        role: form.role,
        password: form.password,
        status: form.status,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "Failed to save user");
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "add" ? "Add New User" : "Edit User"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+252 6X XXX XXXX"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value as User["role"])}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              >
                <option value="Manager">Manager</option>
                <option value="Leader">Leader</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={mode === "edit" ? "Leave blank to keep current" : "Enter password"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder={mode === "edit" ? "Leave blank to keep current" : "Confirm password"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as User["status"])}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving..." : mode === "add" ? "Save User" : "Update User"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ViewUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">User Details</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <UserAvatar
                name={user.fullName}
                className="h-16 w-16 rounded-full shadow-lg"
                fallbackClassName={user.color}
                textClassName="text-xl font-bold"
              />
            </div>
            <h4 className="text-lg font-bold text-gray-900">{user.fullName}</h4>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Role</span>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Status</span>
              <StatusBadge status={user.status} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Created</span>
              <span className="text-sm font-medium text-gray-900">{user.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-green-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function DeleteModal({
  user,
  onClose,
  onDelete,
}: {
  user: User;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await onDelete();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "Failed to delete user");
      setDeleting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-red-100/80 bg-white shadow-2xl">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-700">{user.fullName}</span>? This action cannot be undone.
          </p>
          {error && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-red-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200/50 transition-all hover:bg-red-600 cursor-pointer disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

export default function UsersPage() {
  const { user: authUser, refreshUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canManage = canAccess(userRole, "users", "canCreate");
  const canEditDelete = canAccess(userRole, "users", "canDelete");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const userName = authUser?.full_name || "User";

  useEffect(() => {
    usersService.list().then((data) => {
      setAllUsers(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => allUsers.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  }), [allUsers, search, roleFilter, statusFilter]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Users Report",
    columns: [
      { header: "Full Name", key: "fullName" },
      { header: "Username", key: "username" },
      { header: "Phone", key: "phone" },
      { header: "Role", key: "role" },
      { header: "Status", key: "status" },
      { header: "Created", key: "createdAt" },
    ],
    rows: filtered.map((u) => ({
      fullName: u.fullName,
      username: u.username,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    })),
    fileName: "Users_Report",
    userName,
    totals: {
      "Total Users": String(filtered.length),
      "Managers": String(filtered.filter((u) => u.role === "Manager").length),
      "Leaders": String(filtered.filter((u) => u.role === "Leader").length),
      "Volunteers": String(filtered.filter((u) => u.role === "Volunteer").length),
    },
  }), [filtered, userName]);

  const roleStats = useMemo(() => {
    let totalManagers = 0;
    let totalLeaders = 0;
    let totalVolunteers = 0;
    for (const u of allUsers) {
      if (u.role === "Manager") totalManagers++;
      else if (u.role === "Leader") totalLeaders++;
      else totalVolunteers++;
    }
    return { totalManagers, totalLeaders, totalVolunteers };
  }, [allUsers]);

  const openModal = useCallback((type: ModalType, user?: User) => {
    setModal(type);
    setSelectedUser(user || null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelectedUser(null);
  }, []);

  const handleCreate = useCallback(async (data: UserFormData) => {
    await usersService.create(data);
    setAllUsers(await usersService.list());
    closeModal();
  }, [closeModal]);

  const handleUpdate = useCallback(async (userId: number, data: UserFormData) => {
    await usersService.update(userId, data);
    if (authUser?.id === userId) {
      await refreshUser();
    }
    setAllUsers(await usersService.list());
    closeModal();
  }, [authUser, refreshUser, closeModal]);

  const handleDelete = useCallback(async (userId: number) => {
    await usersService.remove(userId);
    setAllUsers(await usersService.list());
    closeModal();
  }, [closeModal]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="h-8 w-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
      <>
      <PageHeader
        title="Users Management"
        subtitle="Manage Managers, Leaders and Volunteers"
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Users" },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={String(allUsers.length)} description="All system users" change="+3" trend="up" icon="users" />
        <StatCard label="Managers" value={String(roleStats.totalManagers)} description="Project managers" change="0" trend="up" icon="donation" />
        <StatCard label="Leaders" value={String(roleStats.totalLeaders)} description="Team leaders" change="+1" trend="up" icon="balance" />
        <StatCard label="Volunteers" value={String(roleStats.totalVolunteers)} description="Active volunteers" change="+2" trend="up" icon="people" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-green-50/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          >
            <option value="All">All Roles</option>
            <option value="Manager">Managers</option>
            <option value="Leader">Leaders</option>
            <option value="Volunteer">Volunteers</option>
          </select>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {canManage && (
        <button
          type="button"
          onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer whitespace-nowrap"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add User
        </button>
        )}
      </div>

      <div className="flex items-center justify-end">
        <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-50/80 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50/50">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-green-50/30">
                    <td className="px-6 py-3.5">
                      <UserAvatar
                        name={u.fullName}
                        className="h-9 w-9 rounded-full shadow-sm"
                        fallbackClassName={u.color}
                        textClassName="text-xs font-bold"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm font-medium text-gray-800">{u.fullName}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-gray-500">@{u.username}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-gray-500">{u.phone}</td>
                    <td className="px-6 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-3.5"><StatusBadge status={u.status} /></td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-gray-500">{u.createdAt}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openModal("view", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer" title="View">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                        {canManage && (
                        <button type="button" onClick={() => openModal("edit", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gold-50 hover:text-gold-600 cursor-pointer" title="Edit">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        )}
                        {canEditDelete && (
                        <button type="button" onClick={() => openModal("delete", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer" title="Delete">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                      No users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden divide-y divide-green-50/50">
          {filtered.map((u) => (
            <div key={u.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={u.fullName}
                  className="h-9 w-9 shrink-0 rounded-full shadow-sm"
                  fallbackClassName={u.color}
                  textClassName="text-xs font-bold"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-500 truncate">{u.phone}</span>
                  <RoleBadge role={u.role} />
                  <StatusBadge status={u.status} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => openModal("view", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
                  {canManage && (
                  <button type="button" onClick={() => openModal("edit", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gold-50 hover:text-gold-600 cursor-pointer">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  )}
                  {canEditDelete && (
                  <button type="button" onClick={() => openModal("delete", u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              No users found matching your criteria.
            </div>
          )}
        </div>
        <div className="border-t border-green-50 px-4 sm:px-6 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {allUsers.length} users
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <AddEditUserModal mode="add" onClose={closeModal} onSave={handleCreate} />
      )}
      {modal === "edit" && selectedUser && (
        <AddEditUserModal
          mode="edit"
          user={selectedUser}
          onClose={closeModal}
          onSave={(data) => handleUpdate(selectedUser.id, data)}
        />
      )}
      {modal === "view" && selectedUser && (
        <ViewUserModal user={selectedUser} onClose={closeModal} />
      )}
      {modal === "delete" && selectedUser && (
        <DeleteModal user={selectedUser} onClose={closeModal} onDelete={() => handleDelete(selectedUser.id)} />
      )}
      </>
      )}
    </div>
  );
}
