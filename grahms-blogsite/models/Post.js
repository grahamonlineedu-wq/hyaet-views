const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  summary: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'published' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Post', postSchema);
