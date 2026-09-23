-- anon/authenticated에 자동으로 붙어 있던 REFERENCES, TRIGGER, TRUNCATE 권한을 회수한다.
-- 배경: Supabase가 public 스키마에 걸어둔 기본 권한(default privileges) 때문에, 테이블을 만들면
-- "Automatically expose new tables"를 꺼뒀어도 이 세 권한이 API 역할에 붙는다 (0005 적용 후 확인).
--   REFERENCES: 다른 테이블이 이 테이블을 외래키로 참조하게 만들 수 있는 권한
--   TRIGGER:    이 테이블에 트리거를 만들 수 있는 권한
--   TRUNCATE:   모든 행을 한 번에 지우는 권한 (행 단위가 아니라 RLS 정책이 적용되지 않는다)
-- REST API로 호출할 방법은 없지만, 방문자 역할에 필요 없는 권한이므로 최소 권한 원칙에 따라 뺀다.
-- 이미 없는 권한을 revoke하는 건 에러 없이 무시되므로, 기존 댓글 테이블들도 같이 정리한다.
revoke references, trigger, truncate on public.categories from anon, authenticated;
revoke references, trigger, truncate on public.comments from anon, authenticated;
revoke references, trigger, truncate on public.comment_rate_limits from anon, authenticated;

-- 앞으로 postgres 역할(SQL Editor로 테이블을 만드는 역할)이 public 스키마에 만드는 테이블에는
-- 처음부터 이 세 권한이 anon/authenticated에 붙지 않게 기본값을 바꾼다.
alter default privileges for role postgres in schema public
  revoke references, trigger, truncate on tables from anon, authenticated;
