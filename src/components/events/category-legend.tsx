import { USC_NOTICE, CATEGORY_META } from "@/lib/constants";

export function NoticeBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-usc-sky-wash dark:bg-usc-sky/10 border border-usc-sky/20">
      <p className="text-sm text-usc-charcoal dark:text-white/75 leading-relaxed">
        <span className="font-bold text-usc-sky">Heads up:</span> {USC_NOTICE}
      </p>
    </div>
  );
}

export function CategoryLegend() {
  return (
    <div className="usc-card p-5 dark:bg-[#252220]">
      <p className="text-sm font-semibold text-usc-black dark:text-[#F5F0E8] mb-3">
        Please be guided by the legends below.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_META).map(([cat, meta]) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: meta.color, color: meta.textColor }}
          >
            {meta.short}
          </span>
        ))}
      </div>
    </div>
  );
}
