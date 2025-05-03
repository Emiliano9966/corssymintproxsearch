// api/links.js

let storedLinks = [];

module.exports = (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    res.status(200).json(storedLinks);
  } else if (method === 'POST') {
    const { url, type } = req.body;
    if (!url || !type) return res.status(400).send('Missing fields');

    // prevent duplicates
    if (storedLinks.some(l => l.url === url)) return res.status(409).send('Duplicate');

    storedLinks.push({ url, type, up: 0, down: 0 });
    res.status(201).json({ success: true });
  } else if (method === 'PUT') {
    const { url, direction } = req.body;
    const link = storedLinks.find(l => l.url === url);
    if (!link || (direction !== 'up' && direction !== 'down'))
      return res.status(400).send('Invalid');

    link[direction]++;
    res.status(200).json({ success: true });
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
