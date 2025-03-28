import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('towtruck'); // Using your actual database name
    
    // Query for available drivers
    const drivers = await db
      .collection('drivers')
      .find({ available: true })
      .toArray();
      
    // Return the drivers as JSON
    res.status(200).json({ drivers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
} 