"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/post",
      });
      toast.success("Redirection vers Google...");
    } catch (err) {
      toast.error("erreur lors de la connexion");
    }
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
