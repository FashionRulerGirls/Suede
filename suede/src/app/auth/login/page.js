"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/profile";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="wrap" style={{ maxWidth: 460, paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Welcome back</p>
      <h1 className="serif" style={{ fontSize: 40, margin: "10px 0 28px" }}>Sign in</h1>
      <Suspense fallback={<div className="card"><p className="note">Loading…</p></div>}>
        <LoginForm />
      </Suspense>
      <p className="note" style={{ marginTop: 20 }}>
        New to Suede? <Link href="/auth/signup">Create an account</Link>
      </p>
    </main>
  );
}
