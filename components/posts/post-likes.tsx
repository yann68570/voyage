"use client";

import { toggleLike } from "@/actions/post";
import { Heart } from "lucide-react";

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
        className={`flex items-center gap-1.5 transition-all text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 select-none ${
          hasLiked
            ? "text-red-500 font-semibold"
            : "text-gray-500 hover:text-red-500"
        }`}
      >
        <Heart
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${
            hasLiked ? "fill-red-500 text-red-500" : "text-gray-500"
          }`}
        />
        <span>{likes.length}</span>
      </button>
    </form>
  );
}
