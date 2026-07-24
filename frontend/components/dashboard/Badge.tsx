const colorMap: Record<string, string> = {
  Approved: "bg-green-50 text-green-700",
  Completed: "bg-green-50 text-green-700",
  Active: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-red-50 text-red-700",
  Inactive: "bg-gray-100 text-gray-500",
};

export default function Badge({
  status,
  dot = false,
}: {
  status: string;
  dot?: boolean;
}) {
  const color = colorMap[status] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === "Approved" || status === "Completed" || status === "Active"
              ? "bg-green-500"
              : status === "Pending"
                ? "bg-amber-500"
                : "bg-red-500"
          }`}
        />
      )}
      {status}
    </span>
  );
}
