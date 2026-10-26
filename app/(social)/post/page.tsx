import clientPromise from "@/lib/db";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
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
  await connection(); // <--- Indique à Next.js que cette partie est dynamique
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
        <article
          key={post._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden space-y-4 p-5 hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.authorImage ? (
                <Image
                  src={post.authorImage}
                  alt={post.authorName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {post.authorName[0]}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {post.authorName}
                </h3>
                <p className="text-xs text-gray-400">
                  {post.authorUsername ? `@${post.authorUsername} • ` : ""}
                  {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {post.content && (
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          )}

          {post.imageUrl && (
            <div className="relative w-full h-80 rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={post.imageUrl}
                alt="Image du post"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <span>❤️ {post.likes.length} J&apos;aime</span>
              <span>💬 {post.commentsCount} commentaires</span>
              <span>👁️ {post.views} vues</span>
            </div>
            <Link
              href={`/post/${post._id}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Voir les détails →
            </Link>
          </div>
        </article>
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
            Chargement du fil d&apos;actualité...
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
