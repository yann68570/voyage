"use client";

import { useState, useTransition } from "react";
import { deletePost } from "@/actions/post";
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

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result?.success === false) {
        toast.error(result.error || "Erreur lors de la suppression.");
      } else {
        toast.success("Publication supprimée avec succès.");
        setIsOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Sur Base UI, AlertDialogTrigger est déjà le bouton : on place les classes directement dessus */}
      <AlertDialogTrigger
        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center outline-none"
        title="Supprimer la publication"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </AlertDialogTrigger>

      {/* Modale de confirmation Base UI / shadcn v4 */}
      <AlertDialogContent className="w-[92vw] sm:max-w-md rounded-xl p-5 sm:p-6 bg-white border border-gray-100 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-gray-900">
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-gray-500 mt-1.5">
            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action
            est irréversible et supprimera également tous les commentaires
            associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-4">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 text-xs sm:text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
