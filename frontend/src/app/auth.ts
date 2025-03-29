import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
import { getUserFromDb } from "@/utils/password";
// import client from "@/utils/db";

// Extend the User type to include _id
declare module "next-auth" {
    interface User {
        _id?: string;
        role: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (credentials === null) return null;

                try {
                    let user = null;

                    // logic to verify if the user exists
                    user = await getUserFromDb(credentials.email as string, credentials.password as string);

                    if (!user) {
                        // No user found, so this is their first attempt to login
                        // Optionally, this is also the place you could do a user registration
                        throw new Error("Invalid credentials.");
                    }

                    // return user object with their profile data
                    return user;
                } catch (error) {
                    throw error;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    // Callbacks used to add specific info needed from db
    callbacks: {
        async jwt({ token, user }) {
            if (user?._id) token._id = user._id;
            if (user?.role) token.role = user.role;
            return token;
        },
        async session({ session, token }) {
            // user id is stored in ._id when using credentials provider
            if (token?._id) session.user._id = String(token._id);
            if (token?.role && typeof token.role === "string") {
                session.user.role = token.role;
            }

            // // user id is stored sub ._id when using google provider
            // if (token?.sub) session.user._id = token.sub;

            return session;
        },
    },
});
