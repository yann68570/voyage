"use client";

import { useState, useTransition } from "react";
import { deleteComment } from "@/actions/post";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteCommentDialogProps {
  postId: string;
  commentId: string;
}

export function DeleteCommentDialog({
  postId,
  commentId,
}: DeleteCommentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        // Puisque deleteComment ne retourne rien (void) mais lance une erreur si ça échoue
        await deleteComment(postId, commentId);

        toast.success("Commentaire supprimé avec succès.");
        setIsOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la suppression du commentaire.");
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Bouton déclencheur discret et élégant */}
      <AlertDialogTrigger
        className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none font-medium"
        title="Supprimer le commentaire"
      >
        <Trash2 className="w-3 h-3" />
        <span className="hidden sm:inline">Supprimer</span>
      </AlertDialogTrigger>

      {/* Modale de confirmation aux couleurs de Best-Voyage */}
      <AlertDialogContent className="w-[92vw] sm:max-w-md rounded-2xl p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-gray-900">
            Supprimer le commentaire ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
            Voulez-vous vraiment supprimer ce commentaire ? Cette action est
            définitive et irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row justify-end gap-2.5 pt-4">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 text-xs sm:text-sm px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 cursor-pointer transition-colors"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer shadow-md shadow-red-600/20"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
