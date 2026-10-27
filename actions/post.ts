"use server";

import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface ActionResult {
  success: boolean;
  error?: string;
}

// Créer un post
export async function createPost(data: {
  content: string;
  imageUrl: string;
}): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user)
      return { success: false, error: "Non connecté." };

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
      viewedBy: [],
      comments: [],
      createdAt: new Date(),
    });

    revalidatePath("/post");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}

// Supprimer un post complet
export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user)
      return { success: false, error: "Non connecté." };

    if (!ObjectId.isValid(postId))
      return { success: false, error: "ID invalide." };

    const client = await clientPromise;
    const db = client.db();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) return { success: false, error: "Post introuvable." };

    if (post.authorId !== session.user.id) {
      return {
        success: false,
        error: "Vous n'avez pas le droit de supprimer ce post.",
      };
    }

    await db.collection("posts").deleteOne({ _id: new ObjectId(postId) });

    revalidatePath("/post");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}

// Liker / Unliker un post
export async function toggleLike(postId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user)
      return { success: false, error: "Non connecté." };

    if (!ObjectId.isValid(postId))
      return { success: false, error: "ID invalide." };

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
      await db
        .collection("posts")
        .updateOne({ _id: new ObjectId(postId) }, {
          $pull: { likes: userId },
        } as Record<string, unknown>);
    } else {
      await db
        .collection("posts")
        .updateOne({ _id: new ObjectId(postId) }, {
          $push: { likes: userId },
        } as Record<string, unknown>);
    }

    revalidatePath("/post");
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}

// Ajouter un commentaire
export async function addComment(
  postId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user)
      return { success: false, error: "Non connecté." };
    if (!content.trim()) return { success: false, error: "Commentaire vide." };

    if (!ObjectId.isValid(postId))
      return { success: false, error: "ID invalide." };

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

    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(postId) }, {
        $push: { comments: newComment },
      } as Record<string, unknown>);

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}

// Supprimer un commentaire
export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user)
      return { success: false, error: "Non connecté." };

    if (!ObjectId.isValid(postId))
      return { success: false, error: "ID invalide." };

    const client = await clientPromise;
    const db = client.db();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) return { success: false, error: "Post introuvable." };

    const comments = Array.isArray(post.comments) ? post.comments : [];
    const comment = comments.find(
      (c: { id: string; authorId: string }) => c.id === commentId,
    );

    if (!comment) return { success: false, error: "Commentaire introuvable." };

    if (
      comment.authorId !== session.user.id &&
      post.authorId !== session.user.id
    ) {
      return { success: false, error: "Action non autorisée." };
    }

    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(postId) }, {
        $pull: { comments: { id: commentId } },
      } as Record<string, unknown>);

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}
