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
    <article className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100/80 shadow-md shadow-emerald-500/5 overflow-hidden p-4 sm:p-6 space-y-4 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
      {/* En-tête de l'auteur */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-emerald-50 border-2 border-emerald-200 shrink-0 shadow-sm">
            <Image
              src={post.authorImage || "/default-avatar.png"}
              alt={post.authorName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
              {post.authorName}
            </h3>
            {post.destination && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <span>📍</span> {post.destination}
              </p>
            )}
            <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Bouton de suppression aligné proprement à droite */}
        {isAuthor && <DeletePostButton postId={post._id} />}
      </div>

      {/* Contenu textuel */}
      <div className="space-y-1.5">
        {post.title && (
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
            {post.title}
          </h2>
        )}
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Carrousel d'images tactile */}
      {post.images && post.images.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-emerald-50">
          <PostImages images={post.images} />
        </div>
      )}

      {/* Barre d'actions (Likes et Commentaires) */}
      <div className="flex items-center space-x-6 pt-3 border-t border-emerald-50">
        <PostLikes
          postId={post._id}
          likes={post.likes || []}
          currentUserId={currentUserId}
        />
        <PostCommentsModal
          postId={post._id}
          postAuthorId={post.authorId}
          initialComments={comments}
          commentsCount={commentsCount}
          currentUserId={currentUserId}
        />
      </div>
    </article>
  );
}
