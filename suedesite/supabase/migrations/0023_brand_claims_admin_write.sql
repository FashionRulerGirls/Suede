-- ════════════════════════════════════════════════════════════════════
-- Suede — Let admins act on brand claims (approve → assign ownership, reject).
-- brand_claims was insert-open / admin-read; this adds admin update so the
-- dashboard can resolve a claim. Assigning brands.owner_id itself is already
-- permitted by the existing brands admin policy. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists brand_claims_admin_write on brand_claims;
create policy brand_claims_admin_write on brand_claims for update using (public.is_admin()) with check (public.is_admin());

grant update on brand_claims to authenticated; -- still gated to admins by the policy
