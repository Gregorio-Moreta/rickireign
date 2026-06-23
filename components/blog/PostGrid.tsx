import { BlogCard } from "@/components/ui/BlogCard";
import type { PostListItem } from "@/lib/sanity/types";

/** Responsive card grid shared by the blog index and tag pages. */
export function PostGrid({ posts }: { posts: PostListItem[] }) {
  return (
    <ul className="grid gap-x-gutter gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post._id}>
          <BlogCard post={post} />
        </li>
      ))}
    </ul>
  );
}
