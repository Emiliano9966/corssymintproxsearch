// /api/links.ts (Serverless function in Node.js)
import { NowRequest, NowResponse } from '@vercel/node';

let links = [];  // For simplicity, we're using an in-memory store

export default (req: NowRequest, res: NowResponse) => {
  if (req.method === 'POST') {
    // Logic to add a new link
    const { url, type } = req.body;
    if (!url || !type) {
      return res.status(400).json({ message: 'URL and type are required' });
    }
    links.push({ url, type, up: 0, down: 0 });
    return res.status(200).json({ message: 'Link added successfully' });
  }

  // Return all links
  return res.status(200).json(links);
};
