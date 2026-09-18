-- anon/authenticated의 직접 insert를 막고, service role(서버 전용)만 댓글을 쓸 수 있게 좁힌다.
-- 배경: anon key는 NEXT_PUBLIC_*로 클라이언트에 노출되므로, 기존 "with check (true)" 정책은
-- 누구나 Supabase REST API를 직접 호출해 댓글을 insert할 수 있는 구멍이었다.

-- 누구나 insert 가능 정책 삭제
drop policy "anyone can insert a comment" on public.comments;

-- insert 자격 회수
revoke insert on public.comments from anon, authenticated;

-- rate limit 기록용 테이블. RLS만 켜두고 정책은 만들지 않아 anon/authenticated는 아무 것도
-- 할 수 없고, RLS를 우회하는 service role만 접근 가능하다.
-- brgint generated는 1, 2, 3 ... 처럼 자동 증가하는 정수
-- hash는 ip를 해시값으로 저장
create table public.comment_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

-- 인덱스 생성
-- 서버 액션이 rate limit 체크할 때마다 ip_hash로 최근 n분 안에 몇 번 시도했는지 조회
create index comment_rate_limits_ip_hash_created_at_idx
  on public.comment_rate_limits (ip_hash, created_at);

-- RLS 활성화
-- 정책이 없다면, RLS 테이블은 기본이 전부 차단
alter table public.comment_rate_limits enable row level security;
