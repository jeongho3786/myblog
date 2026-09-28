import Link from "next/link";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import {
  buildCategoryTree,
  getAllCategoriesOrEmpty,
  type CategoryNode,
} from "@/lib/categories";
import SidebarTree, { type SidebarFolder, type SidebarPost } from "./sidebar-tree";

const Sidebar = async () => {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    // 사이드바는 루트 레이아웃에 있어서 여기서 에러가 나면 모든 페이지가 깨지므로, 실패하면 빈 배열로 받는다
    getAllCategoriesOrEmpty(),
  ]);

  const categoryTree = buildCategoryTree(categories);

  // 트리에 실제로 들어간 폴더의 slug만 모은다 (순환 등으로 트리에서 빠진 폴더에 속한 글도 uncategorized로)
  const folderSlugs = new Set<string>();
  const collectSlugs = (nodes: CategoryNode[]) =>
    nodes.forEach((node) => {
      folderSlugs.add(node.slug);
      collectSlugs(node.children);
    });
  collectSlugs(categoryTree);

  // 폴더 slug → 그 폴더에 바로 속한 글 (getAllPosts가 이미 날짜 최신순이라 순서가 유지된다)
  const postsByCategory = new Map<string, SidebarPost[]>();
  const uncategorized: SidebarPost[] = [];

  for (const post of posts) {
    if (post.category && folderSlugs.has(post.category)) {
      const list = postsByCategory.get(post.category) ?? [];
      list.push(toSidebarPost(post));
      postsByCategory.set(post.category, list);
      continue;
    }

    // category를 적었는데 DB에 없는 slug면 오타이거나 삭제된 폴더일 수 있으니 개발 중에 알린다
    if (post.category && process.env.NODE_ENV === "development") {
      console.warn(
        `[sidebar] "${post.slug}" 글의 category "${post.category}"가 카테고리 DB에 없어서 uncategorized로 표시합니다.`,
      );
    }

    uncategorized.push(toSidebarPost(post));
  }

  const toSidebarFolders = (nodes: CategoryNode[]): SidebarFolder[] =>
    nodes.map((node) => ({
      id: node.id,
      name: node.name,
      children: toSidebarFolders(node.children),
      posts: postsByCategory.get(node.slug) ?? [],
    }));

  return (
    <>
      <Link
        href="/"
        className="mb-10 block text-lg font-bold -tracking-tight text-foreground"
      >
        jeong-ho blog
      </Link>

      <SidebarTree
        folders={toSidebarFolders(categoryTree)}
        uncategorized={uncategorized}
      />
    </>
  );
};

const toSidebarPost = (post: PostMeta): SidebarPost => ({
  slug: post.slug,
  title: post.title,
});

export default Sidebar;
