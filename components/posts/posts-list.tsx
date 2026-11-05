import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PostCard } from "@/components/posts/post-card";
import { EmptyFeed } from "@/components/posts/empty-feed";
import { getFeedData } from "@/lib/posts";

export async function PostsList() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const feedData = await getFeedData();

  if (feedData.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {feedData.map(({ post, comments, commentsCount }) => (
        <PostCard
          key={post._id}
          post={post}
          comments={comments}
          commentsCount={commentsCount}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
