<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

## Architecture rules

- Signed-in pages live under `src/routes/_authenticated/` with the `/app` shell layout in `app.tsx` — one gate protects the whole subtree.
- All Supabase access for the app goes through `src/lib/supabase.ts` helpers — keeps auth/profile calls in one place.
- Shared types live in `src/types/` — reused across routes and components.
- Reusable UI primitives (`Button`, `Card`, `Input`, `PageHeader`, `SidebarNav`) live in `src/components/` — built on design tokens in `src/styles.css`, never ad hoc colors.
- Assessment results are read from the database via `useLatestResult()` (React Query, key `latest-assessment`); the in-memory assessment store only holds in-progress answers — keeps one source of truth for results.
- Billing: the Starter Kit uses a one-time Razorpay Order; signatures and ownership are verified in server functions before server-only writes — keeps payment state tamper-proof.
- Paid gating: server functions call `has_feature_access()` (true when the DB flag `feature_flags.premium_enabled` is off, else `has_paid_access()`); UI mirrors it via `useSubscription().hasAccess` but never grants access — keeps a free beta switchable without code changes.
- Admin access uses `user_roles` + `has_role()`; admin page is `/app/admin` — roles never live on profiles.
- Shared support contact copy lives in `src/lib/config.ts` — one place to edit it.
- Demand events go to the `events` table via `trackEvent()` (own-row inserts, admin-only reads); templates are rows in `templates` linked by finding key — one source for analytics and template mapping.
- Finding definitions live in `src/lib/finding-definitions.ts`, keyed by an internal `finding_key` (never shown to users); playbooks/templates are referenced, not duplicated — titles can change without breaking links.
