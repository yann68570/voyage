import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/post-card";

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorImage?: string;
  likes: string[];
  views: number;
  commentsCount: number;
  createdAt: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const rawPosts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return rawPosts.map((p) => ({
      _id: p._id.toString(),
      content: p.content,
      imageUrl: p.imageUrl || undefined,
      authorId: p.authorId,
      authorName: p.authorName || "Anonyme",
      authorUsername: p.authorUsername || undefined,
      authorImage: p.authorImage || undefined,
      likes: Array.isArray(p.likes) ? p.likes : [],
      views: typeof p.views === "number" ? p.views : 0,
      commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString()
        : new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

async function PostsList() {
  await connection();
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const currentUserId = session?.user?.id;

  const posts = await getPosts();

  if (posts.length === 0) {
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
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          isDetailView={false}
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
