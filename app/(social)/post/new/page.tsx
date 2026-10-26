"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
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
        if (!cloudinaryData.secure_url) {
          throw new Error("Échec de l'upload de l'image sur Cloudinary");
        }
        imageUrl = cloudinaryData.secure_url;
      }

      const result = await createPost({
        content,
        imageUrl,
      });

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la publication.");
        setLoading(false);
        return;
      }

      toast.success("Publication créée avec succès !");
      router.push("/post");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Créer une nouvelle publication
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
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
            Image (optionnelle)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            {previewUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Aperçu"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-6">
                Cliquez pour ajouter une image
              </p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Publication en cours..." : "Publier"}
        </Button>
      </form>
    </div>
  );
}
