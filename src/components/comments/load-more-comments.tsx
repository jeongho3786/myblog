"use client";

import { useState, useTransition } from "react";
import { type Comment, type CommentCursor, fetchComments } from "@/lib/comments";
import CommentItem from "@/components/comments/comment-item";

// 서버가 렌더링한 첫 묶음 아래에 붙는 "더보기" 영역. 버튼을 누를 때마다 다음 묶음을 브라우저에서 anon 클라이언트로 조회해 뒤에 붙인다.
// CommentList가 key를 첫 묶음의 커서로 주기 때문에, 새 댓글 등록으로 첫 묶음이 바뀌면 이 컴포넌트는 새로 마운트돼 상태가 초기화된다.
const LoadMoreComments = ({
  postSlug,
  initialCursor,
}: {
  postSlug: string;
  initialCursor: CommentCursor;
}) => {
  const [isPending, startTransition] = useTransition();
  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<CommentCursor | null>(initialCursor);
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = () => {
    if (!cursor) return;
    setError(null);

    startTransition(async () => {
      try {
        const { comments, nextCursor } = await fetchComments({ postSlug, cursor });
        setLoadedComments((prev) => [...prev, ...comments]);
        setCursor(nextCursor);
      } catch {
        setError("댓글을 더 불러오지 못했습니다.");
      }
    });
  }

  return (
    <>
      {loadedComments.length > 0 && (
        <ul className="mt-4 flex flex-col gap-4">
          {loadedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {cursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="mt-4 rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          {isPending ? "불러오는 중..." : "댓글 더보기"}
        </button>
      )}
    </>
  );
}

export default LoadMoreComments;
