const mongoose = require("mongoose");
const Product  = require("./models/Product");

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/engine_clone")
    .then(() => console.log("MongoDB Connected to engine_clone"))
    .catch(err  => console.error(err));

// 22 on-sale products — enough to span 3 pages (10 / 10 / 2)
// All images reference files that already exist in /public
const products = [
    // ── Men ──────────────────────────────────────────────────────────
    { name: "Men Casual Shirt",        price: 1999, category: "Men",   rating: 4.2, stock: 32, image: "/1.avif",                    isOnSale: true  },
    { name: "Men Formal Pants",        price: 2599, category: "Men",   rating: 4.3, stock: 22, image: "/5.avif",                    isOnSale: true  },
    { name: "Men Hoodies Upper",       price: 2199, category: "Men",   rating: 4.4, stock: 15, image: "/Hoodies_uppers.webp",       isOnSale: true  },
    { name: "Men Blazer Coat",         price: 4999, category: "Men",   rating: 4.6, stock: 8,  image: "/Blazer_coats.webp",        isOnSale: true  },
    { name: "Men Classic Shirt 2",     price: 1799, category: "Men",   rating: 4.1, stock: 40, image: "/shirt2.webp",              isOnSale: true  },
    { name: "Men Striped Shirt",       price: 1899, category: "Men",   rating: 4.0, stock: 28, image: "/shirt3.webp",              isOnSale: true  },
    { name: "Men Oxford Shirt",        price: 2099, category: "Men",   rating: 4.5, stock: 19, image: "/shirt4.webp",              isOnSale: true  },

    // ── Women ─────────────────────────────────────────────────────────
    { name: "Women Leather Bag",       price: 3499, category: "Women", rating: 4.7, stock: 12, image: "/3.avif",                   isOnSale: true  },
    { name: "Women Summer Dress",      price: 2899, category: "Women", rating: 4.5, stock: 18, image: "/Women_Dresses.webp",       isOnSale: true  },
    { name: "Women Two-Piece Set",     price: 3299, category: "Women", rating: 4.6, stock: 10, image: "/Women_Sets.webp",          isOnSale: true  },
    { name: "Women Casual Top",        price: 1299, category: "Women", rating: 4.2, stock: 35, image: "/Women1.webp",              isOnSale: true  },
    { name: "Women Sleeveless Knit",   price: 1599, category: "Women", rating: 4.3, stock: 21, image: "/women_slveelss_sweater.webp", isOnSale: true },
    { name: "Women Floral Dress",      price: 2499, category: "Women", rating: 4.8, stock: 14, image: "/Women2.webp",              isOnSale: true  },

    // ── Girls ─────────────────────────────────────────────────────────
    { name: "Girls Summer Dress",      price: 1599, category: "Girls", rating: 4.5, stock: 18, image: "/2.avif",                   isOnSale: true  },
    { name: "Girls Party Dress",       price: 1899, category: "Girls", rating: 4.6, stock: 12, image: "/Girl_Dress.webp",          isOnSale: true  },
    { name: "Girls Floral Frock",      price: 1399, category: "Girls", rating: 4.4, stock: 25, image: "/Girl-dress.webp",          isOnSale: true  },
    { name: "Girls Upper Sweater",     price:  999, category: "Girls", rating: 4.2, stock: 30, image: "/girls_upper.webp",         isOnSale: true  },
    { name: "Girls Bottom Pants",      price:  849, category: "Girls", rating: 4.1, stock: 22, image: "/Girl_Bottoms.webp",        isOnSale: true  },

    // ── Boys ──────────────────────────────────────────────────────────
    { name: "Boys Denim Jacket",       price: 2299, category: "Boys",  rating: 4.5, stock: 9,  image: "/Boys_Jackets.webp",        isOnSale: true  },
    { name: "Boys Casual Pants",       price: 1199, category: "Boys",  rating: 4.3, stock: 20, image: "/Boys_Pants.webp",          isOnSale: true  },
    { name: "Boys Graphic Shirt",      price:  999, category: "Boys",  rating: 4.1, stock: 33, image: "/Boy_Shirt.webp",           isOnSale: true  },
    { name: "Boys Casual Upper",       price: 1099, category: "Boys",  rating: 4.2, stock: 17, image: "/Boys_Uppers.webp",         isOnSale: true  },
    
    // ── Extras to reach exactly 30 ────────────────────────────────────
    { name: "Men Winter Scarf",        price:  499, category: "Men",   rating: 4.1, stock: 50, image: "/1.avif",                   isOnSale: true  },
    { name: "Men Sports Cap",          price:  299, category: "Men",   rating: 3.9, stock: 45, image: "/5.avif",                   isOnSale: true  },
    { name: "Women Wool Gloves",       price:  599, category: "Women", rating: 4.6, stock: 38, image: "/3.avif",                   isOnSale: true  },
    { name: "Women Silk Scarf",        price:  899, category: "Women", rating: 4.8, stock: 26, image: "/Women1.webp",              isOnSale: true  },
    { name: "Girls Hair Bands",        price:  199, category: "Girls", rating: 4.0, stock: 60, image: "/2.avif",                   isOnSale: true  },
    { name: "Girls Fancy Socks",       price:  249, category: "Girls", rating: 4.2, stock: 55, image: "/Girl-dress.webp",          isOnSale: true  },
    { name: "Boys Cotton Socks",       price:  199, category: "Boys",  rating: 4.1, stock: 70, image: "/Boy_Shirt.webp",           isOnSale: true  },
    { name: "Boys Beanie Hat",         price:  399, category: "Boys",  rating: 4.3, stock: 32, image: "/Boys_Pants.webp",          isOnSale: true  }
];

async function seedData() {
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} on-sale products successfully.`);
        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        mongoose.connection.close();
    }
}

seedData();
