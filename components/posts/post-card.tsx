import Image from "next/image";

import { PostCommentsModal } from "../comments/post-comments-modal";
import PostImages from "./post-image";
import { PostLikes } from "./post-likes";
import { DeletePostButton } from "./post-delete-button";

interface PostCardProps {
  post: {
    _id: string;
    title?: string;
    content: string;
    destination?: string;
    imageUrl?: string;
    images?: string[];
    authorId: string;
    authorName: string;
    authorImage?: string;
    likes: string[];
    createdAt: Date | string;
  };
  comments: Array<{
    _id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorImage?: string;
    content: string;
    likes: string[];
    createdAt: Date | string;
  }>;
  commentsCount: number;
  currentUserId?: string;
}

export function PostCard({
  post,
  comments,
  commentsCount,
  currentUserId,
}: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const isAuthor = currentUserId === post.authorId;

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      {/* En-tête de l'auteur */}
      <div className="flex items-center space-x-3">
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
          <Image
            src={post.authorImage || "/default-avatar.png"}
            alt={post.authorName}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
            {post.authorName}
          </h3>
          {post.destination && (
            <p className="text-xs text-blue-600 font-medium">
              📍 {post.destination}
            </p>
          )}
          <span className="text-[11px] sm:text-xs text-gray-400">
            {formattedDate}
          </span>
        </div>
        {isAuthor && <DeletePostButton postId={post._id} />}
      </div>

      {/* Contenu textuel */}
      {post.title && (
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {post.title}
        </h2>
      )}
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Carrousel d'images tactile */}
      {post.images && post.images.length > 0 && (
        <PostImages images={post.images} />
      )}

      {/* Barre d'actions (Likes et Commentaires) */}
      <div className="flex items-center space-x-6 pt-2 border-t border-gray-50">
        <PostLikes
          postId={post._id}
          likes={post.likes || []}
          currentUserId={currentUserId}
        />
        <PostCommentsModal
          postId={post._id}
          postAuthorId={post.authorId}
          initialComments={comments} // ou comments={comments} selon ton choix
          commentsCount={commentsCount}
          currentUserId={currentUserId}
        />
      </div>
    </article>
  );
}
