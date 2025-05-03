"use server";

import { sign } from "jsonwebtoken";
import { User } from "@/utils/db";

export const generateAccessToken = async (token: User | null) => {
    if (!token){
        console.error("User is not signed in, cannot create access token");
        throw Error("User is not signed in, cannot create access token");
    }
    const {AUTH_SECRET, AUTH_ISSUER, AUTH_AUDIENCE} = process.env; 
    if (!AUTH_SECRET)
        throw Error("Missing AUTH SECRET")
    return sign({id: token._id, role: token.role}, AUTH_SECRET, {algorithm: "HS256", issuer: AUTH_ISSUER, audience: AUTH_AUDIENCE, expiresIn: "10m"});
}