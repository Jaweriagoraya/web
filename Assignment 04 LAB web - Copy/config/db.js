const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ecommerce');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
