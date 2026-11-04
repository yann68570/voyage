"use client";

import { useTransition } from "react";
import { addComment } from "@/actions/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle, Send } from "lucide-react";
import { DeleteCommentDialog } from "./delete-comment-dialog"; // <--- Import de ton composant de suppression

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
  initialComments = [],
  comments = [],
  currentUserId,
  commentsCount,
}: PostCommentsModalProps) {
  const [isPending, startTransition] = useTransition();

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
      {/* Bouton déclencheur responsive et harmonisé */}
      <DialogTrigger className="group flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors bg-transparent border-none cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-emerald-50/50 select-none">
        <div className="p-1 rounded-full transition-transform group-hover:scale-110">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </div>
        <span className="font-semibold">{commentsCount}</span>
      </DialogTrigger>

      {/* Contenu modale responsive Mobile / PC */}
      <DialogContent className="w-[92vw] sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-100 shadow-2xl">
        <DialogHeader className="border-b border-emerald-100/60 pb-3">
          <DialogTitle className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <span>Commentaires</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {commentsCount}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-3 py-3 pr-1 my-1">
          {listComments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 italic">
                Aucun commentaire pour le moment. Soyez le premier !
              </p>
            </div>
          ) : (
            listComments.map((comment) => {
              const canDelete =
                currentUserId === comment.authorId ||
                currentUserId === postAuthorId;

              return (
                <div
                  key={comment._id}
                  className="p-3.5 bg-emerald-50/30 rounded-xl space-y-1.5 border border-emerald-100/60 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-gray-900">
                      {comment.authorName}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
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

                      {/* Intégration propre de ton composant de dialogue de suppression */}
                      {canDelete && (
                        <DeleteCommentDialog
                          postId={postId}
                          commentId={comment._id}
                        />
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
          className="space-y-3 pt-3 border-t border-emerald-100/60"
        >
          <textarea
            name="comment"
            placeholder="Écrire un commentaire..."
            rows={2}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm resize-none text-gray-800 bg-gray-50/50 transition-all"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPending ? "Envoi..." : "Commenter"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
