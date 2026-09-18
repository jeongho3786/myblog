import Link from "next/link";
import {
  getAllSlugs,
  getAdjacentPosts,
  getReadingTimeMinutes,
} from "@/lib/posts";
import Divider from "@/components/ui/divider";
import CommentForm from "@/components/comments/comment-form";
import CommentList from "@/components/comments/comment-list";
import PostToc from "@/components/layout/post-toc";

const PostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { default: Post, metadata } = await import(
    `@/content/posts/${slug}.mdx`
  );
  const { prev, next } = await getAdjacentPosts(slug);
  const readingTime = getReadingTimeMinutes(slug);
  const tags: string[] = metadata.tags ?? [];

  return (
    <>
      <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
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

        <article id="post-content">
          <Post />
        </article>

        <div className="mt-15 flex justify-between border-t border-border pt-6 text-base tracking-normal">
          {prev ? (
            <Link href={`/${prev.slug}`} className="text-muted">
              &larr; 이전 글
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/${next.slug}`} className="text-muted">
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

      <aside className="hidden w-1/3 min-w-55 shrink-0 px-8 pt-14 min-[1120px]:block">
        <div className="sticky top-14">
          <PostToc />
        </div>
      </aside>
    </>
  );
}

export default PostPage;

export const generateStaticParams = () => {
  return getAllSlugs().map((slug) => ({ slug }));
}

// 목록에 없는 슬러그면 바로 404 반환.
export const dynamicParams = false;
