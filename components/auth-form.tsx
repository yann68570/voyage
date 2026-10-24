"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import GoogleSignInButton from "./google-signin-button";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fonction utilitaire sécurisée pour extraire le message d'erreur sans 'any'
  const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === "object" && err !== null && "message" in err) {
      const maybeMessage = (err as { message: unknown }).message;
      if (typeof maybeMessage === "string") {
        return maybeMessage;
      }
    }
    return defaultMessage;
  };

  // Soumission Email / Mot de passe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "sign-up") {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const result = await authClient.signUp.email({
          email,
          password,
          name: fullName,
        });

        if (result.error) {
          toast.error(result.error.message ?? "Erreur lors de l'inscription");
        } else {
          toast.success("Compte créé avec succès !");
          router.push("/settings");
          router.refresh();
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          toast.error(result.error.message ?? "Erreur lors de la connexion");
        } else {
          toast.success("Connexion réussie !");
          router.push("/settings");
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Une erreur est survenue");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {type === "sign-in" ? "Connexion à Voyage" : "Créer un compte"}
      </h2>

      <GoogleSignInButton />

      <div className="relative flex py-2 items-center">
        <div className="grow border-t border-gray-200"></div>
        <span className="shrink mx-4 text-gray-400 text-xs uppercase">ou</span>
        <div className="grow border-t border-gray-200"></div>
      </div>

      {/* Formulaire Email / Mot de passe */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {type === "sign-up" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dupont"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading
            ? "Chargement..."
            : type === "sign-in"
              ? "Se connecter"
              : "S'inscrire"}
        </button>
      </form>

      {/* Liens de bascule */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {type === "sign-in" ? (
          <p>
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        ) : (
          <p>
            Déjà un compte ?{" "}
            <Link
              href="/signin"
              className="text-blue-600 font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
