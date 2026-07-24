import api from "./api";

interface BackendDonation {
  id: number;
  receipt_no: string;
  donor_name: string;
  donation_type: string;
  amount: number | null;
  item_name: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  estimated_value: number | null;
  payment_method: string | null;
  reference_number: string | null;
  date: string;
  notes: string | null;
  status: string;
  created_by: number;
  created_at: string;
}

export interface Donation {
  id: number;
  receipt: string;
  donorName: string;
  donationType: "Cash" | "In-Kind";
  amount?: number;
  itemName?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  estimatedValue?: number;
  paymentMethod?: string;
  referenceNumber?: string;
  date: string;
  notes?: string;
  status: "Completed" | "Pending" | "Cancelled";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFrontend(d: BackendDonation): Donation {
  return {
    id: d.id,
    receipt: d.receipt_no,
    donorName: d.donor_name,
    donationType: d.donation_type as "Cash" | "In-Kind",
    amount: d.amount ?? undefined,
    itemName: d.item_name ?? undefined,
    category: d.category ?? undefined,
    quantity: d.quantity ?? undefined,
    unit: d.unit ?? undefined,
    estimatedValue: d.estimated_value ?? undefined,
    paymentMethod: d.payment_method ?? undefined,
    referenceNumber: d.reference_number ?? undefined,
    date: fmtDate(d.date),
    notes: d.notes ?? undefined,
    status: d.status as Donation["status"],
  };
}

function toBackend(d: Partial<Donation>) {
  return {
    donor_name: d.donorName,
    donation_type: d.donationType,
    amount: d.amount ?? null,
    item_name: d.itemName ?? null,
    category: d.category ?? null,
    quantity: d.quantity ?? null,
    unit: d.unit ?? null,
    estimated_value: d.estimatedValue ?? null,
    payment_method: d.paymentMethod ?? null,
    reference_number: d.referenceNumber ?? null,
    date: d.date ? new Date(d.date).toISOString() : new Date().toISOString(),
    notes: d.notes ?? null,
    status: d.status ?? "Completed",
  };
}

export const donationsService = {
  async stats(): Promise<{ total: number; totalAmount: number; completed: number; pending: number }> {
    const res = await api.get("/api/donations/stats/summary");
    return { total: res.data.total, totalAmount: res.data.total_amount, completed: res.data.completed, pending: res.data.pending };
  },
  async list(): Promise<Donation[]> {
    const res = await api.get<BackendDonation[]>("/api/donations");
    return res.data.map(toFrontend);
  },
  async create(d: Partial<Donation>): Promise<Donation> {
    const res = await api.post<BackendDonation>("/api/donations", toBackend(d));
    return toFrontend(res.data);
  },
  async update(id: number, d: Partial<Donation>): Promise<Donation> {
    const res = await api.put<BackendDonation>(`/api/donations/${id}`, toBackend(d));
    return toFrontend(res.data);
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/donations/${id}`);
  },
};
