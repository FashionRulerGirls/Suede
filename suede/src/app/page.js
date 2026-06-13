import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">The trust layer for fashion</p>
      <h1 className="serif" style={{ fontSize: 56, lineHeight: 1.05, margin: "16px 0 24px", maxWidth: 720 }}>
        Stop shopping blind.<br />Start shopping with intent.
      </h1>
      <p className="note" style={{ maxWidth: 520, marginBottom: 40 }}>
        Real reviews from real bodies, ranked for your measurement match. This is the foundation
        build — auth, profile, and the database are live. The Capsule, Lookbook, and Collective
        come next.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {user ? (
          <>
            <Link className="btn" href="/profile">Your profile</Link>
            <form action="/auth/signout" method="post">
              <button className="btn ghost" type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <Link className="btn" href="/auth/signup">Create account</Link>
            <Link className="btn ghost" href="/auth/login">Log in</Link>
          </>
        )}
      </div>

      <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "56px 0" }} />

      <p className="eyebrow">For brands</p>
      <h2 className="serif" style={{ fontSize: 28, margin: "10px 0 14px" }}>I’m a brand</h2>
      <p className="note" style={{ maxWidth: 480, marginBottom: 20 }}>
        Manage your presence in The Capsule, respond to reviews, and customize your brand page.
      </p>
      <Link className="btn ghost" href="/brand/login">Brand portal</Link>
      {/* Brand portal lives in a separate auth scope — wired in the brand-portal build step. */}
    </main>
  );
}
