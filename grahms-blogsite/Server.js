const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: "Grahm's Blogsite API is running!" });
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: "Grahm's Blogsite API is running!" });
});

// Post API Endpoint
app.use('/api/posts', require('./routes/postRoutes'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
