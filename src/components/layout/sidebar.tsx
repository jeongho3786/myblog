import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import SidebarTree from "./sidebar-tree";

const Sidebar = async () => {
  const posts = await getAllPosts();

  const grouped = new Map<string, { slug: string; title: string }[]>();

  for (const post of posts) {
    const key = post.tags[0] ?? "uncategorized";
    const list = grouped.get(key) ?? [];

    list.push({ slug: post.slug, title: post.title });
    grouped.set(key, list);
  }

  const categories = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, categoryPosts]) => ({
      key,
      name: `${key}/`,
      posts: categoryPosts,
    }));

  return (
    <>
      <Link
        href="/"
        className="mb-10 block text-lg font-bold -tracking-tight text-foreground"
      >
        jeong-ho blog
      </Link>

      <SidebarTree categories={categories} />
    </>
  );
};

export default Sidebar;
