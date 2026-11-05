import Link from "next/link";
import { Plus, Compass } from "lucide-react";

export function EmptyFeed() {
  return (
    <div className="text-center py-12 sm:py-16 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm mx-1 sm:mx-0 p-6 space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-linear-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-emerald-600 shadow-sm">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Aucun voyage partagé pour le moment
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto">
          Soyez le premier explorateur à publier un carnet de route ou des
          photos d&apos;évasion !
        </p>
      </div>
      <Link
        href="/post/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-cyan-600 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Partager une aventure</span>
      </Link>
    </div>
  );
}
