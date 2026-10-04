import { supabase } from "@/lib/supabase/client";

// 댓글 조회. anon 클라이언트만 쓰므로 서버 컴포넌트(첫 묶음)와 클라이언트 컴포넌트(더보기) 양쪽에서 import 가능.
// 쓰기는 src/lib/actions/comments.ts의 Server Action이 service role로 한다.

export interface Comment {
  id: string;
  author_name: string;
  body: string;
  // DB 값 그대로의 문자열(마이크로초 포함). Date로 바꾸면 밀리초까지만 남아 커서 비교가 어긋나므로 그대로 둔다.
  created_at: string;
}

// 커서 = 지금까지 받은 마지막 댓글의 (created_at, id). 다음 묶음은 이 댓글보다 "오래된" 것부터.
// created_at이 같은 댓글이 여러 개일 수 있어서 id를 동점 처리용으로 같이 쓴다.
export interface CommentCursor {
  created_at: string;
  id: string;
}

export const COMMENTS_PAGE_SIZE = 20;

// 입력 길이 제한. 클라이언트 폼 검증과 서버 액션 검증이 같이 쓴다.
// DB에도 같은 값의 check 제약이 있다 (supabase/migrations/0001_init.sql) — 세 곳이 어긋나지 않게 여기만 고친다.
export const AUTHOR_NAME_MAX_LENGTH = 60;
export const COMMENT_BODY_MAX_LENGTH = 4000;

// 최신순으로 limit개를 가져온다. cursor가 있으면 그 댓글 다음(더 오래된 쪽)부터.
// limit + 1개를 조회해서 하나가 더 오면 다음 묶음이 있다는 뜻 → nextCursor를 채운다. (count 쿼리 불필요)
export const fetchComments = async ({
  postSlug,
  cursor = null,
  limit = COMMENTS_PAGE_SIZE,
}: {
  postSlug: string;
  cursor?: CommentCursor | null;
  limit?: number;
}): Promise<{ comments: Comment[]; nextCursor: CommentCursor | null }> => {
  let query = supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_slug", postSlug)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    // (created_at, id) < (cursor.created_at, cursor.id) 를 PostgREST 필터로 풀어 쓴 것:
    // created_at이 더 이르거나, 같다면 id가 더 작은 것.
    // 값은 큰따옴표로 감싸 timestamp의 ':'·'+' 같은 문자가 필터 문법으로 해석되지 않게 한다.
    query = query.or(
      `created_at.lt."${cursor.created_at}",and(created_at.eq."${cursor.created_at}",id.lt."${cursor.id}")`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data as Comment[];
  const hasMore = rows.length > limit;
  const comments = hasMore ? rows.slice(0, limit) : rows;
  const lastComment = comments[comments.length - 1];

  return {
    comments,
    nextCursor: hasMore
      ? { created_at: lastComment.created_at, id: lastComment.id }
      : null,
  };
};
