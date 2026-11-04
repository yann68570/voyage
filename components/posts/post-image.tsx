"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  // Gestion du blocage du scroll de la page quand la modale est ouverte
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
      {/* --- CARROUSEL PRINCIPAL DANS LE FEED --- */}
      <div
        onClick={() => setIsModalOpen(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-900 rounded-xl overflow-hidden my-3 group cursor-pointer select-none border border-emerald-100/50 shadow-sm"
      >
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className="object-cover transition-all duration-300 pointer-events-none group-hover:scale-[1.02]"
        />

        {/* Boutons de navigation gauche/droite (Desktop) */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            onClick={prevImage}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Indicateurs de points (Pagination) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-5 bg-linear-to-r from-emerald-400 to-cyan-400"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- MODALE PLEIN ÉCRAN VIA PORTAL --- */}
      {isModalOpen &&
        createPortal(
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-999999 bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
          >
            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-1000000 cursor-pointer"
              title="Fermer"
            >
              <X size={22} />
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
                      className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl transition-all cursor-pointer z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  {currentIndex < images.length - 1 && (
                    <button
                      type="button"
                      onClick={nextImage}
                      className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl transition-all cursor-pointer z-10"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}

                  {/* Badge compteur de photos */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border border-emerald-500/30 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm z-10">
                    <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {currentIndex + 1}
                    </span>{" "}
                    / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
