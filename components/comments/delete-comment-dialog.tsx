"use client";

import { deleteComment } from "@/actions/post";
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
  const handleDelete = async () => {
    await deleteComment(postId, commentId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="text-xs text-red-500 hover:underline bg-transparent border-none cursor-pointer p-0">
        Supprimer
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le commentaire ?</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment supprimer ce commentaire ? Cette action est
            définitive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
