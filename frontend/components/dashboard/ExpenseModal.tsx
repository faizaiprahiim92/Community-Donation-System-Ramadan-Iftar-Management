"use client";

import { useState } from "react";
import Badge from "./Badge";
import type { Expense } from "@/lib/mock-data";

const categoryOptions: Expense["category"][] = [
  "Food",
  "Transport",
  "Packaging",
  "Water",
  "Cooking",
  "Other",
];
const unitOptions = [
  "kg",
  "liters",
  "bottles",
  "pieces",
  "bags",
  "trips",
  "tanks",
  "sets",
  "trip",
  "day",
  "days",
  "fill-up",
  "lot",
];
const paymentOptions: Expense["paymentMethod"][] = ["Cash", "EVC Plus", "Bank"];

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100";

export function AddExpenseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: Omit<Expense, "id" | "receipt" | "date">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Food");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Expense["paymentMethod"]>("Cash");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Expense["status"]>("Pending");

  const total = Number(quantity) * Number(unitPrice || 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      name,
      category,
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
      totalCost: total,
      paidBy,
      paymentMethod,
      receiptNumber: receiptNumber || undefined,
      notes: notes || undefined,
      status,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Expense Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter expense name"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Expense["category"])}
                    className={inputClass}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={inputClass}
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Unit Price ($) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-green-50/50 px-4 py-3">
                <p className="text-xs text-gray-500">Auto Calculated Total</p>
                <p className="text-lg font-bold text-green-700">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Paid By *
                  </label>
                  <input
                    required
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="Enter name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Expense["paymentMethod"])}
                    className={inputClass}
                  >
                    {paymentOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Receipt Number
                </label>
                <input
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="e.g., CASH-12345"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  className={inputClass}
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional notes..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Upload Receipt
                </label>
                <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center transition-colors hover:border-green-400 cursor-pointer">
                  <div className="mx-auto">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-500">
                      Click to upload receipt image
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Expense["status"])}
                  className={inputClass}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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
              type="submit"
              className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function ViewExpenseModal({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Expense Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-3">
            {[
              { label: "Receipt", value: expense.receipt, mono: true },
              { label: "Expense Name", value: expense.name },
              { label: "Category", value: expense.category, badge: true },
              { label: "Quantity", value: `${expense.quantity} ${expense.unit}` },
              { label: "Unit Price", value: `$${expense.unitPrice.toFixed(2)}` },
              { label: "Total Cost", value: `$${expense.totalCost.toLocaleString()}`, bold: true },
              { label: "Paid By", value: expense.paidBy },
              { label: "Payment Method", value: expense.paymentMethod },
              { label: "Receipt Number", value: expense.receiptNumber || "-", mono: !!expense.receiptNumber },
              { label: "Date", value: expense.date },
              { label: "Status", value: expense.status, dotBadge: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <span className="text-sm text-gray-500">{item.label}</span>
                {item.badge ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    {item.value}
                  </span>
                ) : item.dotBadge ? (
                  <Badge status={item.value} dot />
                ) : (
                  <span
                    className={`text-sm ${item.bold ? "font-bold text-green-700" : "font-medium text-gray-900"} ${item.mono ? "font-mono" : ""}`}
                  >
                    {item.value}
                  </span>
                )}
              </div>
            ))}
            {expense.notes && (
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{expense.notes}</p>
              </div>
            )}
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

export function EditExpenseModal({
  expense,
  onClose,
  onSave,
}: {
  expense: Expense;
  onClose: () => void;
  onSave: (e: Expense) => void;
}) {
  const [name, setName] = useState(expense.name);
  const [category, setCategory] = useState<Expense["category"]>(expense.category);
  const [quantity, setQuantity] = useState(String(expense.quantity));
  const [unit, setUnit] = useState(expense.unit);
  const [unitPrice, setUnitPrice] = useState(String(expense.unitPrice));
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [paymentMethod, setPaymentMethod] = useState<Expense["paymentMethod"]>(expense.paymentMethod);
  const [receiptNumber, setReceiptNumber] = useState(expense.receiptNumber ?? "");
  const [notes, setNotes] = useState(expense.notes ?? "");
  const [status, setStatus] = useState<Expense["status"]>(expense.status);

  const total = Number(quantity) * Number(unitPrice || 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...expense,
      name,
      category,
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
      totalCost: total,
      paidBy,
      paymentMethod,
      receiptNumber: receiptNumber || undefined,
      notes: notes || undefined,
      status,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Expense</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Expense Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"])} className={inputClass}>
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quantity *</label>
                  <input required type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Unit *</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}>
                    {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Unit Price ($) *</label>
                  <input required type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="rounded-xl bg-green-50/50 px-4 py-3">
                <p className="text-xs text-gray-500">Auto Calculated Total</p>
                <p className="text-lg font-bold text-green-700">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Paid By *</label>
                  <input required value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as Expense["paymentMethod"])} className={inputClass}>
                    {paymentOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Receipt Number</label>
                <input value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Expense["status"])} className={inputClass}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function DeleteExpenseModal({
  expense,
  onClose,
  onDelete,
}: {
  expense: Expense;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-red-100/80 bg-white shadow-2xl">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Expense?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">{expense.receipt}</span> -{" "}
            <span className="font-semibold text-gray-700">{expense.name}</span>?
            This action cannot be undone.
          </p>
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
            onClick={onDelete}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200/50 transition-all hover:bg-red-600 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
