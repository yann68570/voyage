"use client";

import { useSession } from "@/lib/auth-client";
import SignOutButton from "@/components/sign-out-button"; // Ajustez le chemin selon votre structure
import Image from "next/image";

export default function Navbar() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      {/* Logo / Nom du réseau social */}
      <div className="font-bold text-xl text-primary">Voyage 🌍</div>

      {/* Partie utilisateur connectée */}
      <div className="flex items-center gap-4">
        {isPending ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : session ? (
          <div className="flex items-center gap-3">
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
                {session.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {session.user.username || session.user.name}
              </p>
              {/* <p className="text-xs text-gray-500 capitalize">
                {session.user.role}
              </p> */}
            </div>

            {/* Bouton Sign Out */}
            <SignOutButton />
          </div>
        ) : (
          <a
            href="/signin"
            className="text-sm font-medium text-primary hover:underline"
          >
            Se connecter
          </a>
        )}
      </div>
    </nav>
  );
}
