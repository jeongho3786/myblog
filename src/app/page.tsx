import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Tag from "@/components/ui/tag";

const Home = async () => {
  const posts = await getAllPosts();

  return (
    <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
      <div className="mb-14">
        <div className="mb-5 text-sm font-medium tracking-label text-primary">
          {"// INDEX"}
        </div>

        <h1 className="mb-5 text-5xl font-bold tracking-tight text-foreground">
          ALL POSTS
        </h1>

        <div className="text-sm tracking-wide text-muted">
          {posts.length} ENTRIES · SORTED BY DATE
        </div>
      </div>

      <div>
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            className="grid grid-cols-[60px_1fr_140px] items-start gap-5 border-b border-border py-5"
          >
            <span className="pt-0.5 text-sm text-muted">
              {String(posts.length - index).padStart(3, "0")}
            </span>

            <span>
              <span className="block text-xl font-bold text-foreground">
                {post.title}
              </span>

              {post.tags.length > 0 && (
                <span className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Tag key={tag}>#{tag.toUpperCase()}</Tag>
                  ))}
                </span>
              )}
            </span>

            <span className="pt-0.5 text-right text-sm tracking-normal text-muted">
              {post.date}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default Home;
