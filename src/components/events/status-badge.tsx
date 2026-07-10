import { STATUS_META } from "@/lib/constants";

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const meta = STATUS_META[status] ?? { color: "#374151", bg: "#F3F4F6" };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {status}
    </span>
  );
}
