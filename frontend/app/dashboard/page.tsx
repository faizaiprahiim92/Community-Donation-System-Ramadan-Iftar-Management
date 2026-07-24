"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import GalleryPreview from "@/components/dashboard/GalleryPreview";
import PageHeader from "@/components/dashboard/PageHeader";
import { donationsService, type Donation } from "@/lib/services/donations";
import { expensesService, type Expense } from "@/lib/services/expenses";
import { tasksService, type Task } from "@/lib/services/tasks";
import { reportsService } from "@/lib/services/reports";
import { galleryService } from "@/lib/services/gallery";
import { usersService } from "@/lib/services/users";
import { fetchMessages } from "@/lib/services/messages";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: string; description: string; icon: string }[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ date: string; activity: string; user: string; status: string }[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: number; title: string; description: string; date: string; type: string }[]>([]);
  const [galleryImages, setGalleryImages] = useState<{ id: number; alt: string; color: string; url?: string; type?: string }[]>([]);
  const [campaignData, setCampaignData] = useState({ peopleServed: 0, mealsPrepared: 0, mealsRemaining: 0, campaignDays: 0 });
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myActivities, setMyActivities] = useState<{ date: string; activity: string; user: string; status: string }[]>([]);

  const isVolunteer = user?.role === "Volunteer";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [donStats, expStats, repStats, galStats] = await Promise.all([
          donationsService.stats(),
          expensesService.stats(),
          reportsService.stats(),
          galleryService.stats(),
        ]);

        if (cancelled) return;

        const balance = donStats.totalAmount - expStats.totalCost;

        if (isVolunteer) {
          setStats([
            { label: "Total Donations", value: `$${donStats.totalAmount.toLocaleString()}`, description: "Across all campaigns", icon: "donation" },
            { label: "Total Expenses", value: `$${expStats.totalCost.toLocaleString()}`, description: "Food & logistics", icon: "expense" },
            { label: "People Served", value: repStats.totalPeopleServed.toLocaleString(), description: "Community members", icon: "people" },
            { label: "Campaign Days", value: repStats.campaignDays.toLocaleString(), description: "Active campaign days", icon: "campaign" },
            { label: "Total Videos", value: galStats.videos.toLocaleString(), description: "Gallery media files", icon: "video" },
          ]);
        } else {
          let usrStats = { total: 0 };
          try { usrStats = await usersService.stats(); } catch { /* */ }
          setStats([
            { label: "Total Donations", value: `$${donStats.totalAmount.toLocaleString()}`, description: "Across all campaigns", icon: "donation" },
            { label: "Total Expenses", value: `$${expStats.totalCost.toLocaleString()}`, description: "Food & logistics", icon: "expense" },
            { label: "Remaining Balance", value: `$${balance.toLocaleString()}`, description: "Available funds", icon: "balance" },
            { label: "People Served", value: repStats.totalPeopleServed.toLocaleString(), description: "Community members", icon: "people" },
            { label: "Campaign Days", value: repStats.campaignDays.toLocaleString(), description: "Active campaign days", icon: "campaign" },
            { label: "Total Videos", value: galStats.videos.toLocaleString(), description: "Gallery media files", icon: "video" },
            { label: "Team Members", value: usrStats.total.toLocaleString(), description: "Active team members", icon: "team" },
          ]);
        }

        setCampaignData({
          peopleServed: repStats.totalPeopleServed,
          mealsPrepared: repStats.totalMealsPrepared,
          mealsRemaining: 0,
          campaignDays: repStats.campaignDays,
        });

        const [donations, expenses, tasks, reports, gallery, messages] = await Promise.all([
          donationsService.list(),
          expensesService.list(),
          tasksService.list(),
          reportsService.list(),
          galleryService.list(),
          fetchMessages({}),
        ]);

        if (cancelled) return;

        setRecentDonations(donations.slice(0, 5));
        setRecentExpenses(expenses.slice(0, 5));

        if (isVolunteer && user) {
          const myTaskList = tasks.filter((t) => t.assignedToId === user.id);
          setMyTasks(myTaskList.slice(0, 5));

          const myActs: { date: string; activity: string; user: string; status: string }[] = [];
          donations.filter((d) => d.status === "Completed").slice(0, 2).forEach((d) => {
            myActs.push({ date: d.date, activity: `Donation received - $${d.amount || 0} from ${d.donorName}`, user: user.full_name, status: "completed" });
          });
          myTaskList.slice(0, 3).forEach((t) => {
            myActs.push({ date: t.startDate, activity: t.name, user: user.full_name, status: t.status === "Completed" ? "completed" : "in_progress" });
          });
          reports.slice(0, 2).forEach((r) => {
            myActs.push({ date: r.date, activity: `Daily report - ${r.peopleServed} people served`, user: r.teamLeader, status: "completed" });
          });
          setMyActivities(myActs.slice(0, 10));
        } else {
          const activities: { date: string; activity: string; user: string; status: string }[] = [];
          donations.slice(0, 3).forEach((d) => {
            activities.push({ date: d.date, activity: `Donation received - $${d.amount || 0} from ${d.donorName}`, user: "System", status: "completed" });
          });
          expenses.slice(0, 3).forEach((e) => {
            activities.push({ date: e.date, activity: `Expense added - ${e.name} ($${e.totalCost})`, user: e.paidBy, status: "completed" });
          });
          tasks.slice(0, 2).forEach((t) => {
            activities.push({ date: t.startDate, activity: `Task - ${t.name}`, user: t.assignedTo, status: t.status === "Completed" ? "completed" : "in_progress" });
          });
          reports.slice(0, 2).forEach((r) => {
            activities.push({ date: r.date, activity: `Daily report - ${r.peopleServed} people served`, user: r.teamLeader, status: "completed" });
          });
          setRecentActivities(activities.slice(0, 10));
        }

        setAnnouncements(messages.filter((m) => m.isAnnouncement).slice(0, 3).map((m) => ({
          id: m.id,
          title: m.subject,
          description: m.content,
          date: m.date,
          type: "info",
        })));

        setGalleryImages(gallery.slice(0, 6).map((g) => ({
          id: g.id,
          alt: g.title,
          color: g.color || "bg-green-200",
          url: g.videoUrl,
          type: g.type,
        })));
      } catch {
        // API may be down, show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isVolunteer, user]);

  const displayName = user?.full_name || "User";
  const userRole = user?.role || "Volunteer";

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" breadcrumb={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
      />

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-green-100/80 bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-4 sm:p-6 lg:p-8 text-white shadow-lg shadow-green-200/50">
        <p className="text-xs sm:text-sm font-medium text-green-200">Ramadan Mubarak</p>
        <h2 className="mt-1 text-lg sm:text-xl lg:text-2xl font-bold">Welcome back, {displayName}</h2>
        <p className="mt-1 text-xs sm:text-sm text-green-200/80">Here&apos;s what&apos;s happening with your donation campaigns today.</p>
      </div>

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isVolunteer ? "xl:grid-cols-5" : "xl:grid-cols-7"}`}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} change="" trend="up" />
        ))}
      </div>

      {isVolunteer ? (
        /* =============================================
           VOLUNTEER DASHBOARD
           ============================================= */
        <>
          {/* Campaign Summary */}
          <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-sm font-bold text-gray-900">Campaign Summary</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Total Donations", value: `$${campaignData.mealsPrepared > 0 ? campaignData.mealsPrepared.toLocaleString() : "0"}`, icon: "donation", color: "bg-green-50 text-green-600" },
                { label: "Total Expenses", value: `$${campaignData.mealsRemaining.toLocaleString()}`, icon: "expense", color: "bg-red-50 text-red-600" },
                { label: "People Served", value: campaignData.peopleServed.toLocaleString(), icon: "people", color: "bg-blue-50 text-blue-600" },
                { label: "Campaign Days", value: campaignData.campaignDays.toLocaleString(), icon: "campaign", color: "bg-green-50 text-green-600" },
                { label: "Videos", value: galleryImages.filter((g) => g.type === "Video").length.toString(), icon: "video", color: "bg-purple-50 text-purple-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 sm:gap-3 rounded-xl bg-gray-50 p-2 sm:p-3">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={
                        item.icon === "donation" ? "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" :
                        item.icon === "expense" ? "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" :
                        item.icon === "people" ? "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" :
                        item.icon === "campaign" ? "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" :
                        "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      } />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Assigned Tasks */}
          {myTasks.length > 0 && (
            <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">My Assigned Tasks</h3>
                <Link href="/dashboard/tasks" className="text-xs font-semibold text-green-600 hover:text-green-700">View All</Link>
              </div>
              <div className="space-y-2">
                {myTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400">Due: {t.dueDate}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] font-semibold ${
                        t.priority === "High" ? "bg-red-50 text-red-700" : t.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                      }`}>{t.priority}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        t.status === "Completed" ? "bg-green-50 text-green-700" : t.status === "In Progress" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      }`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Recent Activities */}
          {myActivities.length > 0 && (
            <ActivityTable activities={myActivities} />
          )}

          {/* Announcements & Gallery */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <AnnouncementCard announcements={announcements} />
            <GalleryPreview images={galleryImages} />
          </div>
        </>
      ) : (
        /* =============================================
           MANAGER / LEADER DASHBOARD
           ============================================= */
        <>
          {/* Recent Donations & Expenses */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Recent Donations */}
            <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-green-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Recent Donations</h3>
                  <p className="text-xs text-gray-400">Latest 5 donation records</p>
                </div>
                <Link href="/dashboard/donations" className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
                  View All
                </Link>
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-50/80 bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50/50">
                    {recentDonations.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No donations yet</td></tr>
                    ) : recentDonations.map((d) => (
                      <tr key={d.id} className="transition-colors hover:bg-green-50/30">
                        <td className="whitespace-nowrap px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                              {d.donorName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{d.donorName}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-700">
                          {d.amount ? `$${d.amount.toLocaleString()}` : d.estimatedValue ? `$${d.estimatedValue.toLocaleString()}` : "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">{d.paymentMethod || "-"}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">{d.date}</td>
                        <td className="whitespace-nowrap px-6 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            d.status === "Completed" ? "bg-green-50 text-green-700" : d.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                          }`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-green-50/50">
                {recentDonations.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-400">No donations yet</p>
                ) : recentDonations.map((d) => (
                  <div key={d.id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                          {d.donorName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{d.donorName}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        d.status === "Completed" ? "bg-green-50 text-green-700" : d.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      }`}>{d.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-700">{d.amount ? `$${d.amount.toLocaleString()}` : d.estimatedValue ? `$${d.estimatedValue.toLocaleString()}` : "-"}</span>
                      <span>{d.paymentMethod || "-"}</span>
                      <span>{d.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-green-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Recent Expenses</h3>
                  <p className="text-xs text-gray-400">Latest 5 expense records</p>
                </div>
                <Link href="/dashboard/expenses" className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
                  View All
                </Link>
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-50/80 bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Expense</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Paid By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50/50">
                    {recentExpenses.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No expenses yet</td></tr>
                    ) : recentExpenses.map((e) => (
                      <tr key={e.id} className="transition-colors hover:bg-green-50/30">
                        <td className="whitespace-nowrap px-6 py-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">{e.name}</span>
                            <p className="text-[10px] text-gray-400">{e.receipt}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-700">${e.totalCost.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">{e.paidBy}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">{e.date}</td>
                        <td className="whitespace-nowrap px-6 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            e.status === "Approved" ? "bg-green-50 text-green-700" : e.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                          }`}>{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-green-50/50">
                {recentExpenses.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-400">No expenses yet</p>
                ) : recentExpenses.map((e) => (
                  <div key={e.id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{e.name}</p>
                        <p className="text-[10px] text-gray-400">{e.receipt}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        e.status === "Approved" ? "bg-green-50 text-green-700" : e.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      }`}>{e.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-700">${e.totalCost.toLocaleString()}</span>
                      <span>{e.paidBy}</span>
                      <span>{e.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Progress */}
          <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-sm font-bold text-gray-900">Campaign Progress</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Left: Campaign Info */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Ramadan Iftar Campaign</p>
                      <p className="text-xs text-gray-400">Completed Campaign Days</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">100%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all" style={{ width: "100%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-xs font-bold text-green-700">
                        {day}
                      </div>
                      <span className="text-[10px] text-green-600 font-medium">{"\u2705"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-700">Completed</span>
                </div>
              </div>
              {/* Right: Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-blue-50 p-2 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-blue-700">{campaignData.peopleServed}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-blue-600 mt-0.5 sm:mt-1">People Served</p>
                </div>
                <div className="rounded-xl bg-green-50 p-2 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-green-700">{campaignData.mealsPrepared}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-green-600 mt-0.5 sm:mt-1">Meals Prepared</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-amber-700">{campaignData.mealsRemaining}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-amber-600 mt-0.5 sm:mt-1">Remaining Meals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <ActivityTable activities={recentActivities} />

          {/* Announcements & Gallery */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <AnnouncementCard announcements={announcements} />
            <GalleryPreview images={galleryImages} />
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-green-50/80 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-sm font-bold text-gray-900">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Link
                href="/dashboard/donations"
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-green-100 bg-green-50/50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-green-700 transition-all hover:bg-green-50 hover:border-green-200 hover:shadow-sm"
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                Manage Donations
              </Link>
              <Link
                href="/dashboard/expenses"
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-red-700 transition-all hover:bg-red-50 hover:border-red-200 hover:shadow-sm"
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Manage Expenses
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-amber-700 transition-all hover:bg-amber-50 hover:border-amber-200 hover:shadow-sm"
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Manage Reports
              </Link>
              {userRole === "Manager" && (
                <Link
                  href="/dashboard/users"
                  className="flex items-center gap-2 sm:gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-blue-700 transition-all hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
