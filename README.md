# The Last Mixtape

Private spaces for friends and couples far apart: dedicate songs, send voice notes, share
photos and letters. See [PLAN.md](PLAN.md) for the full plan and decisions.

## Run it

1. Create a Supabase project, then in the SQL Editor run `supabase/0001_spaces.sql`, then
   `supabase/0002_grants.sql`, then `supabase/0003_posts.sql` (in that order, once each).
2. In Supabase: Authentication -> Providers -> turn on Email (and Google later).
   For quick testing, Authentication -> Sign In / Providers -> Email -> turn off "Confirm email".
3. `cp .env.example .env.local` and paste the project URL and anon key.
4. `pnpm install` then `pnpm dev`.

## What exists so far

- Sign up / log in (email + password)
- First-time profile (name, avatar, timezone)
- Your spaces: create one, join with a code, leave, see members, copy the code
- Database privacy rules (you only see spaces you belong to)

Everything else (songs, voice notes, photos, letters) comes next, per PLAN.md.
