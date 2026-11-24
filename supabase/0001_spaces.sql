-- The Last Mixtape: accounts, spaces (rooms) and membership.
-- Run once in the Supabase SQL Editor (new project). Safe to read top to bottom.
-- Privacy rule everywhere: you only see data for spaces you are a member of.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar text not null default 'a1',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  join_code text not null unique,
  code_enabled boolean not null default true,
  max_members int not null default 10 check (max_members between 2 and 10),
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index room_members_user_idx on public.room_members (user_id);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Helper functions run as the table owner so policies can use them without recursion.
create function public.is_member(rid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from room_members where room_id = rid and user_id = auth.uid())
$$;

create function public.shares_room(uid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from room_members a join room_members b on a.room_id = b.room_id
    where a.user_id = auth.uid() and b.user_id = uid
  )
$$;

-- profiles: see yourself and people who share a space with you.
create policy "read own or shared profiles" on public.profiles
  for select using (id = auth.uid() or public.shares_room(id));
create policy "create own profile" on public.profiles
  for insert with check (id = auth.uid());
create policy "edit own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- rooms / members: read only your own spaces. All writes go through the functions below.
create policy "read my spaces" on public.rooms
  for select using (public.is_member(id));
create policy "read members of my spaces" on public.room_members
  for select using (public.is_member(room_id));

-- Six characters, no 0/O/1/I so codes are easy to read aloud.
create function public.new_join_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from rooms where join_code = code);
  end loop;
  return code;
end $$;

create function public.create_room(room_name text, size int default 10) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare r rooms;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into rooms (name, join_code, max_members, created_by)
    values (trim(room_name), new_join_code(), least(greatest(size, 2), 10), auth.uid())
    returning * into r;
  insert into room_members (room_id, user_id, role) values (r.id, auth.uid(), 'owner');
  return r;
end $$;

create function public.join_room(code text) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare r rooms;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into r from rooms where join_code = upper(trim(code)) and code_enabled;
  if not found then raise exception 'That code doesn''t match an open space.'; end if;
  if exists (select 1 from room_members where room_id = r.id and user_id = auth.uid()) then
    return r;
  end if;
  if (select count(*) from room_members where room_id = r.id) >= r.max_members then
    raise exception 'That space is full.';
  end if;
  insert into room_members (room_id, user_id) values (r.id, auth.uid());
  return r;
end $$;

create function public.leave_room(rid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare was_owner boolean; next_owner uuid;
begin
  select role = 'owner' into was_owner from room_members where room_id = rid and user_id = auth.uid();
  if was_owner is null then return; end if;
  delete from room_members where room_id = rid and user_id = auth.uid();
  if was_owner then
    select user_id into next_owner from room_members where room_id = rid order by joined_at limit 1;
    if next_owner is null then
      delete from rooms where id = rid;
    else
      update room_members set role = 'owner' where room_id = rid and user_id = next_owner;
    end if;
  end if;
end $$;

create function public.remove_member(rid uuid, uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from room_members where room_id = rid and user_id = auth.uid() and role = 'owner') then
    raise exception 'Only the owner can remove people.';
  end if;
  if uid = auth.uid() then raise exception 'Use leave instead.'; end if;
  delete from room_members where room_id = rid and user_id = uid;
end $$;

create function public.reset_join_code(rid uuid, enabled boolean default true) returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not exists (select 1 from room_members where room_id = rid and user_id = auth.uid() and role = 'owner') then
    raise exception 'Only the owner can change the code.';
  end if;
  code := new_join_code();
  update rooms set join_code = code, code_enabled = enabled where id = rid;
  return code;
end $$;

revoke all on function public.create_room, public.join_room, public.leave_room,
  public.remove_member, public.reset_join_code from public, anon;
grant execute on function public.create_room, public.join_room, public.leave_room,
  public.remove_member, public.reset_join_code to authenticated;

-- Realtime for membership changes (new people appearing in a space).
alter publication supabase_realtime add table public.room_members;
