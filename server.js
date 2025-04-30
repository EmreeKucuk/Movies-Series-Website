require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Statik dosyaları sun (index.html, app.js, style.css vs)
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('API_KEY is missing. Please check your .env file.');
  process.exit(1);
}

// OMDb API proxy endpoint
app.get('/api/movies', async (req, res) => {
  const { s, i, type } = req.query;

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${s || ''}&i=${i || ''}&type=${type || 'movie'}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from OMDb API:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from OMDb API' });
  }
});

// 404 fallback (opsiyonel)
app.use((req, res) => {
  res.status(404).send('Sayfa bulunamadı.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
