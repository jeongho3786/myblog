import { supabase } from "@/lib/supabase/client";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const CommentList = async ({ postSlug }: { postSlug: string }) => {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_slug", postSlug)
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-500">댓글을 불러오지 못했습니다.</p>;
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {(comments as Comment[]).map((comment) => (
        <li key={comment.id} className="border-b border-gray-200 pb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">{comment.author_name}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-gray-700">
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
