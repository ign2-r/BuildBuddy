"use server";

import bcrypt from 'bcrypt';
import { MongoClient } from "mongodb";
import { User } from './db';

const connectToDB = async () => {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_NS){
        console.log("Missing mongo URI or namespace in .env.local");
    }
    const client = new MongoClient(process.env.MONGODB_URI as string);
    return client;
}

const connectToUsers = async (client: MongoClient) => {
    const database = client.db(process.env.MONGODB_NS);
    const users = database.collection('users');

    return users;
}

export const saltAndHashPassword = async (password: string): Promise<string | null> => {
    try{
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const registerUser = async (email: string, password: string, username: string | null) => {
    const re:RegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    // email:string, password:string, username: string|null

    if (!email || !password || !username){
        throw new Error("Invalid email, password, or username");
    }

    if(!re.test(email))
        throw new Error("Invalid email format");
    // do any testing for passwords if necessary
    const client = await connectToDB();
    try {
        const users = await connectToUsers(client);
        const hashPassword = await saltAndHashPassword(password);
        if (!hashPassword) throw new Error("Unable to set up password");
        const result = await users.insertOne({
            email: email,
            password: hashPassword,
            username: username ?? email.split("@")[0],
            role: "free",
            budget_min: 0,
            budget_max: 0,
            createdAt: new Date(),
            notes: []
        });
        return result.acknowledged;
    } catch (e) {
        console.error(e);
        throw e;
        // return false;
    } finally {
        await client.close();
    }

}

export const getUserFromDb = async (email: string, pwHash:string): Promise<User | null> => {
    const client = await connectToDB();
    try {
        const users = await connectToUsers(client);
        const user = await users.findOne({ email: email }) as User | null;
        console.log(`comparing user with ${user}`);
        return (user && await bcrypt.compare(pwHash, user.password))? user: null;
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        await client.close();
    }
}

