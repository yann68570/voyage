"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Initialisation directe des états sans passer par un setState synchrone dans un effet
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(
    token ? null : "Jeton de vérification manquant ou invalide.",
  );
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const verifyToken = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token: token,
          },
        });

        if (!isMounted) return;

        if (error) {
          setError(error.message || "Impossible de vérifier l'adresse e-mail.");
        } else {
          setSuccess(true);
        }
      } catch {
        if (isMounted) {
          setError("Une erreur inattendue est survenue.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="max-w-md mx-auto p-6 mt-16 border rounded-lg shadow-sm text-center space-y-4">
      <h1 className="text-2xl font-bold">
        Vérification de l&apos;adresse e-mail
      </h1>

      {loading && (
        <p className="text-muted-foreground text-sm">
          Vérification de votre adresse e-mail en cours...
        </p>
      )}

      {!loading && error && (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
          <Link
            href="/signin"
            className={buttonVariants({ variant: "outline" })}
          >
            Retour à la connexion
          </Link>
        </div>
      )}

      {!loading && success && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
            Votre adresse e-mail a été vérifiée avec succès !
          </div>
          <Button onClick={() => router.push("/settings")} className="w-full">
            Accéder à mon compte
          </Button>
        </div>
      )}
    </div>
  );
}
