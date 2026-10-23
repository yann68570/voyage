"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/settings", // Page où l'utilisateur est redirigé après connexion
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mb-4 flex items-center justify-center gap-2 p-5 cursor-pointer "
      onClick={handleGoogleSignIn}
    >
      <Image src="/google.svg" width={30} height={30} alt="Google" />
      CONNEXION AVEC GOOGLE
    </Button>
  );
}
