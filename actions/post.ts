"use server";

import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface CreatePostInput {
  content: string;
  imageUrl: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

// 1. Créer un post
export async function createPost(data: CreatePostInput): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "Vous devez être connecté pour publier.",
      };
    }

    if (!data.content.trim() && !data.imageUrl) {
      return {
        success: false,
        error: "Le post doit contenir du texte ou une image.",
      };
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("posts").insertOne({
      content: data.content.trim(),
      imageUrl: data.imageUrl,
      authorId: session.user.id,
      authorName: session.user.name || "Utilisateur",
      authorUsername: session.user.username || null,
      authorImage: session.user.image || null,
      likes: [],
      views: 0,
      comments: [],
      createdAt: new Date(),
    });

    revalidatePath("/post");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur serveur inconnue";
    return { success: false, error: message };
  }
}

// 2. Ajouter un commentaire
export async function addComment(
  postId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "Vous devez être connecté pour commenter.",
      };
    }

    if (!content.trim()) {
      return { success: false, error: "Le commentaire ne peut pas être vide." };
    }

    const client = await clientPromise;
    const db = client.db();

    const newComment = {
      id: new ObjectId().toString(),
      authorId: session.user.id,
      authorName: session.user.name || "Utilisateur",
      authorImage: session.user.image || null,
      content: content.trim(),
      createdAt: new Date(),
    };

    await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, {
      $push: { comments: newComment },
    } as Record<string, unknown>);

    revalidatePath(`/post/${postId}`);
    revalidatePath("/post");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur serveur inconnue";
    return { success: false, error: message };
  }
}

// 3. Liker / Unliker un post
export async function toggleLike(postId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Vous devez être connecté pour liker." };
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) return { success: false, error: "Post introuvable." };

    const likes: string[] = Array.isArray(post.likes) ? post.likes : [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, {
        $pull: { likes: userId },
      } as Record<string, unknown>);
    } else {
      await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, {
        $push: { likes: userId },
      } as Record<string, unknown>);
    }

    revalidatePath("/post");
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur serveur inconnue";
    return { success: false, error: message };
  }
}

// 4. Incrémenter les vues avec protection par cookie anti-spam (valable 24h)
// export async function incrementPostView(postId: string): Promise<void> {
//   if (!ObjectId.isValid(postId)) return;

//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     // Optionnel : Si vous voulez aussi compter les visiteurs non connectés,
//     // vous pouvez utiliser un identifiant de session générique ou leur IP,
//     // mais ici on s'appuie sur l'utilisateur connecté ou une clé unique.
//     const userId = session?.user?.id || "anonymous";

//     const client = await clientPromise;
//     const db = client.db();

//     // Vérifie si l'utilisateur a déjà vu ce post
//     const post = await db.collection("posts").findOne({
//       _id: new ObjectId(postId),
//       viewedBy: userId,
//     });

//     // S'il l'a déjà vu, on ne fait rien
//     if (post) return;

//     // Sinon, on incrémente le compteur et on ajoute l'ID/visiteur dans le tableau
//     await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, {
//       $inc: { views: 1 },
//       $push: { viewedBy: userId },
//     } as Record<string, unknown>);
//   } catch (err) {
//     console.error("Erreur increment view:", err);
//   }
// }
