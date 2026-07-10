"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, AlertTriangle, Building2, Settings, Search, Moon, Sun,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/organizations", icon: Building2, label: "Organizations" },
  { href: "/conflicts", icon: AlertTriangle, label: "Conflicts" },
  { href: "/settings", icon: Settings, label: "Legend" },
];

export function AppShell({
  children,
  search = "",
  onSearchChange,
  orgCount,
  conflictCount,
}: {
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
  orgCount?: number;
  conflictCount?: number;
}) {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex bg-transparent">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-white/90 dark:bg-[#252220]/95 backdrop-blur-sm border-r border-usc-border dark:border-[#3D3833]">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <img src="/usc.jpg" alt="USC" className="w-14 h-14 rounded-2xl object-cover usc-gold-ring shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-usc-black dark:text-[#F5F0E8] text-sm leading-tight">USC Calendar</p>
              <p className="text-xs text-usc-muted dark:text-white/50 mt-0.5">AY 2026–2027</p>
            </div>
          </div>
          <div className="usc-accent-line mt-4 w-16" />
          <p className="text-xs text-usc-muted dark:text-white/45 mt-3 leading-relaxed">
            One place for every org&apos;s schedule at WVSU.
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            const badge =
              label === "Organizations" ? orgCount :
              label === "Conflicts" ? conflictCount : 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  active
                    ? "bg-usc-gold text-usc-black shadow-sm"
                    : "text-usc-charcoal dark:text-white/70 hover:bg-usc-gold-wash dark:hover:bg-white/5"
                )}
              >
                <Icon size={18} strokeWidth={2.25} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className={cn(
                    "text-[10px] font-bold min-w-[1.25rem] text-center px-1.5 py-0.5 rounded-full",
                    active ? "bg-usc-black/15 text-usc-black" : "bg-usc-gold-wash dark:bg-white/10 text-usc-gold-dark"
                  )}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-usc-gold-wash dark:bg-usc-gold/10 border border-usc-gold/20">
          <p className="text-xs text-usc-charcoal dark:text-white/70 leading-relaxed">
            Made for councils & student orgs. Schedules may change until USC approves.
          </p>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#252220]/85 backdrop-blur-md border-b border-usc-border dark:border-[#3D3833]">
          <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
            <img src="/usc.jpg" alt="USC" className="lg:hidden w-10 h-10 rounded-xl object-cover usc-gold-ring" />
            <div className="hidden sm:block min-w-0">
              <p className="font-bold text-usc-black dark:text-[#F5F0E8] text-sm">WVSU · University Student Council</p>
              <p className="text-xs text-usc-muted dark:text-white/45">Unified org calendar</p>
            </div>
            {onSearchChange && (
              <div className="flex-1 max-w-md ml-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-usc-muted" size={16} />
                <input
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search events, orgs, venues…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-usc-border text-sm font-medium text-usc-ink dark:text-[#F2EDE6] bg-usc-warm dark:bg-[#2A2724] focus:ring-2 focus:ring-usc-gold/30 focus:border-usc-gold"
                />
              </div>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full border border-usc-border text-usc-muted hover:bg-usc-gold-wash dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="lg:hidden flex overflow-x-auto gap-2 px-4 pb-3">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition",
                  pathname === href
                    ? "bg-usc-gold text-usc-black"
                    : "bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] border border-usc-border"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 lg:px-8 text-usc-ink dark:text-[#F2EDE6]">{children}</main>
      </div>
    </div>
  );
}
