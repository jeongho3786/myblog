-- service_role은 RLS(정책)는 우회하지만, GRANT는 RLS와 별개로 여전히 필요하다.
-- 0002에서 anon/authenticated의 insert grant는 회수했지만 service_role에는
-- 애초에 grant를 해준 적이 없어서(자동 노출 옵션이 꺼져있어 기본 권한도 안 붙음)
-- 서버 액션의 supabaseAdmin 호출이 "permission denied"로 실패하던 문제를 해결한다.
grant select, insert on public.comments to service_role;
grant select, insert on public.comment_rate_limits to service_role;
