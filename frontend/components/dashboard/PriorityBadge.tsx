const priorityColors: Record<string, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-amber-50 text-amber-700",
  Urgent: "bg-red-50 text-red-700",
};

const dotColors: Record<string, string> = {
  Low: "bg-gray-400",
  Medium: "bg-blue-500",
  High: "bg-amber-500",
  Urgent: "bg-red-500",
};

export default function PriorityBadge({
  priority,
  dot = false,
}: {
  priority: string;
  dot?: boolean;
}) {
  const color = priorityColors[priority] || "bg-gray-100 text-gray-600";
  const dotColor = dotColors[priority] || "bg-gray-400";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      )}
      {priority}
    </span>
  );
}
