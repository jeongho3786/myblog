-- categories 테이블 권한 · RLS.
-- 읽기: 사이드바가 누구에게나 트리를 보여줘야 하므로 anon/authenticated 모두 허용.
-- 쓰기: 관리 페이지의 서버 액션이 verifyAdmin()으로 어드민을 확인한 뒤 service role로만 한다.
--       anon/authenticated에는 쓰기 grant도 정책도 주지 않으므로, 로그인한 사용자라도
--       Supabase REST API를 직접 호출해서 카테고리를 바꿀 수 없다.

-- "Automatically expose new tables"를 꺼뒀기 때문에 API 역할에 명시적으로 권한을 부여한다.
grant select on public.categories to anon, authenticated;

-- service_role은 RLS는 우회하지만 grant는 별도로 필요하다 (0003 참고).
grant select, insert, update, delete on public.categories to service_role;

-- RLS 활성화. 아래 select 정책 외에는 anon/authenticated에게 허용되는 동작이 없다.
alter table public.categories enable row level security;

-- 카테고리 목록은 공개 정보이므로 모든 행 읽기 허용
create policy "categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);
