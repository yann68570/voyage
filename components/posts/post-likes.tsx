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
        className={`group flex items-center gap-2 transition-all text-xs sm:text-sm bg-transparent border-none cursor-pointer py-1.5 px-2.5 rounded-xl select-none ${
          hasLiked
            ? "text-red-500 font-bold bg-red-50/60"
            : "text-gray-500 hover:text-red-500 hover:bg-emerald-50/50"
        }`}
        title={hasLiked ? "Je n'aime plus" : "J'aime"}
      >
        <div className="p-1 rounded-full transition-transform group-hover:scale-110 active:scale-125">
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              hasLiked
                ? "fill-red-500 text-red-500 drop-shadow-sm"
                : "text-gray-400 group-hover:text-red-500"
            }`}
          />
        </div>
        <span className="font-semibold">{likes.length}</span>
      </button>
    </form>
  );
}
