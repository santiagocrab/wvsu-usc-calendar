import { CATEGORY_META } from "@/lib/constants";

export function CategoryBadge({ category, className = "" }: { category: string; className?: string }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META["USC Events"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: meta.color, color: meta.textColor }}
    >
      {meta.short}
    </span>
  );
}
