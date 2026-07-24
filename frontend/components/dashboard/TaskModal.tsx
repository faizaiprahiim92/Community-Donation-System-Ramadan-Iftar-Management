"use client";

import { useState } from "react";
import PriorityBadge from "./PriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import type { Task } from "@/lib/mock-data";

const people = [
  "Ahmed Hassan",
  "Fatima Ali",
  "Omar Mohamed",
  "Amina Yusuf",
  "Sara Ibrahim",
  "Khalid Osman",
  "Hassan Abdi",
  "Abdirahman Ali",
  "Maryam Said",
];
const roleMap: Record<string, Task["role"]> = {
  "Ahmed Hassan": "Manager",
  "Fatima Ali": "Leader",
  "Omar Mohamed": "Volunteer",
  "Amina Yusuf": "Leader",
  "Sara Ibrahim": "Volunteer",
  "Khalid Osman": "Manager",
  "Hassan Abdi": "Volunteer",
  "Abdirahman Ali": "Volunteer",
  "Maryam Said": "Volunteer",
};
const priorities: Task["priority"][] = ["Low", "Medium", "High"];
const statuses: Task["status"][] = ["Pending", "In Progress", "Completed"];

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

export function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (t: Omit<Task, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(people[0]);
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Task["status"]>("Pending");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      name,
      description,
      assignedTo,
      assignedToId: 0,
      role: roleMap[assignedTo] || "Volunteer",
      priority,
      startDate: startDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dueDate: dueDate || startDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status,
      notes: notes || undefined,
      progress: status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Add Task</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Task Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter task name" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the task..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Assign To *</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputClass}>
                    {people.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                  <input value={roleMap[assignedTo] || "Volunteer"} readOnly className={`${inputClass} bg-gray-100`} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority *</label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                      priority === p
                        ? p === "High" ? "bg-red-500 text-white shadow-lg shadow-red-200" : p === "Medium" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Due Date *</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])} className={inputClass}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." className={inputClass} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer">Save Task</button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function ViewTaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Task Name</p>
              <p className="text-sm font-bold text-gray-900">{task.name}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-[10px] font-bold text-white">
                    {task.assignedTo.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{task.assignedTo}</span>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <span className="text-sm font-medium text-gray-900">{task.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <TaskStatusBadge status={task.status} />
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${task.progress === 100 ? "bg-green-500" : task.progress > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-800">{task.progress}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900">{task.startDate}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{task.dueDate}</p>
              </div>
            </div>
            {task.notes && (
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{task.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-green-50 px-6 py-4">
          <button type="button" onClick={onClose} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Close</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

export function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (t: Task) => void;
}) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);
  const [startDate, setStartDate] = useState(task.startDate);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [status, setStatus] = useState<Task["status"]>(task.status);
  const [notes, setNotes] = useState(task.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...task,
      name,
      description,
      assignedTo,
      role: roleMap[assignedTo] || "Volunteer",
      priority,
      startDate,
      dueDate,
      status,
      notes: notes || undefined,
      progress: status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Task</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Task Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Assign To *</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputClass}>
                    {people.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                  <input value={roleMap[assignedTo] || "Volunteer"} readOnly className={`${inputClass} bg-gray-100`} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority *</label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                      priority === p
                        ? p === "High" ? "bg-red-500 text-white shadow-lg shadow-red-200" : p === "Medium" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Due Date *</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])} className={inputClass}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
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

export function DeleteTaskModal({
  task,
  onClose,
  onDelete,
}: {
  task: Task;
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
          <h3 className="text-lg font-bold text-gray-900">Delete Task?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-700">{task.name}</span>? This action cannot be undone.
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
