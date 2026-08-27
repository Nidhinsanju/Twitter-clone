"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TwitterLogo from "@/components/icons/TwitterLogo";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await login({ identifier: identifier.trim(), password });
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center text-accent">
          <TwitterLogo className="h-10 w-10" />
        </div>
        <h1 className="mb-6 text-center text-2xl font-extrabold">Log in to Twitter Clone</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-lg bg-danger-hover px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
            <span className="text-[13px] text-text-secondary">Email or username</span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
              className="bg-transparent text-[15px] outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
            <span className="text-[13px] text-text-secondary">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent text-[15px] outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !identifier.trim() || !password}
            className="mt-2 rounded-full bg-text py-2.5 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-8 rounded-xl border border-border p-3 text-[13px] text-text-secondary">
          <p className="mb-1 font-bold text-text">Try a demo account</p>
          <p>Username: <span className="text-text">vercel</span> · Password: <span className="text-text">password123</span></p>
        </div>
      </div>
    </div>
  );
}
