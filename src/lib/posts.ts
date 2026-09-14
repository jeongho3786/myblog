import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export const getAllPosts = unstable_cache(
  async (): Promise<PostMeta[]> => {
    const slugs = getAllSlugs();
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const { metadata } = await import(`@/content/posts/${slug}.mdx`);
        return { slug, tags: [], ...metadata } as PostMeta;
      }),
    );
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  ["all-posts"],
  { tags: ["posts"] },
);

export function getReadingTimeMinutes(slug: string): number {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
  return Math.max(1, Math.round(raw.length / 500));
}

export async function getAdjacentPosts(
  slug: string,
): Promise<{ prev: PostMeta | null; next: PostMeta | null }> {
  const posts = await getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index >= 0 ? (posts[index + 1] ?? null) : null,
    next: index >= 0 ? (posts[index - 1] ?? null) : null,
  };
}
