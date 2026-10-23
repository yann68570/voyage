import { NextResponse } from "next/server";
import { MongoClient } from "mongodb"; //

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Pseudo requis" }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db(); // Base de données par défaut
    // Better Auth stocke généralement les utilisateurs dans la collection "user"
    const existingUser = await db
      .collection("user")
      .findOne({ username: username.toLowerCase().trim() });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
