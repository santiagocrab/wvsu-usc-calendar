"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { loginAction } from "@/actions/events";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction(password, searchParams.get("from"));
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="usc-card p-6 dark:bg-[#252220]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-usc-gold flex items-center justify-center">
          <Lock size={18} className="text-usc-black" />
        </div>
        <div>
          <h2 className="font-extrabold text-usc-black dark:text-[#F5F0E8]">Sign in</h2>
          <p className="text-xs text-usc-muted">Enter admin password</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-usc-border bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6] font-medium"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-full bg-usc-gold text-usc-black font-bold hover:bg-usc-gold-dark disabled:opacity-50 transition"
        >
          {isPending ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
