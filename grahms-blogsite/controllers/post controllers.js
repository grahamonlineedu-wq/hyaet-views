const Post = require('../models/Post');

// Get all published posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, slug, content, summary, tags } = req.body;
    
    const newPost = await Post.create({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      content,
      summary,
      tags
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
