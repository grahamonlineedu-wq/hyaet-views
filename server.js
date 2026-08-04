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

// Schemas
const productSchema = new mongoose.Schema({
  name: String,
  vendor: String,
  price: Number,
  originalPrice: Number,
  discount: String,
  qty: Number,
  interested: Number,
  isVerified: Boolean,
  description: { type: String, default: "High-grade electronics verified via AI authenticators." },
  imageUrl: String
});

const orderSchema = new mongoose.Schema({
  productName: String,
  price: Number,
  customerEmail: String,
  status: { type: String, default: 'Paid' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

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
          description: "Factory un-locked iPhone 15 Pro, titanium chassis, pristine condition.",
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
          description: "Flagship Galaxy S24 with AI camera capabilities and original box.",
          imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80"
        }
      ]);
      console.log('🌱 Seeded default products');
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

// Public API
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Item not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load details' });
  }
});

app.post('/api/checkout', async (req, res) => {
  const { productName, price, customerEmail } = req.body;
  try {
    const order = new Order({ productName, price, customerEmail });
    await order.save();
    res.status(201).json({ success: true, message: "Order processed successfully!", orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Admin API
app.post('/api/admin/products', async (req, res) => {
  const { secret, name, vendor, price, originalPrice, imageUrl, description } = req.body;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized secret' });

  try {
    const discount = `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`;
    const newProduct = new Product({ name, vendor, price, originalPrice, discount, qty: 1, interested: 1, isVerified: true, imageUrl, description });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Views
app.get('/product.html', (req, res) => res.sendFile(path.join(__dirname, 'product.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🛒 Store live on http://localhost:${PORT}`));
}

module.exports = app;
