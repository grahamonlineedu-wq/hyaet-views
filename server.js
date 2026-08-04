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

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('⚡ Shopping App DB Connected');
      seedInitialProducts();
    })
    .catch((err) => console.error('❌ DB Error:', err.message));
} else {
  console.error('❌ Warning: MONGO_URI missing from .env');
}

const productSchema = new mongoose.Schema({
  name: String,
  vendor: String,
  price: Number,
  originalPrice: Number,
  discount: String,
  qty: Number,
  interested: Number,
  isVerified: Boolean,
  imageUrl: String
});

const Product = mongoose.model('Product', productSchema);

async function seedInitialProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          name: "iPhone 15 Pro",
          vendor: "TechMart Lagos",
          price: 850000,
          originalPrice: 950000,
          discount: "-11%",
          qty: 2,
          interested: 3,
          isVerified: true,
          imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
        },
        {
          name: "Samsung Galaxy S24",
          vendor: "Galaxy Store NG",
          price: 720000,
          originalPrice: 820000,
          discount: "-12%",
          qty: 1,
          interested: 2,
          isVerified: true,
          imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80"
        }
      ]);
      console.log('🌱 Seeded default Group Buy products into MongoDB Atlas!');
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Join Group Buy Endpoint
app.post('/api/group/join', async (req, res) => {
  res.json({ success: true, message: "Successfully joined group buy! Member count updated to 9/12." });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🛒 Store server live on http://localhost:${PORT}`);
  });
}

module.exports = app;
