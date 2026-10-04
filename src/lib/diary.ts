import { supabase } from "@/lib/supabase/client";

// 짧은 일기 조회. 테이블 정의는 supabase/migrations/0009_diary_entries.sql 참고.
// 읽기는 anon 클라이언트로 하고, 쓰기(작성·수정·삭제)는 src/lib/actions/diary.ts의 Server Action이 service role로 한다.

export interface DiaryEntry {
  id: string;
  body: string;
  created_at: string;
}

export const DIARY_PAGE_SIZE = 5;

// DB check 제약(0009)과 같은 값. 폼 검증과 서버 액션 검증이 같이 쓴다.
export const DIARY_BODY_MAX_LENGTH = 1000;

// ?page= 값을 1 이상의 정수로 바꾼다. 없거나 숫자가 아니면 1페이지.
// searchParams 값은 같은 키가 여러 번 오면 배열이 될 수 있어서 string일 때만 본다.
export const parsePageParam = (value: string | string[] | undefined): number => {
  const pageNumber = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
};

// 최신순으로 requestedPage번째 페이지(5개)를 가져온다.
// 페이지 번호로 이동하는 방식이라 "몇 번째부터"라는 위치가 필요해서 offset(.range)을 쓰고, 전체 페이지 수를 위해 개수도 센다.
//
// 개수를 먼저 세는 이유: 마지막 페이지를 넘는 범위를 .range()로 요청하면 PostgREST가 에러(416)를 돌려준다.
// 그래서 개수로 페이지 범위를 먼저 확정하고(넘으면 마지막 페이지로 맞춤), 그 범위 안에서만 조회한다.
// 돌려주는 page가 requestedPage와 다르면 호출하는 쪽에서 주소를 맞춰줄 수 있다.
export const fetchDiaryPage = async (
  requestedPage: number,
): Promise<{ entries: DiaryEntry[]; page: number; totalPages: number; totalCount: number }> => {
  // head: true → 행은 안 가져오고 개수만
  const { count, error: countError } = await supabase
    .from("diary_entries")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  const totalCount = count ?? 0;
  if (totalCount === 0) return { entries: [], page: 1, totalPages: 0, totalCount };

  const totalPages = Math.ceil(totalCount / DIARY_PAGE_SIZE);
  const page = Math.min(requestedPage, totalPages);

  // 3페이지면 from = 10, to = 14 (0부터 세고 to도 포함)
  const from = (page - 1) * DIARY_PAGE_SIZE;
  const to = from + DIARY_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, body, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return { entries: data as DiaryEntry[], page, totalPages, totalCount };
};
