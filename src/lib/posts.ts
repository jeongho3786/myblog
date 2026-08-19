import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = getAllSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const { metadata } = await import(`@/content/posts/${slug}.mdx`);
      return { slug, ...metadata } as PostMeta;
    }),
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
