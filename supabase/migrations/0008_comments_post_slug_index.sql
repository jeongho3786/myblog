-- 댓글 목록 페이지네이션용 인덱스.
-- 조회 쿼리(src/lib/comments.ts fetchComments)는 항상
--   where post_slug = ? [and (created_at, id) < 커서] order by created_at desc, id desc limit 21
-- 형태다. 지금까지 comments에는 기본키(id) 외 인덱스가 없어서, 글 하나의 댓글을 찾으려면 테이블 전체를 훑고 정렬해야 했다.

-- 컬럼 순서: 동등 조건(post_slug) 먼저, 정렬·범위 조건(created_at, id) 나중 — comment_rate_limits 인덱스(0002)와 같은 원칙.
-- 인덱스는 오름차순이지만 B-tree는 거꾸로도 읽을 수 있어서 desc 정렬에도 그대로 쓰인다.
-- 이렇게 하면 해당 글의 댓글 구간에서 최신 쪽부터 21개만 읽고 멈출 수 있다 (별도 정렬 단계 없음).
create index comments_post_slug_created_at_id_idx
  on public.comments (post_slug, created_at, id);
