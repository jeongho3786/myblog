"use client";

import { type SubmitEvent, useState, useTransition } from "react";
import { createComment } from "@/lib/actions/comments";

const CommentForm = ({ postSlug }: { postSlug: string }) => {
  const [isPending, startTransition] = useTransition();
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error } = await createComment({
        postSlug,
        authorName,
        body,
        honeypot: website,
      });

      if (error) {
        setError(error);
        return;
      }

      setAuthorName("");
      setBody("");
      setWebsite("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px]"
      />
      <input
        type="text"
        placeholder="이름"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        required
        maxLength={60}
        className="rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        placeholder="댓글을 입력하세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={4000}
        rows={4}
        className="rounded border border-gray-300 px-3 py-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "등록 중..." : "댓글 등록"}
      </button>
    </form>
  );
}

export default CommentForm;
