"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { Settings, ArrowLeft, Camera, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-emerald-600 animate-pulse">
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-3">
        <p className="text-sm text-gray-500">
          Veuillez vous connecter pour accéder aux paramètres.
        </p>
        <Link href="/signin">
          <Button className="bg-linear-to-r from-emerald-600 to-cyan-500 text-white rounded-xl">
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <SettingsForm key={session.user.id} session={session} router={router} />
  );
}

interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    image?: string | null;
    emailVerified: boolean;
  };
}

function SettingsForm({
  session,
  router,
}: {
  session: UserSession;
  router: ReturnType<typeof useRouter>;
}) {
  const fullNameParts = (session.user.name || "").trim().split(" ");
  const firstName = session.user.firstName || fullNameParts[0] || "";

  const initialLastName =
    session.user.lastName || fullNameParts.slice(1).join(" ") || "";

  const [lastName, setLastName] = useState(initialLastName);
  const [username, setUsername] = useState(session.user.username || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkUsernameAvailability = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUsernameStatus(null);
      return;
    }

    if (trimmed === session.user?.username) {
      setUsernameStatus("C'est votre pseudo actuel.");
      return;
    }

    try {
      const { data, error } = await authClient.isUsernameAvailable({
        username: trimmed,
      });

      if (error) {
        setUsernameStatus("❌ Erreur lors de la vérification.");
        return;
      }

      if (data?.available) {
        setUsernameStatus("✅ Ce pseudo est disponible !");
      } else {
        setUsernameStatus("❌ Ce pseudo est déjà pris.");
      }
    } catch {
      setUsernameStatus(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastNameToSubmit = lastName.trim();
    const usernameToSubmit = username.trim();

    if (!lastNameToSubmit) {
      toast.error("Le nom ne peut pas être vide.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = session.user.image;

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
        if (!cloudinaryData.secure_url)
          throw new Error("Échec de l'upload Cloudinary");

        imageUrl = cloudinaryData.secure_url;

        const avatarRes = await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });

        if (!avatarRes.ok)
          throw new Error("Échec de la sauvegarde de l'avatar");
      }

      const fullUnifiedName = `${firstName} ${lastNameToSubmit}`.trim();

      const updateData: {
        name: string;
        firstName: string;
        lastName: string;
        username?: string;
      } = {
        name: fullUnifiedName,
        firstName: firstName,
        lastName: lastNameToSubmit,
      };

      if (usernameToSubmit.length > 0) {
        updateData.username = usernameToSubmit;
      }

      const { error } = await authClient.updateUser(updateData);

      if (error) {
        toast.error("Erreur lors de la mise à jour : " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Profil mis à jour avec succès !");

      setTimeout(() => {
        router.refresh();
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la mise à jour.");
      setLoading(false);
    }
  };

  const currentAvatar = previewUrl || session.user.image;

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-7">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
              Paramètres du profil
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Personnalisez votre identité sur Best-Voyage
            </p>
          </div>
        </div>

        <Link
          href="/post"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au fil</span>
        </Link>
      </div>

      {/* Formulaire principal */}
      <form
        onSubmit={handleUpdate}
        className="space-y-6 bg-white/90 backdrop-blur-md p-4 sm:p-7 rounded-2xl shadow-xl shadow-emerald-500/5 border border-emerald-100/80"
      >
        {/* Gestion de l'avatar */}
        <div className="flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className="relative cursor-pointer group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-emerald-300 shadow-md shadow-emerald-500/10"
            title="Changer la photo de profil"
          >
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Avatar de l'utilisateur"
                fill
                priority
                className="object-cover transition-transform group-hover:scale-105 duration-300"
              />
            ) : (
              <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
                {firstName?.[0] || session.user.name?.[0] || "?"}
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1">
              <Camera className="w-5 h-5" />
              <span>Modifier</span>
            </div>
          </div>

          {selectedFile && (
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Nouvelle image sélectionnée (cliquez sur Enregistrer pour valider)
            </p>
          )}
        </div>

        {/* Champs d'information */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              E-mail
            </label>
            <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium text-gray-600">
              {session.user.email}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Prénom
            </label>
            <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium text-gray-600">
              {firstName || "Non renseigné"}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Nom
            </label>
            <Input
              type="text"
              value={lastName}
              placeholder="Votre nom"
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Pseudo unique (@){" "}
              <span className="text-gray-400 text-xs font-normal">
                (Optionnel)
              </span>
            </label>
            <Input
              type="text"
              value={username}
              placeholder="Votre pseudo (facultatif)"
              onChange={(e) => {
                setUsername(e.target.value);
                checkUsernameAvailability(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 bg-gray-50/50"
            />
            {usernameStatus && (
              <p
                className={`text-xs mt-1.5 font-medium ${
                  usernameStatus.includes("✅")
                    ? "text-emerald-600"
                    : usernameStatus.includes("❌")
                      ? "text-red-500"
                      : "text-gray-500"
                }`}
              >
                {usernameStatus}
              </p>
            )}
          </div>
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base mt-2"
        >
          {loading
            ? "Enregistrement en cours..."
            : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  );
}
