import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function VerifyEmailSentPage() {
  return (
    <div className="max-w-md mx-auto p-6 mt-16 border rounded-lg shadow-sm text-center space-y-4">
      <h1 className="text-2xl font-bold">Vérifiez votre boîte mail</h1>
      <p className="text-sm text-muted-foreground">
        Un e-mail de confirmation vient de vous être envoyé. Veuillez cliquer
        sur le lien contenu dans le message pour activer votre compte.
      </p>
      <div className="pt-4">
        <Link href="/signin" className={buttonVariants({ variant: "outline" })}>
          Me connecter après vérification
        </Link>
      </div>
    </div>
  );
}
