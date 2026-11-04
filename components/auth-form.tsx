"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Compass } from "lucide-react";
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
          router.push("/post");
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
          router.push("/post");
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
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-500/5 border border-emerald-100/80">
      {/* En-tête avec logo thématique */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 mb-3">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {type === "sign-in" ? "Bon retour !" : "Rejoignez Best-Voyage"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {type === "sign-in"
            ? "Connectez-vous pour retrouver vos carnets de route"
            : "Partagez vos plus beaux souvenirs d'évasion avec la communauté"}
        </p>
      </div>

      <GoogleSignInButton />

      <div className="relative flex py-3 items-center">
        <div className="grow border-t border-emerald-100"></div>
        <span className="shrink mx-4 text-gray-400 text-xs uppercase tracking-wider font-medium">
          ou avec un email
        </span>
        <div className="grow border-t border-emerald-100"></div>
      </div>

      {/* Formulaire Email / Mot de passe */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {type === "sign-up" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50/50"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50/50"
                placeholder="Dupont"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50/50"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50/50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm sm:text-base mt-2"
        >
          {loading
            ? "Chargement..."
            : type === "sign-in"
              ? "Se connecter"
              : "Créer mon compte"}
        </button>
      </form>

      {/* Liens de bascule */}
      <div className="text-center mt-6 text-xs sm:text-sm text-gray-600">
        {type === "sign-in" ? (
          <p>
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        ) : (
          <p>
            Déjà un compte ?{" "}
            <Link
              href="/signin"
              className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
