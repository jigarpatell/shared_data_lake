const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors()); 
app.use(express.json());

// MySQL connection details - Update with your actual MySQL connection details
const dbConfig = {
  host: 'reldatabase.xxx.rds.amazonaws.com',
  user: 'admin',
  password: 'xxxxxxxxxxxxxxxxxxx',
  database: 'firstdb', // Update with your database name
};

// Function to execute SQL query
const executeQuery = async (query) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query);
    await connection.end();
    return rows;
  } catch (error) {
    throw error;
  }
};

// Endpoint to fetch data from SQL database
app.post('/fetch-sql-data', async (req, res) => {
  const { tablename } = req.body;
  const query = `SELECT * FROM ${tablename}`;

  try {
    const sqlResponse = await executeQuery(query);
    res.json(sqlResponse); // Assuming SQL response contains the fetched data
  } catch (error) {
    console.error('Error fetching data from SQL database:', error);
    res.status(500).json({ error: 'Failed to fetch data from SQL database' });
  }
});

app.listen(port, () => {
  console.log(`Server 1 is running on port ${port}`);
});
