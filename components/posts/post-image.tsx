"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PostImagesProps {
  images?: string[];
}

export default function PostImages({ images = [] }: PostImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (!images || images.length === 0) return null;

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentIndex < images.length - 1) {
      nextImage();
    }
    if (distance < -minSwipeDistance && currentIndex > 0) {
      prevImage();
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full h-64 sm:h-80 md:h-96 bg-black rounded-lg overflow-hidden my-3 group cursor-pointer select-none"
      >
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className="object-cover transition-all duration-300 pointer-events-none"
        />

        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            onClick={prevImage}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-10000"
          >
            <X size={24} />
          </button>

          <div
            className="relative w-full max-w-5xl h-[75vh] sm:h-[85vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={images[currentIndex]}
              alt="Vue en grand"
              fill
              className="object-contain pointer-events-none"
            />

            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={prevImage}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {currentIndex < images.length - 1 && (
                  <button
                    type="button"
                    onClick={nextImage}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs sm:text-sm px-3.5 py-1 rounded-full font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
