const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    await Product.deleteMany(); // Clear existing products

    const sample = [
      { name: "Milk", price: 40, quantity: 100 },
      { name: "Bread", price: 20, quantity: 150 },
      { name: "Butter", price: 60, quantity: 80 },
      { name: "Eggs", price: 5, quantity: 200 }
    ];

    await Product.insertMany(sample);
    res.status(200).send("✅ Sample products seeded to MongoDB.");
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).send("❌ Error seeding products.");
  }
});

module.exports = router;
