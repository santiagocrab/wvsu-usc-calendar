import { AppShell } from "@/components/layout/app-shell";
import { CategoryLegend, NoticeBanner } from "@/components/events/category-legend";
import { USC_NOTICE } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-5">
        <section className="usc-card p-6 dark:bg-[#252220]">
          <h1 className="text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8]">Legend & Guidelines</h1>
          <p className="text-sm text-usc-muted mt-2 leading-relaxed">{USC_NOTICE}</p>
        </section>
        <NoticeBanner />
        <CategoryLegend />
        <section className="usc-card p-6 bg-usc-gold-wash dark:bg-usc-gold/10 border border-usc-gold/25 dark:bg-[#252220]">
          <h2 className="font-bold text-usc-black dark:text-[#F5F0E8] mb-3">USC Reminders</h2>
          <ul className="text-sm text-usc-charcoal dark:text-white/70 space-y-2 list-disc pl-5">
            <li>Proposed events need USC approval before final posting.</li>
            <li>Check venue conflicts before scheduling face-to-face activities.</li>
            <li>Afford WVSU examination periods and holidays priority.</li>
            <li>Contact your org president for calendar corrections.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
