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
      {/* Bouton corbeille discret et harmonisé avec l'interface */}
      <AlertDialogTrigger
        className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50/80 transition-all cursor-pointer bg-transparent border-none flex items-center justify-center outline-none group"
        title="Supprimer la publication"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
      </AlertDialogTrigger>

      {/* Modale de confirmation Base UI / shadcn v4 aux couleurs de Best-Voyage */}
      <AlertDialogContent className="w-[92vw] sm:max-w-md rounded-2xl p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-gray-900">
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action
            est irréversible et supprimera également tous les commentaires
            associés.
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
