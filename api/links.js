const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://emilianocabralcerroni:<db_password>@cluster0.st7uzy3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
  const method = req.method;
  const dbName = 'proxyLinks';  // Your database name
  const collectionName = 'links';  // Your collection name

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (method === 'GET') {
      const links = await collection.find({}).toArray();
      res.status(200).json(links);
    } else if (method === 'POST') {
      const { url, type } = req.body;
      if (!url || !type) return res.status(400).send('Missing fields');

      // prevent duplicates
      const existingLink = await collection.findOne({ url });
      if (existingLink) return res.status(409).send('Duplicate');

      await collection.insertOne({ url, type, up: 0, down: 0 });
      res.status(201).json({ success: true });
    } else if (method === 'PUT') {
      const { url, direction } = req.body;
      const link = await collection.findOne({ url });
      if (!link || (direction !== 'up' && direction !== 'down'))
        return res.status(400).send('Invalid');

      await collection.updateOne({ url }, { $inc: { [direction]: 1 } });
      res.status(200).json({ success: true });
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  } finally {
    await client.close();
  }
};
