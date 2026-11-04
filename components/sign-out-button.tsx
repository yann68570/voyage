"use client";

import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Déconnexion réussie");
          router.push("/signin");
        },
      },
    });
  };

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      className="flex items-center gap-2.5 text-red-600 hover:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer py-2.5 font-medium w-full"
    >
      <LogOut className="w-4 h-4" />
      <span>Se déconnecter</span>
    </DropdownMenuItem>
  );
}
