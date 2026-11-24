-- Run once, after 0001_spaces.sql.
-- New Supabase projects don't give signed-in users access to tables by default.
-- Row-level security (0001) still limits which rows each person can see or change.

grant usage on schema public to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.rooms to authenticated;
grant select on public.room_members to authenticated;
