"use server";

import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ObjectId, Document } from "mongodb";
import { revalidatePath } from "next/cache";

interface PostPayload {
  title?: string;
  content?: string;
  destination?: string;
  images?: string[];
}

type CreatePostInput = FormData | PostPayload;

export async function createPost(input: CreatePostInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Non autorisé" };
    }

    let title = "";
    let content = "";
    let destination = "";
    let images: string[] = [];

    if (input instanceof FormData) {
      title = input.get("title")?.toString() || "";
      content = input.get("content")?.toString() || "";
      destination = input.get("destination")?.toString() || "";
      const singleImage = input.get("imageUrl")?.toString();
      images = singleImage ? [singleImage] : [];
    } else {
      title = input.title || "";
      content = input.content || "";
      destination = input.destination || "";
      images = input.images || [];
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("posts").insertOne({
      authorId: session.user.id,
      authorName: session.user.name || "Anonyme",
      authorImage: session.user.image || undefined,
      title,
      content,
      destination,
      images, // Enregistrement direct du tableau d'images dans MongoDB
      likes: [],
      createdAt: new Date(),
    });

    revalidatePath("/post");
    revalidatePath("/post/new");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Erreur serveur lors de la création.";
    return { success: false, error: message };
  }
}

export async function deletePost(postId: string) {
  if (!ObjectId.isValid(postId)) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");

  const client = await clientPromise;
  const db = client.db();
  const objectId = new ObjectId(postId);

  const post = await db.collection("posts").findOne({ _id: objectId });
  if (!post || post.authorId !== session.user.id)
    throw new Error("Action non autorisée");

  await db.collection("posts").deleteOne({ _id: objectId });
  await db.collection("comments").deleteMany({ postId: objectId });

  revalidatePath("/post");
}

export async function toggleLike(postId: string) {
  if (!ObjectId.isValid(postId)) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");

  const userId = session.user.id;
  const client = await clientPromise;
  const db = client.db();
  const objectId = new ObjectId(postId);

  const post = await db.collection("posts").findOne({ _id: objectId });
  if (!post) return;

  const likes: string[] = Array.isArray(post.likes) ? post.likes : [];
  const hasLiked = likes.includes(userId);

  // On effectue l'opération en séparant clairement les blocs avec un cast unknown sécurisé
  if (hasLiked) {
    const updateDoc = {
      $pull: { likes: userId } as unknown as Document,
    };
    await db.collection("posts").updateOne({ _id: objectId }, updateDoc);
  } else {
    const updateDoc = {
      $push: { likes: userId } as unknown as Document,
    };
    await db.collection("posts").updateOne({ _id: objectId }, updateDoc);
  }

  revalidatePath("/post");
}

export async function addComment(postId: string, content: string) {
  if (!ObjectId.isValid(postId) || !content.trim()) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");

  const client = await clientPromise;
  const db = client.db();

  await db.collection("comments").insertOne({
    postId: new ObjectId(postId),
    authorId: session.user.id,
    authorName: session.user.name || "Anonyme",
    authorImage: session.user.image || undefined,
    content: content.trim(),
    likes: [],
    createdAt: new Date(),
  });

  revalidatePath("/post");
}

export async function deleteComment(postId: string, commentId: string) {
  if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");

  const client = await clientPromise;
  const db = client.db();

  const comment = await db
    .collection("comments")
    .findOne({ _id: new ObjectId(commentId) });
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  if (!comment || !post) return;

  if (
    comment.authorId !== session.user.id &&
    post.authorId !== session.user.id
  ) {
    throw new Error("Action non autorisée");
  }

  await db.collection("comments").deleteOne({ _id: new ObjectId(commentId) });

  revalidatePath("/post");
}
