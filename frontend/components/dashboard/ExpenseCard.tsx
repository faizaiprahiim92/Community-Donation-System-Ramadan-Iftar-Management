import StatCard from "./StatCard";
import type { Expense } from "@/lib/mock-data";

function getCategoryTotal(expenses: Expense[], cat: Expense["category"]) {
  return expenses
    .filter((e) => e.category === cat && e.status !== "Rejected")
    .reduce((s, e) => s + e.totalCost, 0);
}

export default function ExpenseCards({ data, totalDonations = 0 }: { data: Expense[]; totalDonations?: number }) {
  const totalExpenses = data
    .filter((e) => e.status !== "Rejected")
    .reduce((s, e) => s + e.totalCost, 0);
  const todayTotal = data
    .filter((e) => e.date.includes("Jul 23") && e.status !== "Rejected")
    .reduce((s, e) => s + e.totalCost, 0);
  const foodTotal = getCategoryTotal(data, "Food");
  const transportTotal = getCategoryTotal(data, "Transport");
  const otherTotal =
    getCategoryTotal(data, "Packaging") +
    getCategoryTotal(data, "Water") +
    getCategoryTotal(data, "Cooking") +
    getCategoryTotal(data, "Other");
  const remaining = totalDonations - totalExpenses;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total Expenses"
        value={`$${totalExpenses.toLocaleString()}`}
        description={`${data.filter((e) => e.status !== "Rejected").length} expenses`}
        icon="expense"
        change="+8%"
        trend="up"
      />
      <StatCard
        label="Today's Expenses"
        value={`$${todayTotal.toLocaleString()}`}
        description="Spent today"
        icon="donation"
        change="+3%"
        trend="up"
      />
      <StatCard
        label="Food Expenses"
        value={`$${foodTotal.toLocaleString()}`}
        description="Ingredients & supplies"
        icon="meals"
        change="+12%"
        trend="up"
      />
      <StatCard
        label="Transport Expenses"
        value={`$${transportTotal.toLocaleString()}`}
        description="Delivery & travel"
        icon="people"
        change="+5%"
        trend="up"
      />
      <StatCard
        label="Other Expenses"
        value={`$${otherTotal.toLocaleString()}`}
        description="Packaging, water, etc."
        icon="campaign"
        change="0%"
        trend="up"
      />
      <StatCard
        label="Remaining Budget"
        value={`$${remaining.toLocaleString()}`}
        description="Available funds"
        icon="balance"
        change={`${remaining > 0 ? "+" : ""}$${remaining.toLocaleString()}`}
        trend={remaining > 0 ? "up" : "down"}
      />
    </div>
  );
}
