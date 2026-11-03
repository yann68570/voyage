"use client";

import { useSession } from "@/lib/auth-client";
import SignOutButton from "@/components/sign-out-button"; // Ajustez le chemin selon votre structure
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm sticky top-0 z-50">
      {/* Logo / Nom du réseau social */}
      <Link
        href="/"
        className="font-bold text-xl text-primary hover:opacity-90 transition-opacity"
      >
        Voyage 🌍
      </Link>

      {/* Partie utilisateur connectée */}
      <div className="flex items-center gap-4">
        {isPending ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : session ? (
          <div className="flex items-center gap-3">
            {/* Lien cliquable unique vers /settings (plus de <Link> imbriqué) */}
            <Link href="/settings" className="flex items-center gap-3 group">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  {session.user.username || session.user.name}
                </p>
              </div>
            </Link>

            {/* Bouton Sign Out (séparé du lien pour éviter les clics conflictuels) */}
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/signin"
            className="text-sm font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        )}
      </div>
    </nav>
  );
}
