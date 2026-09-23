import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 어드민 페이지 요청 직전에 Supabase 세션을 확인하고, access token이 만료됐으면
// refresh token으로 갱신해서 새 쿠키를 응답에 실어 보낸다.
// 서버 컴포넌트는 쿠키를 쓸 수 없어서, 이 갱신을 여기서 해줘야 로그인이 풀리지 않는다.
// 어드민 여부 판단(403)은 여기서 하지 않고 페이지/서버 액션의 verifyAdmin()에서 한다.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 갱신된 쿠키를 요청에도 반영해야 이어지는 서버 컴포넌트가 새 토큰을 읽는다.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // 세션 쿠키가 담긴 응답이 CDN에 캐시되어 다른 사람에게 가지 않도록 no-store 헤더
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // 세션을 불러오면서 필요하면 토큰을 갱신한다 (결과는 여기서 쓰지 않음)
  await supabase.auth.getClaims();

  return response;
}

// 블로그 글 페이지는 로그인과 무관한 정적 페이지라 제외하고, 어드민 경로에서만 실행한다.
export const config = {
  matcher: ["/admin/:path*"],
};
