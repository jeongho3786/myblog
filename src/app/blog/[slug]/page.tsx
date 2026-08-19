import { getAllSlugs } from "@/lib/posts";
import CommentForm from "@/components/comments/comment-form";
import CommentList from "@/components/comments/comment-list";


const PostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { default: Post, metadata } = await import(
    `@/content/posts/${slug}.mdx`
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">{metadata.title}</h1>
      <p className="mb-8 text-sm text-gray-500">{metadata.date}</p>

      <article className="prose">
        <Post />
      </article>

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

export const dynamicParams = false;
export const dynamic = "force-dynamic";
