import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { db } = await connectToDatabase();
  const existingUser = await db.collection('users').findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').insertOne({ email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
}