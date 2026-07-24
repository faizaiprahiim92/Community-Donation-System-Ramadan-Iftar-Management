"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import PasswordInput from "@/components/ui/PasswordInput";

/* ── Data ──────────────────────────────────────────── */

const features = [
  { label: "Users Management", icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
  { label: "Donation Management", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" },
  { label: "Expense Management", icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Daily Reports", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
  { label: "Task Management", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Gallery", icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" },
  { label: "Messages", icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" },
  { label: "Role Based Access", icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
  { label: "Dashboard Analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
];

const team = [
  { name: "Usama Hassan Abdi", role: "Manager", photo: "/uploads/photos/Usama.jpg" },
  { name: "Ilhaam Omar Farah", role: "Leader", photo: "/uploads/photos/Ilhaam.jpg" },
  { name: "Faiza Ibrahiim Abdullahi", role: "Volunteer", photo: "/uploads/photos/Faiza.jpg" },
  { name: "Nasteha Mohamed Hassan", role: "Volunteer", photo: "/uploads/photos/Nasteha.jpg" },
  { name: "Sawda Mohamed Omar", role: "Volunteer", photo: "/uploads/photos/Sawda.jpg" },
];

const techStack = [
  { category: "Frontend", items: ["Next.js 16", "React", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", items: ["FastAPI", "Python", "SQLAlchemy"] },
  { category: "Authentication", items: ["JWT", "bcrypt"] },
  { category: "Database", items: ["SQLite"] },
  { category: "Tools", items: ["Visual Studio Code", "Git", "GitHub"] },
];

const campaignResults = [
  { label: "People Served", value: "100" },
  { label: "Meals Prepared", value: "100" },
  { label: "Campaign Days", value: "5" },
  { label: "Videos", value: "5" },
];

/* ── About Modal ───────────────────────────────────── */

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[5vh] backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header — always visible */}
        <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-green-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">About Us</h2>
            <p className="text-xs text-gray-400">Project Information</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-6 space-y-8">
          {/* Project Info */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-200">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Community Donation System</h3>
            <p className="mt-1 text-sm font-medium text-gold-600">Ramadan Iftar Management System</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
              Community Donation System is a web-based application developed to manage Ramadan Iftar campaigns.
              The system helps organizations manage team members, donations, expenses, daily reports,
              tasks, gallery, messages, and campaign statistics.
            </p>
          </div>

          {/* Project Duration & Campaign Results */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700">Project Duration</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Start Date</span><span className="font-medium text-gray-800">15 March 2026</span></div>
                <div className="flex justify-between"><span>End Date</span><span className="font-medium text-gray-800">19 March 2026</span></div>
                <div className="flex justify-between"><span>Total Duration</span><span className="font-medium text-gray-800">5 Days</span></div>
                <div className="flex justify-between border-t border-green-200 pt-2"><span>Status</span><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Completed Successfully</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700">Campaign Results</h4>
              <div className="grid grid-cols-2 gap-3">
                {campaignResults.map((r) => (
                  <div key={r.label} className="text-center">
                    <p className="text-2xl font-bold text-green-700">{r.value}</p>
                    <p className="text-[11px] text-gray-500">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700">Technologies</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {techStack.map((t) => (
                <div key={t.category} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="mb-1.5 text-xs font-bold text-gray-700">{t.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.items.map((item) => (
                      <span key={item} className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700">System Features</h4>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                  <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700">Project Team</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50">
                  <img src={m.photo} alt={m.name} className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-[11px] font-medium text-gray-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Future Use */}
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-700">Future Use</h4>
            <p className="text-sm leading-relaxed text-gray-600">
              This system was developed to manage a five-day Ramadan Iftar campaign held from 15 March to 19 March 2026.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              The application is designed to be reusable for future Ramadan campaigns. Administrators can update donations, expenses, team members, reports, tasks, and media without modifying the system architecture.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-xs text-gray-400">Developed for the Ramadan Iftar Campaign &middot; 15&ndash;19 March 2026</p>
          <p className="mt-0.5 text-xs font-medium text-green-600">Community Donation System</p>
        </div>
      </div>
    </div>
  );
}

/* ── Login Page (Landing) ─────────────────────────── */

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    try {
      await login(username, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-gold-50">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold-100/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-green-200/20 blur-3xl" />
      </div>

      {/* Top nav */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-green-800">CDS</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAbout(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-green-700 shadow-sm backdrop-blur-sm transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-800 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          About Us
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center px-6 pb-12 pt-4 sm:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* ── Left: Hero ── */}
          <div className="space-y-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700">Ramadan Iftar Campaign 2026</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-green-950 sm:text-5xl lg:text-6xl">
                Community
                <br />
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Donation System</span>
              </h1>
              <p className="mt-2 text-lg font-medium text-gold-600">Ramadan Iftar Management</p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
                Manage donations, expenses, volunteers, reports, and Ramadan campaign
                activities in one secure platform.
              </p>
            </div>

            {/* Feature icons */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[
                { icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z", label: "Donations" },
                { icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", label: "Expenses" },
                { icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z", label: "Volunteers" },
                { icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z", label: "Gallery" },
                { icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z", label: "Analytics" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-green-100/80 bg-white/60 p-3 text-center backdrop-blur-sm transition-all hover:bg-white hover:shadow-md hover:shadow-green-100/50">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                  <span className="text-[10px] font-semibold text-gray-600">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
              {[
                { value: "100", label: "People Served" },
                { value: "$100", label: "Donations" },
                { value: "5", label: "Campaign Days" },
                { value: "5", label: "Team Members" },
                { value: "5", label: "Videos" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-extrabold text-green-700 sm:text-2xl">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-gray-400 sm:text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-green-100/80 bg-white/90 p-8 shadow-xl shadow-green-900/5 backdrop-blur-sm sm:p-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-200">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="Enter your username"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-xs font-medium text-green-600 transition-colors hover:text-green-700">
                      Forgot password?
                    </a>
                  </div>
                  <PasswordInput id="password" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200/50 transition-all hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-200/60 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[11px] text-gray-400">Developed for the Ramadan Iftar Campaign &middot; 15&ndash;19 March 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
