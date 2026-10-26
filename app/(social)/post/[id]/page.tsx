import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addComment, toggleLike } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

interface Comment {
  id: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  authorUsername?: string;
  authorImage?: string;
  likes: string[];
  views: number;
  comments: Comment[];
  createdAt: string;
}

async function getPostAndIncrementViews(id: string): Promise<Post | null> {
  if (!ObjectId.isValid(id)) return null;

  try {
    const client = await clientPromise;
    const db = client.db();
    const headersList = await headers();

    // 1. Ignore les requêtes de préchargement (prefetch) de Next.js pour éviter les fausses vues
    const isPrefetch =
      headersList.get("next-router-prefetch") === "1" ||
      headersList.get("purpose") === "prefetch";

    if (!isPrefetch) {
      // Récupère l'utilisateur connecté via Better Auth (ou "anonymous" s'il ne l'est pas)
      const session = await auth.api.getSession({
        headers: headersList,
      });
      const userId = session?.user?.id || "anonymous";

      // 2. Incrémente atomiquement SEULEMENT si l'utilisateur n'a pas encore son ID dans `viewedBy`
      await db.collection("posts").updateOne(
        {
          _id: new ObjectId(id),
          viewedBy: { $ne: userId }, // Vérifie qu'il n'y est pas déjà
        },
        {
          $inc: { views: 1 },
          $push: { viewedBy: userId },
        } as Record<string, unknown>,
      );
    }

    // 3. Récupère le post mis à jour
    const p = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!p) return null;

    return {
      _id: p._id.toString(),
      content: p.content,
      imageUrl: p.imageUrl || undefined,
      authorName: p.authorName || "Anonyme",
      authorUsername: p.authorUsername || undefined,
      authorImage: p.authorImage || undefined,
      likes: Array.isArray(p.likes) ? p.likes : [],
      views: typeof p.views === "number" ? p.views : 0,
      comments: Array.isArray(p.comments) ? p.comments : [],
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString()
        : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function PostDetailContent({ params }: PageProps) {
  await connection();
  const resolvedParams = await params;
  const post = await getPostAndIncrementViews(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const handleLikeAction = async () => {
    "use server";
    await toggleLike(post._id);
  };

  const handleCommentAction = async (formData: FormData) => {
    "use server";
    const commentContent = formData.get("comment");
    if (typeof commentContent === "string") {
      await addComment(post._id, commentContent);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/post" className="text-sm text-blue-600 hover:underline">
        ← Retour au fil d&apos;actualité
      </Link>

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          {post.authorImage ? (
            <Image
              src={post.authorImage}
              alt={post.authorName}
              width={48}
              height={48}
              sizes="48px"
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {post.authorName[0]}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{post.authorName}</h2>
            <p className="text-xs text-gray-400">
              {post.authorUsername ? `@${post.authorUsername} • ` : ""}
              {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {post.content && (
          <p className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}

        {post.imageUrl && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-600">
          <form action={handleLikeAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
            >
              <span>❤️</span> {post.likes.length} J&apos;aime
            </button>
          </form>
          <span>👁️ {post.views} vues</span>
        </div>
      </article>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-bold text-gray-900">
          Commentaires ({post.comments.length})
        </h3>

        <form action={handleCommentAction} className="space-y-3">
          <textarea
            name="comment"
            placeholder="Écrire un commentaire..."
            rows={3}
            required
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-800"
          />
          <div className="flex justify-end">
            <Button type="submit">Commenter</Button>
          </div>
        </form>

        <div className="space-y-4 pt-2">
          {post.comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Soyez le premier à commenter ce post !
            </p>
          ) : (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-gray-50 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-800">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function PostDetailPage({ params }: PageProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-400">
            Chargement de la publication...
          </div>
        }
      >
        <PostDetailContent params={params} />
      </Suspense>
    </div>
  );
}
