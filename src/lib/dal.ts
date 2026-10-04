import { cache } from "react";
import { forbidden } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session-client";

// 어드민 확인 로직을 한 곳에 모아둔 Data Access Layer.
// 페이지와 서버 액션은 모두 이 파일의 함수로만 로그인/어드민 여부를 판단한다.

// 현재 로그인한 사용자의 JWT claims. 로그인 안 했으면 null.
// cache로 감싸서 한 번의 렌더링 안에서 여러 번 불러도 Supabase 호출은 한 번만 한다.
export const getCurrentUser = cache(async () => {
  const supabase = await createSessionClient();
  // getClaims는 쿠키의 JWT 서명을 검증하므로 조작된 쿠키로는 통과할 수 없다
  const { data } = await supabase.auth.getClaims();

  return data?.claims ?? null;
});

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

// 어드민 판별 규칙은 여기 한 곳에만 둔다. isAdmin()과 verifyAdmin()이 같이 쓴다.
// env가 비어 있으면 아무도 통과시키지 않는다 (설정 실수로 열리지 않게)
const isAdminUser = (user: CurrentUser): user is NonNullable<CurrentUser> => {
  const adminUserId = process.env.ADMIN_USER_ID;
  return !!user && !!adminUserId && user.sub === adminUserId;
};

// 어드민이 아니면(로그인 안 한 경우 포함) 403으로 중단한다.
// 서버 액션은 페이지를 거치지 않고 직접 호출될 수 있으므로, 쓰기 액션마다 맨 앞에서 반드시 호출한다.
export async function verifyAdmin() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    forbidden();
  }

  return user;
}

// 공개 페이지에서 어드민 전용 UI(작성 폼, 수정/삭제 버튼)를 보여줄지 정할 때 쓴다. 막지 않고 true/false만 돌려준다.
// 화면에서 숨기는 것일 뿐 방어선이 아니다 — 실제 쓰기 액션은 각자 verifyAdmin()을 다시 호출한다.
export async function isAdmin() {
  return isAdminUser(await getCurrentUser());
}
