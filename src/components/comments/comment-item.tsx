import type { Comment } from "@/lib/comments";

// 댓글 하나. 서버(CommentList 첫 묶음)와 클라이언트(더보기로 불러온 묶음) 양쪽에서 렌더링하므로
// 시각은 로캘·시간대를 고정해서 포맷한다 — 안 그러면 서버(Vercel은 UTC)와 브라우저의 표시가 달라진다.
const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <li className="border-b border-border pb-4">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-foreground">{comment.author_name}</span>
        <span className="text-xs tracking-wide text-muted">
          {new Date(comment.created_at).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          })}
        </span>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-foreground-secondary">{comment.body}</p>
    </li>
  );
}

export default CommentItem;
