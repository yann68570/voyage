"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Importer le router
import { toggleLike, deletePost } from "@/actions/post";
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

interface PostCardProps {
  post: {
    _id: string;
    content: string;
    imageUrl?: string;
    authorId: string;
    authorName: string;
    authorUsername?: string;
    authorImage?: string;
    likes: string[];
    views: number;
    commentsCount: number;
    createdAt: string;
  };
  currentUserId?: string;
  isDetailView?: boolean;
  onDeleteRedirect?: string; // 2. Nouvelle prop optionnelle pour la redirection
}

export function PostCard({
  post,
  currentUserId,
  isDetailView = false,
  onDeleteRedirect,
}: PostCardProps) {
  const router = useRouter(); // 3. Initialiser le router
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  const hasLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.authorId;

  const handleLike = async () => {
    await toggleLike(post._id);
  };

  const handleDeletePost = async () => {
    await deletePost(post._id);
    // 4. Si une URL de redirection est fournie, on redirige l'utilisateur
    if (onDeleteRedirect) {
      router.push(onDeleteRedirect);
      router.refresh();
    }
  };

  return (
    <>
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
                {post.authorUsername ? `@${post.authorUsername} • ` : ""}
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
                  <AlertDialogTitle>
                    Êtes-vous absolument sûr ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le post ainsi que tous ses
                    likes, vues et commentaires seront définitivement supprimés.
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

        {post.content && (
          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}

        {post.imageUrl && (
          <div className="relative w-full h-80 rounded-lg overflow-hidden bg-gray-50 cursor-pointer group">
            {isDetailView ? (
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="w-full h-full relative"
              >
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <Link href={`/post/${post._id}`} className="block w-full h-full">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <form action={handleLike}>
              <button
                type="submit"
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                <span>{hasLiked ? "❤️" : "🤍"}</span> {post.likes.length}
              </button>
            </form>
            <span>💬 {post.commentsCount}</span>
            <span>👁️ {post.views}</span>
          </div>

          {!isDetailView && (
            <Link
              href={`/post/${post._id}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Voir les détails →
            </Link>
          )}
        </div>
      </article>

      {isImageModalOpen && post.imageUrl && (
        <div
          className="fixed inset-0 z-9999 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-6 right-6 z-10000 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 w-12 h-12 flex items-center justify-center font-bold text-xl transition-colors shadow-lg"
          >
            ✕
          </button>

          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={post.imageUrl}
              alt="Image en grand"
              fill
              sizes="100vw"
              className="object-contain rounded-lg"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
