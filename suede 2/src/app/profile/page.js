import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, user_name, email, role, profile_completed")
    .eq("id", user.id)
    .single();

  const { data: m } = await supabase
    .from("measurements")
    .select("height_feet, height_inches, bust_inches, waist_inches, hips_inches, source")
    .eq("user_id", user.id)
    .maybeSingle();

  const height = m?.height_feet != null ? `${m.height_feet}'${m.height_inches ?? 0}"` : "—";

  return (
    <main className="wrap" style={{ maxWidth: 640, paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Your profile</p>
      <h1 className="serif" style={{ fontSize: 40, margin: "10px 0 28px" }}>
        {profile?.display_name || profile?.user_name || profile?.email}
      </h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="serif" style={{ fontSize: 20, marginBottom: 16 }}>Account</h3>
        <p className="note">Email — {profile?.email}</p>
        <p className="note">Role — {profile?.role}</p>
        <p className="note">Profile complete — {profile?.profile_completed ? "Yes" : "No"}</p>
      </div>

      <div className="card">
        <h3 className="serif" style={{ fontSize: 20, marginBottom: 16 }}>Measurements</h3>
        {m ? (
          <>
            <p className="note">Height — {height}</p>
            <p className="note">Bust — {m.bust_inches ?? "—"}"</p>
            <p className="note">Waist — {m.waist_inches ?? "—"}"</p>
            <p className="note">Hips — {m.hips_inches ?? "—"}"</p>
            <p className="note">Source — {m.source ?? "—"}</p>
          </>
        ) : (
          <p className="note">
            No measurements yet. The Quick Fit quiz and self-guided tool write here in the next build step.
          </p>
        )}
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
        <Link className="btn ghost" href="/">Home</Link>
        <form action="/auth/signout" method="post">
          <button className="btn ghost" type="submit">Sign out</button>
        </form>
      </div>
    </main>
  );
}
