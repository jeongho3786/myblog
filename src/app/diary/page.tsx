import { redirect } from "next/navigation";
import { fetchDiaryPage, parsePageParam, type DiaryEntry } from "@/lib/diary";
import { isAdmin } from "@/lib/dal";
import DiaryEntryItem from "@/components/diary/diary-entry-item";
import DiaryEntryForm from "@/components/diary/diary-entry-form";
import DiaryPagination from "@/components/diary/diary-pagination";

// /diary는 정적 경로라 /[slug]보다 먼저 매칭된다 → slug가 "diary"인 글은 만들 수 없다.
// ?page=를 읽기 때문에 요청마다 렌더링된다.
const DiaryPage = async ({ searchParams }: PageProps<"/diary">) => {
  const requestedPage = parsePageParam((await searchParams).page);

  let entries: DiaryEntry[];
  let page: number;
  let totalPages: number;
  let totalCount: number;

  try {
    ({ entries, page, totalPages, totalCount } = await fetchDiaryPage(requestedPage));
  } catch {
    return (
      <DiaryLayout>
        <p className="text-sm text-accent-alt">짧은 일기를 불러오지 못했습니다.</p>
      </DiaryLayout>
    );
  }

  // 마지막 페이지를 넘는 번호(?page=99)는 fetchDiaryPage가 마지막 페이지로 맞춰서 돌려주므로, 주소도 그에 맞춘다.
  // redirect는 예외를 던져 렌더링을 끝내므로 위 try 밖에서 호출한다.
  if (page !== requestedPage) {
    redirect(page === 1 ? "/diary" : `/diary?page=${page}`);
  }

  // 어드민에게만 작성 폼·수정/삭제 버튼을 보여준다. 화면에서 숨기는 것일 뿐이고 실제 방어는 서버 액션의 verifyAdmin()
  const canEdit = await isAdmin();

  return (
    <DiaryLayout totalCount={totalCount}>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">아직 짧은 일기가 없습니다.</p>
      ) : (
        <ul className="border-t border-border">
          {entries.map((entry) => (
            <DiaryEntryItem key={entry.id} entry={entry} canEdit={canEdit} />
          ))}
        </ul>
      )}

      <DiaryPagination currentPage={page} totalPages={totalPages} />

      {canEdit && <DiaryEntryForm />}
    </DiaryLayout>
  );
};

const DiaryLayout = ({
  totalCount,
  children,
}: {
  totalCount?: number;
  children: React.ReactNode;
}) => (
  <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
    <div className="mb-14">
      <div className="mb-5 text-sm font-medium tracking-label text-primary">
        {"// DIARY"}
      </div>

      <h1 className="mb-5 text-5xl font-bold tracking-tight text-foreground">
        짧은 일기
      </h1>

      {totalCount !== undefined && (
        <div className="text-sm tracking-wide text-muted">
          {totalCount} ENTRIES · SORTED BY DATE
        </div>
      )}
    </div>

    {children}
  </main>
);

export default DiaryPage;
