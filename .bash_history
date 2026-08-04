      --accent-hover: #0284c7;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    header {
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .nav-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--accent);
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .admin-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .admin-link:hover {
      color: var(--text);
      border-color: var(--accent);
    }

    .hero {
      padding: 40px 0 20px 0;
      text-align: center;
    }

    .hero h1 {
      font-size: 2.2rem;
      margin-bottom: 10px;
      letter-spacing: -0.8px;
    }

    .hero p {
      color: var(--muted);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Turnkey AdSense Slot Header */
    .ad-slot {
      background: rgba(51, 65, 85, 0.3);
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
      margin: 25px 0;
    }

    .posts-grid {
      display: grid;
      gap: 20px;
      margin-top: 30px;
    }

    .post-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .post-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }

    .post-badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .post-title {
      margin: 0 0 10px 0;
      font-size: 1.4rem;
    }

    .post-meta {
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 15px;
    }

    .post-excerpt {
      color: #cbd5e1;
      font-size: 0.98rem;
    }

    /* Affiliate Callout Box Component */
    .affiliate-box {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid var(--accent);
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .affiliate-box h3 {
      margin: 0;
      color: var(--accent);
      font-size: 1.1rem;
    }

    .affiliate-box p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--muted);
    }

    .affiliate-btn {
      align-self: flex-start;
      background: var(--accent);
      color: #000;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
    }

    footer {
      border-top: 1px solid var(--border);
      margin-top: 60px;
      padding: 30px 0;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>

  <header>
    <div class="container nav-flex">
      <a href="/" class="logo">hyæt-views</a>
      <a href="/admin.html" class="admin-link">Manage Site</a>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <h1>Engineering & Digital Growth</h1>
      <p>Exploring modern software development, web frameworks, and digital architecture.</p>
    </section>

    <!-- Turnkey Ad Placement Slot for Buyers -->
    <div class="ad-slot">
      <span>[ Monetization Slot: Responsive Google AdSense Banner ]</span>
    </div>

    <!-- Dynamic Posts Container -->
    <div id="posts-container" class="posts-grid">
      <p style="text-align: center; color: var(--muted);">Loading articles...</p>
    </div>

    <!-- Turnkey Affiliate Callout Box -->
    <div class="affiliate-box">
      <h3>🚀 Recommended Developer Stack</h3>
      <p>Deploy your full-stack applications effortlessly with Vercel & MongoDB Atlas.</p>
      <a href="#" class="affiliate-btn">Get Started Free &rarr;</a>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 hyæt-views. Powered by Node.js & MongoDB Atlas.</p>
    </div>
  </footer>

  <script>
    async function loadPosts() {
      const container = document.getElementById('posts-container');
      try {
        const res = await fetch('/api/posts');
        const posts = await res.json();

        if (posts.length === 0) {
          container.innerHTML = '<p style="text-align: center; color: var(--muted);">No articles published yet. Visit <a href="/admin.html" style="color: var(--accent);">/admin.html</a> to write your first post!</p>';
          return;
        }

        container.innerHTML = posts.map(post => `
          <article class="post-card">
            <span class="post-badge">${post.category || 'Tech'}</span>
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">Published on ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div class="post-excerpt">${post.content}</div>
          </article>
        `).join('');
      } catch (err) {
        container.innerHTML = '<p style="text-align: center; color: #f87171;">Failed to load articles. Please check server connection.</p>';
      }
    }

    loadPosts();
  </script>
</body>
</html>
EOF

node server.js
vercel --prod
node server.js
nano server.js
nano admin.html
nano index.html
node server.js
vercel --prod
node server.js
rm Server.js
cat << 'EOF' > server.js
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
EOF

pkill -f node && node server.js
node server.js
vercel --prod
nano post.html
cat << 'EOF' > post.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article View | hyæt-views</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; line-height: 1.7; }
    .container { max-width: 750px; margin: 40px auto; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
    .badge { background: rgba(56, 189, 248, 0.1); color: #38bdf8; font-size: 0.8rem; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
    h1 { color: #fff; margin-top: 15px; font-size: 2rem; }
    .meta { color: #94a3b8; font-size: 0.85rem; margin-bottom: 25px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
    .content { font-size: 1.05rem; color: #e2e8f0; white-space: pre-wrap; }
    .back-btn { display: inline-block; margin-bottom: 20px; color: #38bdf8; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-btn">&larr; Back to Articles</a>
    <div id="article-body">
      <p style="color: #94a3b8;">Loading article...</p>
    </div>
  </div>

  <script>
    async function loadSinglePost() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const bodyDiv = document.getElementById('article-body');

      if (!id) {
        bodyDiv.innerHTML = '<p style="color: #f87171;">Article ID missing.</p>';
        return;
      }

      try {
        const res = await fetch(`/api/posts/${id}`);
        const post = await res.json();

        if (!res.ok) {
          bodyDiv.innerHTML = `<p style="color: #f87171;">${post.error || 'Article not found.'}</p>`;
          return;
        }

        bodyDiv.innerHTML = `
          <span class="badge">${post.category || 'Tech'}</span>
          <h1>${post.title}</h1>
          <div class="meta">Published on ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div class="content">${post.content}</div>
        `;
      } catch (err) {
        bodyDiv.innerHTML = '<p style="color: #f87171;">Error loading article details.</p>';
      }
    }

    loadSinglePost();
  </script>
</body>
</html>
EOF

cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>hyæt-views | Technical Insights & Web Engineering</title>
  <style>
    :root { --bg: #0f172a; --card-bg: #1e293b; --border: #334155; --text: #f8fafc; --muted: #94a3b8; --accent: #38bdf8; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
    header { border-bottom: 1px solid var(--border); padding: 20px 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 100; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
    .nav-flex { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 800; color: var(--accent); text-decoration: none; }
    .admin-link { color: var(--muted); text-decoration: none; font-size: 0.9rem; border: 1px solid var(--border); padding: 6px 12px; border-radius: 6px; }
    .hero { padding: 40px 0 20px 0; text-align: center; }
    .hero h1 { font-size: 2.2rem; margin-bottom: 10px; }
    .hero p { color: var(--muted); font-size: 1.1rem; }
    .ad-slot { background: rgba(51, 65, 85, 0.3); border: 1px dashed var(--border); border-radius: 8px; padding: 15px; text-align: center; color: var(--muted); font-size: 0.85rem; margin: 25px 0; }
    .posts-grid { display: grid; gap: 20px; margin-top: 30px; }
    .post-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: transform 0.2s ease; cursor: pointer; text-decoration: none; color: inherit; display: block; }
    .post-card:hover { transform: translateY(-2px); border-color: var(--accent); }
    .post-badge { display: inline-block; background: rgba(56, 189, 248, 0.1); color: var(--accent); font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
    .post-title { margin: 0 0 10px 0; font-size: 1.4rem; color: #fff; }
    .post-meta { font-size: 0.85rem; color: var(--muted); }
    footer { border-top: 1px solid var(--border); margin-top: 60px; padding: 30px 0; text-align: center; color: var(--muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  <header>
    <div class="container nav-flex">
      <a href="/" class="logo">hyæt-views</a>
      <a href="/admin.html" class="admin-link">Manage Site</a>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <h1>Engineering & Digital Growth</h1>
      <p>Exploring modern software development, web frameworks, and digital architecture.</p>
    </section>

    <div class="ad-slot">[ Monetization Slot: Responsive Google AdSense Banner ]</div>

    <div id="posts-container" class="posts-grid">
      <p style="text-align: center; color: var(--muted);">Loading articles...</p>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 hyæt-views. Powered by Node.js & MongoDB Atlas.</p>
    </div>
  </footer>

  <script>
    async function loadPosts() {
      const container = document.getElementById('posts-container');
      try {
        const res = await fetch('/api/posts');
        const posts = await res.json();

        if (posts.length === 0) {
          container.innerHTML = '<p style="text-align: center; color: var(--muted);">No articles published yet. Visit <a href="/admin.html" style="color: var(--accent);">/admin.html</a> to publish!</p>';
          return;
        }

        container.innerHTML = posts.map(post => `
          <a href="/post.html?id=${post._id}" class="post-card">
            <span class="post-badge">${post.category || 'Tech'}</span>
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">Published on ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &rarr; Click to read full post</div>
          </a>
        `).join('');
      } catch (err) {
        container.innerHTML = '<p style="text-align: center; color: #f87171;">Failed to load articles.</p>';
      }
    }

    loadPosts();
  </script>
</body>
</html>
EOF

pkill -f node && node server.js
vercel --prod
node server.js
exit
