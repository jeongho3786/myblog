import Link from "next/link";
import {
  getAllSlugs,
  getAdjacentPosts,
  getReadingTimeMinutes,
} from "@/lib/posts";
import Divider from "@/components/ui/divider";
import CommentForm from "@/components/comments/comment-form";
import CommentList from "@/components/comments/comment-list";

const PostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { default: Post, metadata } = await import(
    `@/content/posts/${slug}.mdx`
  );
  const { prev, next } = await getAdjacentPosts(slug);
  const readingTime = getReadingTimeMinutes(slug);
  const tags: string[] = metadata.tags ?? [];

  return (
    <main className="min-w-0 max-w-200 flex-1 px-14 pt-14 pb-25">
      <div className="mb-10">
        <div className="mb-5 text-sm tracking-wide text-muted">
          {metadata.date}
          {tags.length > 0 && ` · #${tags[0].toUpperCase()}`}
          {` · ${readingTime} MIN READ`}
        </div>

        <h1 className="text-4xl leading-tight font-bold tracking-tight text-foreground">
          {metadata.title}
        </h1>
      </div>

      <Divider variant="rule" className="mb-10" />

      <article>
        <Post />
      </article>

      <div className="mt-15 flex justify-between border-t border-border pt-6 text-sm tracking-normal">
        {prev ? (
          <Link href={`/${prev.slug}`} className="text-muted">
            &larr; 이전 글
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${next.slug}`} className="text-primary">
            다음 글 &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      <section className="mt-16">
        <h2 className="mb-4 text-xl font-semibold">댓글</h2>

        <CommentForm postSlug={slug} />

        <div className="mt-8">
          <CommentList postSlug={slug} />
        </div>
      </section>
    </main>
  );
}

export default PostPage;

export const generateStaticParams = () => {
  return getAllSlugs().map((slug) => ({ slug }));
}

// 목록에 없는 슬러그면 바로 404 반환.
export const dynamicParams = false;
