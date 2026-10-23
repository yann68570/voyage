"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setServerError(null);

    const fullName = `${data.firstName} ${data.lastName}`;

    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: fullName,
      username: data.username.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (error) {
      setServerError(
        error.message || "Une erreur est survenue lors de l'inscription.",
      );
      setLoading(false);
      return;
    }

    router.push("/verify-email-sent");
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <Input type="text" placeholder="Jean" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <Input type="text" placeholder="Dupont" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pseudo unique (@)
          </label>
          <Input
            type="text"
            placeholder="jean_voyage"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Adresse email
          </label>
          <Input
            type="email"
            placeholder="jean@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">
            Minimum 8 caractères, 1 chiffre et 1 caractère spécial.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Inscription en cours..." : "S'inscrire"}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/signin" className="text-primary hover:underline">
          Vous avez déjà un compte ? Me connecter
        </Link>
      </div>
    </div>
  );
}
