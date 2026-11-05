import clientPromise from "@/lib/db";
import { Post, Comment } from "@/types";

export interface FeedPost extends Omit<Post, "_id"> {
  _id: string;
  imageUrl?: string;
}

export interface FeedComment extends Omit<Comment, "_id" | "postId"> {
  _id: string;
  postId: string;
}

export interface FeedData {
  post: FeedPost;
  comments: FeedComment[];
  commentsCount: number;
}

/**
 * Récupère tous les posts et leurs commentaires associés depuis MongoDB
 */
export async function getFeedData(): Promise<FeedData[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const rawPosts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Promise.all(
      rawPosts.map(async (p) => {
        const commentDocs = await db
          .collection("comments")
          .find({ postId: p._id })
          .sort({ createdAt: -1 })
          .toArray();

        const comments: FeedComment[] = commentDocs.map((c) => ({
          _id: c._id.toString(),
          postId: c.postId.toString(),
          authorId: c.authorId,
          authorName: c.authorName || "Anonyme",
          authorImage: c.authorImage || undefined,
          content: c.content,
          likes: Array.isArray(c.likes) ? c.likes : [],
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        }));

        const imagesList = Array.isArray(p.images) ? p.images : [];

        const post: FeedPost = {
          _id: p._id.toString(),
          title: p.title || "",
          content: p.content,
          destination: p.destination || "",
          imageUrl:
            p.imageUrl || (imagesList.length > 0 ? imagesList[0] : undefined),
          images: imagesList,
          authorId: p.authorId,
          authorName: p.authorName || "Anonyme",
          authorImage: p.authorImage || undefined,
          likes: Array.isArray(p.likes) ? p.likes : [],
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        };

        return {
          post,
          comments,
          commentsCount: comments.length,
        };
      }),
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du fil d'actualité :", error);
    return [];
  }
}
