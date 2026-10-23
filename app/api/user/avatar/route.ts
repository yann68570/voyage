import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Aucune URL d'image fournie" },
        { status: 400 },
      );
    }

    // Mettre à jour l'utilisateur avec la nouvelle image dans MongoDB via Better Auth
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        image: imageUrl,
      },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
