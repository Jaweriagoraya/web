const mongoose = require('mongoose');

function connectDB() {
  const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/ecommerce';

  return mongoose.connect(databaseUrl)
    .then(() => {
      console.log('MongoDB Connected for Assignment 4');
    })
    .catch((error) => {
      console.error('MongoDB Connection Error:', error);
      process.exit(1);
    });
}

module.exports = { connectDB };