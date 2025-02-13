import bcrypt from "bcrypt";
import { connectToDatabase } from "./mongodb";

export async function createUser(email: string, password: string) {
  const { db } = await connectToDatabase();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  await db.collection("users").insertOne({ email, passwordHash });
}