export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-usc-cream dark:bg-[#1A1816] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/usc.jpg" alt="USC" className="w-16 h-16 rounded-2xl object-cover usc-gold-ring mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-usc-black dark:text-[#F5F0E8]">USC Calendar Admin</h1>
          <p className="text-sm text-usc-muted mt-1">AY 2026–2027</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
