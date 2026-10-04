-- comment_rate_limits의 오래된 행을 pg_cron으로 매일 정리한다.
-- 배경: 댓글 등록 서버 액션이 성공할 때마다 행을 하나씩 insert하지만 삭제 로직이 없어 테이블이 계속 커졌다.
-- rate limit 조회는 최근 1시간(RATE_LIMIT_WINDOW_MS)만 보므로 그보다 오래된 행은 쓰이지 않는다.
-- 보관 기간은 여유를 두고 1일로 잡았다 (디버깅 시 하루치 기록 확인용).

-- pg_cron 확장. 대시보드(Database → Extensions)에서 이미 켰다면 아무 일도 하지 않는다.
-- 새 프로젝트에 마이그레이션을 다시 적용할 때 이 파일이 pg_cron에 의존한다는 걸 남기기 위해 둔다.
create extension if not exists pg_cron with schema pg_catalog;

-- 매일 UTC 18:00 (KST 03:00)에 1일 넘은 행 삭제.
-- cron 표현식: 분 시 일 월 요일 → '0 18 * * *' = 매일 18시 0분.
-- job은 이 SQL을 실행한 postgres 역할로 돌기 때문에 service_role에 delete 권한을 줄 필요가 없다.
-- 같은 이름으로 다시 schedule하면 새 job이 생기지 않고 기존 job이 덮어써진다.
select cron.schedule(
  'cleanup-comment-rate-limits',
  '0 18 * * *',
  $$delete from public.comment_rate_limits where created_at < now() - interval '1 day'$$
);
