const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'grahms_admin_2026';

app.use(cors());
app.use(express.json());

// Serve static files from root AND Public folder if it exists
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('⚡ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));
} else {
  console.error('❌ Error: MONGO_URI missing!');
}

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/admin/posts', async (req, res) => {
  const { secret, title, category, content } = req.body;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
  }
  try {
    const newPost = new Post({ title, category, content });
    await newPost.save();
    res.status(201).json({ message: 'Post published successfully!', post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Explicit Route Handlers
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🛡️ Server running on http://localhost:${PORT}`);
    console.log(`🔑 Admin page live at http://localhost:${PORT}/admin.html`);
  });
}

module.exports = app;
