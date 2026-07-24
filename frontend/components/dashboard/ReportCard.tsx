import StatCard from "./StatCard";
import type { DailyReport } from "@/lib/mock-data";

export default function ReportCards({ data }: { data: DailyReport[] }) {
  const totalDays = data.length;
  const totalPeople = data.reduce((s, r) => s + r.peopleServed, 0);
  const totalMeals = data.reduce((s, r) => s + r.mealsPrepared, 0);
  const totalRemaining = data.reduce((s, r) => s + r.mealsRemaining, 0);
  const totalPhotos = data.reduce((s, r) => s + r.photos.length, 0);
  const totalVideos = data.reduce((s, r) => s + r.videos.length, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total Report Days"
        value={String(totalDays)}
        description="Campaign days"
        icon="campaign"
        change={`${totalDays} days`}
        trend="up"
      />
      <StatCard
        label="People Served"
        value={totalPeople.toLocaleString()}
        description="Community members"
        icon="people"
        change="+18%"
        trend="up"
      />
      <StatCard
        label="Meals Prepared"
        value={totalMeals.toLocaleString()}
        description="Iftar meals total"
        icon="meals"
        change="+22%"
        trend="up"
      />
      <StatCard
        label="Meals Remaining"
        value={String(totalRemaining)}
        description="Leftover meals"
        icon="balance"
        change={`${totalRemaining}`}
        trend="up"
      />
      <StatCard
        label="Photos Uploaded"
        value={String(totalPhotos)}
        description="Campaign photos"
        icon="donation"
        change={`${totalPhotos}`}
        trend="up"
      />
      <StatCard
        label="Videos Uploaded"
        value={String(totalVideos)}
        description="Campaign videos"
        icon="expense"
        change={`${totalVideos}`}
        trend="up"
      />
    </div>
  );
}
