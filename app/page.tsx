"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

import {
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cyan-50/30 to-emerald-50/30 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* --- HERO SECTION PRINCIPALE --- */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        {/* Badge "Nouveau" */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/60 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Le nouveau réseau social des passionnés de voyage 🌍</span>
        </div>

        {/* Titre Accrocheur */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
          Partagez vos plus beaux <br className="hidden sm:inline" />
          <span className="bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            souvenirs d&apos;évasion.
          </span>
        </h1>

        {/* Paragraphe descriptif */}
        <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          <strong className="text-gray-900 font-semibold">Best-Voyage</strong>{" "}
          est la communauté idéale pour immortaliser vos aventures. Créez des
          publications uniques, partagez vos galeries photos, échangez des
          commentaires et exprimez vos coups de cœur avec des likes.
        </p>

        {/* Bouton d'action dynamique (CTA) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {isPending ? (
            <div className="h-12 w-48 bg-gray-100 animate-pulse rounded-xl" />
          ) : session ? (
            <Link href="/post" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white text-base font-semibold px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3">
                <span>Voir le fil d&apos;actualité</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-linear-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white text-base font-semibold px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3">
                <span>Commencer l&apos;aventure gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>

        {/* --- CARDS DE FONCTIONNALITÉS (RÉSEAU SOCIAL) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Publications & Photos
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Publiez vos carnets de route, localisez vos destinations et
              partagez vos superbes galeries d&apos;images en haute qualité.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 font-bold">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Commentaires & Échanges
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Discutez avec d&apos;autres voyageurs, obtenez des conseils sur
              vos prochaines destinations et tissez des liens uniques.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Likes & Coups de cœur
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Exprimez votre admiration pour les plus beaux paysages du monde en
              aimant les publications de la communauté.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
