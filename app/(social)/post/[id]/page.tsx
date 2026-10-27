import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addComment } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/post-card";
import { DeleteCommentDialog } from "@/components/comments/delete-comment-dialog";

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: string;
}

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
  comments: Comment[];
  createdAt: string;
}

async function getPostAndIncrementViews(id: string): Promise<Post | null> {
  if (!ObjectId.isValid(id)) return null;

  try {
    const client = await clientPromise;
    const db = client.db();
    const headersList = await headers();

    const isPrefetch =
      headersList.get("next-router-prefetch") === "1" ||
      headersList.get("purpose") === "prefetch";

    if (!isPrefetch) {
      const session = await auth.api.getSession({ headers: headersList });
      const userId = session?.user?.id || "anonymous";

      await db
        .collection("posts")
        .updateOne({ _id: new ObjectId(id), viewedBy: { $ne: userId } }, {
          $inc: { views: 1 },
          $push: { viewedBy: userId },
        } as Record<string, unknown>);
    }

    const p = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!p) return null;

    return {
      _id: p._id.toString(),
      content: p.content,
      imageUrl: p.imageUrl || undefined,
      authorId: p.authorId,
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

type PageProps = {
  params: Promise<{ id: string }>;
};

async function PostDetailContent({ params }: PageProps) {
  await connection();
  const resolvedParams = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const currentUserId = session?.user?.id;

  const post = await getPostAndIncrementViews(resolvedParams.id);
  if (!post) notFound();

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

      <PostCard
        post={{
          ...post,
          commentsCount: post.comments.length,
        }}
        currentUserId={currentUserId}
        isDetailView={true}
        onDeleteRedirect="/post"
      />

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
            post.comments.map((comment: Comment) => {
              const canDeleteComment =
                currentUserId === comment.authorId ||
                currentUserId === post.authorId;

              return (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-800">
                      {comment.authorName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      {canDeleteComment && (
                        <DeleteCommentDialog
                          postId={post._id}
                          commentId={comment.id}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              );
            })
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
