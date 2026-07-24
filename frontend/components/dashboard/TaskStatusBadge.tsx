const statusStyles: Record<string, string> = {
  Completed: "bg-green-50 text-green-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
};

const dotStyles: Record<string, string> = {
  Completed: "bg-green-500",
  "In Progress": "bg-blue-500",
  Pending: "bg-amber-500",
};

export default function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || "bg-gray-400"}`} />
      {status}
    </span>
  );
}
