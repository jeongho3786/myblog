-- 테이블 생성
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null check (char_length(author_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

-- 권한
-- anon, authenticated(로그인 사용자를 염두, 아직 미사용)에게 select, insert 허가
-- "Automatically expose new tables"를 꺼뒀기 때문에 API 역할에 명시적으로 권한을 부여한다.
grant select, insert on public.comments to anon, authenticated;

-- RLS(row level security) 실행
-- grant로 권한을 허용했더라도 RLS가 켜져 있으면
-- 아래 명시적인 policy가 없는 한 실제로 아무 행도 못 읽고 못 쓴다.
alter table public.comments enable row level security;

-- select에 한해, 모든 행 허용
-- 댓글은 공개 게시판이니깐
create policy "comments are publicly readable"
  on public.comments for select
  to anon, authenticated
  using (true);

-- 새로 들어오는 행이 조건 없이 항상 통과
create policy "anyone can insert a comment"
  on public.comments for insert
  to anon, authenticated
  with check (true);
