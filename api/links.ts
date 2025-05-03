import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = 'proxyLinks';
const collectionName = 'links';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (method === 'GET') {
      const links = await collection.find({}).toArray();
      res.status(200).json(links);
    } else if (method === 'POST') {
      const { url, type } = req.body;
      if (!url || !type) return res.status(400).send('Missing fields');

      const existing = await collection.findOne({ url });
      if (existing) return res.status(409).send('Duplicate');

      await collection.insertOne({ url, type, up: 0, down: 0 });
      res.status(201).json({ success: true });
    } else if (method === 'PUT') {
      const { url, direction } = req.body;
      if (!url || (direction !== 'up' && direction !== 'down')) {
        return res.status(400).send('Invalid request');
      }

      await collection.updateOne({ url }, { $inc: { [direction]: 1 } });
      res.status(200).json({ success: true });
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).send('Internal Server Error');
  }
}
