import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { Suspense } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voyage",
  description: "Découvrez les meilleurs endroits pour voyager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Suspense>
          <ConditionalNavbar />
        </Suspense>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
