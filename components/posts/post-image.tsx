"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface PostImageProps {
  imageUrl?: string;
}

export function PostImage({ imageUrl }: PostImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!imageUrl) return null;

  return (
    <>
      <div
        className="relative w-full h-80 rounded-lg overflow-hidden bg-gray-50 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={imageUrl}
          alt="Post image"
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 z-[10000] text-white bg-white/10 hover:bg-white/20 rounded-full p-3 w-12 h-12 flex items-center justify-center font-bold text-xl transition-colors shadow-lg"
          >
            ✕
          </button>
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
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
