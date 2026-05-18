const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        required: true
    },

    image: {
        type: String
    },

    isOnSale: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Product", productSchema);
