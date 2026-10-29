import clientPromise from "@/lib/db";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addComment } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/post-card";
import { DeleteCommentDialog } from "@/components/comments/delete-comment-dialog";
import { Post, Comment } from "@/types";

interface ExtendedPost extends Omit<Post, "_id"> {
  _id: string;
  commentsCount: number;
  views: number;
  imageUrl?: string;
}

interface ExtendedComment extends Omit<Comment, "_id" | "postId"> {
  _id: string;
  postId: string;
}

async function getPostDetails(
  id: string,
): Promise<{ post: ExtendedPost; comments: ExtendedComment[] } | null> {
  if (!ObjectId.isValid(id)) return null;

  try {
    const client = await clientPromise;
    const db = client.db();
    const objectId = new ObjectId(id);

    // Incrémentation des vues à chaque consultation de la page détail
    await db
      .collection("posts")
      .updateOne({ _id: objectId }, { $inc: { views: 1 } });

    const postDoc = await db.collection("posts").findOne({ _id: objectId });
    if (!postDoc) return null;

    const commentDocs = await db
      .collection("comments")
      .find({ postId: objectId })
      .sort({ createdAt: -1 })
      .toArray();

    const comments: ExtendedComment[] = commentDocs.map((c) => ({
      _id: c._id.toString(),
      postId: c.postId.toString(),
      authorId: c.authorId,
      authorName: c.authorName || "Anonyme",
      authorImage: c.authorImage || undefined,
      content: c.content,
      likes: Array.isArray(c.likes) ? c.likes : [],
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
    }));

    const imagesList = Array.isArray(postDoc.images) ? postDoc.images : [];

    const post: ExtendedPost = {
      _id: postDoc._id.toString(),
      title: postDoc.title || "",
      content: postDoc.content,
      destination: postDoc.destination || "",
      imageUrl:
        postDoc.imageUrl || (imagesList.length > 0 ? imagesList[0] : undefined),
      images: imagesList,
      authorId: postDoc.authorId,
      authorName: postDoc.authorName || "Anonyme",
      authorImage: postDoc.authorImage || undefined,
      likes: Array.isArray(postDoc.likes) ? postDoc.likes : [],
      views: typeof postDoc.views === "number" ? postDoc.views + 1 : 1,
      commentsCount: comments.length,
      createdAt: postDoc.createdAt ? new Date(postDoc.createdAt) : new Date(),
    };

    return { post, comments };
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

  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const data = await getPostDetails(resolvedParams.id);
  if (!data) notFound();

  const { post, comments } = data;

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
        post={post}
        currentUserId={currentUserId}
        isDetailView={true}
        onDeleteRedirect="/post"
      />

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-bold text-gray-900">
          Commentaires ({comments.length})
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
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Soyez le premier à commenter ce post !
            </p>
          ) : (
            comments.map((comment) => {
              const canDeleteComment =
                currentUserId === comment.authorId ||
                currentUserId === post.authorId;

              return (
                <div
                  key={comment._id}
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
                          commentId={comment._id}
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
