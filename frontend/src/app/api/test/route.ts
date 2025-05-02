import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtDecrypt } from "jose";
import { generateAccessToken } from "@/app/actions/jwt";
import { User } from "@/utils/db";

export async function GET(req: NextRequest) {
    const secret: string = process.env.AUTH_SECRET ? process.env.AUTH_SECRET : "";
    // Get the raw token
    const token = await getToken({ req, secret });

    // if (token) {
    //     try {
    //         // Pass the token to decode with complete option to get header and payload
    //         const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    //         const { payload } = await jwtDecrypt(token, secret);

    //         return NextResponse.json({ rawToken: token, decode:payload });

    //     } catch (error) {
    //         console.error("Failed to decode token:", error);
    //     }
    // } else {
    //     console.error("No token found");
    // }
    if (token) {
        const user = {
            _id: token._id || "",
            username: token.name || "",
            role: token.role || "user",
            email: token.email || "",
            password: "", // Placeholder, as password is not available in the token
        } as User;
        return NextResponse.json({ rawToken: token, token: await generateAccessToken(user) });
    }
    return NextResponse.json({ rawToken: token, token: null });
}
