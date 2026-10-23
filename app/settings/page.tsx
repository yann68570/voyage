"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <p className="text-center py-10">Chargement des paramètres...</p>;
  }

  if (!session) {
    return (
      <p className="text-center py-10">
        Veuillez vous connecter pour accéder aux paramètres.
      </p>
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
  // Extraction sécurisée : vérifie les champs personnalisés ou extrait du nom global
  const fullNameParts = (session.user.name || "").trim().split(" ");
  const firstName = session.user.firstName || fullNameParts[0] || "";

  // Si lastName n'est pas dans session.user, on prend tout ce qui vient après le premier mot du nom complet
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

  const handleSendVerification = async () => {
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/settings",
      });

      if (error) {
        toast.error("Erreur : " + error.message);
        return;
      }

      toast.success(
        "E-mail de vérification envoyé ! Vérifiez votre boîte de réception.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer l'e-mail de vérification.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastNameToSubmit = lastName.trim();
    const usernameToSubmit = username.trim() || session.user.username || "";

    if (!lastNameToSubmit) {
      toast.error("Le nom ne peut pas être vide.");
      return;
    }

    if (!usernameToSubmit) {
      toast.error("Le pseudo est obligatoire.");
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

      const { error } = await authClient.updateUser({
        name: fullUnifiedName,
        firstName: firstName,
        lastName: lastNameToSubmit,
        username: usernameToSubmit,
      });

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
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres du profil</h1>

      <form onSubmit={handleUpdate} className="space-y-6">
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
            className="relative cursor-pointer group w-24 h-24"
            title="Changer la photo de profil"
          >
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Avatar de l'utilisateur"
                width={96}
                height={96}
                priority
                className="rounded-full object-cover w-24 h-24 aspect-square transition-opacity group-hover:opacity-75"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 aspect-square transition-opacity group-hover:opacity-75">
                {firstName?.[0] || session.user.name?.[0] || "?"}
              </div>
            )}

            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
              Modifier
            </div>
          </div>
          {selectedFile && (
            <p className="text-xs text-amber-600 mt-2">
              Nouvelle image sélectionnée (cliquez sur Enregistrer pour valider)
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <div className="flex items-center gap-3 mt-1">
            <p className="font-medium text-gray-800">{session.user.email}</p>

            {session.user.emailVerified ? (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                ✓ Vérifié
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendVerification}
                className="text-xs text-amber-600 underline hover:text-amber-700 font-medium"
              >
                Vérifier l&apos;email
              </button>
            )}
          </div>
        </div>

        {/* Prénom (Lecture seule) */}
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <div className="p-2 border rounded-md bg-muted text-gray-600 text-sm">
            {firstName || "Non renseigné"}
          </div>
        </div>

        {/* Nom (Seul champ modifiable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <Input
            type="text"
            value={lastName}
            placeholder="Votre nom"
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pseudo unique (@)
          </label>
          <Input
            type="text"
            value={username}
            placeholder={session.user.username || ""}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsernameAvailability(e.target.value);
            }}
          />
          {usernameStatus && (
            <p
              className={`text-xs mt-1 ${
                usernameStatus.includes("✅")
                  ? "text-green-600"
                  : usernameStatus.includes("❌")
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {usernameStatus}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  );
}
