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

  // Effet pour bloquer/débloquer le scroll de l'arrière-plan quand la modale s'ouvre/se ferme
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Nettoyage au démontage du composant
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (!images || images.length === 0) return null;

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Conteneur de l'image / carrousel dans le post */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="relative w-full h-80 bg-black rounded-lg overflow-hidden my-3 group cursor-pointer"
      >
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1} sur ${images.length}`}
          fill
          className="object-cover transition-all duration-300"
        />

        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
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

      {/* --- MODALE PLEIN ÉCRAN AU-DESSUS DE TOUT --- */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
        >
          {/* Bouton de fermeture */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-10000"
          >
            <X size={26} />
          </button>

          {/* Conteneur de l'image en grand */}
          <div
            className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`Vue en grand ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {currentIndex < images.length - 1 && (
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-1.5 rounded-full font-medium">
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
