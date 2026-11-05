"use client";

import { useSession } from "@/lib/auth-client";
import SignOutButton from "@/components/sign-out-button";
import Image from "next/image";
import Link from "next/link";
import { Compass, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-emerald-100 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      {/* Logo et Nom : Best-Voyage */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
      >
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <Compass className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
          Best-Voyage
        </span>
      </Link>

      {/* Partie utilisateur connectée / Actions */}
      <div className="flex items-center gap-4" suppressHydrationWarning>
        {isPending ? (
          <p className="text-sm text-gray-400 font-medium">Chargement...</p>
        ) : session ? (
          /* --- MENU DÉROULANT DU PROFIL --- */
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 outline-none group cursor-pointer p-1.5 rounded-xl hover:bg-emerald-50/50 transition-colors">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 border-2 border-emerald-200">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                {session.user.username || session.user.name}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl p-2 shadow-xl border-emerald-100 bg-white"
            >
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 focus:bg-emerald-50">
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 text-gray-700 font-medium w-full"
                >
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Paramètres du compte</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-gray-100" />

              {/* Appel du composant SignOutButton séparé */}
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button className="bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white rounded-xl px-4 py-2 text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer">
                Se connecter
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
