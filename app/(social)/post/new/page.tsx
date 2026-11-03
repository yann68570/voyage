"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { X, Plus } from "lucide-react";

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
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        Créer une nouvelle publication
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partagez votre voyage ou vos pensées..."
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images (optionnelles)
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
                className="relative h-24 sm:h-32 rounded-lg overflow-hidden border border-gray-200 group"
              >
                <Image
                  src={url}
                  alt={`Aperçu ${index}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white rounded-full p-1.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg h-24 sm:h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors text-gray-400 hover:text-blue-500 bg-gray-50"
            >
              <Plus size={24} />
              <span className="text-xs mt-1 font-medium">Ajouter</span>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Publication en cours..." : "Publier"}
        </Button>
      </form>
    </div>
  );
}
