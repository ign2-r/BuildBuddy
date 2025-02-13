import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../../../lib/mongodb";

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});