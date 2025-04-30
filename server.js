require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('API_KEY is missing. Please check your .env file.');
  process.exit(1); // Exit the server if the API key is missing
}

app.get('/api/movies', async (req, res) => {
  const { s, i, type, page } = req.query; // Add 'page' parameter

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${s || ''}&i=${i || ''}&type=${type || 'movie'}&page=${page || 1}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from OMDb API:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from OMDb API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});