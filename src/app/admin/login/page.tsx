export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader showAdminLink={false} />
      <main className="mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
