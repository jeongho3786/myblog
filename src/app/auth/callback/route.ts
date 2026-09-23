import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/session-client";

// Google 로그인 후 Supabase가 ?code=...를 붙여 보내주는 곳.
// code를 세션으로 교환하면 createSessionClient의 setAll이 로그인 쿠키를 심는다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  // 외부 사이트로 튕겨 보내는 open redirect 방지 — 우리 사이트 안의 경로("/...")만 허용.
  // "//evil.com"은 브라우저가 다른 도메인으로 해석하므로 따로 막는다.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin?error=callback`);
}
