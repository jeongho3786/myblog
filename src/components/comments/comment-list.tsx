import { type Comment, type CommentCursor, fetchComments } from "@/lib/comments";
import CommentItem from "@/components/comments/comment-item";
import LoadMoreComments from "@/components/comments/load-more-comments";

// 첫 묶음(최신 COMMENTS_PAGE_SIZE개)만 서버에서 렌더링한다. 나머지는 더보기로 브라우저에서 불러온다.
const CommentList = async ({ postSlug }: { postSlug: string }) => {
  let comments: Comment[];
  let nextCursor: CommentCursor | null;

  try {
    ({ comments, nextCursor } = await fetchComments({ postSlug }));
  } catch {
    return <p className="text-sm text-red-500">댓글을 불러오지 못했습니다.</p>;
  }

  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ul>
      {/* key: 새 댓글이 등록돼 첫 묶음이 바뀌면 커서도 바뀌므로, 더보기로 불러둔 목록을 버리고 처음 상태로 되돌린다.
          안 그러면 첫 묶음에서 밀려난 댓글이 이미 불러둔 목록에도 없어서 화면에서 빠진다. */}
      {nextCursor && (
        <LoadMoreComments
          key={`${nextCursor.created_at}_${nextCursor.id}`}
          postSlug={postSlug}
          initialCursor={nextCursor}
        />
      )}
    </>
  );
}

export default CommentList;
