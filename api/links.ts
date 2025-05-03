import { NowRequest, NowResponse } from '@vercel/node';

let links: { url: string, type: string }[] = []; // In-memory storage for links

export default (req: NowRequest, res: NowResponse) => {
  if (req.method === 'GET') {
    // Return all the links in memory
    return res.status(200).json(links);
  } else if (req.method === 'POST') {
    // Handle link submission
    const { url, type } = req.body;

    if (!url || !type) {
      return res.status(400).json({ message: 'URL and type are required' });
    }

    // Create new link
    const newLink = { url, type };
    
    // Store the link in memory (this will reset every time the server restarts)
    links.push(newLink);

    // Return the new link as a response
    return res.status(200).json(newLink);
  }

  // Handle unsupported HTTP methods
  res.status(405).send('Method Not Allowed');
};
