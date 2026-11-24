-- Posts: songs, photos, voice notes and notes shared inside a space.
-- Run once, after 0001 and 0002. (Replaces the earlier songs-only draft; safe to run
-- even if that draft was applied.)
-- Each person's "corner" is just this feed filtered to their posts.
-- Only metadata and short licensed preview links are stored for songs, never audio files.

drop table if exists public.songs;

create or replace function public.is_room_owner(rid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from room_members where room_id = rid and user_id = auth.uid() and role = 'owner'
  )
$$;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms on delete cascade,
  author_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('song', 'photo', 'voice', 'note')),
  title text check (title is null or char_length(title) between 1 and 200),
  artist text check (artist is null or char_length(artist) between 1 and 200),
  artwork_url text check (artwork_url is null or artwork_url ~ '^https://'),
  preview_url text check (preview_url is null or preview_url ~ '^https://'),
  store_url text check (store_url is null or store_url ~ '^https://'),
  body text check (body is null or char_length(body) <= 2000),
  media_path text check (
    media_path is null or media_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[A-Za-z0-9._-]+$'
  ),
  created_at timestamptz not null default now(),
  constraint post_has_what_it_needs check (
    (kind = 'song' and title is not null and artist is not null)
    or (kind = 'note' and body is not null and char_length(btrim(body)) > 0)
    or (kind in ('photo', 'voice') and media_path is not null)
  )
);

create index posts_room_created_idx on public.posts (room_id, created_at desc);
create index posts_author_idx on public.posts (room_id, author_id, created_at desc);

alter table public.posts enable row level security;

create policy "members read posts" on public.posts
  for select using (public.is_member(room_id));

-- You can only post as yourself, into a space you belong to, and a file path must be
-- inside your own folder of that space (room_id/your_id/file).
create policy "members add their own posts" on public.posts
  for insert with check (
    author_id = auth.uid()
    and public.is_member(room_id)
    and (media_path is null or media_path like room_id::text || '/' || auth.uid()::text || '/%')
  );

create policy "author or owner removes a post" on public.posts
  for delete using (author_id = auth.uid() or public.is_room_owner(room_id));

grant select, insert, delete on public.posts to authenticated;

-- Private bucket for photos and voice notes. 10 MB per file, images and audio only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/ogg',
        'audio/mp4', 'audio/mpeg', 'audio/aac', 'video/webm']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "members read media" on storage.objects
  for select using (
    bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid)
  );

create policy "members upload to their own folder" on storage.objects
  for insert with check (
    bucket_id = 'media'
    and public.is_member(((storage.foldername(name))[1])::uuid)
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "author or owner deletes media" on storage.objects
  for delete using (
    bucket_id = 'media'
    and public.is_member(((storage.foldername(name))[1])::uuid)
    and (
      (storage.foldername(name))[2] = auth.uid()::text
      or public.is_room_owner(((storage.foldername(name))[1])::uuid)
    )
  );

-- Live updates: new posts appear for everyone in the space without a refresh.
alter publication supabase_realtime add table public.posts;
