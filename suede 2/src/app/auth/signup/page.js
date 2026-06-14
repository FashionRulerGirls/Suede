"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <main className="wrap" style={{ maxWidth: 460, paddingTop: 80 }}>
        <h1 className="serif" style={{ fontSize: 36, marginBottom: 16 }}>Check your email</h1>
        <p className="note">
          We sent a confirmation link to {email}. Open it to activate your account, then sign in.
        </p>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ maxWidth: 460, paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Join the community of informed shoppers</p>
      <h1 className="serif" style={{ fontSize: 40, margin: "10px 0 28px" }}>Create account</h1>
      <div className="card">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="err">{error}</p>}
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
      <p className="note" style={{ marginTop: 20 }}>
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </main>
  );
}
