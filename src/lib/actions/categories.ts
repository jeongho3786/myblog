"use server";

import { updateTag } from "next/cache";
import { verifyAdmin } from "@/lib/dal";
import { getAllPosts } from "@/lib/posts";
import { compareCategories, MAX_CATEGORY_DEPTH } from "@/lib/categories";
import { supabaseAdmin } from "@/lib/supabase/server-client";

// DB check 제약(0004_categories.sql)과 같은 규칙 — DB 에러 대신 알아보기 쉬운 메시지를 먼저 돌려주려고 서버에서도 검사한다
// 오직 소문자, 숫자, 하이픈
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_LENGTH = 40;

type ActionResult = { error: string | null };

// 이름 검사 (추가 · 이름 변경 공통). 문제가 없으면 null
function validateName(trimmedName: string): string | null {
  if (trimmedName.length < 1 || trimmedName.length > MAX_LENGTH) {
    return `이름은 1~${MAX_LENGTH}자로 입력해 주세요.`;
  }

  return null;
}

export async function createCategory({
  name,
  slug,
  parentId,
}: {
  name: string;
  slug: string;
  parentId: string | null;
}): Promise<ActionResult> {
  // 서버 액션은 페이지를 거치지 않고 직접 호출될 수 있으므로 맨 앞에서 확인한다
  await verifyAdmin();

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();

  const nameError = validateName(trimmedName);
  if (nameError) return { error: nameError };

  if (trimmedSlug.length > MAX_LENGTH || !SLUG_PATTERN.test(trimmedSlug)) {
    return {
      error: `slug는 ${MAX_LENGTH}자 이내의 소문자·숫자·하이픈만 쓸 수 있습니다 (예: data-structure).`,
    };
  }

  // 깊이는 캐시가 아니라 DB의 최신 상태로 계산한다 (방금 다른 변경이 있었을 수도 있으므로)
  const { data: categories, error: fetchError } = await supabaseAdmin
    .from("categories")
    .select("id, parent_id, sort_order");

  // 화면에는 결과만 알리고, 실패 원인은 서버 로그에 남긴다
  if (fetchError) {
    console.error("[createCategory] 카테고리 조회 실패", fetchError);
    return { error: "카테고리를 추가하지 못했습니다." };
  }

  const parentById = new Map(
    categories.map((category) => [category.id, category.parent_id]),
  );

  if (parentId !== null && !parentById.has(parentId)) {
    return { error: "상위 폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  // 새 폴더의 깊이 = 새 폴더 자신(1) + 상위 폴더에서 최상위까지 올라가며 만난 조상 수
  // depthCount: 지금까지 센 단계 수. 새 폴더 자신부터 세므로 1에서 시작한다
  // ancestorId: 지금 세고 있는 조상 폴더. 상위 폴더에서 시작해 한 칸씩 부모로 올라간다
  let depthCount = 1;
  let ancestorId = parentId;

  // 최대 깊이를 넘으면 더 셀 필요가 없으므로 멈춘다 (혹시 순환 구조가 있어도 무한 루프에 빠지지 않는다)
  while (ancestorId !== null && depthCount <= MAX_CATEGORY_DEPTH) {
    depthCount += 1;
    ancestorId = parentById.get(ancestorId) ?? null;
  }

  // 1~3이면 통과, 4부터 에러
  if (depthCount > MAX_CATEGORY_DEPTH) {
    return { error: `폴더는 최대 ${MAX_CATEGORY_DEPTH}단계까지만 만들 수 있습니다.` };
  }

  // 같은 폴더 안 맨 뒤에 붙인다 (삭제로 번호가 비어 있을 수 있어 개수가 아니라 최댓값 + 1)
  const sortOrder = Math.max(
    -1,
    ...categories
      .filter((category) => category.parent_id === parentId)
      .map((category) => category.sort_order),
  ) + 1;

  const { error } = await supabaseAdmin.from("categories").insert({
    parent_id: parentId,
    name: trimmedName,
    slug: trimmedSlug,
    sort_order: sortOrder,
  });

  if (error) {
    // 23505 = unique 제약 위반. 어떤 제약에 걸렸는지는 메시지의 제약 이름으로 구분한다
    if (error.code === "23505" && error.message.includes("categories_slug_key")) {
      return { error: `이미 사용 중인 slug입니다: ${trimmedSlug}` };
    }
    if (error.code === "23505" && error.message.includes("categories_parent_name_unique")) {
      return { error: `같은 위치에 같은 이름의 폴더가 이미 있습니다: ${trimmedName}` };
    }

    console.error("[createCategory] insert 실패", error);
    return { error: "카테고리를 추가하지 못했습니다." };
  }

  // 방금 추가한 폴더가 바로 보이도록 캐시를 즉시 만료시킨다 (어드민 트리 · 사이드바)
  // updateTag는 캐시를 만료시키지 다시금 호출을 하지는 않는다.
  // 다만 서버액션 내에 updateTag가 있다면 해당 경로에서 리랜더링을 트리거한다.
  updateTag("categories");
  return { error: null };
}

// 이름만 바꾼다. slug는 MDX와 DB를 잇는 식별자라서 받지 않는다 (수정 불가 방침)
export async function renameCategory({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<ActionResult> {
  await verifyAdmin();

  const trimmedName = name.trim();
  const nameError = validateName(trimmedName);

  if (nameError) return { error: nameError };

  // select를 붙여야 바뀐 행이 돌아온다 — 0개면 그 사이 삭제된 폴더
  const { data, error } = await supabaseAdmin
    .from("categories")
    .update({ name: trimmedName })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505" && error.message.includes("categories_parent_name_unique")) {
      return { error: `같은 위치에 같은 이름의 폴더가 이미 있습니다: ${trimmedName}` };
    }

    console.error("[renameCategory] update 실패", error);
    return { error: "이름을 바꾸지 못했습니다." };
  }

  if (data.length === 0) {
    return { error: "폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  updateTag("categories");
  return { error: null };
}

// 폴더를 다른 상위 폴더(또는 최상위)로 옮긴다. 하위 폴더들도 함께 따라간다.
// MDX는 slug만 알고 경로는 DB에서 계산하므로, 옮겨도 MDX는 고칠 필요가 없다
export async function moveCategory({
  id,
  parentId,
}: {
  id: string;
  parentId: string | null;
}): Promise<ActionResult> {
  await verifyAdmin();

  if (parentId === id) {
    return { error: "폴더를 자기 자신 안으로 옮길 수 없습니다." };
  }

  // 순환 · 깊이 검사는 캐시가 아니라 DB의 최신 상태로 한다
  const { data: categories, error: fetchError } = await supabaseAdmin
    .from("categories")
    .select("id, parent_id, sort_order");

  if (fetchError) {
    console.error("[moveCategory] 카테고리 조회 실패", fetchError);
    return { error: "폴더를 옮기지 못했습니다." };
  }

  const parentById = new Map(
    categories.map((category) => [category.id, category.parent_id]),
  );

  if (!parentById.has(id)) {
    return { error: "폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  if (parentId !== null && !parentById.has(parentId)) {
    return { error: "옮길 위치의 폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  // 이미 그 위치에 있으면 바꿀 것이 없다
  if (parentById.get(id) === parentId) return { error: null };

  // 1) 옮길 위치(새 상위 폴더)에서 최상위까지 올라가며 조상을 센다.
  //    올라가다 옮기려는 폴더 자신을 만나면, 자기 하위 폴더 안으로 옮기려는 것(순환)이다.
  // depthCount: 새 상위 폴더의 깊이 (최상위로 옮기면 0)
  // ancestorId: 지금 세고 있는 조상 폴더
  let depthCount = 0;
  let ancestorId = parentId;

  while (ancestorId !== null && depthCount <= MAX_CATEGORY_DEPTH) {
    if (ancestorId === id) {
      return { error: "폴더를 자기 하위 폴더 안으로 옮길 수 없습니다." };
    }

    depthCount += 1;
    ancestorId = parentById.get(ancestorId) ?? null;
  }

  // 2) 옮기는 폴더 아래로 하위 폴더가 몇 단계 있는지 센다 (자기 자신 = 1).
  //    예: dev > frontend > react에서 frontend를 옮기면 2 (frontend, react)
  const childIdsByParent = new Map<string, string[]>();
  for (const category of categories) {
    if (category.parent_id === null) continue;
    const childIds = childIdsByParent.get(category.parent_id) ?? [];
    childIds.push(category.id);
    childIdsByParent.set(category.parent_id, childIds);
  }

  // level이 최대 깊이를 넘으면 더 내려가지 않는다 (혹시 순환 구조가 있어도 무한 재귀에 빠지지 않는다)
  const countSubtreeLevels = (categoryId: string, level: number): number =>
    level > MAX_CATEGORY_DEPTH
      ? level
      : Math.max(
          level,
          ...(childIdsByParent.get(categoryId) ?? []).map((childId) =>
            countSubtreeLevels(childId, level + 1),
          ),
        );

  // 옮긴 뒤 가장 깊은 하위 폴더의 깊이 = 새 상위 폴더 깊이 + 옮기는 폴더 아래 단계 수
  const deepestDepth = depthCount + countSubtreeLevels(id, 1);

  if (deepestDepth > MAX_CATEGORY_DEPTH) {
    return {
      error: `옮기면 하위 폴더까지 ${deepestDepth}단계가 되어 최대 ${MAX_CATEGORY_DEPTH}단계를 넘습니다.`,
    };
  }

  // 새 위치의 맨 뒤에 붙인다
  const sortOrder = Math.max(
    -1,
    ...categories
      .filter((category) => category.parent_id === parentId)
      .map((category) => category.sort_order),
  ) + 1;

  const { error } = await supabaseAdmin
    .from("categories")
    .update({ parent_id: parentId, sort_order: sortOrder })
    .eq("id", id);

  if (error) {
    if (error.code === "23505" && error.message.includes("categories_parent_name_unique")) {
      return { error: "옮길 위치에 같은 이름의 폴더가 이미 있습니다." };
    }

    console.error("[moveCategory] update 실패", error);
    return { error: "폴더를 옮기지 못했습니다." };
  }

  updateTag("categories");
  return { error: null };
}

// 같은 폴더 안에서 한 칸 위(up) / 아래(down)로 옮긴다
export async function reorderCategory({
  id,
  direction,
}: {
  id: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  await verifyAdmin();

  const { data: target, error: targetError } = await supabaseAdmin
    .from("categories")
    .select("parent_id")
    .eq("id", id)
    .maybeSingle();

  if (targetError) {
    console.error("[reorderCategory] 폴더 조회 실패", targetError);
    return { error: "순서를 바꾸지 못했습니다." };
  }

  if (!target) {
    return { error: "폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  // 같은 부모 아래 형제 폴더들 (최상위면 parent_id가 null인 것들)
  const siblingsQuery = supabaseAdmin
    .from("categories")
    .select("id, parent_id, name, slug, sort_order");

  const { data: siblings, error: siblingsError } =
    target.parent_id === null
      ? await siblingsQuery.is("parent_id", null)
      : await siblingsQuery.eq("parent_id", target.parent_id);

  if (siblingsError) {
    console.error("[reorderCategory] 형제 폴더 조회 실패", siblingsError);
    return { error: "순서를 바꾸지 못했습니다." };
  }

  // 화면의 트리와 같은 기준으로 정렬한 뒤, 이웃한 두 폴더의 자리를 맞바꾼다
  const ordered = siblings.sort(compareCategories);
  const index = ordered.findIndex((category) => category.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  // 이미 맨 위 / 맨 아래면 바꿀 것이 없다
  if (swapIndex < 0 || swapIndex >= ordered.length) return { error: null };

  [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];

  // sort_order를 0부터 다시 매긴다. 삭제 등으로 번호가 비었거나 겹쳐 있어도 이번에 정리된다.
  // 여러 행을 upsert 한 번으로 보내서 중간에 일부만 바뀐 상태로 남지 않게 한다
  const { error } = await supabaseAdmin.from("categories").upsert(
    ordered.map((category, sortOrder) => ({ ...category, sort_order: sortOrder })),
  );

  if (error) {
    console.error("[reorderCategory] upsert 실패", error);
    return { error: "순서를 바꾸지 못했습니다." };
  }

  updateTag("categories");
  return { error: null };
}

// 삭제 확인 때 보여줄 "이 폴더에 바로 속한 글" 목록.
// 트리에는 글 수를 표시하지 않기로 해서, 삭제 확인 영역을 열 때만 찾는다
export async function findPostsInCategory(
  slug: string,
): Promise<
  | { posts: { slug: string; title: string }[]; error: null }
  | { posts: null; error: string }
> {
  // forbidden()은 Next.js가 403을 보여주려고 일부러 던지는 예외라 try 밖에 둔다
  await verifyAdmin();

  // Supabase와 달리 getAllPosts(파일 읽기 · MDX import)는 실패하면 예외를 던지므로 try로 감싼다
  try {
    const posts = await getAllPosts();

    return {
      posts: posts
        .filter((post) => post.category === slug)
        .map((post) => ({ slug: post.slug, title: post.title })),
      error: null,
    };
  } catch (error) {
    console.error("[findPostsInCategory] 글 목록 조회 실패", error);
    return { posts: null, error: "연결된 글을 확인하지 못했습니다. 다시 시도해 주세요." };
  }
}

// 폴더를 삭제한다. 여기 속한 글은 MDX의 category가 DB에 없는 slug가 되어 uncategorized로 보인다
export async function deleteCategory({ id }: { id: string }): Promise<ActionResult> {
  await verifyAdmin();

  // 하위 폴더가 있으면 막는다 (DB의 on delete restrict가 마지막 안전장치지만, 알아보기 쉬운 메시지를 먼저 돌려준다)
  const { count, error: childError } = await supabaseAdmin
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id);

  if (childError) {
    console.error("[deleteCategory] 하위 폴더 조회 실패", childError);
    return { error: "폴더를 삭제하지 못했습니다." };
  }

  if (count && count > 0) {
    return { error: "하위 폴더가 있어서 삭제할 수 없습니다. 하위 폴더를 먼저 옮기거나 삭제해 주세요." };
  }

  // select를 붙여야 삭제된 행이 돌아온다 — 0개면 그 사이 이미 삭제된 폴더
  const { data, error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    // 23503 = 외래 키 위반. 확인한 사이에 하위 폴더가 생긴 경우 on delete restrict에 걸린다
    if (error.code === "23503") {
      return { error: "하위 폴더가 있어서 삭제할 수 없습니다. 하위 폴더를 먼저 옮기거나 삭제해 주세요." };
    }

    console.error("[deleteCategory] delete 실패", error);
    return { error: "폴더를 삭제하지 못했습니다." };
  }

  if (data.length === 0) {
    return { error: "폴더를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요." };
  }

  updateTag("categories");
  return { error: null };
}
