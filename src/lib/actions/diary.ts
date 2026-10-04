"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/dal";
import { DIARY_BODY_MAX_LENGTH } from "@/lib/diary";
import { supabaseAdmin } from "@/lib/supabase/server-client";

type ActionResult = { error: string | null };

// 본문 검사 (작성 · 수정 공통). 앞뒤 공백을 자른 값을 받는다. 문제가 없으면 null
function validateBody(trimmedBody: string): string | null {
  if (!trimmedBody) return "내용을 입력해 주세요.";
  if (trimmedBody.length > DIARY_BODY_MAX_LENGTH) {
    return `${DIARY_BODY_MAX_LENGTH}자까지 입력할 수 있습니다.`;
  }

  return null;
}

export async function createDiaryEntry({ body }: { body: string }): Promise<ActionResult> {
  // 서버 액션은 페이지를 거치지 않고 직접 호출될 수 있으므로 맨 앞에서 확인한다 (어드민이 아니면 403)
  await verifyAdmin();

  const trimmedBody = body.trim();
  const bodyError = validateBody(trimmedBody);
  if (bodyError) return { error: bodyError };

  const { error } = await supabaseAdmin.from("diary_entries").insert({ body: trimmedBody });

  // 화면에는 결과만 알리고, 실패 원인은 서버 로그에 남긴다
  if (error) {
    console.error("[createDiaryEntry] 짧은 일기 작성 실패", error);
    return { error: "짧은 일기를 저장하지 못했습니다." };
  }

  // 같은 왕복 응답에 다시 그린 /diary 화면을 실어 보낸다
  revalidatePath("/diary");
  return { error: null };
}

// 본문만 수정한다. 작성 날짜(created_at)는 그대로 둔다.
export async function updateDiaryEntry({
  id,
  body,
}: {
  id: string;
  body: string;
}): Promise<ActionResult> {
  await verifyAdmin();

  const trimmedBody = body.trim();
  const bodyError = validateBody(trimmedBody);
  if (bodyError) return { error: bodyError };

  // .select("id"): 실제로 바뀐 행을 돌려받아서, 없는 id(이미 삭제됨 등)였는지 알 수 있게 한다
  const { data, error } = await supabaseAdmin
    .from("diary_entries")
    .update({ body: trimmedBody })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[updateDiaryEntry] 짧은 일기 수정 실패", error);
    return { error: "짧은 일기를 수정하지 못했습니다." };
  }
  if (data.length === 0) {
    return { error: "이미 삭제된 일기입니다. 새로고침 후 다시 시도해 주세요." };
  }

  revalidatePath("/diary");
  return { error: null };
}

export async function deleteDiaryEntry({ id }: { id: string }): Promise<ActionResult> {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from("diary_entries")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[deleteDiaryEntry] 짧은 일기 삭제 실패", error);
    return { error: "짧은 일기를 삭제하지 못했습니다." };
  }
  if (data.length === 0) {
    return { error: "이미 삭제된 일기입니다. 새로고침 후 다시 시도해 주세요." };
  }

  // 마지막 페이지의 마지막 하나를 지워 페이지가 사라지면, 다시 그리는 /diary가 마지막 페이지로 redirect한다
  revalidatePath("/diary");
  return { error: null };
}
