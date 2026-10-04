import Link from "next/link";

// 현재 페이지 양옆으로 몇 개의 번호를 보여줄지. 2면 5페이지에서 "1 … 3 4 5 6 7 … 20"
const SIBLING_COUNT = 2;

// 1페이지는 쿼리 없이 /diary로 (같은 페이지가 주소 두 개로 나뉘지 않게)
const pageHref = (pageNumber: number) =>
  pageNumber === 1 ? "/diary" : `/diary?page=${pageNumber}`;

// 보여줄 페이지 번호 목록. 처음·끝 페이지는 항상 보이고, 현재 페이지 주변만 펼치고 나머지는 "…"로 줄인다.
// 예) currentPage = 5, totalPages = 20 → [1, "…", 3, 4, 5, 6, 7, "…", 20]
// 예) currentPage = 1, totalPages = 2  → [1, 2]
const getPageItems = (currentPage: number, totalPages: number): (number | "…")[] => {
  const windowStart = Math.max(2, currentPage - SIBLING_COUNT);
  const windowEnd = Math.min(totalPages - 1, currentPage + SIBLING_COUNT);

  const items: (number | "…")[] = [1];
  if (windowStart > 2) items.push("…");
  for (let pageNumber = windowStart; pageNumber <= windowEnd; pageNumber++) {
    items.push(pageNumber);
  }
  if (windowEnd < totalPages - 1) items.push("…");
  if (totalPages > 1) items.push(totalPages);

  return items;
};

const DiaryPagination = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="짧은 일기 페이지" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {hasPrev ? (
        <Link href={pageHref(currentPage - 1)} className="text-muted hover:text-foreground">
          &larr; 이전
        </Link>
      ) : (
        <span className="text-code-tab">&larr; 이전</span>
      )}

      <ol className="flex items-center gap-1">
        {getPageItems(currentPage, totalPages).map((item, index) =>
          item === "…" ? (
            // "…"는 두 번 나올 수 있어서 위치(index)로 key를 만든다
            <li key={`ellipsis-${index}`} className="px-2 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={pageHref(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={`block min-w-8 border px-2 py-1 text-center ${
                  item === currentPage
                    ? "border-foreground font-bold text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>

      {hasNext ? (
        <Link href={pageHref(currentPage + 1)} className="text-muted hover:text-foreground">
          다음 &rarr;
        </Link>
      ) : (
        <span className="text-code-tab">다음 &rarr;</span>
      )}
    </nav>
  );
}

export default DiaryPagination;
