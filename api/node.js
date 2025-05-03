import { createServer } from 'http';
import { Server } from 'socket.io';
import { NowRequest, NowResponse } from '@vercel/node';

// Create an HTTP server
const server = createServer((req, res) => {
  res.status(200).send('Proxy Link Manager');
});

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all origins, you can restrict this if needed
    methods: ["GET", "POST"]
  }
});

// Initialize an in-memory store for links (this will be shared across all connected clients)
let links: { url: string, type: string }[] = [];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Emit the current list of links to the newly connected user
  socket.emit('current-links', links);

  // Listen for new links being added and broadcast them to all connected clients
  socket.on('new-link', (newLink) => {
    // Add new link to in-memory store
    links.push(newLink);

    // Broadcast new link to all clients
    io.emit('new-link', newLink);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

// Define your Vercel handler for API routes
export default (req: NowRequest, res: NowResponse) => {
  if (req.method === 'GET') {
    // Serve the current links when requested via GET
    return res.status(200).json(links);
  }
  
  res.status(405).send('Method Not Allowed');
};

// Start the server (this is required for Vercel's serverless functions)
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
