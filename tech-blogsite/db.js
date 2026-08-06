const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('abcde')) {
      console.log('⚠️ No valid MONGO_URI found in .env. Running server without active database connection.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.log('⚠️ MongoDB Connection Failed:', err.message);
    console.log('🚀 App will continue running without database blocking.');
  }
};

module.exports = connectDB;
