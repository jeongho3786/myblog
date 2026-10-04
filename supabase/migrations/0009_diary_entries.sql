-- 짧은 일기 테이블 + 권한 · RLS.
-- 읽기: /diary 페이지가 누구에게나 목록을 보여줘야 하므로 anon/authenticated 모두 허용.
-- 쓰기(작성·수정·삭제): 서버 액션이 verifyAdmin()으로 어드민을 확인한 뒤 service role로만 한다.
--       anon/authenticated에는 쓰기 grant도 정책도 주지 않는다 (categories와 같은 패턴, 0005 참고).
-- 댓글(comments)과 테이블을 나눈 이유: 작성자 이름·ip_hash·글 slug가 필요 없고 쓰기 권한 규칙도 달라서,
-- 한 테이블에 섞으면 RLS·서버 액션에 분기가 생긴다.

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  -- 나만 쓰는 일기라 넉넉하게 1000자. src/lib/diary.ts의 DIARY_BODY_MAX_LENGTH와 같은 값으로 맞춘다.
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- 목록은 최신순(created_at desc, id desc)으로 5개씩 페이지를 나눠 조회한다.
-- created_at이 같은 행이 있어도 순서가 하나로 정해지도록 id까지 포함한다 (B-tree는 역방향으로도 읽힌다).
create index diary_entries_created_at_id_idx
  on public.diary_entries (created_at, id);

-- "Automatically expose new tables"를 꺼뒀기 때문에 API 역할에 명시적으로 권한을 부여한다.
grant select on public.diary_entries to anon, authenticated;

-- service_role은 RLS는 우회하지만 grant는 별도로 필요하다 (0003 참고).
-- 어드민이 작성·수정·삭제를 모두 하므로 네 가지 다 준다.
grant select, insert, update, delete on public.diary_entries to service_role;

-- RLS 활성화. 아래 select 정책 외에는 anon/authenticated에게 허용되는 동작이 없다.
alter table public.diary_entries enable row level security;

create policy "diary entries are publicly readable"
  on public.diary_entries for select
  to anon, authenticated
  using (true);
