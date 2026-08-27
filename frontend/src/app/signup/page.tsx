"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TwitterLogo from "@/components/icons/TwitterLogo";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const usernameValid = /^[a-z0-9_]{3,20}$/.test(username);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !usernameValid || !email.trim() || password.length < 6) return;
    setSubmitting(true);
    setError("");
    try {
      await signup({ name: name.trim(), username, email: email.trim(), password });
      router.replace("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center text-accent">
          <TwitterLogo className="h-10 w-10" />
        </div>
        <h1 className="mb-6 text-center text-2xl font-extrabold">Create your account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-lg bg-danger-hover px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
            <span className="text-[13px] text-text-secondary">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={50}
              className="bg-transparent text-[15px] outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
            <span className="text-[13px] text-text-secondary">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              maxLength={20}
              className="bg-transparent text-[15px] outline-none"
            />
            {username.length > 0 && !usernameValid && (
              <span className="text-[12px] text-danger">
                3-20 characters: letters, numbers, underscores only
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
            <span className="text-[13px] text-text-secondary">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {password.length > 0 && password.length < 6 && (
              <span className="text-[12px] text-danger">At least 6 characters</span>
            )}
          </label>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !usernameValid || !email.trim() || password.length < 6}
            className="mt-2 rounded-full bg-text py-2.5 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
