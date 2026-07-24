import api from "./api";

interface BackendExpense {
  id: number;
  receipt_no: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
  paid_by: number;
  paid_by_name: string;
  payment_method: string;
  receipt_number: string | null;
  date: string;
  notes: string | null;
  status: string;
  created_by: number;
  created_at: string;
}

export interface Expense {
  id: number;
  receipt: string;
  name: string;
  category: "Food" | "Transport" | "Packaging" | "Water" | "Cooking" | "Other";
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  paidBy: string;
  paymentMethod: "Cash" | "EVC Plus" | "Bank";
  receiptNumber?: string;
  date: string;
  notes?: string;
  receiptFile?: string;
  status: "Approved" | "Pending" | "Rejected";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFrontend(e: BackendExpense, userNameMap: Record<number, string> = {}): Expense {
  return {
    id: e.id,
    receipt: e.receipt_no,
    name: e.name,
    category: e.category as Expense["category"],
    quantity: e.quantity,
    unit: e.unit,
    unitPrice: e.unit_price,
    totalCost: e.total_cost,
    paidBy: e.paid_by_name || userNameMap[e.paid_by] || `User #${e.paid_by}`,
    paymentMethod: e.payment_method as Expense["paymentMethod"],
    receiptNumber: e.receipt_number ?? undefined,
    date: fmtDate(e.date),
    notes: e.notes ?? undefined,
    status: e.status as Expense["status"],
  };
}

function toBackend(e: Partial<Expense>, userIdMap: Record<string, number>) {
  return {
    name: e.name,
    category: e.category,
    quantity: e.quantity,
    unit: e.unit,
    unit_price: e.unitPrice,
    total_cost: e.totalCost,
    paid_by: e.paidBy ? userIdMap[e.paidBy] || 1 : 1,
    payment_method: e.paymentMethod,
    receipt_number: e.receiptNumber ?? null,
    date: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
    notes: e.notes ?? null,
    status: e.status ?? "Pending",
  };
}

export const expensesService = {
  async stats(): Promise<{ total: number; totalCost: number; approved: number; pending: number }> {
    const res = await api.get("/api/expenses/stats/summary");
    return { total: res.data.total, totalCost: res.data.total_cost, approved: res.data.approved, pending: res.data.pending };
  },
  async list(userNameMap: Record<number, string> = {}): Promise<Expense[]> {
    const res = await api.get<BackendExpense[]>("/api/expenses");
    return res.data.map((e) => toFrontend(e, userNameMap));
  },
  async create(e: Partial<Expense>, userIdMap: Record<string, number> = {}): Promise<Expense> {
    const res = await api.post<BackendExpense>("/api/expenses", toBackend(e, userIdMap));
    return toFrontend(res.data, {});
  },
  async update(id: number, e: Partial<Expense>, userIdMap: Record<string, number> = {}): Promise<Expense> {
    const res = await api.put<BackendExpense>(`/api/expenses/${id}`, toBackend(e, userIdMap));
    return toFrontend(res.data, {});
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/expenses/${id}`);
  },
};
