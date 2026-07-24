"use client";

import PageHeader from "@/components/dashboard/PageHeader";

const features = [
  { label: "Users Management", icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
  { label: "Donation Management", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" },
  { label: "Expense Management", icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Daily Reports", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
  { label: "Task Management", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Gallery", icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" },
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

const objectives = [
  "Streamline Ramadan Iftar campaign operations",
  "Track donations and expenses transparently",
  "Coordinate volunteers and team roles",
  "Generate daily reports and monitor progress",
  "Manage tasks and gallery media",
  "Provide role-based access for secure data management",
];

const futureUse = [
  "Reusable for future Ramadan campaigns",
  "Easy data updates without code changes",
  "Scalable architecture for larger community programs",
  "Multi-campaign support for year-round events",
];

export default function AboutUsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="About Us"
        subtitle="Project information and team details"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "About Us" },
        ]}
      />

      {/* Project Overview */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-200">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Community Donation System</h2>
          <p className="mt-1 text-sm font-medium text-gold-600">Ramadan Iftar Management System</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            Community Donation System is a web-based application developed to manage Ramadan Iftar campaigns.
            The system helps organizations manage team members, donations, expenses, daily reports,
            tasks, gallery, and campaign statistics.
          </p>
        </div>
      </div>

      {/* Project Duration & Campaign Results */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Project Duration</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between"><span>Start Date</span><span className="font-medium text-gray-800">15 March 2026</span></div>
            <div className="flex justify-between"><span>End Date</span><span className="font-medium text-gray-800">19 March 2026</span></div>
            <div className="flex justify-between"><span>Total Duration</span><span className="font-medium text-gray-800">5 Days</span></div>
            <div className="flex justify-between border-t border-green-100 pt-3"><span>Status</span><span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Completed Successfully</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Campaign Results</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "People Served", value: "100" },
              { label: "Meals Prepared", value: "100" },
              { label: "Campaign Days", value: "5" },
              { label: "Videos", value: "5" },
            ].map((r) => (
              <div key={r.label} className="text-center">
                <p className="text-2xl font-bold text-green-700">{r.value}</p>
                <p className="text-[11px] text-gray-500">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Technologies</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {techStack.map((t) => (
            <div key={t.category} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <p className="mb-2 text-xs font-bold text-gray-700">{t.category}</p>
              <div className="flex flex-wrap gap-1">
                {t.items.map((item) => (
                  <span key={item} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">System Features</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
              <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
              <span className="text-xs font-medium text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Project Team</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:p-4 lg:p-5 transition-colors hover:bg-gray-50">
              <img src={m.photo} alt={m.name} className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{m.name}</p>
                <p className="text-[11px] font-medium text-gray-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objectives */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Project Objectives</h3>
        <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4 sm:grid-cols-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-gray-50/50 px-3 py-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-sm text-gray-600">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future Use */}
      <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Future Use</h3>
        <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4 sm:grid-cols-2">
          {futureUse.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-green-50/50 px-3 py-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-green-50/80 bg-white px-4 py-4 sm:px-6 sm:py-6 text-center shadow-sm">
        <p className="text-xs text-gray-400">Developed for the Ramadan Iftar Campaign &middot; 15&ndash;19 March 2026</p>
        <p className="mt-1 text-xs font-medium text-green-600">Community Donation System</p>
      </div>
    </div>
  );
}
