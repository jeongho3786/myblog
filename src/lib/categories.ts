import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase/client";

// 사이드바 트리에 쓰이는 카테고리(폴더). 테이블 정의는 supabase/migrations/0004_categories.sql 참고.
// slug는 MDX metadata.category가 가리키는 식별자라서 만든 뒤에는 바꾸지 않는다. 화면에 보이는 건 name.
export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
}

// 트리로 조립된 카테고리. depth는 최상위가 1 (최대 3단계).
export type CategoryNode = Category & {
  depth: number;
  children: CategoryNode[];
};

export const MAX_CATEGORY_DEPTH = 3;

// 카테고리 전체를 평평한 배열로 가져온다. 읽기는 공개라서 anon 클라이언트로 충분하다.
// 쓰기 액션에서 updateTag("categories")로 만료시키기 전까지 캐시된 값을 재사용한다.
export const getAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, parent_id, name, slug, sort_order");

    // 에러를 던지면 실패한 결과는 캐시되지 않는다
    if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);

    return data;
  },
  ["all-categories"],
  { tags: ["categories"] },
);

// 사이드바 · 글 페이지처럼 카테고리 없이도 화면이 그려져야 하는 곳에서 쓴다.
// 조회에 실패하면 로그만 남기고 빈 배열을 돌려준다 → 모든 글이 uncategorized로 보인다 (실패한 결과는 캐시되지 않는다)
export async function getAllCategoriesOrEmpty(): Promise<Category[]> {
  try {
    return await getAllCategories();
  } catch (error) {
    console.error("[categories] 카테고리 조회 실패", error);
    return [];
  }
}

// 같은 부모 아래 폴더 순서: sort_order → name (트리 조립과 순서 변경 액션이 같은 기준을 쓴다)
export function compareCategories(
  a: Pick<Category, "sort_order" | "name">,
  b: Pick<Category, "sort_order" | "name">,
): number {
  return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
}

// 평평한 배열을 parent_id 기준으로 트리로 조립한다 (어드민 페이지와 사이드바가 같이 쓴다).
// 같은 부모 아래에서는 sort_order → name 순으로 정렬한다.
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const childrenByParent = new Map<string | null, Category[]>();

  for (const category of categories) {
    const siblings = childrenByParent.get(category.parent_id) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parent_id, siblings);
  }

  const build = (parentId: string | null, depth: number): CategoryNode[] =>
    (childrenByParent.get(parentId) ?? [])
      .sort(compareCategories)
      .map((category) => ({
        ...category,
        depth,
        children: build(category.id, depth + 1),
      }));

  // 최상위(parent_id = null)부터 내려가므로, 순환 구조에 걸린 폴더는 최상위에 닿지 않아 트리에서 빠진다
  // (순환은 서버 액션에서 막지만, 혹시 생겨도 무한 루프에 빠지지 않는다)
  return build(null, 1);
}

// 폴더 선택지 (추가 · 이동의 "상위 폴더" 목록). label은 "dev / frontend"처럼 최상위부터의 경로
export type CategoryOption = { id: string; label: string; depth: number };

// 트리를 경로 라벨이 붙은 평평한 선택지 목록으로 펼친다 (트리 순서 그대로)
export function toCategoryOptions(
  nodes: CategoryNode[],
  parentLabel = "",
): CategoryOption[] {
  return nodes.flatMap((node) => {
    const label = parentLabel ? `${parentLabel} / ${node.name}` : node.name;
    return [
      { id: node.id, label, depth: node.depth },
      ...toCategoryOptions(node.children, label),
    ];
  });
}

// 이 폴더를 포함해 아래로 몇 단계가 있는지 (하위 폴더가 없으면 1)
export function countSubtreeLevels(node: CategoryNode): number {
  return 1 + Math.max(0, ...node.children.map(countSubtreeLevels));
}

// 이 폴더와 모든 하위 폴더의 id
export function collectSubtreeIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectSubtreeIds)];
}

// 글의 category slug로 최상위부터의 경로를 만든다 (예: "react" → [dev, frontend, react]).
// DB에 없는 slug거나 null이면 빈 배열 → uncategorized
export function getCategoryPath(
  categories: Category[],
  slug: string | null,
): Category[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const path: Category[] = [];
  let current = categories.find((category) => category.slug === slug);

  // 최대 깊이를 넘으면 멈춘다 (혹시 순환 구조가 있어도 무한 루프에 빠지지 않는다)
  while (current && path.length < MAX_CATEGORY_DEPTH) {
    path.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }

  // 최대 깊이 안에 최상위까지 닿지 못했으면 순환 등 잘못된 데이터다.
  // 사이드바(buildCategoryTree)에서도 빠지는 폴더이므로 똑같이 uncategorized로 취급한다
  if (current) return [];

  return path;
}
