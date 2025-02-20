import { NextResponse } from "next/server";
import { obtainUsers } from "@/lib/mongodb";
import { User } from "../../../../prisma/types";

export async function GET(): Promise<NextResponse<User[]>> {
    const users: User[] = await obtainUsers();
    return NextResponse.json(users);
}