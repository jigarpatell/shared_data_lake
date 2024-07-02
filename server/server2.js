const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5002;

app.use(cors()); 
app.use(express.json());

// MongoDB connection string - Update with your actual MongoDB connection details
const mongoURI = 'mongodb+srv://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

let db; // Global variable to hold the database connection

// Connect to MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('seconddb'); // Assuming your database name is 'seconddb'
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Endpoint to fetch data from NoSQL database
app.get('/fetch-mongodb-data', async (req, res) => {
  const { collection } = req.query;
  try {
    const collectionData = await db.collection(collection).find({}).toArray();
    res.json(collectionData);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
});

app.listen(port, () => {
  console.log(`Server 2 is running on port ${port}`);
});
