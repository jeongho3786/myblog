"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
// service role key를 쓰는 걸로 변경
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { AUTHOR_NAME_MAX_LENGTH, COMMENT_BODY_MAX_LENGTH } from "@/lib/comments";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1시간
const RATE_LIMIT_MAX_PER_WINDOW = 10;
const MIN_INTERVAL_MS = 30 * 1000;  // 30초
const IP_HASH_FALLBACK_SALT = "myblog-comment-rate-limit";

async function getClientIpHash(): Promise<string> {
  const headerList = await headers();
  // vercel 같은 프록시/엣지 네트워크가 요청에 대해 어떤 ip에서 왔는지 넣어주는 헤더
  // x-forwarded-for: 203.0.113.5, 70.41.3.18, 150.172.238.178 이런 형태로 옴 (방문자 IP, 뒤는 프록시 IP들)
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");

  // 로컬 환경을 대비하여 fallback으로 unknown
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  const salt = process.env.IP_HASH_SALT ?? IP_HASH_FALLBACK_SALT;

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function createComment({
  postSlug,
  authorName,
  body,
  honeypot,
}: {
  postSlug: string;
  authorName: string;
  body: string;
  honeypot: string;
  }): Promise<{ error: string | null }> {
  // 허니팟 체크
  // DB 건드리는 거 없이, 가짜 성공 반환
  if (honeypot) return { error: null };

  // 입력 검증. 클라이언트 검증은 개발자도구로 우회할 수 있으므로 여기가 실제 방어선.
  // 앞뒤 공백을 잘라낸 값으로 검사·저장한다 — DB check 제약은 길이만 봐서 "   " 같은 공백만 있는 값도 통과시킨다.
  // 잘못된 입력은 DB를 조회할 필요도 없으므로 rate limit 조회보다 먼저 한다.
  const trimmedAuthorName = authorName.trim();
  const trimmedBody = body.trim();

  if (!trimmedAuthorName || !trimmedBody) {
    return { error: "이름과 댓글을 입력해주세요." };
  }
  if (
    trimmedAuthorName.length > AUTHOR_NAME_MAX_LENGTH ||
    trimmedBody.length > COMMENT_BODY_MAX_LENGTH
  ) {
    return { error: "입력이 너무 깁니다." };
  }

  const ipHash = await getClientIpHash();
  const now = Date.now();
  // 현재 시각에서 1시간을 뺀 시각
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS).toISOString();

  // gte("created_at", windowStart) == 1시간 전 시각 이후 것만 필터
  const { data: recentAttempts, error: rateLimitError } = await supabaseAdmin
    .from("comment_rate_limits")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false });

  if (rateLimitError) return { error: "댓글 등록에 실패했습니다." };

  if (recentAttempts.length >= RATE_LIMIT_MAX_PER_WINDOW) {
    return { error: "너무 많은 요청이 감지됐어요. 잠시 후 다시 시도해주세요." };
  }

  const lastAttempt = recentAttempts[0];
  if (
    // 마지막 시도 이후 30초가 지났는지 판단
    lastAttempt &&
    now - new Date(lastAttempt.created_at).getTime() < MIN_INTERVAL_MS
  ) {
    return { error: "너무 빠르게 요청했어요. 잠시 후 다시 시도해주세요." };
  }

  const { error } = await supabaseAdmin.from("comments").insert({
    post_slug: postSlug,
    author_name: trimmedAuthorName,
    body: trimmedBody,
  });

  if (error) return { error: "댓글 등록에 실패했습니다." };

  await supabaseAdmin.from("comment_rate_limits").insert({ ip_hash: ipHash });

  revalidatePath(`/${postSlug}`);
  return { error: null };
}
