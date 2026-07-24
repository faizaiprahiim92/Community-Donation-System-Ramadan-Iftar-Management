"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ExportButtons from "@/components/dashboard/ExportButtons";
import type { ExportOptions } from "@/lib/exportUtils";
import { donationsService, type Donation } from "@/lib/services/donations";
import { useAuth } from "@/lib/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/permissions";

const donationTypes = ["All", "Cash", "In-Kind"];
const paymentMethods = ["All", "Cash", "EVC Plus", "Bank"];
const categories = ["Rice", "Oil", "Dates", "Sugar", "Flour", "Meat", "Juice", "Water", "Other"];
const units = ["kg", "liters", "bottles", "cartons", "bags", "pieces"];

function Badge({ status }: { status: string }) {
  const color =
    status === "Completed"
      ? "bg-green-100 text-green-800"
      : status === "Pending"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function DonationsPage() {
  const { user: authUser } = useAuth();
  const userRole = (authUser?.role || "Volunteer") as Role;
  const canCreate = canAccess(userRole, "donations", "canCreate");
  const canEdit = canAccess(userRole, "donations", "canEdit");
  const canDelete = canAccess(userRole, "donations", "canDelete");
  const userName = authUser?.full_name || "User";
  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [viewDonation, setViewDonation] = useState<Donation | null>(null);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [deleteDonation, setDeleteDonation] = useState<Donation | null>(null);
  const [addTab, setAddTab] = useState<"Cash" | "In-Kind">("Cash");
  const [editTab, setEditTab] = useState<"Cash" | "In-Kind">("Cash");

  const fetchDonations = useCallback(async () => {
    try {
      const donations = await donationsService.list();
      setData(donations);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const filtered = useMemo(() => data.filter((d) => {
    const matchSearch =
      search === "" ||
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.receipt.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || d.donationType === filterType;
    const matchPayment =
      filterPayment === "All" || d.paymentMethod === filterPayment;
    return matchSearch && matchType && matchPayment;
  }), [data, search, filterType, filterPayment]);

  const exportOptions: ExportOptions = useMemo(() => ({
    title: "Donations Report",
    columns: [
      { header: "Receipt", key: "receipt" },
      { header: "Donor Name", key: "donorName" },
      { header: "Type", key: "donationType" },
      { header: "Amount", key: "amountDisplay" },
      { header: "Quantity", key: "quantityDisplay" },
      { header: "Payment", key: "paymentMethod" },
      { header: "Date", key: "date" },
      { header: "Status", key: "status" },
    ],
    rows: filtered.map((d) => ({
      receipt: d.receipt,
      donorName: d.donorName,
      donationType: d.donationType,
      amountDisplay: d.donationType === "Cash" && d.amount ? `$${d.amount.toLocaleString()}` : d.estimatedValue ? `$${d.estimatedValue.toLocaleString()}` : "-",
      quantityDisplay: d.quantity ? `${d.quantity} ${d.unit ?? ""}` : "-",
      paymentMethod: d.paymentMethod ?? "-",
      date: d.date,
      status: d.status,
    })),
    fileName: "Donations_Report",
    userName,
    totals: {
      "Total Donations": String(filtered.length),
      "Total Cash Amount": `$${data.filter((d) => d.donationType === "Cash" && d.status === "Completed").reduce((sum, d) => sum + (d.amount ?? 0), 0).toLocaleString()}`,
    },
  }), [filtered, data, userName]);

  const stats = useMemo(() => {
    let totalAmount = 0;
    let cashCount = 0;
    let inKindCount = 0;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    for (const d of data) {
      if (d.donationType === "Cash" && d.status === "Completed") {
        totalAmount += d.amount ?? 0;
        cashCount++;
      }
      if (d.donationType === "In-Kind" && d.status === "Completed") inKindCount++;
      if (d.date.includes("Jul 23")) todayCount++;
      const day = parseInt(d.date.match(/Jul (\d+)/)?.[1] ?? "0");
      if (day >= 17 && day <= 23) weekCount++;
      if (d.status === "Completed") monthCount++;
    }
    return { totalAmount, cashCount, inKindCount, todayCount, weekCount, monthCount };
  }, [data]);

  const handleAdd = useCallback(async (d: Omit<Donation, "id" | "receipt" | "date">) => {
    try {
      await donationsService.create(d);
      setShowAdd(false);
      await fetchDonations();
    } catch (err) {
      console.error("Failed to create donation:", err);
    }
  }, [fetchDonations]);

  const handleEdit = useCallback(async (d: Donation) => {
    try {
      await donationsService.update(d.id, d);
      setEditDonation(null);
      await fetchDonations();
    } catch (err) {
      console.error("Failed to update donation:", err);
    }
  }, [fetchDonations]);

  const handleDelete = useCallback(async () => {
    if (deleteDonation) {
      try {
        await donationsService.remove(deleteDonation.id);
        setDeleteDonation(null);
        await fetchDonations();
      } catch (err) {
        console.error("Failed to delete donation:", err);
      }
    }
  }, [deleteDonation, fetchDonations]);

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading donations...</p>
        </div>
      ) : (
      <>
      <PageHeader
        title="Donations"
        subtitle="Track all donations"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Donations" }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          label="Total Donations"
          value={`$${stats.totalAmount.toLocaleString()}`}
          description={`${stats.monthCount} donations`}
          icon="donation"
          change="+12%"
          trend="up"
        />
        <StatCard
          label="Cash Donations"
          value={stats.cashCount.toString()}
          description="Completed"
          icon="balance"
          change={`${stats.cashCount}`}
          trend="up"
        />
        <StatCard
          label="In-Kind Donations"
          value={stats.inKindCount.toString()}
          description="Items received"
          icon="campaign"
          change={`${stats.inKindCount}`}
          trend="up"
        />
        <StatCard
          label="Today's Donations"
          value={stats.todayCount.toString()}
          description="Received today"
          icon="meals"
          change="0"
          trend="up"
        />
        <StatCard
          label="This Week"
          value={stats.weekCount.toString()}
          description="Jul 17 - Jul 23"
          icon="people"
          change={`${stats.weekCount}`}
          trend="up"
        />
        <StatCard
          label="This Month"
          value={stats.monthCount.toString()}
          description="July 2026"
          icon="expense"
          change="0"
          trend="up"
        />
      </div>

      <div className="flex items-center justify-end mb-4">
        <ExportButtons exportOptions={exportOptions} disabled={filtered.length === 0} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by donor or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            {donationTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All" ? "All Types" : type}
              </option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm === "All" ? "All Payment" : pm}
              </option>
            ))}
          </select>
          {canCreate && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Donation
          </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Receipt
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Donor Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Quantity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm">{d.id}</td>
                      <td className="px-4 py-3 text-sm font-mono">{d.receipt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-medium">
                            {d.donorName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">
                            {d.donorName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            d.donationType === "Cash"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {d.donationType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {d.donationType === "Cash" && d.amount
                          ? `$${d.amount.toLocaleString()}`
                          : d.estimatedValue
                            ? `$${d.estimatedValue.toLocaleString()}`
                            : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {d.quantity
                          ? `${d.quantity} ${d.unit ?? ""}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{d.paymentMethod ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.date}</td>
                      <td className="px-4 py-3">
                        <Badge status={d.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewDonation(d)}
                            className="p-1.5 rounded-lg hover:bg-gray-100"
                            title="View"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {canEdit && (
                          <button
                            onClick={() => {
                              setEditDonation(d);
                              setEditTab(d.donationType);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100"
                            title="Edit"
                          >
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          )}
                          {canDelete && (
                          <button
                            onClick={() => setDeleteDonation(d)}
                            className="p-1.5 rounded-lg hover:bg-gray-100"
                            title="Delete"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden divide-y divide-green-50/50">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 text-sm">
              No donations found
            </div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-medium flex-shrink-0">
                    {d.donorName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium truncate">{d.donorName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.donationType === "Cash"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {d.donationType === "Cash" ? "Cash" : "In-Kind"}
                  </span>
                  <Badge status={d.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="font-medium text-sm">
                    {d.donationType === "Cash" && d.amount
                      ? `$${d.amount.toLocaleString()}`
                      : d.estimatedValue
                        ? `$${d.estimatedValue.toLocaleString()}`
                        : "-"}
                  </span>
                  {d.quantity && <span>{d.quantity} {d.unit ?? ""}</span>}
                  {d.paymentMethod && <span>{d.paymentMethod}</span>}
                  <span>{d.date}</span>
                </div>
                <div className="flex items-center gap-3 pt-0.5">
                  <span className="text-xs text-gray-500 font-mono">{d.receipt}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => setViewDonation(d)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      View
                    </button>
                    {canEdit && (
                    <button
                      onClick={() => {
                        setEditDonation(d);
                        setEditTab(d.donationType);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    )}
                    {canDelete && (
                    <button
                      onClick={() => setDeleteDonation(d)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Today&apos;s Donations</p>
            <p className="text-2xl font-bold text-green-700">{stats.todayCount}</p>
            <p className="text-xs text-gray-500">received today</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Recent Donors</p>
            <div className="mt-1 space-y-1">
              {[...new Set(data.filter((d) => d.date.includes("Jul 23")).map((d) => d.donorName))].slice(0, 3).map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Top Donation</p>
            <p className="text-2xl font-bold text-yellow-700">
              ${Math.max(...data.filter((d) => d.donationType === "Cash").map((d) => d.amount ?? 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {data.find((d) => d.amount === Math.max(...data.filter((d) => d.donationType === "Cash").map((d) => d.amount ?? 0)))?.donorName}
            </p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddDonationModal
          tab={addTab}
          setTab={setAddTab}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* View Modal */}
      {viewDonation && (
        <ViewDonationModal
          donation={viewDonation}
          onClose={() => setViewDonation(null)}
        />
      )}

      {/* Edit Modal */}
      {editDonation && (
        <EditDonationModal
          donation={editDonation}
          tab={editTab}
          setTab={setEditTab}
          onSave={handleEdit}
          onClose={() => setEditDonation(null)}
        />
      )}

      {/* Delete Modal */}
      {deleteDonation && (
        <DeleteDonationModal
          donation={deleteDonation}
          onDelete={handleDelete}
          onClose={() => setDeleteDonation(null)}
        />
      )}
      </>
      )}
    </div>
  );
}

function AddDonationModal({
  tab,
  setTab,
  onAdd,
  onClose,
}: {
  tab: "Cash" | "In-Kind";
  setTab: (t: "Cash" | "In-Kind") => void;
  onAdd: (d: Omit<Donation, "id" | "receipt" | "date">) => void;
  onClose: () => void;
}) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Rice");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Completed" | "Pending" | "Cancelled">("Completed");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "Cash") {
      onAdd({
        donorName,
        donationType: "Cash",
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
        status,
      });
    } else {
      onAdd({
        donorName,
        donationType: "In-Kind",
        itemName,
        category,
        quantity: Number(quantity),
        unit,
        estimatedValue: Number(amount) || undefined,
        notes: notes || undefined,
        status,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add Donation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {(["Cash", "In-Kind"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  tab === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {t === "Cash" ? "💵 Cash Donation" : "📦 In-Kind Donation"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Donor Name *</label>
              <input
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter donor name"
              />
            </div>
            {tab === "Cash" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount ($) *</label>
                  <input
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Cash</option>
                    <option>EVC Plus</option>
                    <option>Bank</option>
                  </select>
                </div>
                {paymentMethod !== "Cash" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Reference Number</label>
                    <input
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="e.g., EVC-12345"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="e.g., Rice, Oil"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <input
                      required
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit *</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {units.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "Completed" | "Pending" | "Cancelled")} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Completed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                Add Donation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ViewDonationModal({
  donation,
  onClose,
}: {
  donation: Donation;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Donation Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Receipt</p>
              <p className="font-mono text-sm font-medium">{donation.receipt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge status={donation.status} />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Donor Name</p>
              <p className="text-sm font-medium">{donation.donorName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Donation Type</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${donation.donationType === "Cash" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                {donation.donationType}
              </span>
            </div>
            {donation.donationType === "Cash" ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="text-sm font-bold text-green-700">${donation.amount?.toLocaleString()}</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Item</p>
                  <p className="text-sm font-medium">{donation.itemName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="text-sm">{donation.quantity} {donation.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm">{donation.category}</p>
                </div>
              </>
            )}
            {donation.paymentMethod && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm">{donation.paymentMethod}</p>
              </div>
            )}
            {donation.referenceNumber && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                <p className="text-sm font-mono">{donation.referenceNumber}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm">{donation.date}</p>
            </div>
            {donation.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{donation.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t">
          <button onClick={onClose} className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDonationModal({
  donation,
  tab,
  setTab,
  onSave,
  onClose,
}: {
  donation: Donation;
  tab: "Cash" | "In-Kind";
  setTab: (t: "Cash" | "In-Kind") => void;
  onSave: (d: Donation) => void;
  onClose: () => void;
}) {
  const [donorName, setDonorName] = useState(donation.donorName);
  const [amount, setAmount] = useState(String(donation.amount ?? donation.estimatedValue ?? ""));
  const [itemName, setItemName] = useState(donation.itemName ?? "");
  const [category, setCategory] = useState(donation.category ?? "Rice");
  const [quantity, setQuantity] = useState(String(donation.quantity ?? ""));
  const [unit, setUnit] = useState(donation.unit ?? "kg");
  const [paymentMethod, setPaymentMethod] = useState(donation.paymentMethod ?? "Cash");
  const [referenceNumber, setReferenceNumber] = useState(donation.referenceNumber ?? "");
  const [notes, setNotes] = useState(donation.notes ?? "");
  const [status, setStatus] = useState(donation.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...donation,
      donorName,
      donationType: tab,
      amount: tab === "Cash" ? Number(amount) : undefined,
      itemName: tab === "In-Kind" ? itemName : undefined,
      category: tab === "In-Kind" ? category : undefined,
      quantity: tab === "In-Kind" ? Number(quantity) : undefined,
      unit: tab === "In-Kind" ? unit : undefined,
      estimatedValue: tab === "In-Kind" ? Number(amount) || undefined : undefined,
      paymentMethod: tab === "Cash" ? paymentMethod : undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
      status,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Edit Donation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {(["Cash", "In-Kind"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  tab === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {t === "Cash" ? "💵 Cash" : "📦 In-Kind"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Donor Name *</label>
              <input required value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            {tab === "Cash" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount ($) *</label>
                  <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Cash</option>
                    <option>EVC Plus</option>
                    <option>Bank</option>
                  </select>
                </div>
                {paymentMethod !== "Cash" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Reference Number</label>
                    <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <input required type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" min="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit *</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {units.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" min="0" step="0.01" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "Completed" | "Pending" | "Cancelled")} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Completed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DeleteDonationModal({
  donation,
  onDelete,
  onClose,
}: {
  donation: Donation;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-center mb-2">Delete Donation?</h3>
          <p className="text-gray-600 text-center text-sm">
            Are you sure you want to delete <strong>{donation.receipt}</strong> from <strong>{donation.donorName}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}