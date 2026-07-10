import { cn } from "@/lib/utils";
import { STATUS_COLORS, type Status } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors = STATUS_COLORS[status as Status] ?? "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", colors, className)}>
      {status}
    </span>
  );
}
