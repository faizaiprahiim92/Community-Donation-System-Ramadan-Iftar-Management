"use client";

import { useState } from "react";
import { users } from "@/lib/mock-data";

export default function RecipientSelector({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const roles = ["All", "Manager", "Leader", "Volunteer"];
  const filtered = roleFilter === "All" ? users : users.filter((u) => u.role === roleFilter);

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function selectAll() {
    onChange(filtered.map((u) => u.id));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <span className="text-xs font-semibold text-gray-700">Select Recipients</span>
        <div className="flex gap-1">
          <button type="button" onClick={selectAll} className="rounded px-2 py-0.5 text-[10px] font-medium text-green-600 hover:bg-green-50 cursor-pointer">
            All
          </button>
          <button type="button" onClick={clearAll} className="rounded px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 cursor-pointer">
            Clear
          </button>
        </div>
      </div>
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(role)}
            className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all cursor-pointer ${
              roleFilter === role
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="max-h-48 overflow-y-auto px-2 py-2">
        {filtered.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => toggle(user.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
              selected.includes(user.id) ? "bg-green-50" : "hover:bg-gray-100"
            }`}
          >
            <div className={`relative h-7 w-7 shrink-0 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center`}>
              <span className="text-[9px] font-bold text-white">{user.initials}</span>
              {selected.includes(user.id) && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 flex items-center justify-center">
                  <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.fullName}</p>
              <p className="text-[10px] text-gray-400">{user.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
