"use client";

interface BarChartProps {
  data: { month: string; amount: number }[];
  color?: string;
  maxVal?: number;
}

export function BarChart({ data, color = "from-green-400 to-green-600", maxVal }: BarChartProps) {
  const max = maxVal || Math.max(...data.map((d) => d.amount));

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d) => {
        const height = (d.amount / max) * 100;
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">
              ${(d.amount / 1000).toFixed(1)}k
            </span>
            <div className="relative w-full flex justify-center">
              <div
                className={`w-full max-w-10 rounded-t-lg bg-gradient-to-b ${color} transition-all duration-500 ease-out`}
                style={{ height: `${height}%`, minHeight: 8 }}
              />
            </div>
            <span className="text-xs text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

interface LineChartProps {
  data: { day: string; donations: number; expenses: number; meals: number }[];
}

export function LineChart({ data }: LineChartProps) {
  const maxDonations = Math.max(...data.map((d) => d.donations));
  const maxMeals = Math.max(...data.map((d) => d.meals));
  const maxY = Math.max(maxDonations, maxMeals);

  function toPoints(key: "donations" | "meals") {
    const width = 400;
    const height = 160;
    const step = width / (data.length - 1);
    return data
      .map((d, i) => {
        const x = i * step;
        const y = height - (d[key] / maxY) * (height - 20);
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox="0 0 400 180" className="w-full h-44">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 160 - (i / 4) * 140;
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={400}
              y2={y}
              stroke="#f0fdf4"
              strokeWidth={1}
            />
          );
        })}
        {/* Donations line */}
        <polyline
          points={toPoints("donations")}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Meals line */}
        <polyline
          points={toPoints("meals")}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots for donations */}
        {data.map((d, i) => {
          const x = i * (400 / (data.length - 1));
          const y = 160 - (d.donations / maxY) * 140;
          return <circle key={`d-${i}`} cx={x} cy={y} r={4} fill="#22c55e" stroke="white" strokeWidth={2} />;
        })}
        {/* Dots for meals */}
        {data.map((d, i) => {
          const x = i * (400 / (data.length - 1));
          const y = 160 - (d.meals / maxY) * 140;
          return <circle key={`m-${i}`} cx={x} cy={y} r={4} fill="#f59e0b" stroke="white" strokeWidth={2} />;
        })}
      </svg>
      <div className="flex justify-center gap-6 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Donations
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2.5 w-2.5 rounded-full bg-gold-500" /> Meals
        </span>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
