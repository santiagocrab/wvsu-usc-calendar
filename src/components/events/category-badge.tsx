import { cn } from "@/lib/utils";
import { getCategoryStyle } from "@/lib/events";

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const style = getCategoryStyle(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      {category}
    </span>
  );
}
