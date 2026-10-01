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
