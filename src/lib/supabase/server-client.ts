import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// RLS를 우회하는 service role 클라이언트 — "use server" 액션 밖(클라이언트 컴포넌트)에서
// 절대 import하면 안 된다. 댓글 insert처럼 신뢰된 서버 경로에서만 사용.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
