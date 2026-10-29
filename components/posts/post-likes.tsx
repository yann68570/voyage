"use client";

import { toggleLike } from "@/actions/post";

interface PostLikesProps {
  postId: string;
  likes: string[];
  currentUserId?: string;
}

export function PostLikes({ postId, likes, currentUserId }: PostLikesProps) {
  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;

  const handleLike = async () => {
    await toggleLike(postId);
  };

  return (
    <form action={handleLike}>
      <button
        type="submit"
        className="flex items-center gap-1 hover:text-red-500 transition-colors text-xs text-gray-500 bg-transparent border-none cursor-pointer p-0"
      >
        <span>{hasLiked ? "❤️" : "🤍"}</span> {likes.length}
      </button>
    </form>
  );
}
