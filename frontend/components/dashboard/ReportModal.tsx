"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Badge from "./Badge";
import type { DailyReport } from "@/lib/mock-data";
import { getLocations, addLocation } from "@/lib/locations";

function LocationInput({
  value,
  onChange,
  existingLocations,
}: {
  value: string;
  onChange: (val: string) => void;
  existingLocations: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allLocations = useMemo(() => {
    const saved = getLocations();
    return [...new Set([...saved, ...existingLocations])].sort();
  }, [existingLocations, open]);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase();
    return q ? allLocations.filter((l) => l.toLowerCase().includes(q)) : allLocations;
  }, [query, allLocations]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        placeholder="Select or type a location"
        className={inputClass}
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            suggestions.map((l) => (
              <button
                key={l}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(l);
                  addLocation(l);
                  setQuery("");
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 cursor-pointer ${
                  l === value ? "bg-green-50 font-medium text-green-700" : "text-gray-900"
                }`}
              >
                {l}
              </button>
            ))
          ) : query ? (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addLocation(query);
                onChange(query);
                setQuery("");
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 cursor-pointer"
            >
              Add &quot;{query}&quot;
            </button>
          ) : (
            <div className="px-4 py-2.5 text-sm text-gray-500">
              Type to add a new location
            </div>
          )}
        </div>
      )}
    </div>
  );
}
const weatherOptions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Hot", "Windy"];
const statusOptions: DailyReport["status"][] = ["Completed", "Pending", "In Progress"];

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100";

export function AddReportModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (r: Omit<DailyReport, "id">) => void;
}) {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState(getLocations()[0]);
  const [peopleServed, setPeopleServed] = useState("0");
  const [mealsPrepared, setMealsPrepared] = useState("0");
  const [mealsRemaining, setMealsRemaining] = useState("0");
  const [foodMenu, setFoodMenu] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [volunteersCount, setVolunteersCount] = useState("0");
  const [weather, setWeather] = useState("Sunny");
  const [startTime, setStartTime] = useState("5:00 PM");
  const [endTime, setEndTime] = useState("8:00 PM");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<DailyReport["status"]>("Pending");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location,
      peopleServed: Number(peopleServed),
      mealsPrepared: Number(mealsPrepared),
      mealsRemaining: Number(mealsRemaining),
      foodMenu,
      teamLeader,
      volunteersCount: Number(volunteersCount),
      weather,
      startTime,
      endTime,
      notes: notes || undefined,
      photos: [],
      videos: [],
      status,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Add Daily Report</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Report Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                  <LocationInput value={location} onChange={setLocation} existingLocations={[]} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">People Served *</label>
                  <input required type="number" min="0" value={peopleServed} onChange={(e) => setPeopleServed(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Meals Prepared *</label>
                  <input required type="number" min="0" value={mealsPrepared} onChange={(e) => setMealsPrepared(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Meals Remaining</label>
                  <input type="number" min="0" value={mealsRemaining} onChange={(e) => setMealsRemaining(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Food Menu *</label>
                <input required value={foodMenu} onChange={(e) => setFoodMenu(e.target.value)} placeholder="e.g., Rice, Chicken, Dates, Water" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Team Leader *</label>
                  <input required value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} placeholder="Enter team leader name" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Volunteers Count *</label>
                  <input required type="number" min="0" value={volunteersCount} onChange={(e) => setVolunteersCount(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Weather</label>
                  <select value={weather} onChange={(e) => setWeather(e.target.value)} className={inputClass}>
                    {weatherOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                  <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="5:00 PM" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                  <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="8:00 PM" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">General Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional notes..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Upload Photos</label>
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 transition-colors hover:border-green-400 cursor-pointer">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-500">Click to upload photos</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Upload Videos</label>
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 transition-colors hover:border-green-400 cursor-pointer">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-500">Click to upload videos</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as DailyReport["status"])} className={inputClass}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-green-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 cursor-pointer">
              Save Report
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

export function ViewReportModal({
  report,
  onClose,
}: {
  report: DailyReport;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Report Details</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Report Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Date", value: report.date },
                  { label: "Location", value: report.location },
                  { label: "Team Leader", value: report.teamLeader },
                  { label: "Weather", value: report.weather },
                  { label: "Start Time", value: report.startTime },
                  { label: "End Time", value: report.endTime },
                  { label: "Volunteers", value: String(report.volunteersCount) },
                  { label: "Status", value: report.status, badge: true },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    {item.badge ? (
                      <Badge status={item.value} dot />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Food Summary</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{report.peopleServed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">People Served</p>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{report.mealsPrepared.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Meals Prepared</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{report.mealsRemaining}</p>
                  <p className="text-xs text-gray-500">Meals Remaining</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Food Menu</p>
                <p className="text-sm font-medium text-gray-900">{report.foodMenu}</p>
              </div>
            </div>

            {report.photos.length > 0 && (
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Photo Preview</h4>
                <div className="grid grid-cols-3 gap-2">
                  {report.photos.map((p) => (
                    <div key={p} className="aspect-square rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">{report.photos.length} photo(s)</p>
              </div>
            )}

            {report.videos.length > 0 && (
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Video Preview</h4>
                <div className="grid grid-cols-2 gap-2">
                  {report.videos.map((v) => (
                    <div key={v} className="aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">{report.videos.length} video(s)</p>
              </div>
            )}

            {report.notes && (
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Notes</h4>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-700">{report.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-green-50 px-6 py-4">
          <button type="button" onClick={onClose} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

export function EditReportModal({
  report,
  onClose,
  onSave,
}: {
  report: DailyReport;
  onClose: () => void;
  onSave: (r: DailyReport) => void;
}) {
  const [date, setDate] = useState(report.date);
  const [location, setLocation] = useState(report.location);
  const [peopleServed, setPeopleServed] = useState(String(report.peopleServed));
  const [mealsPrepared, setMealsPrepared] = useState(String(report.mealsPrepared));
  const [mealsRemaining, setMealsRemaining] = useState(String(report.mealsRemaining));
  const [foodMenu, setFoodMenu] = useState(report.foodMenu);
  const [teamLeader, setTeamLeader] = useState(report.teamLeader);
  const [volunteersCount, setVolunteersCount] = useState(String(report.volunteersCount));
  const [weather, setWeather] = useState(report.weather);
  const [startTime, setStartTime] = useState(report.startTime);
  const [endTime, setEndTime] = useState(report.endTime);
  const [notes, setNotes] = useState(report.notes ?? "");
  const [status, setStatus] = useState<DailyReport["status"]>(report.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...report,
      date,
      location,
      peopleServed: Number(peopleServed),
      mealsPrepared: Number(mealsPrepared),
      mealsRemaining: Number(mealsRemaining),
      foodMenu,
      teamLeader,
      volunteersCount: Number(volunteersCount),
      weather,
      startTime,
      endTime,
      notes: notes || undefined,
      status,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-green-50/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Report</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Report Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                  <LocationInput value={location} onChange={setLocation} existingLocations={[]} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">People Served *</label>
                  <input required type="number" min="0" value={peopleServed} onChange={(e) => setPeopleServed(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Meals Prepared *</label>
                  <input required type="number" min="0" value={mealsPrepared} onChange={(e) => setMealsPrepared(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Meals Remaining</label>
                  <input type="number" min="0" value={mealsRemaining} onChange={(e) => setMealsRemaining(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Food Menu *</label>
                <input required value={foodMenu} onChange={(e) => setFoodMenu(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Team Leader *</label>
                  <input required value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Volunteers Count *</label>
                  <input required type="number" min="0" value={volunteersCount} onChange={(e) => setVolunteersCount(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Weather</label>
                  <select value={weather} onChange={(e) => setWeather(e.target.value)} className={inputClass}>
                    {weatherOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                  <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                  <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">General Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as DailyReport["status"])} className={inputClass}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
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

export function DeleteReportModal({
  report,
  onClose,
  onDelete,
}: {
  report: DailyReport;
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
          <h3 className="text-lg font-bold text-gray-900">Delete Report?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete the report for{" "}
            <span className="font-semibold text-gray-700">{report.date}</span> at{" "}
            <span className="font-semibold text-gray-700">{report.location}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-red-50 px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={onDelete} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200/50 transition-all hover:bg-red-600 cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
