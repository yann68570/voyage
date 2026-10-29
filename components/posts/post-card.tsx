"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { deletePost } from "@/actions/post";
import { Post } from "@/types";
import { PostImage } from "./post-image";
import { PostLikes } from "./post-likes";
import { PostCommentsModal } from "@/components/comments/post-comments-modal"; // <-- Import depuis le dossier comments
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

// Définition propre synchro avec la modale
interface FeedComment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  likes: string[];
  createdAt: Date;
}

interface PostCardProps {
  post: Omit<Post, "_id"> & {
    _id: string;
    imageUrl?: string;
  };
  comments: FeedComment[]; // <-- Utilise FeedComment avec _id en string
  commentsCount: number;
  currentUserId?: string;
}

export function PostCard({
  post,
  comments,
  commentsCount,
  currentUserId,
}: PostCardProps) {
  const router = useRouter();
  const isAuthor = currentUserId === post.authorId;

  const handleDeletePost = async () => {
    await deletePost(post._id);
    router.refresh();
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden space-y-4 p-5 hover:border-gray-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.authorImage ? (
            <Image
              src={post.authorImage}
              alt={post.authorName}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
              {post.authorName[0]}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {post.authorName}
            </h3>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {isAuthor && (
          <AlertDialog>
            <AlertDialogTrigger className="text-xs text-red-500 hover:underline bg-transparent border-none cursor-pointer p-0">
              Supprimer
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le post ainsi que tous ses
                  likes et commentaires seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePost}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {post.title && (
        <h2 className="font-bold text-gray-900 text-lg">{post.title}</h2>
      )}

      {post.content && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      )}

      <PostImage imageUrl={post.imageUrl || post.images?.[0]} />

      <div className="flex items-center gap-6 text-xs text-gray-500 pt-2 border-t border-gray-50">
        <PostLikes
          postId={post._id}
          likes={post.likes}
          currentUserId={currentUserId}
        />
        <PostCommentsModal
          postId={post._id}
          postAuthorId={post.authorId}
          initialComments={comments}
          currentUserId={currentUserId}
          commentsCount={commentsCount}
        />
      </div>
    </article>
  );
}
