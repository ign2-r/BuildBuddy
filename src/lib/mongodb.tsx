// import { PrismaClient } from "@prisma/client/edge"; //used for edge computing
import { PrismaClient } from "@prisma/client";
import { User, Chats } from "../../prisma/types";

const prisma = new PrismaClient() //connects to db

// // run inside `async` function - example of create
// const newUser = await prisma.user.create({
//   data: {
//     name: 'Alice',
//     email: 'alice@prisma.io',
//   },
// })

export async function obtainUsers(): Promise<User[]> {
  return await prisma.user.findMany();
}

export async function obtainChat(chatID:string): Promise<Chats | null>{
  const chat:Chats | null = await prisma.chat.aggregate({
    
  });
  // where: { id: chatID },

  if (chat)
    return chat;
  else 
    console.log(`No chat with ${chatID} found`)
    return null;
}