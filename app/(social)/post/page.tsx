import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/post-card";
import { Post, Comment } from "@/types";

interface FeedPost extends Omit<Post, "_id"> {
  _id: string;
  imageUrl?: string;
}

interface FeedComment extends Omit<Comment, "_id" | "postId"> {
  _id: string;
  postId: string;
}

interface FeedData {
  post: FeedPost;
  comments: FeedComment[];
  commentsCount: number;
}

async function getFeedData(): Promise<FeedData[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const rawPosts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Promise.all(
      rawPosts.map(async (p) => {
        const commentDocs = await db
          .collection("comments")
          .find({ postId: p._id })
          .sort({ createdAt: -1 })
          .toArray();

        const comments: FeedComment[] = commentDocs.map((c) => ({
          _id: c._id.toString(),
          postId: c.postId.toString(),
          authorId: c.authorId,
          authorName: c.authorName || "Anonyme",
          authorImage: c.authorImage || undefined,
          content: c.content,
          likes: Array.isArray(c.likes) ? c.likes : [],
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        }));

        const imagesList = Array.isArray(p.images) ? p.images : [];

        const post: FeedPost = {
          _id: p._id.toString(),
          title: p.title || "",
          content: p.content,
          destination: p.destination || "",
          imageUrl:
            p.imageUrl || (imagesList.length > 0 ? imagesList[0] : undefined),
          images: imagesList,
          authorId: p.authorId,
          authorName: p.authorName || "Anonyme",
          authorImage: p.authorImage || undefined,
          likes: Array.isArray(p.likes) ? p.likes : [],
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        };

        return {
          post,
          comments,
          commentsCount: comments.length,
        };
      }),
    );
  } catch {
    return [];
  }
}

async function PostsList() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const feedData = await getFeedData();

  if (feedData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <p className="text-gray-500">
          Aucun post pour le moment. Soyez le premier à publier !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

export default function PostsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Fil d&apos;actualité
        </h1>
        <Link
          href="/post/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Créer un post
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-400">
            Chargement du fil...
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
