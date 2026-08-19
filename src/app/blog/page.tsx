import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

const BlogPage = async () => {
    const posts = await getAllPosts();

    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold">Blog</h1>

        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold hover:underline">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-500">{post.date}</p>
                <p className="mt-1 text-gray-700">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    )
};

export default BlogPage;
