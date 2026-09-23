"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session-client";

// Google 로그인 시작. Supabase가 만들어 준 Google 로그인 주소로 보낸다.
// 로그인이 끝나면 Google → Supabase(/auth/v1/callback) → 우리 /auth/callback 순서로 돌아온다.
export async function signInWithGoogle() {
  const supabase = await createSessionClient();

  // 요청이 들어온 주소(localhost든 배포 도메인이든)로 돌아오게 해서 환경별 설정 없이 동작하게 한다.
  // 이 주소는 Supabase의 Redirect URLs 허용 목록에 있어야 한다.
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/admin`,
    },
  });

  if (error || !data.url) {
    redirect("/admin?error=signin");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSessionClient();

  await supabase.auth.signOut();
  redirect("/admin");
}
