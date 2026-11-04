"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { X, Plus, Sparkles, ImagePlus } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error(
        "Veuillez ajouter du texte ou une image à votre publication.",
      );
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrls: string[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        );

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const cloudinaryData = await cloudinaryRes.json();
        if (cloudinaryData.secure_url) {
          uploadedImageUrls.push(cloudinaryData.secure_url);
        }
      }

      const result = await createPost({
        content,
        images: uploadedImageUrls,
      });

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la publication.");
        return;
      }

      setContent("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast.success("Publication créée avec succès !");
      router.push("/post");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-7">
      {/* En-tête de la page */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-100/60">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            Créer une nouvelle publication
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Partagez vos souvenirs de voyage et vos plus beaux paysages
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white/90 backdrop-blur-md p-4 sm:p-7 rounded-2xl shadow-xl shadow-emerald-500/5 border border-emerald-100/80"
      >
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 items-center gap-1.5">
            <span>Description de votre voyage</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Racontez votre évasion, vos découvertes ou partagez vos conseils..."
            rows={5}
            className="w-full p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none text-gray-800 bg-gray-50/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 items-center gap-1.5">
            <ImagePlus className="w-4 h-4 text-emerald-600" />
            <span>Photos souvenirs (optionnelles)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative h-24 sm:h-32 rounded-xl overflow-hidden border border-emerald-100 group shadow-sm bg-gray-100"
              >
                <Image
                  src={url}
                  alt={`Aperçu ${index}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors cursor-pointer shadow-md"
                  title="Supprimer l'image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 rounded-xl h-24 sm:h-32 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all text-emerald-600 hover:text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50/80 group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-xs mt-1.5 font-semibold text-emerald-700">
                Ajouter
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            Vous pouvez ajouter jusqu&apos;à 10 photos.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base mt-2"
        >
          {loading ? "Publication en cours..." : "Publier l'aventure"}
        </Button>
      </form>
    </div>
  );
}
