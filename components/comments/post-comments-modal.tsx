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
import { MessageCircle, Trash2 } from "lucide-react";

export interface FeedComment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  likes: string[];
  createdAt: Date | string;
}

interface PostCommentsModalProps {
  postId: string;
  postAuthorId?: string;
  initialComments?: FeedComment[];
  comments?: FeedComment[];
  currentUserId?: string;
  commentsCount: number;
}

export function PostCommentsModal({
  postId,
  postAuthorId,
  initialComments = [], // Valeur par défaut pour éviter le risque d'être undefined
  comments = [], // Valeur par défaut pour comments aussi
  currentUserId,
  commentsCount,
}: PostCommentsModalProps) {
  const [isPending, startTransition] = useTransition();

  // Fusion sécurisée des deux sources de commentaires possibles
  const listComments = initialComments.length > 0 ? initialComments : comments;

  const handleAddComment = async (formData: FormData) => {
    const content = formData.get("comment")?.toString();
    if (!content?.trim()) return;

    startTransition(async () => {
      await addComment(postId, content);
    });
  };

  return (
    <Dialog>
      {/* Bouton déclencheur responsive */}
      <DialogTrigger className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer p-0 select-none">
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-blue-600 transition-colors" />
        <span>{commentsCount}</span>
      </DialogTrigger>

      {/* Contenu modale responsive Mobile / PC */}
      <DialogContent className="w-[92vw] sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900">
            Commentaires ({commentsCount})
          </DialogTitle>
        </DialogHeader>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 py-2 pr-1 my-2">
          {listComments.length === 0 ? (
            <p className="text-xs sm:text-sm text-gray-400 italic text-center py-6">
              Aucun commentaire pour le moment. Soyez le premier !
            </p>
          ) : (
            listComments.map((comment) => {
              const canDelete =
                currentUserId === comment.authorId ||
                currentUserId === postAuthorId;

              return (
                <div
                  key={comment._id}
                  className="p-3 bg-gray-50 rounded-lg space-y-1.5 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs sm:text-sm text-gray-800">
                      {comment.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-gray-400">
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
                          type="button"
                          onClick={async () => {
                            await deleteComment(postId, comment._id);
                          }}
                          className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5 bg-transparent border-none cursor-pointer p-0.5 rounded transition-colors"
                          title="Supprimer le commentaire"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Formulaire d'envoi */}
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
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm resize-none text-gray-800"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="px-4 py-2 text-xs sm:text-sm font-medium"
            >
              {isPending ? "Envoi..." : "Commenter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
