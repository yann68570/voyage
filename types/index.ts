import { ObjectId } from "mongodb";

// 1. UTILISATEUR (Better Auth + Rôle Admin)

export interface User {
  id: string; // Better Auth utilise souvent une chaîne de caractères pour l'ID utilisateur
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "user" | "admin"; // Gère votre besoin de compte admin
  createdAt: Date;
  updatedAt: Date;
}

// 2. POST / PARTAGE DE VOYAGE

export interface Post {
  _id?: ObjectId; // Optionnel lors de la création (généré par MongoDB)
  authorId: string; // ID de l'utilisateur (référence vers User.id)
  authorName: string;
  authorImage?: string;
  title: string; // Ex: "Road trip épique en Norvège"
  content: string; // Description détaillée de l'expérience
  destination: string; // Ex: "Lofoten, Norvège"
  images?: string[]; // URLs des photos de voyage
  likes: string[]; // Tableau des IDs utilisateurs qui ont liké le post
  createdAt: Date;
  updatedAt?: Date;
}

// 3. COMMENTAIRE

export interface Comment {
  _id?: ObjectId;
  postId: ObjectId; // ID du post associé
  authorId: string; // ID de l'auteur du commentaire
  authorName: string;
  authorImage?: string;
  content: string; // Texte du commentaire
  likes: string[]; // Tableau des IDs utilisateurs qui ont liké CE commentaire
  createdAt: Date;
}

// Données envoyées lors de la création d'un post
export interface CreatePostInput {
  title: string;
  content: string;
  destination: string;
  images?: string[];
}

// Données envoyées lors de la création d'un commentaire
export interface CreateCommentInput {
  postId: string;
  content: string;
}
