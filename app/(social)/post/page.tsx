import { Suspense } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { PostsList } from "@/components/posts/posts-list";

export default function PostsPage() {
  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-7">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Fil d&apos;actualité
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Découvrez les dernières aventures de la communauté Best-Voyage
            </p>
          </div>
        </div>

        <Link
          href="/post/new"
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un post</span>
        </Link>
      </div>

      {/* Chargement Suspense stylisé */}
      <Suspense
        fallback={
          <div className="space-y-4 sm:space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-emerald-50 p-4 sm:p-6 space-y-4 animate-pulse shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100/60 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-emerald-100/60 rounded w-1/3" />
                    <div className="h-3 bg-emerald-50 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-emerald-50 rounded w-3/4" />
                <div className="h-32 sm:h-48 bg-emerald-50/50 rounded-xl" />
              </div>
            ))}
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
