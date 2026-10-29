"use client";

import { useTransition } from "react";
import { addComment, deleteComment } from "@/actions/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface FeedComment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  likes: string[];
  createdAt: Date;
}

interface PostCommentsModalProps {
  postId: string;
  postAuthorId: string;
  initialComments: FeedComment[];
  currentUserId?: string;
  commentsCount: number;
}

export function PostCommentsModal({
  postId,
  postAuthorId,
  initialComments,
  currentUserId,
  commentsCount,
}: PostCommentsModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddComment = async (formData: FormData) => {
    const content = formData.get("comment")?.toString();
    if (!content?.trim()) return;

    startTransition(async () => {
      await addComment(postId, content);
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer p-0">
        <span>💬</span> {commentsCount}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Commentaires ({commentsCount})</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {initialComments.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">
              Aucun commentaire pour le moment. Soyez le premier !
            </p>
          ) : (
            initialComments.map((comment) => {
              const canDelete =
                currentUserId === comment.authorId ||
                currentUserId === postAuthorId;

              return (
                <div
                  key={comment._id}
                  className="p-3 bg-gray-50 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-800">
                      {comment.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">
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
                      {canDelete && (
                        <button
                          onClick={async () => {
                            await deleteComment(postId, comment._id);
                          }}
                          className="text-[10px] text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>

        <form
          action={async (formData) => {
            await handleAddComment(formData);
            const formElement = document.getElementById(
              `comment-form-${postId}`,
            ) as HTMLFormElement;
            formElement?.reset();
          }}
          id={`comment-form-${postId}`}
          className="space-y-3 pt-2 border-t border-gray-100"
        >
          <textarea
            name="comment"
            placeholder="Écrire un commentaire..."
            rows={2}
            required
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-800"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Envoi..." : "Commenter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
