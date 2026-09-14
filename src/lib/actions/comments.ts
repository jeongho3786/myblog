"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";

export async function createComment({
  postSlug,
  authorName,
  body,
}: {
  postSlug: string;
  authorName: string;
  body: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("comments").insert({
    post_slug: postSlug,
    author_name: authorName,
    body,
  });

  if (error) {
    return { error: "댓글 등록에 실패했습니다." };
  }

  revalidatePath(`/${postSlug}`);
  return { error: null };
}
