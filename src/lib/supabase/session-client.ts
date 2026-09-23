import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// 로그인 세션(쿠키)을 읽고 쓰는 클라이언트 — 어드민 로그인/로그아웃, 어드민 확인에만 사용.
// 요청마다 쿠키가 다르므로 모듈 전역에 하나 만들어 두지 말고, 매번 새로 만들어야 한다.
// 카테고리 쓰기는 이 클라이언트가 아니라 verifyAdmin() 통과 후 supabaseAdmin(service role)으로 한다.
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // 서버 컴포넌트 렌더링 중에는 쿠키를 쓸 수 없어서 에러가 난다.
        // 그 경우 토큰 갱신은 proxy.ts가 대신 쿠키에 반영하므로 무시해도 된다.
        // (서버 액션, 라우트 핸들러에서는 정상적으로 쓰인다)
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {}
      },
    },
  });
}
