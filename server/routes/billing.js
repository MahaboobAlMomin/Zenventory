const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill'); // Bill model
const Product = require('../models/Product'); // Product model

router.post('/generate-bill', async (req, res) => {
  try {
    const { customer, cart } = req.body; // expect customer info and cart items

    // Save bill
    const newBill = new Bill({ customer, cart, date: new Date() });
    await newBill.save();

    // Update product quantities
    for (const item of cart) {
      const product = await Product.findById(item._id);
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.qty);
        await product.save();
      }
    }

    res.status(200).json({ message: 'Bill saved and products updated successfully' });
  } catch (error) {
    console.error('Error saving bill or updating products:', error);
    res.status(500).json({ error: 'Failed to save bill or update products' });
  }
});

module.exports = router;
