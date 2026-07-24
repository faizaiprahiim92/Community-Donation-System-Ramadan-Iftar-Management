"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import ExpenseCards from "@/components/dashboard/ExpenseCard";
import ExpenseFilters from "@/components/dashboard/ExpenseFilters";
import ExpenseTable from "@/components/dashboard/ExpenseTable";
import ExpenseSummary from "@/components/dashboard/ExpenseSummary";
import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/permissions";
import {
  AddExpenseModal,
  ViewExpenseModal,
  EditExpenseModal,
  DeleteExpenseModal,
} from "@/components/dashboard/ExpenseModal";
import { expensesService, type Expense } from "@/lib/services/expenses";
import { donationsService } from "@/lib/services/donations";
import { usersService } from "@/lib/services/users";


type ModalType = "add" | "view" | "edit" | "delete" | null;

export default function ExpensesPage() {
  const { user: authUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canEdit = canAccess(userRole, "expenses", "canEdit");
  const canDelete = canAccess(userRole, "expenses", "canDelete");
  const [data, setData] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("");
  const [status, setStatus] = useState("All Status");
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [userIdMap, setUserIdMap] = useState<Record<string, number>>({});
  const [totalDonations, setTotalDonations] = useState(0);
  const userName = authUser?.full_name || "User";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const expenses = await expensesService.list();
      setData(expenses);
      try {
        const names = await usersService.names();
        const map: Record<string, number> = {};
        for (const n of names) map[n.fullName] = n.id;
        setUserIdMap(map);
      } catch {
        // name map may fail for Volunteers, create/edit will be hidden anyway
      }
      try {
        const stats = await donationsService.stats();
        setTotalDonations(stats.totalAmount);
      } catch {
        // donations fetch may fail for Volunteers
      }
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => data.filter((e) => {
    const matchSearch =
      search === "" ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.receipt.toLowerCase().includes(search.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === "All Categories" || e.category === category;
    const matchStatus = status === "All Status" || e.status === status;
    const matchDate =
      dateFilter === "" || e.date.includes(dateFilter);
    return matchSearch && matchCategory && matchStatus && matchDate;
  }), [data, search, category, status, dateFilter]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Expenses Report",
    columns: [
      { header: "Receipt", key: "receipt" },
      { header: "Expense Name", key: "name" },
      { header: "Category", key: "category" },
      { header: "Quantity", key: "quantityDisplay" },
      { header: "Unit Price", key: "unitPriceDisplay" },
      { header: "Total Cost", key: "totalCostDisplay" },
      { header: "Paid By", key: "paidBy" },
      { header: "Date", key: "date" },
      { header: "Status", key: "status" },
    ],
    rows: filtered.map((e) => ({
      receipt: e.receipt,
      name: e.name,
      category: e.category,
      quantityDisplay: `${e.quantity} ${e.unit}`,
      unitPriceDisplay: `$${e.unitPrice.toFixed(2)}`,
      totalCostDisplay: `$${e.totalCost.toLocaleString()}`,
      paidBy: e.paidBy,
      date: e.date,
      status: e.status,
    })),
    fileName: "Expenses_Report",
    userName,
    totals: {
      "Total Expenses": String(filtered.length),
      "Total Cost": `$${filtered.reduce((sum, e) => sum + e.totalCost, 0).toLocaleString()}`,
    },
  }), [filtered, userName]);

  const openModal = useCallback((type: ModalType, expense?: Expense) => {
    setModal(type);
    setSelected(expense || null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelected(null);
  }, []);

  const handleAdd = useCallback(async (e: Omit<Expense, "id" | "receipt" | "date">) => {
    try {
      await expensesService.create(e as Partial<Expense>, userIdMap);
      await fetchData();
    } catch (err) {
      console.error("Failed to create expense:", err);
    }
    closeModal();
  }, [userIdMap, fetchData, closeModal]);

  const handleSave = useCallback(async (updated: Expense) => {
    try {
      await expensesService.update(updated.id, updated, userIdMap);
      await fetchData();
    } catch (err) {
      console.error("Failed to update expense:", err);
    }
    closeModal();
  }, [userIdMap, fetchData, closeModal]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      try {
        await expensesService.remove(selected.id);
        await fetchData();
      } catch (err) {
        console.error("Failed to delete expense:", err);
      }
      closeModal();
    }
  }, [selected, fetchData, closeModal]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Expenses"
          subtitle="Manage all Ramadan campaign expenses"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Expenses" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Manage all Ramadan campaign expenses"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Expenses" },
        ]}
      />

      <ExpenseCards data={data} totalDonations={totalDonations} />

      <ExpenseFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        status={status}
        onStatusChange={setStatus}
        onAdd={canEdit ? () => openModal("add") : undefined}
      />

      <div className="flex items-center justify-end">
        <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <ExpenseTable
          data={filtered}
          onView={(e) => openModal("view", e)}
          onEdit={canEdit ? (e) => openModal("edit", e) : undefined}
          onDelete={canDelete ? (e) => openModal("delete", e) : undefined}
        />
        <ExpenseSummary data={data} />
      </div>

      {modal === "add" && (
        <AddExpenseModal onClose={closeModal} onAdd={handleAdd} />
      )}
      {modal === "view" && selected && (
        <ViewExpenseModal expense={selected} onClose={closeModal} />
      )}
      {modal === "edit" && selected && (
        <EditExpenseModal
          expense={selected}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteExpenseModal
          expense={selected}
          onClose={closeModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
