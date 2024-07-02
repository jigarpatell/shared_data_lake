const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json());

// MongoDB connection string - Update with your actual MongoDB connection details
const mongoURI = 'mongodb+srv://newuser:passwordnew@';

// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

let db; // Global variable to hold the database connection

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    db = client.db('userMetadata');
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Endpoint to fetch filenames based on account name
app.get('/filenames/:account', async (req, res) => {
  const { account } = req.params;
  try {
    const collection = db.collection(account);
    const filenames = await collection.distinct('filename');
    res.json({ filenames });
  } catch (err) {
    console.error('Error fetching filenames:', err);
    res.status(500).json({ error: 'Failed to fetch filenames' });
  }
});

// Endpoint to fetch document data based on account name and filename
app.get('/documents/:account/:filename', async (req, res) => {
  const { account, filename } = req.params;
  try {
    const collection = db.collection(account);
    const documentData = await collection.find({ filename }).toArray(); // Fetch all documents with the same filename
    if (documentData && documentData.length > 0) {
      // Create a merged JSON object with common filename on top
      const mergedData = {
        filename: documentData[0].filename,
        documents: documentData.map(({ _id, encryption_key, type_of_db, stored_tablename }) => ({
          _id,
          encryption_key,
          type_of_db,
          stored_tablename,
        })),
      };
      res.json(mergedData);
    } else {
      res.status(404).json({ error: 'Documents not found' });
    }
  } catch (err) {
    console.error('Error fetching document data:', err);
    res.status(500).json({ error: 'Failed to fetch document data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
