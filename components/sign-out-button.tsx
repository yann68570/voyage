"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Déconnexion réussie");
          router.push("/signin");
          router.refresh();
        },
        onError: (error) => {
          toast.error("Erreur lors de la déconnexion : " + error);
        },
      },
    });
  };

  return (
    <Button onClick={handleSignOut} variant="destructive">
      Se déconnecter
    </Button>
  );
}
