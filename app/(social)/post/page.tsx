import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Compass, Sparkles } from "lucide-react";

import { Post, Comment } from "@/types";
import { PostCard } from "@/components/posts/post-card";

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
      <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-sm mx-1 sm:mx-0 p-6 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-linear-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-emerald-600">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Aucun voyage partagé pour le moment
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto">
            Soyez le premier explorateur à publier un carnet de route ou des
            photos d&apos;évasion !
          </p>
        </div>
        <Link
          href="/post/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-cyan-600 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Partager une aventure</span>
        </Link>
      </div>
    );
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

export default function PostsPage() {
  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-7">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Fil d&apos;actualité
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Découvrez les dernières aventures de la communauté Best-Voyage
            </p>
          </div>
        </div>

        <Link
          href="/post/new"
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un post</span>
        </Link>
      </div>

      {/* Chargement Suspense stylisé */}
      <Suspense
        fallback={
          <div className="space-y-4 sm:space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-emerald-50 p-4 sm:p-6 space-y-4 animate-pulse shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100/60 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-emerald-100/60 rounded w-1/3" />
                    <div className="h-3 bg-emerald-50 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-emerald-50 rounded w-3/4" />
                <div className="h-32 sm:h-48 bg-emerald-50/50 rounded-xl" />
              </div>
            ))}
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
