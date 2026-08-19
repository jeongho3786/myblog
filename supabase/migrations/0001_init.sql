create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null check (char_length(author_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

-- "Automatically expose new tables"를 꺼뒀기 때문에 API 역할에 명시적으로 권한을 부여한다.
grant select, insert on public.comments to anon, authenticated;

alter table public.comments enable row level security;

create policy "comments are publicly readable"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "anyone can insert a comment"
  on public.comments for insert
  to anon, authenticated
  with check (true);
