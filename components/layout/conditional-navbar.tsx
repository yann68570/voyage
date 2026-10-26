"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Liste des chemins où la Navbar ne doit PAS s'afficher
  const hideNavbarRoutes = ["/signin", "/signup"];

  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
