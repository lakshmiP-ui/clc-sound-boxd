-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create albums table (for caching album data)
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  cover_url text,
  year integer,
  genre text,
  created_at timestamp with time zone default now()
);

alter table public.albums enable row level security;
create policy "albums_select_all" on public.albums for select using (true);
create policy "albums_insert_auth" on public.albums for insert with check (auth.uid() is not null);

-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  album_id uuid not null references public.albums(id) on delete cascade,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  review_text text,
  liked boolean default false,
  listened_at date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, album_id)
);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- Create lists table
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.lists enable row level security;

create policy "lists_select_public" on public.lists for select using (is_public = true or auth.uid() = user_id);
create policy "lists_insert_own" on public.lists for insert with check (auth.uid() = user_id);
create policy "lists_update_own" on public.lists for update using (auth.uid() = user_id);
create policy "lists_delete_own" on public.lists for delete using (auth.uid() = user_id);

-- Create list_albums junction table
create table if not exists public.list_albums (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  album_id uuid not null references public.albums(id) on delete cascade,
  position integer not null,
  added_at timestamp with time zone default now(),
  unique(list_id, album_id)
);

alter table public.list_albums enable row level security;

create policy "list_albums_select" on public.list_albums for select using (
  exists (select 1 from public.lists where id = list_id and (is_public = true or auth.uid() = user_id))
);
create policy "list_albums_insert" on public.list_albums for insert with check (
  exists (select 1 from public.lists where id = list_id and auth.uid() = user_id)
);
create policy "list_albums_delete" on public.list_albums for delete using (
  exists (select 1 from public.lists where id = list_id and auth.uid() = user_id)
);

-- Create follows table
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_insert_own" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own" on public.follows for delete using (auth.uid() = follower_id);

-- Create trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
