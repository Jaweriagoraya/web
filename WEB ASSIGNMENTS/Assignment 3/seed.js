const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/ecommerce")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.error(error);
});

const products = [
    {
        name: "Men Casual Shirt",
        price: 1999,
        category: "Men",
        rating: 4.2,
        stock: 32,
        image: "/1.avif"
    },
    {
        name: "Girls Summer Dress",
        price: 1599,
        category: "Girls",
        rating: 4.5,
        stock: 18,
        image: "/2.avif"
    },
    {
        name: "Women Leather Bag",
        price: 3499,
        category: "Women",
        rating: 4.7,
        stock: 12,
        image: "/3.avif"
    },
    {
        name: "Home Accent Lamp",
        price: 1200,
        category: "Home",
        rating: 4.1,
        stock: 27,
        image: "/4.avif"
    },
    {
        name: "Men Formal Pants",
        price: 2599,
        category: "Men",
        rating: 4.3,
        stock: 22,
        image: "/5.avif"
    }
];

async function seedData() {
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log("Data Inserted Successfully");
        mongoose.connection.close();
    } catch (error) {
        console.error(error);
    }
}

seedData();
